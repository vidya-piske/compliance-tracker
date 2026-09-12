-- Reference data: violation types and their escalation ladders.
-- Run after schema.sql. (Users, employees and cases are created through the app.)

INSERT INTO violations (name) VALUES
  ('Late Attendance'),
  ('Safety Breach'),
  ('Misconduct');

-- Each violation escalates on its own ladder. More serious violations start higher.
INSERT INTO rules (violation_id, offense_number, action) VALUES
  -- Late Attendance
  (1, 1, 'FIRST_WARNING'),
  (1, 2, 'FINAL_WRITTEN_WARNING'),
  (1, 3, 'SUSPENSION_3_DAYS'),
  (1, 4, 'SUSPENSION_5_DAYS'),
  (1, 5, 'DISMISSAL'),
  -- Safety Breach (starts at a written warning)
  (2, 1, 'FINAL_WRITTEN_WARNING'),
  (2, 2, 'SUSPENSION_3_DAYS'),
  (2, 3, 'SUSPENSION_5_DAYS'),
  (2, 4, 'DISMISSAL'),
  -- Misconduct
  (3, 1, 'FIRST_WARNING'),
  (3, 2, 'SUSPENSION_3_DAYS'),
  (3, 3, 'DISMISSAL');
