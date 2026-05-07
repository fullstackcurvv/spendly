# Spec: Login and Logout

## Overview
This feature introduces stateless JWT-based authentication to Spendly. Users sign in with their email and password; the backend validates credentials against the stored BCrypt hash, issues a signed JWT, and returns it alongside basic user info. The frontend stores the token and user info in `localStorage` and redirects to a minimal dashboard. Logout is fully client-side: clearing `localStorage` and redirecting to the home page. This step also wires up Spring Security so that `/auth/**` routes remain public while all other routes require authentication — setting the stage for protected expense endpoints in later steps.

## Depends on
- **Step 01 — Database Setup**: `User` model, `UserRepository` interface and all three repository adapters must exist.
- **Step 02 — Registration**: `UserService`, `BCryptPasswordEncoder` bean in `AppConfig`, and the `users` table/collection must exist.

## Routes
- `POST /auth/login` — authenticate with email + password, receive a JWT — public
  (full URL: `POST /api/auth/login`)
- Logout has **no backend route** — it is entirely client-side (clear `localStorage` and navigate away).

## Database changes
No database changes. Stateless JWT requires no token table.

## Templates
Not applicable — this is a Spring Boot REST API + React SPA project.

## Files to change
- `backend/pom.xml` — add `spring-boot-starter-security`, `jjwt-api`, `jjwt-impl`, `jjwt-jackson`
- `backend/src/main/resources/application.yml` — add `jwt.secret` and `jwt.expiration-ms` properties
- `backend/src/main/java/com/spendly/service/UserService.java` — add `login(LoginRequestDto)` method signature
- `backend/src/main/java/com/spendly/service/impl/UserServiceImpl.java` — implement `login()` method
- `backend/src/main/java/com/spendly/controller/AuthController.java` — add `POST /auth/login` endpoint
- `backend/src/main/java/com/spendly/exception/GlobalExceptionHandler.java` — add handler for `InvalidCredentialsException` → `401`
- `frontend/src/app/App.tsx` — add `/login` and `/dashboard` routes; wire "Sign in" button to `/login`
- `frontend/src/app/RegisterPage.tsx` — update "Sign in" link href from `/` to `/login`

## Files to create

### Backend
| File | Purpose |
|------|---------|
| `backend/src/main/java/com/spendly/dto/LoginRequestDto.java` | Request body: `email` + `password` with `@NotBlank` and `@Email` |
| `backend/src/main/java/com/spendly/dto/LoginResponseDto.java` | Response: `token`, `id`, `name`, `email` — no password fields |
| `backend/src/main/java/com/spendly/exception/InvalidCredentialsException.java` | Thrown when email not found or password does not match |
| `backend/src/main/java/com/spendly/util/JwtUtil.java` | `@Component` — generates and validates JWTs; reads secret + expiry from config |
| `backend/src/main/java/com/spendly/config/SecurityConfig.java` | Permits `/auth/**`, requires auth for all other routes, disables CSRF, sets stateless session |

### Frontend
| File | Purpose |
|------|---------|
| `frontend/src/app/LoginPage.tsx` | Login form: Email + Password fields, error handling, calls `POST /api/auth/login` |
| `frontend/src/app/DashboardPage.tsx` | Minimal post-login page showing personalised greeting and a Logout button |

## New dependencies

### Backend (`pom.xml`)
- `org.springframework.boot:spring-boot-starter-security` (managed version)
- `io.jsonwebtoken:jjwt-api:0.12.6`
- `io.jsonwebtoken:jjwt-impl:0.12.6` (scope: runtime)
- `io.jsonwebtoken:jjwt-jackson:0.12.6` (scope: runtime)

### Frontend
No new frontend dependencies. `axios` (already installed) is sufficient. JWT payload is decoded with native `atob()` — no `jwt-decode` package needed.

## Rules for implementation

### Backend
- `POST /auth/login` → `200 OK` with `LoginResponseDto { token, id, name, email }` on valid credentials.
- Invalid email or wrong password → throw `InvalidCredentialsException` → `401 Unauthorized` with `{ "error": "Invalid email or password" }`. **Never** distinguish between "email not found" and "wrong password" in the response (prevents user enumeration).
- JWT must be signed with **HMAC-SHA256** using the secret read from `application.yml`. Never hardcode the secret in code.
- JWT payload must include: `sub` (user's email), `userId` (user's id as a string), `exp` (Unix epoch expiry).
- Default expiration: **86400000 ms** (24 hours). Configurable via `jwt.expiration-ms`.
- `JwtUtil` is a `@Component`; inject the secret and expiry via `@Value("${jwt.secret}")` and `@Value("${jwt.expiration-ms}")`.
- `SecurityConfig` must:
  - Disable CSRF (stateless REST API — no cookies).
  - Permit `POST /auth/register` and `POST /auth/login` without authentication.
  - Require authentication (`.anyRequest().authenticated()`) for all other routes.
  - Set `SessionCreationPolicy.STATELESS`.
  - **Do not add a JWT filter** in this step — protected routes don't exist yet. The filter chain is forward-looking configuration only.
- `UserServiceImpl.login()` must:
  1. Call `userRepository.findByEmail(email)` — if empty, throw `InvalidCredentialsException`.
  2. Call `passwordEncoder.matches(rawPassword, user.getPasswordHash())` — if false, throw `InvalidCredentialsException`.
  3. Generate a token via `jwtUtil.generateToken(user)`.
  4. Return `LoginResponseDto`.
- Controller only receives, delegates to service, and returns the response — zero business logic in the controller.
- All three profiles (mongodb, postgresql, sqlserver) must work identically through the existing `UserRepository` adapters.

### Frontend
- On successful `POST /api/auth/login`:
  - Store the JWT in `localStorage["spendly_token"]`.
  - Store `{ id, name, email }` from the response in `localStorage["spendly_user"]` (JSON-stringified).
  - Navigate to `/dashboard`.
- On `401` from the server: display `"Invalid email or password."` inline (below the form) without a page reload.
- On `400`: display a generic `"Something went wrong. Please try again."` error.
- `LoginPage.tsx` fields: **Email** (required, valid format) and **Password** (required). Show inline validation errors before submission — same pattern as `RegisterPage.tsx`.
- `DashboardPage.tsx`:
  - On mount, read `localStorage["spendly_user"]`. If absent, immediately navigate to `/login`.
  - Display `"Welcome back, <name>!"` using the stored name.
  - Logout button: remove `localStorage["spendly_token"]` and `localStorage["spendly_user"]`, then navigate to `/`.
- Use CSS variables only — never hardcode hex colour values. Match the visual style of `RegisterPage.tsx` (same header, card layout, brand green submit button).
- Use `axios` with `baseURL` `/api` for all API calls.

## Definition of done
- [ ] `POST /api/auth/login` with valid `{ email, password }` → `200 OK`; response contains `token`, `id`, `name`, `email`; token starts with `eyJ`
- [ ] `POST /api/auth/login` with a correct email but wrong password → `401 Unauthorized` with `{ "error": "Invalid email or password" }`
- [ ] `POST /api/auth/login` with an email that does not exist → `401 Unauthorized` with `{ "error": "Invalid email or password" }`
- [ ] `POST /api/auth/login` with a blank email or blank password → `400 Bad Request`
- [ ] Frontend `/login` page renders with Email and Password fields
- [ ] Submitting valid credentials stores `spendly_token` and `spendly_user` in `localStorage` and navigates to `/dashboard`
- [ ] Submitting invalid credentials on `/login` shows `"Invalid email or password."` inline without a page reload
- [ ] `/dashboard` shows `"Welcome back, <name>!"` using the name from `localStorage`
- [ ] Clicking Logout on `/dashboard` clears `localStorage["spendly_token"]` and `localStorage["spendly_user"]` and navigates to `/`
- [ ] Navigating directly to `/dashboard` with no token in `localStorage` redirects to `/login`
- [ ] The "Sign in" button on the landing page links to `/login`
- [ ] The "Sign in" link on `RegisterPage.tsx` links to `/login`
- [ ] App starts without errors on all three profiles: `mongodb`, `postgresql`, `sqlserver`
