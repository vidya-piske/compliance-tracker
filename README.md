# Corrective Action Tracker

An HR corrective-action (progressive-discipline) tracker. When an employee breaks a company rule, a manager logs the incident and the app automatically determines the correct corrective action from the rulebook — based on **which** violation it was and **how many times** that employee has committed it — then tracks the case through HR review to closure.

## Features

- **Rules engine** — deterministic lookup: `violation + offense number → corrective action` (a 5-level ladder: First Warning → Final Written Warning → 3-day Suspension → 5-day Suspension → Dismissal). The action is decided by the rulebook, never guessed.
- **Manager dashboard** — a live cases table (real data), coloured status badges, and summary stat counts.
- **Log an incident** — pick an employee + violation and see the recommended action compute live from the rules engine. Save as a draft (reopenable and pre-filled) or submit for HR review.
- **Action ladder** — a visual of the five corrective-action levels showing where an employee currently sits and why.
- **HR review** — approve or reject the cases managers submit.

## Tech stack

- **Next.js** (App Router) + **TypeScript**
- **Tailwind CSS**
- **PostgreSQL** (hosted on Neon), accessed with raw SQL via **node-postgres (`pg`)**
- **Server Components** for data fetching + **Server Actions** for writes

## Database

- Schema: [`db/schema.sql`](db/schema.sql)
- Seed data: [`db/seed.sql`](db/seed.sql)

Tables: `employees`, `violations`, `rules` (the rulebook), `cases`, `case_events` (audit trail).

## Getting started

```bash
npm install
# create .env with your Neon connection string:
# DATABASE_URL="postgresql://..."
npm run dev
```

Then open http://localhost:3000.

## Roles

Manager (build cases), HR (approve/reject), Employee (acknowledge — planned), Admin (manage the rulebook — planned).
