# Plan: Login and Logout (Step 03)

## Context
Registration exists (Step 02) but there is no way to sign in. The landing page has an unwired "Sign in" button and the register page links "Sign in" back to `/`. This step introduces stateless JWT-based authentication: a login endpoint that validates credentials and issues a signed JWT, client-side logout (clear localStorage), a Login page, and a minimal Dashboard page as the post-login landing zone. Spring Security is added in a permissive configuration so it doesn't break existing public routes while laying the groundwork for protected endpoints in later steps.

---

## Implementation Steps

### 1 · pom.xml — swap security dependency, add jjwt
File: `backend/pom.xml`

- **Remove** the existing `spring-security-crypto` entry (becomes a transitive dependency of the starter).
- **Add** `spring-boot-starter-security` (version managed by Spring Boot 3.3.0 BOM, no explicit version).
- **Add** three jjwt 0.12.6 entries:
  - `io.jsonwebtoken:jjwt-api:0.12.6` — default (compile) scope
  - `io.jsonwebtoken:jjwt-impl:0.12.6` — `<scope>runtime</scope>`
  - `io.jsonwebtoken:jjwt-jackson:0.12.6` — `<scope>runtime</scope>`

> **Must be done first.** All new backend classes import from these libraries.

---

### 2 · application.yml — add JWT config block
File: `backend/src/main/resources/application.yml`

Append a new top-level `jwt` block below the existing keys:
```
jwt:
  secret: <64-char hex string — at least 32 bytes required for HMAC-SHA256>
  expiration-ms: 86400000
```
The secret must be ≥ 32 characters (jjwt enforces this at startup; shorter values throw `WeakKeyException`).

---

### 3 · `exception/InvalidCredentialsException.java` — new
Extends `RuntimeException`. No-arg constructor calling `super("Invalid email or password")`.

### 4 · `dto/LoginRequestDto.java` — new
Fields: `@NotBlank @Email email`, `@NotBlank password`. Getters required.

### 5 · `dto/LoginResponseDto.java` — new
Immutable: `token`, `id`, `name`, `email`. No passwordHash.

### 6 · `util/JwtUtil.java` — new
`@Component`. Reads `${jwt.secret}` and `${jwt.expiration-ms}`. Method `generateToken(User)` using jjwt 0.12.6 HS256.

### 7 · `config/SecurityConfig.java` — new
Permit `/auth/**`, require auth elsewhere, STATELESS, CSRF off. No JWT filter.

### 8 · `service/UserService.java` — add `login(LoginRequestDto)` signature

### 9 · `service/impl/UserServiceImpl.java` — implement `login()`
1. findByEmail → throw InvalidCredentialsException if empty
2. BCrypt.matches → throw if false
3. generateToken → return LoginResponseDto

### 10 · `controller/AuthController.java` — add `POST /login`

### 11 · `exception/GlobalExceptionHandler.java` — add 401 handler for InvalidCredentialsException

### 12 · `frontend/src/app/LoginPage.tsx` — new
2 fields (email, password), axios POST to `/api/auth/login`, store token+user to localStorage, navigate to `/dashboard`.

### 13 · `frontend/src/app/DashboardPage.tsx` — new
Check localStorage on mount, show "Welcome back, {name}!", logout button clears storage + navigates to `/`.

### 14 · `frontend/src/app/App.tsx` — add `/login` and `/dashboard` routes, fix Sign in button to `<Link to="/login">`

### 15 · `frontend/src/app/RegisterPage.tsx` — fix Sign in link from `to="/"` to `to="/login"`

---

## Execution Order

```
Step 1 (pom.xml)
  └─ Step 2 (application.yml)
       └─ Step 6 (JwtUtil)
Step 3 (InvalidCredentialsException)
  └─ Step 11 (GlobalExceptionHandler update)
Step 4 (LoginRequestDto)
Step 5 (LoginResponseDto)
Step 7 (SecurityConfig) ← must exist before app restarts after Step 1
Steps 3+4+5+6 → Step 8 (UserService interface)
  └─ Step 9 (UserServiceImpl)
       └─ Step 10 (AuthController)
Steps 12+13 (new frontend pages, parallel)
  └─ Step 14 (App.tsx routes)
       └─ Step 15 (RegisterPage link fix)
```

## Key Risk Notes

| Risk | Mitigation |
|------|------------|
| Adding `spring-boot-starter-security` auto-blocks all endpoints | Create `SecurityConfig.java` (Step 7) before starting the app after Step 1 |
| JWT secret too short → `WeakKeyException` at startup | Secret must be ≥ 32 ASCII chars for HMAC-SHA256 |
| Security matchers use wrong path | Use `/auth/**` not `/api/auth/**` — matchers operate after context-path stripping |
| `BCryptPasswordEncoder` bean conflict | Keep it in `AppConfig.java`; do not redeclare in `SecurityConfig.java` |
| localStorage key typos | Use identical literals `"spendly_token"` and `"spendly_user"` in both files |

## Verification Checklist

- [ ] `POST /api/auth/login` valid → `200 OK` with `token`, `id`, `name`, `email`; token starts with `eyJ`
- [ ] Wrong password → `401` with `{"error": "Invalid email or password"}`
- [ ] Unknown email → `401` with same message
- [ ] Blank fields → `400 Bad Request`
- [ ] `POST /api/auth/register` still works
- [ ] `/login` page renders with Email + Password fields
- [ ] Valid login stores localStorage keys and navigates to `/dashboard`
- [ ] Invalid login shows error inline
- [ ] `/dashboard` shows `"Welcome back, <name>!"`
- [ ] Logout clears localStorage and navigates to `/`
- [ ] Direct `/dashboard` with no token → redirects to `/login`
- [ ] Landing "Sign in" links to `/login`
- [ ] RegisterPage "Sign in" links to `/login`
