-- Compliance Tracker — PostgreSQL schema
-- Run top-to-bottom (foreign keys require their referenced tables first).

-- People who can log in (manager | hr | employee | admin).
CREATE TABLE users (
  id                  SERIAL PRIMARY KEY,
  name                TEXT NOT NULL,
  title               TEXT,
  role                TEXT NOT NULL,
  email               TEXT UNIQUE,
  password_hash       TEXT,
  reset_token         TEXT,
  reset_token_expires TIMESTAMP
);

-- Server-side sessions; the id is stored in an httpOnly cookie.
CREATE TABLE sessions (
  id         TEXT PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id),
  expires_at TIMESTAMP NOT NULL
);

-- Violation types (e.g. Late Attendance, Safety Breach).
CREATE TABLE violations (
  id   SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

-- The workforce being tracked. manager_id -> the owning manager (a user).
-- email (optional) links a record to an employee login so they can acknowledge.
CREATE TABLE employees (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  designation TEXT NOT NULL,               -- Intern | Employee | Senior | Lead
  manager_id  INTEGER REFERENCES users(id),
  email       TEXT
);

-- The rule book: for each violation, offense N -> mandated action.
CREATE TABLE rules (
  id             SERIAL PRIMARY KEY,
  violation_id   INTEGER NOT NULL REFERENCES violations(id),
  offense_number INTEGER NOT NULL,
  action         TEXT NOT NULL             -- FIRST_WARNING | FINAL_WRITTEN_WARNING | SUSPENSION_3_DAYS | SUSPENSION_5_DAYS | DISMISSAL
);

-- A filed case. status flows:
-- DRAFT -> SUBMITTED -> APPROVED | RETURNED -> (resubmit) -> ACKNOWLEDGED | CLOSED
CREATE TABLE cases (
  id                    SERIAL PRIMARY KEY,
  employee_id           INTEGER NOT NULL REFERENCES employees(id),
  violation_id          INTEGER NOT NULL REFERENCES violations(id),
  offense_number        INTEGER NOT NULL,
  action                TEXT NOT NULL,
  status                TEXT NOT NULL DEFAULT 'DRAFT',
  incident_date         DATE,
  description           TEXT,
  suspension_start_date DATE,
  suspension_days       INTEGER,
  created_at            TIMESTAMP NOT NULL DEFAULT now()
);

-- Append-only audit trail for each case.
CREATE TABLE case_events (
  id         SERIAL PRIMARY KEY,
  case_id    INTEGER NOT NULL REFERENCES cases(id),
  actor      TEXT NOT NULL,
  message    TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);
