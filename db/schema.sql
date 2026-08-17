-- Compliance Tracker - database schema (PostgreSQL)
-- Run these in order (foreign keys require the referenced table to exist first).

CREATE TABLE employees (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT NOT NULL
);

CREATE TABLE violations (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE rules (
  id SERIAL PRIMARY KEY,
  violation_id INT NOT NULL REFERENCES violations(id),
  offense_number INT NOT NULL,
  action TEXT NOT NULL
);

CREATE TABLE cases (
  id SERIAL PRIMARY KEY,
  employee_id INT NOT NULL REFERENCES employees(id),
  violation_id INT NOT NULL REFERENCES violations(id),
  offense_number INT NOT NULL,
  action TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  suspension_start_date DATE,
  suspension_days INT,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE case_events (
  id SERIAL PRIMARY KEY,
  case_id INT NOT NULL REFERENCES cases(id),
  actor TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);
