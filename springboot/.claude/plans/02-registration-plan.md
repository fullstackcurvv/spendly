# Plan: Registration (Step 02)

## Context
Adding the first user-facing auth feature to Spendly: a `POST /auth/register` endpoint and a matching `/register` page on the frontend. The data layer (User model, UserRepository, BCryptPasswordEncoder bean) already exists from step 01. No controller, service, or DTO packages exist yet — all must be created. Axios is not installed in the frontend.

---

## Backend — 7 files to create

### Package layout (all under `backend/src/main/java/com/spendly/`)
```
controller/AuthController.java
service/UserService.java
service/impl/UserServiceImpl.java
dto/RegisterRequestDto.java
dto/UserResponseDto.java
exception/EmailAlreadyInUseException.java
exception/GlobalExceptionHandler.java
```

### 1. `dto/RegisterRequestDto.java`
Fields with JSR-380 annotations:
- `@NotBlank String name`
- `@NotBlank @Email String email`
- `@NotBlank @Size(min = 8) String password`

Standard getters/setters (no Lombok — consistent with existing models).

### 2. `dto/UserResponseDto.java`
Fields: `String id`, `String name`, `String email`, `LocalDateTime createdAt`.  
All-args constructor + getters only — no setter, no passwordHash field ever.

### 3. `exception/EmailAlreadyInUseException.java`
Extends `RuntimeException`. Constructor sets message `"Email already in use"`.

### 4. `exception/GlobalExceptionHandler.java`
`@RestControllerAdvice` with one handler:
- `@ExceptionHandler(EmailAlreadyInUseException.class)` → `409 Conflict`, body `{ "error": "Email already in use" }`

Spring auto-handles `MethodArgumentNotValidException` as `400 Bad Request`.

### 5. `service/UserService.java`
Interface with one method:
```java
UserResponseDto register(RegisterRequestDto request);
```

### 6. `service/impl/UserServiceImpl.java`
`@Service` implementing `UserService`. Constructor-injected: `UserRepository`, `BCryptPasswordEncoder` (bean from existing `AppConfig`).

Logic:
1. `userRepository.existsByEmail(request.getEmail())` → throw `EmailAlreadyInUseException` if true
2. Build `User`, set `name`, `email`, `passwordHash(passwordEncoder.encode(request.getPassword()))`, `createdAt(LocalDateTime.now())`
3. `userRepository.save(user)` → returns saved user with generated id
4. Map `User` → `UserResponseDto` (manual, inline private method)

### 7. `controller/AuthController.java`
`@RestController @RequestMapping("/auth")`.  
One endpoint:
```
POST /auth/register
  @Valid @RequestBody RegisterRequestDto
  → 201 Created, body: UserResponseDto
```
Zero business logic — delegates entirely to `UserService`.

---

## Frontend — 4 changes

### 1. Install axios
```bash
cd frontend && npm install axios
```

### 2. Add CSS variables to `frontend/src/styles/theme.css`
The brand green (`#2ca85a`) and page background (`#f8f6f4`) are currently hardcoded in App.tsx. Add them as proper variables:

In `:root`:
```css
--brand-green: #2ca85a;
--page-bg: #f8f6f4;
```
In `@theme inline`:
```css
--color-brand-green: var(--brand-green);
--color-page-bg: var(--page-bg);
```

### 3. Create `frontend/src/app/RegisterPage.tsx`
Full-page registration form. Uses shadcn/ui `Input`, `Label`, `Button` components (already available under `src/app/components/ui/`).

**Layout:** Centered card on `bg-[var(--page-bg)]` background. Header logo links back to `/`.

**Fields:** Name, Email, Password (type="password") — each with a `<Label>` and inline error message span.

**Client-side validation (before submit):**
- Name: required
- Email: required + basic regex format check
- Password: required, min 8 chars

**On submit — axios `POST /api/auth/register`:**
- `201` → show "Account created!" message with a link to sign in (login page doesn't exist yet)
- `409` → display `"Email already in use"` below the email field
- `400` or other → display generic `"Something went wrong. Please try again."`

**Axios call:**
```ts
import axios from 'axios';
axios.post('/api/auth/register', { name, email, password })
```
No baseURL instance needed — all calls use the `/api` prefix directly.

**Styling:** Use `var(--brand-green)` for the submit button accent, `var(--page-bg)` for background. No hardcoded hex values.

### 4. Update `frontend/vite.config.ts`
Add a dev proxy so frontend calls to `/api/*` are forwarded to the Spring Boot server at `http://localhost:8080`:
```ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
    },
  },
},
```

### 5. Update `frontend/src/app/App.tsx`
Two changes only:
- Add `<Route path="/register" element={<RegisterPage />} />` inside `<Routes>`
- Change the three "Get started" / "Create free account" buttons (lines 35, 62, 164) to `<Link to="/register">` elements styled to match the existing button classes

---

## Verification
1. Start backend: `cd backend && mvn spring-boot:run` (MongoDB profile active by default)
2. Start frontend: `cd frontend && npm run dev`
3. Navigate to `http://localhost:5173/register` — form renders
4. Submit valid data → `201`, success message shown
5. Submit same email again → `409`, "Email already in use" shown inline
6. Submit with blank name/email/password → client-side errors shown before any network call
7. Submit with 7-char password → client-side error shown
8. In MongoDB (Compass or shell): confirm stored `passwordHash` starts with `$2a$`
9. Clicking "Get started" / "Create free account" on the landing page routes to `/register`
