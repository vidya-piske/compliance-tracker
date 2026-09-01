# Corrective Action Tracker

A full-stack HR corrective-action (progressive-discipline) tracker. When an employee breaks a company rule, a manager logs the incident and the app automatically determines the correct corrective action from the rulebook — based on **which** violation it was and **how many times** that employee has committed it — then tracks the case through HR review to closure, with a full audit trail.

## Architecture

This is a **separate backend + frontend**, built from scratch to learn full-stack development:

- **`backend/`** — a standalone **Node + Express** REST API using **raw SQL** via `node-postgres` (`pg`), talking to **PostgreSQL** (hosted on Neon). Includes roll-your-own **authentication** (bcrypt password hashing + database sessions + httpOnly cookies).
- **`frontend/`** — a **React + Vite + TypeScript** single-page app that consumes the API.
- **`db/`** — the SQL schema and seed data.
- **`design/`** — the design reference the UI is built to match.

> The original **Next.js** version of this project (v1 — complete, all four roles) is preserved on the [`v1-nextjs`](../../tree/v1-nextjs) branch.

## Backend API

Auth: `POST /api/signup`, `POST /api/login`, `POST /api/logout`, `GET /api/me`
Data (protected): `GET /api/employees`, `GET /api/cases`, `GET /api/cases/:id`, `POST /api/cases`, `PATCH /api/cases/:id`, `GET /api/rules`

Every protected route runs through auth middleware that verifies the session and attaches the current user, and personal data is filtered to the logged-in user.

## Getting started

**Backend** (port 4000):
```bash
cd backend
npm install
# create backend/.env with:  DATABASE_URL="postgresql://..."
npm run dev
```

**Frontend** (port 5173):
```bash
cd frontend
npm install
npm run dev
```

## Database

- Schema: [`db/schema.sql`](db/schema.sql)
- Seed data: [`db/seed.sql`](db/seed.sql)

Tables: `users`, `sessions`, `employees`, `violations`, `rules` (the rulebook), `cases`, `case_events` (audit trail).
