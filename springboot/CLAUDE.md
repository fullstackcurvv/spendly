# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Spendly is an expense-tracking web app. This repo currently contains only the **frontend** (React + Vite) — the `backend/` directory is empty. The frontend is a landing page with routes to Terms and Privacy Policy pages.

## High-Level Architecture Diagram

```
                        ┌──────────────────────────────────────┐
                        │           React Frontend             │
                        │  (TypeScript + Vite + Tailwind v4)   │
                        └──────────────┬───────────────────────┘
                                       │  HTTP (Axios)
                                       │  baseURL: /api
                                       ▼
                        ┌──────────────────────────────────────┐
                        │         Spring Boot Backend          │
                        │                                      │
                        │  ┌────────────────────────────────┐  │
                        │  │     Controller Layer            │  │
                        │  │   (@RestController)│  │
                        │  └──────────────┬─────────────────┘  │
                        │                 │                     │
                        │  ┌──────────────▼─────────────────┐  │
                        │  │     Service Layer               │  │
                        │  │  (@Service)         │  │
                        │  │  - Business logic               │  │
                        │  │  - Disk file operations          │  │
                        │  │  - Calls repository interface    │  │
                        │  └──────────────┬─────────────────┘  │
                        │                 │                     │
                        │  ┌──────────────▼─────────────────┐  │
                        │  │   Repository Interface          │  │
                        │  │    (interface)    │  │
                        │  └──┬───────────┬────────────┬────┘  │
                        │     │           │            │        │
                        │  ┌──▼──┐  ┌─────▼────┐  ┌───▼────┐  │
                        │  │Mongo│  │PostgreSQL │  │SQL Srv │  │
                        │  │Impl │  │  Impl     │  │ Impl   │  │
                        │  └──┬──┘  └─────┬────┘  └───┬────┘  │
                        │     │           │            │        │
                        └─────┼───────────┼────────────┼───────┘
                              │           │            │
                              ▼           ▼            ▼
                          MongoDB    PostgreSQL    SQL Server
```

## Frontend Folder Structure

```
frontend/
├── ATTRIBUTIONS.md
├── default_shadcn_theme.css
├── file.txt
├── guidelines/
│   └── Guidelines.md
├── index.html
├── package.json
├── package-lock.json
├── pnpm-workspace.yaml
├── postcss.config.mjs
├── README.md
├── vite.config.ts
├── node_modules/
└── src/
    ├── main.tsx
    ├── app/
    │   ├── App.tsx
    │   ├── PrivacyPolicyPage.tsx
    │   ├── TermsPage.tsx
    │   └── components/
    │       ├── figma/
    │       │   └── ImageWithFallback.tsx
    │       └── ui/
    │           ├── accordion.tsx
    │           ├── alert-dialog.tsx
    │           ├── alert.tsx
    │           ├── aspect-ratio.tsx
    │           ├── avatar.tsx
    │           ├── badge.tsx
    │           ├── breadcrumb.tsx
    │           ├── button.tsx
    │           ├── calendar.tsx
    │           ├── card.tsx
    │           ├── carousel.tsx
    │           ├── chart.tsx
    │           ├── checkbox.tsx
    │           ├── collapsible.tsx
    │           ├── command.tsx
    │           ├── context-menu.tsx
    │           ├── dialog.tsx
    │           ├── drawer.tsx
    │           ├── dropdown-menu.tsx
    │           ├── form.tsx
    │           ├── hover-card.tsx
    │           ├── input-otp.tsx
    │           ├── input.tsx
    │           ├── label.tsx
    │           ├── menubar.tsx
    │           ├── navigation-menu.tsx
    │           ├── pagination.tsx
    │           ├── popover.tsx
    │           ├── progress.tsx
    │           ├── radio-group.tsx
    │           ├── resizable.tsx
    │           ├── scroll-area.tsx
    │           ├── select.tsx
    │           ├── separator.tsx
    │           ├── sheet.tsx
    │           ├── sidebar.tsx
    │           ├── skeleton.tsx
    │           ├── slider.tsx
    │           ├── sonner.tsx
    │           ├── switch.tsx
    │           ├── table.tsx
    │           ├── tabs.tsx
    │           ├── textarea.tsx
    │           ├── toggle-group.tsx
    │           ├── toggle.tsx
    │           ├── tooltip.tsx
    │           ├── use-mobile.ts
    │           └── utils.ts
    ├── imports/
    │   └── spendly-landing-page.jpeg
    └── styles/
        ├── fonts.css
        ├── globals.css
        ├── index.css
        ├── tailwind.css
        └── theme.css
```

## Architecture Principles

1. **Clean Architecture** — strict layered boundaries enforced by package structure
2. **Dependency Inversion** — service layer depends on repository interfaces, never on concrete DB implementations
3. **Single Responsibility** — each class/component has exactly one reason to change
4. **Configuration over Code** — database selection, file limits, CORS origins — all externalised to configuration
5. **Adapter Pattern** — each database has its own repository implementation behind a common interface
6. **Shared Validation** — validation constants (MIME whitelist, size limits) defined once, consumed by both backend and frontend

--
## Backend Folder Structure

Backend will be implemented using Spring Boot (Java 17+) following Clean Architecture and layered design.
The backend is currently empty and must be created under a new backend/ directory.

The system is designed to be:

Modular (feature-based packages)
Database-agnostic (via repository interfaces)
Config-driven (profiles + external config)

backend/
└── src/main/java/com/spendly/
    ├── SpendlyApplication.java
    ├── config/
    ├── controller/
    ├── service/
    ├── repository/
    ├── model/
    ├── dto/
    └── util/

## Configuration Profiles

Database selection uses Spring's `spring.profiles.active` property. Each
profile activates the corresponding repository implementation via `@Profile`.

```
# Switch to MongoDB:
spring.profiles.active=mongodb

# Switch to PostgreSQL:
spring.profiles.active=postgresql

# Switch to SQL Server:
spring.profiles.active=sqlserver
```

Only ONE profile is active at a time. The active profile determines:

- Which `application-{profile}.yml` is loaded
- Which `@Profile`-annotated repository bean is instantiated
- Which database driver and connection pool are configured

## Technology Stack

| Layer         | Technology                                                                    |
|---------------|-------------------------------------------------------------------------------|
| Backend       | Java 17+ / Spring Boot 3.x, clean architecture                               |
| ORM           | Hibernate (JPA) for SQL databases                                             |
| MongoDB       | Spring Data MongoDB                                                           |
| SQL Server    | Spring Data JPA with `mssql-jdbc` driver                                      |
| PostgreSQL    | Spring Data JPA with `postgresql` driver                                      |
| DB selection  | `spring.profiles.active` → `@Profile` beans → correct adapter at runtime     |
| Frontend      | React 18 + Vite 6 + TypeScript (strict mode, no `any`)                       |
| Styling       | Tailwind CSS v4 (`@tailwindcss/vite` plugin)                                 |

## Commands

All commands run from the `frontend/` directory:

```bash
cd frontend
npm install       # install dependencies
npm run dev       # start dev server (Vite, localhost:5173)
npm run build     # production build
```

## Architecture

### Entry point
`frontend/src/main.tsx` → mounts `App.tsx` → `BrowserRouter` with routes `/`, `/terms`, `/policy`.

### Source layout
- `src/app/App.tsx` — all route definitions and the `LandingPage` component (hero, features, CTA, footer, YouTube modal)
- `src/app/PrivacyPolicyPage.tsx` / `src/app/TermsPage.tsx` — standalone legal pages
- `src/app/components/ui/` — shadcn/ui component library (do not edit these; regenerate via shadcn CLI if needed)
- `src/app/components/figma/ImageWithFallback.tsx` — Figma Make helper for image imports
- `src/imports/` — static assets (images) exported from Figma
- `src/styles/` — CSS pipeline: `index.css` imports `fonts.css`, `tailwind.css`, `theme.css`

### Styling
Tailwind CSS v4 via the `@tailwindcss/vite` plugin (no `tailwind.config.js` file). Design tokens are CSS variables defined in `src/styles/theme.css` and exposed to Tailwind via `@theme inline`. The brand green is `#2ca85a`; the page background is `#f8f6f4`.

`@` is aliased to `src/` in Vite config. `figma:asset/<filename>` imports resolve to `src/assets/`.

### Key dependencies
- `react-router` v7 — client-side routing
- `lucide-react` — icons
- `motion` — animations
- `recharts` — charts (available but not yet used on the landing page)
- `react-hook-form` — form handling (available, not yet used)
- shadcn/ui (Radix primitives + `class-variance-authority` + `tailwind-merge`)
