# Learning Notes - Compliance Tracker

Short revision notes. I add to this as we build. Read top to bottom later to revise.

Note: I started with Prisma, then pivoted to learn RAW SQL from scratch. The Prisma version is saved in git if I ever want it. These notes now focus on SQL.

---

## What the project is

An app for a company HR team.
When an employee breaks a rule (late, safety, misconduct), a manager logs it.
The app checks how many times that person did that same rule before, then picks the correct punishment from the company rulebook, and tracks the case until it is closed.

Punishment gets harsher each repeat:
1. First Warning
2. Final Written Warning
3. Suspension 1 (3 days, unpaid)
4. Suspension 2 (5 days, unpaid)
5. Dismissal

Two separate parts of the app:
- Rules part decides WHAT punishment (a lookup, never AI).
- Tracking part follows WHERE the case is (Draft, Submitted, HR Review, Approved, Notified, Closed).

Roles: Manager (creates), HR (approves or rejects), Employee (acknowledges), Admin (manages the rulebook).

---

## The tools we set up

- Node.js - runs JavaScript on your computer.
- npm - installs code packages.
- git - saves versions of your code.
- Next.js - the React framework we build the app in.
- Tailwind CSS - for styling the screens.
- TypeScript - safer JavaScript that catches mistakes early.

Command that created the whole starter project: npx create-next-app@latest compliance-tracker
Command to run the app in the browser: npm run dev  (then open http://localhost:3000)

---

## SQL and PostgreSQL

SQL - a language. The words used to talk to a database (create, read, update, delete). Like English.
PostgreSQL - a database. The actual storage box where the data really lives. It speaks SQL. (Others exist too: MySQL, SQLite.)
Key point: SQL and PostgreSQL are not alternatives. PostgreSQL is a database; SQL is the language it speaks.

---

## Neon

Neon is a free online service that runs PostgreSQL for me, so I do not install or manage it myself.
It keeps my database always online, so my live app (on Vercel) can reach it from anywhere.
Note: Neon runs on top of AWS, but handles the hard parts for me and is free. Both my app and my database must be live on the cloud at the same time.
Where I run SQL: Neon SQL Editor in the browser (left sidebar > Postgres database > SQL Editor). NOT the VS Code terminal (terminal is for npm/git only).

---

## Primary key vs Foreign key

Primary key = my table's own unique id. It identifies each row in ITS OWN table.
Foreign key = a column in my table that points to ANOTHER table's primary key.
Same value, two roles: it is a PRIMARY key where it lives, and a FOREIGN key where another table references it.
Note: every primary key is unique, but not every unique column is the primary key. A table picks ONE column (usually id) as its primary key. Other columns can still be UNIQUE.

---

## The data model (the tables)

Employee - stores people. Columns: id, name (a person like Rahul), department.
Violation - the TYPES of rules that can be broken. Columns: id, name (like Late Attendance). name should be UNIQUE (no duplicates).
Rule - the company rulebook (the ladder). Columns: id, violation_id (foreign key), offense_number, action.
Case - actual incidents. Columns: id, employee_id, violation_id, offense_number, action, status, suspension dates.
CaseEvent - the history/audit trail. Columns: id, case_id, actor, message, created_at.

How to read the Rule table:
- Think of the handbook as a book with one PAGE per rule.
- All rows for Late Attendance carry the same violation_id (say 1). Safety Breach rows carry another (2). The number just says which rule.
- offense_number = which time it is (1st, 2nd, 3rd, 4th, 5th).
- action = the punishment for that time.
- One row means: for THIS rule, at THIS repeat number, give THIS punishment.

Late Attendance ladder: 1st -> First Warning, 2nd -> Final Written Warning, 3rd -> 3-day Suspension, 4th -> 5-day Suspension, 5th -> Dismissal.
Important: the Rule table is the general rulebook for EVERYONE, not one person's record. How many times Rahul was late is tracked in the Case table.

---

## SQL basics

SQL = Structured Query Language. The language used to talk to a database. I say what I want, the database does it.
A database is a set of tables (like spreadsheets: rows and columns).

The main commands:
Structure (the tables):
- CREATE TABLE = make a new table
- ALTER TABLE = change a table (add/remove a column)
- DROP TABLE = delete a table

Data (rows inside tables) = CRUD:
- INSERT = add a row (Create)
- SELECT = read/show rows (Read)
- UPDATE = change rows (Update)
- DELETE = remove rows (Delete)

Rules to remember when writing SQL:
1. Every statement ends with a semicolon ;
2. Text values go in single quotes: 'Sales', 'Rahul'. Numbers don't: 5, 100.
3. Keywords usually in CAPITALS (SELECT, FROM, WHERE) for readability. Table/column names lowercase.
4. Spacing and new lines don't matter; the ; ends the statement.
5. Keyword order matters: SELECT before FROM before WHERE.
6. Comments use -- (anything after -- on a line is ignored).

Common SQL keywords/types:
- SERIAL = auto-counting number (1, 2, 3...).
- PRIMARY KEY = the unique id.
- NOT NULL = required (can't be empty).
- TEXT = text. INT = whole number.

Example query explained:
SELECT name FROM employees WHERE department = 'Sales';
= show the name column, from the employees table, only for rows where department is Sales.
- SELECT name = which column(s) to show
- FROM employees = which table
- WHERE department = 'Sales' = the filter (only matching rows)
- SELECT * = show all columns.

---

## CREATE TABLE (making a table)

CREATE TABLE employees (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT NOT NULL
);
- SERIAL = auto-counting number. PRIMARY KEY = the unique id.
- TEXT = text, INT = whole number, DATE = a date, TIMESTAMP = date+time, now() = current time.
- NOT NULL = required. No NOT NULL = optional (can be empty).
- UNIQUE = no duplicates allowed (e.g. violation name).
- DEFAULT 'DRAFT' = fallback value if none given (e.g. status starts as DRAFT).
- SQL uses ( ) for the column list (NOT { } - that's Prisma/JS).

## FOREIGN KEY in SQL

violation_id INT NOT NULL REFERENCES violations(id)
- violation_id = the foreign key (lives in THIS table).
- REFERENCES violations(id) = points to the primary key id in the violations table.
- SQL refuses to add a row pointing to a violation that doesn't exist (keeps data honest).
- A table can have MANY foreign keys (cases has employee_id AND violation_id).

## CRUD - the 4 data commands

INSERT (add rows):
INSERT INTO employees (name, department) VALUES ('Rahul', 'Sales'), ('Priya', 'Marketing');
- Don't include id - SERIAL fills it. Each ( ) is one row.

SELECT (read rows):
SELECT * FROM employees;                 -- all columns
SELECT name FROM employees WHERE department = 'Sales';   -- filtered

UPDATE (change rows):
UPDATE cases SET status = 'APPROVED' WHERE id = 3;
- SET = new value. WHERE = which row(s).

DELETE (remove rows):
DELETE FROM employees WHERE name = 'Test Person';

*** BIGGEST SAFETY RULE ***
UPDATE or DELETE without a WHERE changes/deletes EVERY row. ALWAYS add a WHERE. Check it before running.

## JOIN (combine two tables)

SELECT rules.offense_number, rules.action, violations.name
FROM rules
JOIN violations ON rules.violation_id = violations.id;
- JOIN stitches two tables together using their link (foreign key = primary key).
- ON = the matching condition (where the foreign key equals the primary key).
- Use table.column when pulling from more than one table.
- Why: rules only stores violation_id (a number). JOIN turns that number back into the readable name.

## COUNT (how many rows)

SELECT COUNT(*) FROM cases WHERE employee_id = 1 AND violation_id = 1;
- COUNT(*) returns ONE number = how many rows matched (not the rows themselves).
- AND = combine conditions; a row must match BOTH.

## The rules engine, in pure SQL (Rahul, 3rd late attendance)

1. Count his past cases: SELECT COUNT(*) FROM cases WHERE employee_id = 1 AND violation_id = 1;  -> 2
2. So this is the 3rd (2 + 1).
3. Look up the rule: SELECT action FROM rules WHERE violation_id = 1 AND offense_number = 3;  -> SUSPENSION_3_DAYS

Quotes reminder: single 'quotes' = text value; "double" = table/column name; numbers = no quotes. Lowercase simple names need no quotes.

---

(more notes to be added as we build)
