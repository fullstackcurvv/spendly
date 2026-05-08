# Spec: Profile Page

## Overview
This feature adds a protected profile page where authenticated users can view their account information, update their display name, and change their password. It also introduces the JWT authentication filter — the mechanism that validates the Bearer token on every protected request — completing the auth setup deferred in step 03. This is the first step in Spendly with genuinely protected backend endpoints.

## Depends on
- **Step 01 — Database Setup**: `User` domain model, `UserRepository` interface, and all three repository adapters.
- **Step 02 — Registration**: `UserService`, `BCryptPasswordEncoder` bean in `AppConfig`, and the `users` table/collection.
- **Step 03 — Login and Logout**: `JwtUtil.generateToken()`, `SecurityConfig` filter chain skeleton, and JWT stored in `localStorage["spendly_token"]`.

## Routes
- `GET /users/me` — fetch the authenticated user's profile — logged-in
  (full URL: `GET /api/users/me`)
- `PATCH /users/me` — update display name — logged-in
  (full URL: `PATCH /api/users/me`)
- `PATCH /users/me/password` — change password — logged-in
  (full URL: `PATCH /api/users/me/password`)

## Database changes
No database changes. The `users` table/collection already has all required fields: `id`, `name`, `email`, `passwordHash`, `createdAt`.

## Templates
Not applicable — this is a Spring Boot REST API + React SPA project.

## Files to change

### Backend
| File | Change |
|------|--------|
| `backend/src/main/java/com/spendly/util/JwtUtil.java` | Add `validateToken(String)`, `extractEmail(String)`, `extractUserId(String)` methods |
| `backend/src/main/java/com/spendly/config/SecurityConfig.java` | Register `JwtAuthFilter` before `UsernamePasswordAuthenticationFilter` in the filter chain |
| `backend/src/main/java/com/spendly/service/UserService.java` | Add `getProfile(String userId)`, `updateName(String userId, UpdateProfileRequestDto)`, `changePassword(String userId, ChangePasswordRequestDto)` method signatures |
| `backend/src/main/java/com/spendly/service/impl/UserServiceImpl.java` | Implement the three new service methods |
| `backend/src/main/java/com/spendly/exception/GlobalExceptionHandler.java` | Add handler for `UserNotFoundException` → `404 Not Found` |

### Frontend
| File | Change |
|------|--------|
| `frontend/src/app/App.tsx` | Add `/profile` route wrapped in `PrivateRoute`; add `PrivateRoute` guard component |
| `frontend/src/app/DashboardPage.tsx` | Add a "My Profile" link in the header |

## Files to create

### Backend
| File | Purpose |
|------|---------|
| `backend/src/main/java/com/spendly/dto/UpdateProfileRequestDto.java` | Request body for name update: `name` with `@NotBlank` |
| `backend/src/main/java/com/spendly/dto/ChangePasswordRequestDto.java` | Request body: `currentPassword` + `newPassword`, both `@NotBlank`; `newPassword` with `@Size(min=8)` |
| `backend/src/main/java/com/spendly/controller/UserController.java` | `@RestController` mapping `GET /users/me`, `PATCH /users/me`, `PATCH /users/me/password` |
| `backend/src/main/java/com/spendly/filter/JwtAuthFilter.java` | `OncePerRequestFilter` — validates Bearer token, sets userId as principal in `SecurityContextHolder` |
| `backend/src/main/java/com/spendly/exception/UserNotFoundException.java` | Thrown when user from JWT claims does not exist in the database |

### Frontend
| File | Purpose |
|------|---------|
| `frontend/src/app/ProfilePage.tsx` | Protected page — account info (read-only), name-update form, change-password form |

## New dependencies
No new dependencies.

## Rules for implementation

### Backend
- Add three methods to `JwtUtil`:
  - `validateToken(String token)` — returns `boolean`; catches `JwtException` and returns `false`.
  - `extractEmail(String token)` — returns the `sub` claim.
  - `extractUserId(String token)` — returns the `userId` claim as a `String`.
- `JwtAuthFilter` must:
  - Read the `Authorization` header — if absent or does not start with `"Bearer "`, call `filterChain.doFilter()` and return.
  - Extract the token; call `jwtUtil.validateToken()` — if invalid, call `filterChain.doFilter()` and return.
  - Call `jwtUtil.extractUserId()` and set a `UsernamePasswordAuthenticationToken` (userId String as principal, `null` credentials, empty authorities) into `SecurityContextHolder`.
  - Always call `filterChain.doFilter()` to continue the chain regardless.
- `SecurityConfig` must inject `JwtAuthFilter` and add it before `UsernamePasswordAuthenticationFilter`.
- In `UserController`, extract the authenticated userId via `SecurityContextHolder.getContext().getAuthentication().getPrincipal()` cast to `String`.
- `GET /users/me` → `200 OK` with `UserResponseDto`.
- `PATCH /users/me` with valid `{ "name": "..." }` → `200 OK` with updated `UserResponseDto`.
- `PATCH /users/me` with blank name → `400 Bad Request` (JSR-380 via `@Valid`).
- `PATCH /users/me/password`:
  - Verify `currentPassword` against stored BCrypt hash — if mismatch, throw a handled exception → `400 Bad Request` with `{ "error": "Current password is incorrect" }`.
  - Hash `newPassword` with `BCryptPasswordEncoder` and save.
  - Return `200 OK` with `{ "message": "Password updated successfully" }`.
- `UserNotFoundException` → `404 Not Found` with `{ "error": "User not found" }` via `GlobalExceptionHandler`.
- Controller only receives, delegates to service, and returns the response — zero business logic in the controller.
- Use `@Valid` on all controller method parameters that bind a request body.
- All three profiles (mongodb, postgresql, sqlserver) must work identically through the existing `UserRepository` adapters.

### Frontend
- Add a `PrivateRoute` component in `App.tsx`: if `localStorage["spendly_token"]` is absent, redirect to `/login`; otherwise render `children`. Mirror the existing `GuestRoute` pattern.
- `ProfilePage.tsx` structure:
  - Same header as `DashboardPage.tsx` (Spendly logo left, Logout button right), plus a "Dashboard" back-link.
  - **Account Info** card: read-only display of name, email, and "Member since" (`createdAt` formatted as a readable date).
  - **Edit Name** card: pre-filled name input + "Save changes" button; show success/error message inline.
  - **Change Password** card: Current Password, New Password, Confirm New Password fields + "Update password" button; validate `newPassword === confirmPassword` client-side before submitting.
- On mount, call `GET /api/users/me` with `Authorization: Bearer <token>` to populate fields.
- On successful name update: update `localStorage["spendly_user"]` with the new name; show "Name updated successfully" inline.
- On password change success: clear the password fields; show "Password updated successfully" inline.
- On any `401` response from the API: clear `localStorage["spendly_token"]` and `localStorage["spendly_user"]`, then navigate to `/login`.
- Use CSS variables only — never hardcode hex colour values.
- Use `axios` with `baseURL` `/api`; include `Authorization: Bearer <token>` header on all calls to `/users/me`.
- `DashboardPage.tsx` header: add a "My Profile" link (e.g., a `<Link to="/profile">`) styled consistently with the existing Logout button.

## Definition of done
- [ ] `GET /api/users/me` with a valid Bearer token → `200 OK` with `{ id, name, email, createdAt }`
- [ ] `GET /api/users/me` with no token → `401 Unauthorized`
- [ ] `GET /api/users/me` with a tampered/invalid token → `401 Unauthorized`
- [ ] `PATCH /api/users/me` with valid `{ "name": "New Name" }` and Bearer token → `200 OK`; DB record shows updated name
- [ ] `PATCH /api/users/me` with a blank name → `400 Bad Request`
- [ ] `PATCH /api/users/me/password` with correct `currentPassword` and valid `newPassword` (≥ 8 chars) → `200 OK`; old password no longer authenticates; new password authenticates via `POST /api/auth/login`
- [ ] `PATCH /api/users/me/password` with incorrect `currentPassword` → `400 Bad Request` with `{ "error": "Current password is incorrect" }`
- [ ] `PATCH /api/users/me/password` with `newPassword` shorter than 8 characters → `400 Bad Request`
- [ ] Frontend `/profile` route renders for an authenticated user
- [ ] Navigating directly to `/profile` with no token in `localStorage` redirects to `/login`
- [ ] Account Info card on `/profile` shows the correct name, email, and member-since date
- [ ] Saving a new name calls `PATCH /api/users/me`, shows success message, and updates `localStorage["spendly_user"]`
- [ ] Change-password form shows a client-side error when `newPassword !== confirmPassword` before submitting
- [ ] Successful password change clears the password fields and shows a success message
- [ ] "My Profile" link in the Dashboard header navigates to `/profile`
- [ ] App starts without errors on all three profiles: `mongodb`, `postgresql`, `sqlserver`
