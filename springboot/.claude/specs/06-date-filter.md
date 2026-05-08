# Spec: Date Filter

## Overview
This feature adds optional date-range filtering to the expense list endpoint and wires the Profile page to real expense data. Users can scope their transaction history and summary stats to any calendar window by passing `startDate` and `endDate` query parameters. On the frontend, date pickers replace the hard-coded mock transactions on `ProfilePage`, so all stat cards, the transaction table, and the category breakdown reflect real data filtered by the chosen period.

## Depends on
- **Step 01 — Database Setup**: `Expense` domain model, `ExpenseRepository` interface, and all three adapters.
- **Step 02 — Registration**: `User` table/collection and seed data.
- **Step 03 — Login and Logout**: JWT stored in `localStorage["spendly_token"]`.
- **Step 04 — Profile Page**: `JwtAuthFilter` wired into `SecurityConfig`; `GET /api/users/me` endpoint; `ProfilePage.tsx` shell.
- **Step 05 — Expense API Endpoints**: `ExpenseService`, `ExpenseServiceImpl`, `ExpenseController`, and the `GET /api/expenses` endpoint must exist before this step. This spec only adds date-range filtering on top of that foundation.

## Routes
- `GET /api/expenses?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` — returns the authenticated user's expenses filtered by date range (both params optional; omitting either end returns all expenses from/until that bound) — logged-in

No entirely new routes. This modifies the existing `GET /api/expenses` endpoint introduced in step 05.

## Database changes
Add one new method to the `ExpenseRepository` interface and implement it in all three adapters. No schema changes — `Expense.date` is already stored as a `YYYY-MM-DD` string, which supports lexicographic ordering identical to chronological ordering.

New interface method:
```java
List<Expense> findByUserIdAndDateBetween(String userId, String startDate, String endDate);
```

All three adapters must implement this using their respective Spring Data query mechanisms:
- **MongoDB**: `findByUserIdAndDateGreaterThanEqualAndDateLessThanEqual` derived query on `MongoExpenseMongoRepository`
- **PostgreSQL**: `findByUserIdAndDateGreaterThanEqualAndDateLessThanEqual` derived query on `PostgresExpenseJpaRepository`
- **SQL Server**: same derived query on `SqlServerExpenseJpaRepository`

## Templates
Not applicable — this is a Spring Boot REST API + React SPA project.

## Files to change

### Backend
| File | Change |
|------|--------|
| `backend/src/main/java/com/spendly/repository/ExpenseRepository.java` | Add `findByUserIdAndDateBetween(String userId, String startDate, String endDate)` |
| `backend/src/main/java/com/spendly/repository/mongodb/MongoExpenseMongoRepository.java` | Add `findByUserIdAndDateGreaterThanEqualAndDateLessThanEqual` derived query method |
| `backend/src/main/java/com/spendly/repository/mongodb/MongoExpenseRepository.java` | Implement `findByUserIdAndDateBetween` by delegating to the new Mongo derived query |
| `backend/src/main/java/com/spendly/repository/postgresql/PostgresExpenseJpaRepository.java` | Add `findByUserIdAndDateGreaterThanEqualAndDateLessThanEqual` derived query method |
| `backend/src/main/java/com/spendly/repository/postgresql/PostgresExpenseRepository.java` | Implement `findByUserIdAndDateBetween` by delegating to the new JPA derived query |
| `backend/src/main/java/com/spendly/repository/sqlserver/SqlServerExpenseJpaRepository.java` | Add `findByUserIdAndDateGreaterThanEqualAndDateLessThanEqual` derived query method |
| `backend/src/main/java/com/spendly/repository/sqlserver/SqlServerExpenseRepository.java` | Implement `findByUserIdAndDateBetween` by delegating to the new JPA derived query |
| `backend/src/main/java/com/spendly/service/ExpenseService.java` | Add `getExpenses(String userId, String startDate, String endDate)` method signature |
| `backend/src/main/java/com/spendly/service/impl/ExpenseServiceImpl.java` | Implement: if both params present call `findByUserIdAndDateBetween`; if only `startDate` use a far-future `endDate` ("9999-12-31"); if only `endDate` use "0000-01-01" as `startDate`; if neither call `findByUserId` |
| `backend/src/main/java/com/spendly/controller/ExpenseController.java` | Change `GET /expenses` to accept `@RequestParam(required = false) String startDate` and `@RequestParam(required = false) String endDate`; pass both to the service |

### Frontend
| File | Change |
|------|--------|
| `frontend/src/app/ProfilePage.tsx` | Remove `MOCK_TRANSACTIONS`; add `expenses` state; fetch from `GET /api/expenses` with optional date params; add `startDate` / `endDate` date inputs above the transaction table; re-fetch on filter change; show empty-state message when no results |

## Files to create
No new files — all backend infrastructure was created in step 05.

## New dependencies
No new dependencies.

## Rules for implementation

### Backend
- `findByUserIdAndDateBetween` in `ExpenseServiceImpl` must handle all four combinations of `startDate`/`endDate` being null without throwing.
- Date strings are compared lexicographically; YYYY-MM-DD format guarantees this equals chronological order — do not parse to `LocalDate` in the repository layer.
- Both `startDate` and `endDate` are inclusive bounds.
- If a client sends a malformed date string (not YYYY-MM-DD), return `400 Bad Request` with `{ "error": "Invalid date format. Use YYYY-MM-DD." }` — validate in the controller using a simple regex or `LocalDate.parse()` inside a try-catch before passing to the service.
- The controller extracts `userId` from `SecurityContextHolder.getContext().getAuthentication().getPrincipal()` — never from a request parameter.
- Response is `200 OK` with a JSON array of `ExpenseResponseDto` objects (same DTO used by step 05's list endpoint).
- All three profiles (mongodb, postgresql, sqlserver) must return identical results for the same filter.

### Frontend
- Replace `MOCK_TRANSACTIONS` with `expenses` state: `const [expenses, setExpenses] = useState<Expense[]>([])`.
- On mount and on any filter change, call `GET /api/expenses?startDate=<s>&endDate=<e>` with the Bearer token header. Omit a param entirely (not `&startDate=`) if that bound is not set.
- Use `<input type="date">` for both date pickers, styled to match the existing card design.
- Default both inputs to empty (no pre-selected range) so all expenses show on first load.
- When the expense list is empty (either no data or no match for the filter), show a single-row message in the transaction table: "No transactions for the selected period."
- Stat cards (Total Spent, Transactions, Top Category) must recalculate from the filtered `expenses` array, not from a separate API call.
- On any `401` from `/api/expenses`: clear `localStorage` and navigate to `/login`.
- Use CSS variables only — never hardcode hex colour values. `BAR_COLOR` map entries that currently use hex literals must be replaced with CSS variable references or inline style using the existing theme variables where possible. Where no theme variable exists for a category colour, keep the hex value but add a `/* category palette */` comment to mark it as intentional.
- Do not remove the `BADGE` map — it is still used for category pill styling.

## Definition of done
- [ ] `GET /api/expenses` (no params) with valid Bearer token → `200 OK` with all of the authenticated user's expenses
- [ ] `GET /api/expenses?startDate=2025-04-01&endDate=2025-04-30` → only expenses whose `date` falls within April 2025 (inclusive)
- [ ] `GET /api/expenses?startDate=2025-04-10` (no `endDate`) → all expenses from 2025-04-10 onward
- [ ] `GET /api/expenses?endDate=2025-04-10` (no `startDate`) → all expenses up to and including 2025-04-10
- [ ] `GET /api/expenses?startDate=2025-13-01` → `400 Bad Request` with `{ "error": "Invalid date format. Use YYYY-MM-DD." }`
- [ ] `GET /api/expenses` with no Bearer token → `401 Unauthorized`
- [ ] Results are identical across all three profiles: `mongodb`, `postgresql`, `sqlserver`
- [ ] ProfilePage loads without errors; transaction table shows real expenses (not mock data)
- [ ] Selecting a start date and end date in the UI re-fetches and updates the transaction table and all three stat cards
- [ ] Clearing both date inputs re-fetches and shows all expenses
- [ ] When the filtered result is empty, transaction table shows "No transactions for the selected period."
- [ ] Total Spent, Transactions count, and Top Category stat cards reflect the filtered data, not all-time totals
