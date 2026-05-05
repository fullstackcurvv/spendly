## 1. Overview

create repository and model classes in the backend folder according to the folder structure defined in the CLAUDE.md file

This step establishes the **data layer foundation** for the Spendly application.

All future features (profile, expense tracking) depend on this being correctly implemented.

---

## 2. Depends on

Nothing — this is the first step.

---

## 3. Routes

- No new routes

---

## 4. Database Schema

---

### A. users

| Column | Type | Constraints |
| --- | --- | --- |
| id | INTEGER | Primary key, autoincrement |
| name | TEXT | Not null |
| email | TEXT | Unique, not null |
| password_hash | TEXT | Not null |
| created_at | TEXT | Default datetime('now') |

---

### B. expenses

| Column | Type | Constraints |
| --- | --- | --- |
| id | INTEGER | Primary key, autoincrement |
| user_id | INTEGER | Foreign key → users.id, not null |
| amount | REAL | Not null |
| category | TEXT | Not null |
| date | TEXT | Not null (YYYY-MM-DD format) |
| description | TEXT | Nullable |
| created_at | TEXT | Default datetime('now') |

---

## 5. Categories (Fixed List)

Use exactly these values:

- Food
- Transport
- Bills
- Health
- Entertainment
- Shopping
- Other

---

## 6. Error Handling Expectations

- Inserting duplicate email → should fail (UNIQUE constraint)
- Inserting expense with invalid `user_id` → should fail (foreign key constraint)
- Invalid queries → should raise clear errors for debugging

---

## 7. Definition of Done

- [ ]  Database file is created on app startup
- [ ]  Both tables exist with correct schema and constraints
- [ ]  Demo user exists with hashed password
- [ ]  8 sample expenses exist across categories
- [ ]  No duplicate seed data on repeated runs
- [ ]  App starts without errors
- [ ]  Foreign key enforcement works
- [ ]  All queries use parameterized SQL