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

-- Cases (a clean, realistic starting caseload)
-- Rahul's Late Attendance escalates 1 -> 2 -> 3 (a nice ladder story).
INSERT INTO cases (employee_id, violation_id, offense_number, action, status, incident_date, description)
VALUES
  (1, 1, 1, 'FIRST_WARNING',         'CLOSED',    '2026-05-10', 'Arrived 25 minutes late without notice.'),
  (1, 1, 2, 'FINAL_WRITTEN_WARNING', 'CLOSED',    '2026-06-18', 'Second late arrival this quarter.'),
  (1, 2, 1, 'FINAL_WRITTEN_WARNING', 'CLOSED',    '2026-07-02', 'Bypassed the safety checklist on the floor.'),
  (2, 1, 1, 'FIRST_WARNING',         'DRAFT',     '2026-08-20', 'Late back from break.'),
  (3, 3, 1, 'FIRST_WARNING',         'SUBMITTED', '2026-08-22', 'Unprofessional conduct in a team meeting.'),
  (2, 2, 1, 'FINAL_WRITTEN_WARNING', 'SUBMITTED', '2026-08-24', 'Left equipment unsecured overnight.'),
  (1, 1, 3, 'SUSPENSION_3_DAYS',     'APPROVED',  '2026-08-26', 'Third late arrival; escalated per policy.');

-- Case events (audit trail) for the escalated, approved case (case_id 7)
INSERT INTO case_events (case_id, actor, message, created_at)
VALUES
  (7, 'Manager', 'Submitted for HR review',              '2026-08-26 09:15'),
  (7, 'HR',      'Approved — notice issued to employee', '2026-08-26 11:40');
