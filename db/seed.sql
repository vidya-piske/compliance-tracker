-- Compliance Tracker - seed data
-- Run after schema.sql.

-- Employees
INSERT INTO employees (name, department)
VALUES
  ('Rahul', 'Sales'),
  ('Priya', 'Marketing'),
  ('John', 'Operations');

-- Violations (the types of rules that can be broken)
INSERT INTO violations (name)
VALUES
  ('Late Attendance'),
  ('Safety Breach'),
  ('Misconduct');

-- Rules (the rulebook / ladders: violation + offense number -> action)
INSERT INTO rules (violation_id, offense_number, action)
VALUES
  -- Late Attendance (violation_id 1)
  (1, 1, 'FIRST_WARNING'),
  (1, 2, 'FINAL_WRITTEN_WARNING'),
  (1, 3, 'SUSPENSION_3_DAYS'),
  (1, 4, 'SUSPENSION_5_DAYS'),
  (1, 5, 'DISMISSAL'),
  -- Safety Breach (violation_id 2)
  (2, 1, 'FINAL_WRITTEN_WARNING'),
  (2, 2, 'SUSPENSION_3_DAYS'),
  (2, 3, 'SUSPENSION_5_DAYS'),
  (2, 4, 'DISMISSAL'),
  -- Misconduct (violation_id 3)
  (3, 1, 'FIRST_WARNING'),
  (3, 2, 'SUSPENSION_3_DAYS'),
  (3, 3, 'DISMISSAL');
