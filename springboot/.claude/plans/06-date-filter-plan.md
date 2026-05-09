# Plan: 06 — Date Filter

## Context
Step 05 built the expense API endpoints (`GET /api/expenses`, `GET /api/expenses/summary`, `GET /api/expenses/categories`) and wired ProfilePage to real data. Step 06 extends `GET /api/expenses` with optional `startDate`/`endDate` query params so users can scope the transaction list to a calendar window. The ProfilePage date-filter UI replaces the separate summary/categories API calls — all stat cards are recomputed client-side from the filtered expense list, keeping the round-trip count at one.

---

## Backend

### 1. `ExpenseRepository.java`
**Path:** `backend/src/main/java/com/spendly/repository/ExpenseRepository.java`

Add one new method to the interface:
```java
List<Expense> findByUserIdAndDateBetween(String userId, String startDate, String endDate);
```

---

### 2. MongoDB Spring Data interface
**Path:** `backend/src/main/java/com/spendly/repository/mongodb/MongoExpenseMongoRepository.java`

Add derived query method (Spring Data resolves it automatically via the method name):
```java
List<MongoExpense> findByUserIdAndDateGreaterThanEqualAndDateLessThanEqual(
    String userId, String startDate, String endDate);
```

---

### 3. MongoDB adapter
**Path:** `backend/src/main/java/com/spendly/repository/mongodb/MongoExpenseRepository.java`

Implement `findByUserIdAndDateBetween` by delegating to the new derived query, then mapping with the existing `toModel()`:
```java
@Override
public List<Expense> findByUserIdAndDateBetween(String userId, String startDate, String endDate) {
    return mongoRepository
        .findByUserIdAndDateGreaterThanEqualAndDateLessThanEqual(userId, startDate, endDate)
        .stream().map(this::toModel).collect(Collectors.toList());
}
```

---

### 4. PostgreSQL Spring Data interface
**Path:** `backend/src/main/java/com/spendly/repository/postgresql/PostgresExpenseJpaRepository.java`

Add derived query (same naming pattern, Long userId because JPA uses Long):
```java
List<JpaExpense> findByUserIdAndDateGreaterThanEqualAndDateLessThanEqual(
    Long userId, String startDate, String endDate);
```

---

### 5. PostgreSQL adapter
**Path:** `backend/src/main/java/com/spendly/repository/postgresql/PostgresExpenseRepository.java`

Implement `findByUserIdAndDateBetween`:
```java
@Override
public List<Expense> findByUserIdAndDateBetween(String userId, String startDate, String endDate) {
    return jpaRepository
        .findByUserIdAndDateGreaterThanEqualAndDateLessThanEqual(Long.parseLong(userId), startDate, endDate)
        .stream().map(this::toModel).collect(Collectors.toList());
}
```

---

### 6. SQL Server Spring Data interface
**Path:** `backend/src/main/java/com/spendly/repository/sqlserver/SqlServerExpenseJpaRepository.java`

Same derived query as PostgreSQL (identical JPA entity):
```java
List<JpaExpense> findByUserIdAndDateGreaterThanEqualAndDateLessThanEqual(
    Long userId, String startDate, String endDate);
```

---

### 7. SQL Server adapter
**Path:** `backend/src/main/java/com/spendly/repository/sqlserver/SqlServerExpenseRepository.java`

Implement `findByUserIdAndDateBetween` — identical to PostgreSQL adapter.

---

### 8. `ExpenseService.java`
**Path:** `backend/src/main/java/com/spendly/service/ExpenseService.java`

Change the existing method signature (no overload — just update it):
```java
// Before:
List<ExpenseResponseDto> getExpensesForUser(String userId);

// After:
List<ExpenseResponseDto> getExpensesForUser(String userId, String startDate, String endDate);
```
Leave `getSummaryForUser` and `getCategoryBreakdownForUser` untouched.

---

### 9. `ExpenseServiceImpl.java`
**Path:** `backend/src/main/java/com/spendly/service/impl/ExpenseServiceImpl.java`

Update `getExpensesForUser` to route to the correct repository method based on which params are non-null:
```java
@Override
public List<ExpenseResponseDto> getExpensesForUser(String userId, String startDate, String endDate) {
    List<Expense> expenses;
    if (startDate != null && endDate != null) {
        expenses = expenseRepository.findByUserIdAndDateBetween(userId, startDate, endDate);
    } else if (startDate != null) {
        expenses = expenseRepository.findByUserIdAndDateBetween(userId, startDate, "9999-12-31");
    } else if (endDate != null) {
        expenses = expenseRepository.findByUserIdAndDateBetween(userId, "0000-01-01", endDate);
    } else {
        expenses = expenseRepository.findByUserId(userId);
    }
    return expenses.stream()
        .sorted(Comparator.comparing(Expense::getDate).reversed())
        .map(e -> new ExpenseResponseDto(String.valueOf(e.getId()), e.getCategory().name(),
                                         e.getAmount(), e.getDate(), e.getDescription()))
        .collect(Collectors.toList());
}
```
Reuse the existing sort + mapping logic already in the method.

---

### 10. `ExpenseController.java`
**Path:** `backend/src/main/java/com/spendly/controller/ExpenseController.java`

Add optional `startDate` and `endDate` params to `GET /expenses`. Validate each with `LocalDate.parse()` before passing to the service. Return `400` inline on parse failure:

```java
@GetMapping
public ResponseEntity<?> getExpenses(
        @RequestParam(required = false) String startDate,
        @RequestParam(required = false) String endDate) {
    for (String d : new String[]{startDate, endDate}) {
        if (d != null) {
            try { LocalDate.parse(d); }
            catch (DateTimeParseException e) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid date format. Use YYYY-MM-DD."));
            }
        }
    }
    String userId = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    return ResponseEntity.ok(expenseService.getExpensesForUser(userId, startDate, endDate));
}
```

Import `java.time.LocalDate`, `java.time.format.DateTimeParseException`, and `java.util.Map`.

---

## Frontend

### `ProfilePage.tsx`
**Path:** `frontend/src/app/ProfilePage.tsx`

**State additions:**
```tsx
const [startDate, setStartDate] = useState('');
const [endDate, setEndDate]     = useState('');
```

**Replace 3 separate API calls with 1 filtered call.**  
The existing step-05 version calls `/api/expenses`, `/api/expenses/summary`, `/api/expenses/categories` independently. Drop the summary and categories calls. Compute stats client-side from the returned expense array (the old mock-data version already did this via `reduce` — restore that pattern):

```tsx
useEffect(() => {
    const token = localStorage.getItem('spendly_token');
    if (!token) { navigate('/login'); return; }
    const params = new URLSearchParams();
    if (startDate) params.set('startDate', startDate);
    if (endDate)   params.set('endDate',   endDate);
    const query = params.toString() ? `?${params}` : '';
    axios
        .get<ExpenseResponseDto[]>(`/api/expenses${query}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => setExpenses(res.data))
        .catch(err => {
            if (axios.isAxiosError(err) && err.response?.status === 401) {
                localStorage.removeItem('spendly_token');
                localStorage.removeItem('spendly_user');
                navigate('/login');
            }
        });
}, [startDate, endDate, navigate]);
```

**Stat computations (client-side from `expenses`):**
```tsx
const totalSpent      = expenses.reduce((s, e) => s + Number(e.amount), 0);
const categoryTotals  = /* same groupBy reduce as old mock version, using expenses */
const topCategory     = categoryTotals[0]?.category ?? '—';
```

**Date filter UI** — add above the transaction table inside the "Recent Transactions" card:
```tsx
<div className="flex items-center gap-3 mb-4">
  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
    className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700" />
  <span className="text-gray-400 text-sm">to</span>
  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
    className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700" />
  {(startDate || endDate) && (
    <button onClick={() => { setStartDate(''); setEndDate(''); }}
      className="text-xs text-gray-400 hover:text-gray-700 transition">
      Clear
    </button>
  )}
</div>
```

**Empty-state row** in `<tbody>` when `expenses.length === 0`:
```tsx
{expenses.length === 0 ? (
  <tr>
    <td colSpan={4} className="py-6 text-center text-sm text-gray-400">
      No transactions for the selected period.
    </td>
  </tr>
) : expenses.map(...)}
```

**BAR_COLOR** — keep existing hex values, add `/* category palette */` comment per spec rule.

**Do not remove** the `BADGE` map.

---

## File Save (post-approval)
After plan approval, also save this plan to:
`.claude/plans/06-date-filter-plan.md`  
(inside the springboot working directory, matching the project convention)

---

## Verification

1. **Start backend** (MongoDB profile): `cd backend && mvn spring-boot:run`
2. **Start frontend**: `cd frontend && npm run dev`
3. **Login** as `demo@spendly.com` / `demo1234`
4. Navigate to `/profile` — all 8 seeded transactions should appear; stat cards show real totals
5. Enter a start date before any expense; enter an end date after all expenses — all 8 still appear
6. Set a narrow range (e.g., a single day matching one seeded expense) — only that expense appears; stat cards update
7. Clear filters — all 8 return
8. Set `startDate` only — expenses from that date onward
9. Set `endDate` only — expenses up to that date
10. **curl with invalid date:**
    ```
    curl -H "Authorization: Bearer <token>" "http://localhost:8080/api/expenses?startDate=2025-13-01"
    ```
    → `400 {"error":"Invalid date format. Use YYYY-MM-DD."}`
11. **curl with no token** → `401`
12. **Repeat backend tests** with `--Dspring-boot.run.profiles=postgresql` and `sqlserver`
