# Learning Notes - Compliance Tracker

Short revision notes. I add to this as we build. Read top to bottom later to revise.

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

Command that created the whole starter project:
npx create-next-app@latest compliance-tracker

Command to run the app and see it in the browser:
npm run dev  (then open http://localhost:3000)

---

## Database: the three words that confused me (now clear)

SQL - a language. The words used to talk to a database (create, read, update, delete). Like English.

PostgreSQL - a database. The actual storage box where the data really lives. It speaks SQL. (Others exist too: MySQL, SQLite.)

Prisma - a translator between my code and the database. I write simple code, Prisma writes the SQL for me.

How they work together:
My code  ->  Prisma  ->  SQL  ->  PostgreSQL
simple code   translator   language   storage box

Key boundaries to remember:
- SQL and PostgreSQL are not alternatives. PostgreSQL is a database, SQL is the language it speaks.
- Prisma is NOT a database.
- Prisma does two jobs: creates the tables (from a blueprint) AND handles the data inside (add, read, update, delete rows).
- Prisma works INSIDE a database. It does not create the database box itself - that box is made on Neon/PostgreSQL.

Simple line: PostgreSQL is the box, SQL is its language, Prisma writes that language for me.

Prisma extra facts:
- It is a free, open-source library made by a company called Prisma.
- It is independent - not tied to Next.js or React. It only handles the database.
- The blueprint file is called schema.prisma.
- Command to build tables from the blueprint: npx prisma migrate dev

---

## Neon

Neon is a free online service that runs PostgreSQL for me, so I do not install or manage it myself.
It keeps my database always online, so my live app (on Vercel) can reach it from anywhere.
Note: Neon runs on top of AWS, but handles the hard parts for me and is free. Both my app and my database must be live on the cloud at the same time.

---

## Migrations

Migration keeps local and remote in sync. ✓
Every time you change the database structure and run the migrate command, a migration file is generated. ✓
It logs the history — what happened, what changed. ✓
Without migrations, you wouldn't have a record of what was updated or changed. ✓
---

## Primary key vs Foreign key

Primary key = my table's own unique id. It identifies each row in ITS OWN table. Example: Violation.id.
Foreign key = a column in my table that points to ANOTHER table's primary key. Example: Rule.violationId points to Violation.id.

Same value, two roles: the number is a PRIMARY key where it lives (Violation table) and a FOREIGN key where it is referenced (Rule table).

Note: every primary key is unique, but not every unique column is the primary key. A table picks ONE column (usually id) as its primary key. Other columns can still be @unique (e.g. Violation.name).

---

## The tables so far

Employee - stores people. Columns: id, name (a person like Rahul), department.
Violation - stores the TYPES of rules that can be broken. Columns: id, name (like Late Attendance). name is @unique so no duplicates.
Rule - the company rulebook (the ladder). Columns: id, violationId (foreign key), offenseNumber, action.

How to read the Rule table (this confused me, now clear):
- Think of the handbook as a book with one PAGE per rule.
- The Late Attendance page has 5 lines, one per repeat.
- violationId = which rule/page the row belongs to. All rows for Late Attendance carry violationId = 1. Safety Breach rows would all carry 2. The number just says which rule.
- offenseNumber = which time it is (1st, 2nd, 3rd, 4th, 5th).
- action = the punishment for that time.
- One row means: for THIS rule, at THIS repeat number, give THIS punishment.
  Example: violationId 1, offenseNumber 3 -> 3-day Suspension = Late Attendance, 3rd time.

Late Attendance ladder:
1st time -> First Warning
2nd time -> Final Written Warning
3rd time -> 3-day Suspension
4th time -> 5-day Suspension
5th time -> Dismissal

Important: the Rule table is the general rulebook for EVERYONE, not one person's record. How many times Rahul specifically was late is tracked later in the Cases table.

---

## Relationships and enum (new in the Rule table)

Relationship = tables linked together. One Violation has many Rules (5). Prisma code:
- On Rule: violation Violation @relation(fields: [violationId], references: [id]) and violationId Int
- On Violation: rules Rule[]   (the [] means "many")

fields and references in basic words: fields is the column in MY table that holds the other table's primary key (the foreign key), and references is just adding which primary key of the other table we are pointing to.

Enum = a fixed, locked list of allowed values. The Action enum has exactly 5 punishments, so no wrong value can ever be typed. This is the "safe code" idea.

---

(more notes to be added as we build)
