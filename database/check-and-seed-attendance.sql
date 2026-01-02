-- Check current attendance data for Guruseelan (user_id = 1)
SELECT 
    sa.id,
    sa.date,
    sa.status,
    s.name as student_name,
    s.roll_no,
    sub.name as subject_name,
    ts.day_of_week,
    ts.start_time
FROM session_attendance sa
JOIN student s ON sa.student_id = s.id
JOIN timetable_session ts ON sa.session_id = ts.id
JOIN subject sub ON ts.subject_id = sub.id
WHERE s.section = 'A' AND s.semester = 6 AND s.department = 'Computer Science'
ORDER BY sa.date DESC, s.roll_no;

-- Check all students in section A
SELECT id, name, roll_no, section, semester, department, user_id
FROM student
WHERE section = 'A' AND semester = 6 AND department = 'Computer Science';

-- Check timetable sessions for Monday (today is Friday, but let's see Monday sessions)
SELECT 
    ts.id,
    ts.day_of_week,
    ts.start_time,
    ts.end_time,
    sub.name as subject_name,
    st.name as faculty_name
FROM timetable_session ts
LEFT JOIN subject sub ON ts.subject_id = sub.id
LEFT JOIN staff st ON ts.staff_id = st.id
WHERE ts.department = 'Computer Science'
  AND ts.semester = 6
  AND ts.section = 'A'
  AND ts.day_of_week = 'Monday'
  AND ts.active = true
ORDER BY ts.start_time;

-- Add more attendance records for testing (PRESENT status)
-- Get student IDs first
SET @student1 = (SELECT id FROM student WHERE user_id = 1 LIMIT 1);
SET @student2 = (SELECT id FROM student WHERE roll_no = '21CSA24' LIMIT 1);
SET @student3 = (SELECT id FROM student WHERE roll_no = '21CSA25' LIMIT 1);
SET @student4 = (SELECT id FROM student WHERE roll_no = '21CSA26' LIMIT 1);

-- Get Monday session IDs
SET @monday_algo = (SELECT id FROM timetable_session WHERE department = 'Computer Science' AND semester = 6 AND section = 'A' AND day_of_week = 'Monday' AND subject_id = (SELECT id FROM subject WHERE name = 'Algorithms' LIMIT 1) LIMIT 1);
SET @monday_python = (SELECT id FROM timetable_session WHERE department = 'Computer Science' AND semester = 6 AND section = 'A' AND day_of_week = 'Monday' AND subject_id = (SELECT id FROM subject WHERE name = 'Python Programming' LIMIT 1) LIMIT 1);
SET @monday_oops = (SELECT id FROM timetable_session WHERE department = 'Computer Science' AND semester = 6 AND section = 'A' AND day_of_week = 'Monday' AND subject_id = (SELECT id FROM subject WHERE name = 'OOPS' LIMIT 1) LIMIT 1);

-- Insert attendance for all 4 students for multiple subjects and dates
-- Week 1: Dec 30, 2025 (Monday)
INSERT IGNORE INTO session_attendance (student_id, session_id, date, status, present) VALUES
-- Guruseelan (PRESENT for all classes)
(@student1, @monday_algo, '2025-12-30', 'PRESENT', true),
(@student1, @monday_python, '2025-12-30', 'PRESENT', true),
(@student1, @monday_oops, '2025-12-30', 'PRESENT', true),

-- Other students
(@student2, @monday_algo, '2025-12-30', 'PRESENT', true),
(@student2, @monday_python, '2025-12-30', 'ABSENT', false),
(@student2, @monday_oops, '2025-12-30', 'PRESENT', true),

(@student3, @monday_algo, '2025-12-30', 'PRESENT', true),
(@student3, @monday_python, '2025-12-30', 'PRESENT', true),
(@student3, @monday_oops, '2025-12-30', 'OD', true),

(@student4, @monday_algo, '2025-12-30', 'ABSENT', false),
(@student4, @monday_python, '2025-12-30', 'PRESENT', true),
(@student4, @monday_oops, '2025-12-30', 'PRESENT', true);

-- Week 2: Jan 6, 2026 (Next Monday)
INSERT IGNORE INTO session_attendance (student_id, session_id, date, status, present) VALUES
-- Guruseelan (mix of PRESENT and OD)
(@student1, @monday_algo, '2026-01-06', 'PRESENT', true),
(@student1, @monday_python, '2026-01-06', 'OD', true),
(@student1, @monday_oops, '2026-01-06', 'PRESENT', true);

-- Verify inserted records
SELECT 
    COUNT(*) as total_attendance_records,
    SUM(CASE WHEN status = 'PRESENT' THEN 1 ELSE 0 END) as present_count,
    SUM(CASE WHEN status = 'ABSENT' THEN 1 ELSE 0 END) as absent_count,
    SUM(CASE WHEN status = 'OD' THEN 1 ELSE 0 END) as od_count
FROM session_attendance sa
JOIN student s ON sa.student_id = s.id
WHERE s.section = 'A' AND s.semester = 6 AND s.department = 'Computer Science';
