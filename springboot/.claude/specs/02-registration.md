# Spec: Registration

## Overview
This feature adds a user registration endpoint to the Spendly backend and a corresponding registration form on the frontend. It is the first user-facing auth step: a visitor submits their name, email, and password; the backend validates the input, hashes the password with BCrypt, persists the new user, and returns a sanitised user object. No session or token is issued in this step — authentication (login/JWT) comes later.

## Depends on
- **Step 01 — Database Setup**: `User` domain model, `UserRepository` interface, all three repository adapters (MongoDB, PostgreSQL, SQL Server), and the `BCryptPasswordEncoder` bean in `AppConfig` must exist.

## Routes
- `POST /auth/register` — register a new user account — public  
  (full URL with context-path: `POST /api/auth/register`)

## Database changes
No database changes. The `users` table/collection from step 01 already has all required fields:

| Field         | Notes                              |
|---------------|------------------------------------|
| id            | auto-generated                     |
| name          | stored as-is                       |
| email         | unique constraint already enforced |
| password_hash | BCrypt hash stored here            |
| created_at    | set on save                        |

## Templates
Not applicable — this is a Spring Boot + React project, not a server-rendered template app.

## Files to change
- `frontend/src/app/App.tsx` — add the `/register` route

## Files to create

### Backend
| File | Purpose |
|------|---------|
| `backend/src/main/java/com/spendly/dto/RegisterRequestDto.java` | Incoming request body with JSR-380 validation annotations |
| `backend/src/main/java/com/spendly/dto/UserResponseDto.java` | Outgoing response — never includes `passwordHash` |
| `backend/src/main/java/com/spendly/service/UserService.java` | Service interface declaring `register(RegisterRequestDto)` |
| `backend/src/main/java/com/spendly/service/impl/UserServiceImpl.java` | Service implementation: validates uniqueness, hashes password, saves user |
| `backend/src/main/java/com/spendly/controller/AuthController.java` | `@RestController` mapping `POST /auth/register` |

### Frontend
| File | Purpose |
|------|---------|
| `frontend/src/app/RegisterPage.tsx` | Registration form page with name, email, and password fields |
- link the registration page in the landing page

## New dependencies
No new dependencies. Both `spring-boot-starter-validation` (for `@Valid`, `@NotBlank`, `@Email`, `@Size`) and `spring-security-crypto` (for `BCryptPasswordEncoder`) are already in `pom.xml`.

## Rules for implementation

### Backend
- Use `BCryptPasswordEncoder` (already a `@Bean` in `AppConfig`) — never store plain-text passwords.
- Use `@Valid` on the controller method parameter and JSR-380 annotations (`@NotBlank`, `@Email`, `@Size`) on `RegisterRequestDto`.
- Duplicate email → `409 Conflict` with JSON body `{ "error": "Email already in use" }`.
- Validation failure → `400 Bad Request` (Spring's default `MethodArgumentNotValidException` handling is acceptable).
- Successful registration → `201 Created` with `UserResponseDto` (fields: `id`, `name`, `email`, `createdAt`).
- `UserResponseDto` must **never** include `passwordHash` or any password field.
- Controller only receives, delegates to service, and returns the response — zero business logic in the controller.
- Service layer checks `userRepository.existsByEmail(email)` before saving.
- Map `User` → `UserResponseDto` inside the service (no framework mapper needed — manual mapping is fine).
- Do not add Spring Security filter chains, session management, or JWT in this step.
- All three profiles (mongodb, postgresql, sqlserver) must work identically through the existing `UserRepository` adapters.

### Frontend
- Use CSS variables only — never hardcode hex colour values.
- Fields: **Name** (required), **Email** (required, valid format), **Password** (required, min 8 characters).
- Show inline validation errors before submission.
- On `201` response: redirect the user to the login page (or a "registration successful" confirmation).
- On `409` response: display the server error message inline (e.g., "Email already in use").
- On `400` response: display a generic validation error.
- Use `axios` (already installed) with `baseURL` `/api` to call `POST /auth/register`.
- Keep the design consistent with the existing landing page — use the brand green (`--brand-green`) and background (`--page-bg`) CSS variables defined in `src/styles/theme.css`.

## Definition of done
- [ ] `POST /api/auth/register` with valid `{ name, email, password }` body → `201 Created`, response contains `id`, `name`, `email`, `createdAt` and **no** password field
- [ ] `POST /api/auth/register` with a duplicate email → `409 Conflict` with `{ "error": "Email already in use" }`
- [ ] `POST /api/auth/register` with missing or blank `name`, `email`, or `password` → `400 Bad Request`
- [ ] `POST /api/auth/register` with an invalid email format → `400 Bad Request`
- [ ] `POST /api/auth/register` with `password` shorter than 8 characters → `400 Bad Request`
- [ ] Inspecting the stored record in the DB confirms `passwordHash` is a BCrypt string (starts with `$2a$`), never plain text
- [ ] Frontend `/register` page renders a form with Name, Email, and Password fields
- [ ] Submitting a valid form calls `POST /api/auth/register` and navigates away on success
- [ ] Submitting a duplicate email shows "Email already in use" inline without a full page reload
- [ ] Frontend shows field-level validation errors for blank/invalid inputs before submission
- [ ] App starts without errors on all three profiles: `mongodb`, `postgresql`, `sqlserver`
