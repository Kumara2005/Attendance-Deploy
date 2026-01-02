-- Add more attendance records for Guruseelan to show meaningful percentages
-- User_id = 10, Student_id = 1

-- Get student and session IDs
SET @student_guruseelan = 1;

-- Get session IDs for different subjects
SET @session_algo = (SELECT id FROM timetable_session WHERE department = 'Computer Science' AND semester = 6 AND section = 'A' AND subject_id = (SELECT id FROM subject WHERE name = 'Algorithms') LIMIT 1);
SET @session_python = (SELECT id FROM timetable_session WHERE department = 'Computer Science' AND semester = 6 AND section = 'A' AND subject_id = (SELECT id FROM subject WHERE name = 'Python Programming') LIMIT 1);
SET @session_oops = (SELECT id FROM timetable_session WHERE department = 'Computer Science' AND semester = 6 AND section = 'A' AND subject_id = (SELECT id FROM subject WHERE name = 'OOPS') LIMIT 1);
SET @session_toc = (SELECT id FROM timetable_session WHERE department = 'Computer Science' AND semester = 6 AND section = 'A' AND subject_id = (SELECT id FROM subject WHERE name = 'TOC') LIMIT 1);
SET @session_apt = (SELECT id FROM timetable_session WHERE department = 'Computer Science' AND semester = 6 AND section = 'A' AND subject_id = (SELECT id FROM subject WHERE name = 'Aptitude') LIMIT 1);

-- Delete the ABSENT record and add multiple records with proper dates
DELETE FROM session_attendance WHERE student_id = @student_guruseelan;

-- Week 1: Dec 23, 2025 (Monday)
INSERT INTO session_attendance (student_id, session_id, attendance_date, status, present) VALUES
(@student_guruseelan, @session_algo, '2025-12-23', 'PRESENT', 1),
(@student_guruseelan, @session_python, '2025-12-23', 'PRESENT', 1),
(@student_guruseelan, @session_oops, '2025-12-23', 'PRESENT', 1);

-- Week 1: Dec 24, 2025 (Tuesday)
INSERT INTO session_attendance (student_id, session_id, attendance_date, status, present) VALUES
(@student_guruseelan, @session_algo, '2025-12-24', 'PRESENT', 1),
(@student_guruseelan, @session_python, '2025-12-24', 'PRESENT', 1),
(@student_guruseelan, @session_oops, '2025-12-24', 'ABSENT', 0);

-- Week 1: Dec 25, 2025 (Wednesday)
INSERT INTO session_attendance (student_id, session_id, attendance_date, status, present) VALUES
(@student_guruseelan, @session_algo, '2025-12-25', 'PRESENT', 1),
(@student_guruseelan, @session_python, '2025-12-25', 'PRESENT', 1),
(@student_guruseelan, @session_oops, '2025-12-25', 'PRESENT', 1);

-- Week 1: Dec 26, 2025 (Thursday)
INSERT INTO session_attendance (student_id, session_id, attendance_date, status, present) VALUES
(@student_guruseelan, @session_algo, '2025-12-26', 'PRESENT', 1),
(@student_guruseelan, @session_python, '2025-12-26', 'OD', 1),
(@student_guruseelan, @session_oops, '2025-12-26', 'PRESENT', 1);

-- Week 1: Dec 27, 2025 (Friday)
INSERT INTO session_attendance (student_id, session_id, attendance_date, status, present) VALUES
(@student_guruseelan, @session_algo, '2025-12-27', 'PRESENT', 1),
(@student_guruseelan, @session_python, '2025-12-27', 'PRESENT', 1),
(@student_guruseelan, @session_oops, '2025-12-27', 'ABSENT', 0);

-- Week 2: Dec 30, 2025 (Monday)
INSERT INTO session_attendance (student_id, session_id, attendance_date, status, present) VALUES
(@student_guruseelan, @session_algo, '2025-12-30', 'PRESENT', 1),
(@student_guruseelan, @session_python, '2025-12-30', 'PRESENT', 1),
(@student_guruseelan, @session_oops, '2025-12-30', 'PRESENT', 1);

-- Week 2: Dec 31, 2025 (Tuesday)
INSERT INTO session_attendance (student_id, session_id, attendance_date, status, present) VALUES
(@student_guruseelan, @session_algo, '2025-12-31', 'PRESENT', 1),
(@student_guruseelan, @session_python, '2025-12-31', 'PRESENT', 1),
(@student_guruseelan, @session_oops, '2025-12-31', 'PRESENT', 1);

-- Week 2: Jan 1, 2026 (Wednesday)
INSERT INTO session_attendance (student_id, session_id, attendance_date, status, present) VALUES
(@student_guruseelan, @session_algo, '2026-01-01', 'PRESENT', 1),
(@student_guruseelan, @session_python, '2026-01-01', 'PRESENT', 1),
(@student_guruseelan, @session_oops, '2026-01-01', 'PRESENT', 1);

-- Week 2: Jan 2, 2026 (Thursday - TODAY)
INSERT INTO session_attendance (student_id, session_id, attendance_date, status, present) VALUES
(@student_guruseelan, @session_algo, '2026-01-02', 'PRESENT', 1),
(@student_guruseelan, @session_python, '2026-01-02', 'PRESENT', 1),
(@student_guruseelan, @session_oops, '2026-01-02', 'PRESENT', 1);

-- Verify results
SELECT 
    sub.name as subject,
    COUNT(*) as total_classes,
    SUM(CASE WHEN sa.status IN ('PRESENT', 'OD') THEN 1 ELSE 0 END) as attended,
    SUM(CASE WHEN sa.status = 'ABSENT' THEN 1 ELSE 0 END) as absent,
    ROUND((SUM(CASE WHEN sa.status IN ('PRESENT', 'OD') THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as percentage
FROM session_attendance sa
JOIN timetable_session ts ON sa.session_id = ts.id
JOIN subject sub ON ts.subject_id = sub.id
WHERE sa.student_id = @student_guruseelan
GROUP BY sub.id, sub.name;

-- Overall attendance
SELECT 
    COUNT(*) as total_classes,
    SUM(CASE WHEN status IN ('PRESENT', 'OD') THEN 1 ELSE 0 END) as attended,
    ROUND((SUM(CASE WHEN status IN ('PRESENT', 'OD') THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as overall_percentage
FROM session_attendance
WHERE student_id = @student_guruseelan;
