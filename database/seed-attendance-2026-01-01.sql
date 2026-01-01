-- ============================================
-- Sample Attendance Data for 2026-01-01
-- Seeds attendance records so Reports page has data to display
-- ============================================

USE attendance_db;

-- Insert attendance records for 2026-01-01
-- Students: CS-S1-A01 through CS-S1-A10
-- Sessions: All timetable sessions for Computer Science, Semester 1, Section A

-- Get first timetable session of the day and mark attendance for all students
INSERT INTO session_attendance (student_id, timetable_session_id, date, status)
SELECT 
  s.id,
  (SELECT id FROM timetable_session WHERE day_of_week='Monday' AND start_time='09:00:00' AND department='Computer Science' AND semester=1 AND section='A' LIMIT 1),
  '2026-01-01',
  CASE 
    WHEN s.roll_no IN ('CS-S1-A01', 'CS-S1-A02', 'CS-S1-A03', 'CS-S1-A04', 'CS-S1-A05', 'CS-S1-A06', 'CS-S1-A07') THEN 'PRESENT'
    WHEN s.roll_no IN ('CS-S1-A08', 'CS-S1-A09') THEN 'ABSENT'
    ELSE 'OD'
  END
FROM student s
WHERE s.department='Computer Science' AND s.semester=1 AND s.section='A'
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- Second session
INSERT INTO session_attendance (student_id, timetable_session_id, date, status)
SELECT 
  s.id,
  (SELECT id FROM timetable_session WHERE day_of_week='Monday' AND start_time='10:00:00' AND department='Computer Science' AND semester=1 AND section='A' LIMIT 1),
  '2026-01-01',
  CASE 
    WHEN s.roll_no IN ('CS-S1-A01', 'CS-S1-A02', 'CS-S1-A03', 'CS-S1-A04', 'CS-S1-A06', 'CS-S1-A07', 'CS-S1-A08', 'CS-S1-A10') THEN 'PRESENT'
    WHEN s.roll_no IN ('CS-S1-A05', 'CS-S1-A09') THEN 'ABSENT'
    ELSE 'OD'
  END
FROM student s
WHERE s.department='Computer Science' AND s.semester=1 AND s.section='A'
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- Third session
INSERT INTO session_attendance (student_id, timetable_session_id, date, status)
SELECT 
  s.id,
  (SELECT id FROM timetable_session WHERE day_of_week='Monday' AND start_time='11:00:00' AND department='Computer Science' AND semester=1 AND section='A' LIMIT 1),
  '2026-01-01',
  CASE 
    WHEN s.roll_no IN ('CS-S1-A01', 'CS-S1-A02', 'CS-S1-A03', 'CS-S1-A04', 'CS-S1-A05', 'CS-S1-A06', 'CS-S1-A07', 'CS-S1-A08', 'CS-S1-A09') THEN 'PRESENT'
    WHEN s.roll_no = 'CS-S1-A10' THEN 'ABSENT'
    ELSE 'OD'
  END
FROM student s
WHERE s.department='Computer Science' AND s.semester=1 AND s.section='A'
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- Fourth session
INSERT INTO session_attendance (student_id, timetable_session_id, date, status)
SELECT 
  s.id,
  (SELECT id FROM timetable_session WHERE day_of_week='Monday' AND start_time='12:00:00' AND department='Computer Science' AND semester=1 AND section='A' LIMIT 1),
  '2026-01-01',
  CASE 
    WHEN s.roll_no IN ('CS-S1-A01', 'CS-S1-A02', 'CS-S1-A03', 'CS-S1-A04', 'CS-S1-A05', 'CS-S1-A06', 'CS-S1-A07', 'CS-S1-A08', 'CS-S1-A09', 'CS-S1-A10') THEN 'PRESENT'
    ELSE 'OD'
  END
FROM student s
WHERE s.department='Computer Science' AND s.semester=1 AND s.section='A'
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- Verification: Count attendance records
SELECT COUNT(*) as 'Total Attendance Records' FROM session_attendance WHERE date='2026-01-01';
SELECT s.roll_no, s.name, sa.status 
FROM session_attendance sa
JOIN student s ON sa.student_id = s.id
WHERE sa.date='2026-01-01'
LIMIT 10;

COMMIT;
