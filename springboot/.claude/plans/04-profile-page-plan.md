# Implementation Plan: Profile Page (Step 04)

## Context
Spendly needs a profile page where authenticated users can view their account info, update their name, and change their password. This step also completes the JWT authentication infrastructure deferred in step 03 — specifically the JWT filter that validates Bearer tokens on every protected request. Without this filter, Spring Security cannot identify the caller, so all protected endpoints (including the three added here) would return 401.

Branch: `feature/profile-page`
Spec: `.claude/specs/04-profile-page.md`

---

## Part A — Backend

### A1. Extend `JwtUtil.java`
**File:** `backend/src/main/java/com/spendly/util/JwtUtil.java`

Add three methods that parse the existing token structure (`sub` = email, `userId` claim):

```
validateToken(String token) → boolean
  - Build the key the same way generateToken() does (Keys.hmacShaKeyFor)
  - Call Jwts.parser().verifyWith(key).build().parseSignedClaims(token)
  - Catch JwtException (covers ExpiredJwtException, SignatureException, etc.) → return false
  - Return true on success

extractEmail(String token) → String
  - Parse claims, return subject (getSubject())

extractUserId(String token) → String
  - Parse claims, return claim "userId" as String
```

Reuse the same `Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8))` pattern already in `generateToken()`. Extract to a private `getKey()` helper to avoid duplication.

---

### A2. Create `JwtAuthFilter.java`
**File:** `backend/src/main/java/com/spendly/filter/JwtAuthFilter.java`

```
@Component
public class JwtAuthFilter extends OncePerRequestFilter {
    - Inject JwtUtil

    doFilterInternal():
      1. Read Authorization header
      2. If null or doesn't start with "Bearer " → filterChain.doFilter() and return
      3. Extract token (header.substring(7))
      4. If !jwtUtil.validateToken(token) → filterChain.doFilter() and return
      5. String userId = jwtUtil.extractUserId(token)
      6. UsernamePasswordAuthenticationToken auth =
             new UsernamePasswordAuthenticationToken(userId, null, Collections.emptyList())
      7. SecurityContextHolder.getContext().setAuthentication(auth)
      8. filterChain.doFilter(request, response)  ← always called
}
```

---

### A3. Update `SecurityConfig.java`
**File:** `backend/src/main/java/com/spendly/config/SecurityConfig.java`

- Inject `JwtAuthFilter` via constructor parameter.
- In `securityFilterChain()`, add `.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)`.
- No other changes — the existing `permitAll("/auth/**")` + `anyRequest().authenticated()` rules remain.

---

### A4. Create `UpdateProfileRequestDto.java`
**File:** `backend/src/main/java/com/spendly/dto/UpdateProfileRequestDto.java`

```java
public class UpdateProfileRequestDto {
    @NotBlank(message = "Name is required")
    private String name;
    // getter + setter
}
```

---

### A5. Create `ChangePasswordRequestDto.java`
**File:** `backend/src/main/java/com/spendly/dto/ChangePasswordRequestDto.java`

```java
public class ChangePasswordRequestDto {
    @NotBlank(message = "Current password is required")
    private String currentPassword;

    @NotBlank(message = "New password is required")
    @Size(min = 8, message = "New password must be at least 8 characters")
    private String newPassword;
    // getters + setters
}
```

---

### A6. Create `UserNotFoundException.java`
**File:** `backend/src/main/java/com/spendly/exception/UserNotFoundException.java`

```java
public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException() { super("User not found"); }
}
```

---

### A7. Create `IncorrectPasswordException.java`
**File:** `backend/src/main/java/com/spendly/exception/IncorrectPasswordException.java`

```java
public class IncorrectPasswordException extends RuntimeException {
    public IncorrectPasswordException() { super("Current password is incorrect"); }
}
```

---

### A8. Update `GlobalExceptionHandler.java`
**File:** `backend/src/main/java/com/spendly/exception/GlobalExceptionHandler.java`

Add two new handlers:

```java
@ExceptionHandler(UserNotFoundException.class)
→ 404 NOT_FOUND with { "error": "User not found" }

@ExceptionHandler(IncorrectPasswordException.class)
→ 400 BAD_REQUEST with { "error": "Current password is incorrect" }
```

---

### A9. Update `UserService.java`
**File:** `backend/src/main/java/com/spendly/service/UserService.java`

Add three method signatures:

```java
UserResponseDto getProfile(String userId);
UserResponseDto updateName(String userId, UpdateProfileRequestDto request);
void changePassword(String userId, ChangePasswordRequestDto request);
```

---

### A10. Update `UserServiceImpl.java`
**File:** `backend/src/main/java/com/spendly/service/impl/UserServiceImpl.java`

Implement the three methods. The private `toDto()` helper already exists and is reused:

```
getProfile(String userId):
  userRepository.findById(userId).orElseThrow(UserNotFoundException::new)
  return toDto(user)

updateName(String userId, UpdateProfileRequestDto request):
  user = userRepository.findById(userId).orElseThrow(UserNotFoundException::new)
  user.setName(request.getName())
  saved = userRepository.save(user)
  return toDto(saved)

changePassword(String userId, ChangePasswordRequestDto request):
  user = userRepository.findById(userId).orElseThrow(UserNotFoundException::new)
  if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash()))
      throw new IncorrectPasswordException()
  user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()))
  userRepository.save(user)
  // void — no return value
```

---

### A11. Create `UserController.java`
**File:** `backend/src/main/java/com/spendly/controller/UserController.java`

```java
@RestController
@RequestMapping("/users")
public class UserController {
    private final UserService userService;
    // constructor injection

    private String currentUserId() {
        return (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponseDto> getProfile() {
        return ResponseEntity.ok(userService.getProfile(currentUserId()));
    }

    @PatchMapping("/me")
    public ResponseEntity<UserResponseDto> updateName(@Valid @RequestBody UpdateProfileRequestDto request) {
        return ResponseEntity.ok(userService.updateName(currentUserId(), request));
    }

    @PatchMapping("/me/password")
    public ResponseEntity<Map<String, String>> changePassword(@Valid @RequestBody ChangePasswordRequestDto request) {
        userService.changePassword(currentUserId(), request);
        return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
    }
}
```

---

## Part B — Frontend

### B1. Update `App.tsx`
**File:** `frontend/src/app/App.tsx`

1. Add `PrivateRoute` component (mirrors `GuestRoute` but inverted):
   ```tsx
   function PrivateRoute({ children }: { children: React.ReactNode }) {
     return localStorage.getItem('spendly_token')
       ? <>{children}</>
       : <Navigate to="/login" replace />;
   }
   ```

2. Import `ProfilePage` and add route:
   ```tsx
   import ProfilePage from './ProfilePage';
   // ...
   <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
   ```

---

### B2. Update `DashboardPage.tsx`
**File:** `frontend/src/app/DashboardPage.tsx`

Add a "My Profile" link in the header, between the logo and the Logout button. Match the Logout button's visual style (border, rounded, small text):

```tsx
import { Link } from 'react-router';
// In the header, before the Logout button:
<Link
  to="/profile"
  className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition"
>
  My Profile
</Link>
```

---

### B3. Create `ProfilePage.tsx`
**File:** `frontend/src/app/ProfilePage.tsx`

**Structure:**
- Same page shell as `DashboardPage.tsx`: `min-h-screen flex flex-col` with `--page-bg` background
- Header: Spendly logo (Link to `/`) on left; "My Profile" text (active/current page, greyed out) + Logout button on right
- Main content: three stacked cards (max-w-lg, centred)

**Card 1 — Account Info (read-only)**
- Loaded from `GET /api/users/me` on mount
- Fields displayed (not editable): Name, Email, Member since (format `createdAt` with `toLocaleDateString()`)
- Show skeleton/loading state while fetching

**Card 2 — Edit Name**
- Pre-fills `name` from the API response
- Single field: Name (`@NotBlank`)
- On submit: `PATCH /api/users/me` with `{ name }`
  - Success: update `localStorage["spendly_user"]` name field, show "Name updated successfully" inline (green text)
  - Error 400: show field error inline
  - Error 401: clear localStorage, navigate to `/login`

**Card 3 — Change Password**
- Three fields: Current Password, New Password, Confirm New Password
- Client-side: if `newPassword !== confirmPassword` → show "Passwords do not match" before submitting
- On submit: `PATCH /api/users/me/password` with `{ currentPassword, newPassword }`
  - Success: clear all three fields, show "Password updated successfully" inline
  - Error 400: show server error (`{ "error": "..." }`) inline
  - Error 401: clear localStorage, navigate to `/login`

**Axios calls pattern** (follows `LoginPage.tsx`):
```tsx
const token = localStorage.getItem('spendly_token');
const { data } = await axios.get('/api/users/me', {
  headers: { Authorization: `Bearer ${token}` },
});
```

**CSS rules:**
- All colours via CSS variables (`--page-bg`, `--brand-green`, `--destructive`, `--border`)
- No hardcoded hex values
- Buttons: `backgroundColor: 'var(--brand-green)'`, white text, same `disabled:opacity-60` pattern
- Error text: `color: 'var(--destructive)'`
- Input borders: `borderColor: fieldError ? 'var(--destructive)' : 'var(--border)'`

---

## File Summary

### New files
| File | Type |
|------|------|
| `backend/src/main/java/com/spendly/filter/JwtAuthFilter.java` | Backend |
| `backend/src/main/java/com/spendly/dto/UpdateProfileRequestDto.java` | Backend |
| `backend/src/main/java/com/spendly/dto/ChangePasswordRequestDto.java` | Backend |
| `backend/src/main/java/com/spendly/controller/UserController.java` | Backend |
| `backend/src/main/java/com/spendly/exception/UserNotFoundException.java` | Backend |
| `backend/src/main/java/com/spendly/exception/IncorrectPasswordException.java` | Backend |
| `frontend/src/app/ProfilePage.tsx` | Frontend |

### Modified files
| File | Change |
|------|--------|
| `backend/src/main/java/com/spendly/util/JwtUtil.java` | Add `validateToken`, `extractEmail`, `extractUserId`; extract private `getKey()` helper |
| `backend/src/main/java/com/spendly/config/SecurityConfig.java` | Inject `JwtAuthFilter`, add to filter chain |
| `backend/src/main/java/com/spendly/service/UserService.java` | Add 3 method signatures |
| `backend/src/main/java/com/spendly/service/impl/UserServiceImpl.java` | Implement 3 new methods |
| `backend/src/main/java/com/spendly/exception/GlobalExceptionHandler.java` | Add 2 new handlers |
| `frontend/src/app/App.tsx` | Add `PrivateRoute`, import + add `/profile` route |
| `frontend/src/app/DashboardPage.tsx` | Add "My Profile" link in header |

---

## Verification Checklist

1. **Start backend** on `mongodb` profile: `cd backend && mvn spring-boot:run -Dspring-boot.run.profiles=mongodb`

2. **JWT filter works:**
   - `GET /api/users/me` with no header → 401
   - `GET /api/users/me` with a tampered token → 401
   - `GET /api/users/me` with a valid token (obtained from `/api/auth/login`) → 200

3. **Profile endpoints:**
   - `GET /api/users/me` → `{ id, name, email, createdAt }` (no passwordHash)
   - `PATCH /api/users/me` `{ "name": "New Name" }` → 200, updated name in response
   - `PATCH /api/users/me` `{ "name": "" }` → 400
   - `PATCH /api/users/me/password` correct current + valid new → 200; old password fails login; new password succeeds
   - `PATCH /api/users/me/password` wrong current → 400 `{ "error": "Current password is incorrect" }`
   - `PATCH /api/users/me/password` new < 8 chars → 400

4. **Frontend:**
   - `npm run dev` starts without errors
   - `/profile` with no token → redirect to `/login`
   - `/profile` while logged in → page renders with Account Info, Edit Name, Change Password cards
   - Edit Name: pre-fills current name; submit updates name; `localStorage["spendly_user"]` reflects new name
   - Change Password: mismatch confirm → client error before submit; correct current + valid new → success message + fields cleared
   - Dashboard header shows "My Profile" link → navigates to `/profile`

5. **Repeat backend tests** on `postgresql` and `sqlserver` profiles.
