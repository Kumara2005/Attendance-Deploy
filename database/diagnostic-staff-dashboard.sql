-- Diagnostic queries for Staff Dashboard issue
-- Run these queries to check the current state of the database

-- 1. Check all users
SELECT id, username, role, enabled FROM users;

-- 2. Check staff records and their linkage to users
SELECT s.id as staff_id, s.staff_code, s.name, s.department, s.user_id, u.username, u.role 
FROM staff s 
LEFT JOIN users u ON s.user_id = u.id;

-- 3. Check all timetable sessions with staff info
SELECT ts.id, ts.staff_id, ts.day_of_week, ts.start_time, ts.end_time, 
       ts.department, ts.semester, ts.section, ts.active,
       s.name as staff_name, s.staff_code
FROM timetable_session ts
LEFT JOIN staff s ON ts.staff_id = s.id
ORDER BY ts.day_of_week, ts.start_time;

-- 4. Check Thursday sessions specifically
SELECT ts.id, ts.staff_id, ts.day_of_week, ts.start_time, ts.end_time, 
       ts.department, ts.semester, ts.section, ts.active,
       s.name as staff_name, sub.name as subject_name
FROM timetable_session ts
LEFT JOIN staff s ON ts.staff_id = s.id
LEFT JOIN subject sub ON ts.subject_id = sub.id
WHERE LOWER(ts.day_of_week) = 'thursday' AND ts.active = TRUE;

-- 5. Check what day name format is used in database
SELECT DISTINCT day_of_week FROM timetable_session;

-- 6. Check staff_subjects mapping
SELECT ss.staff_id, s.name as staff_name, ss.subject_id, sub.code, sub.name as subject_name
FROM staff_subjects ss
LEFT JOIN staff s ON ss.staff_id = s.id
LEFT JOIN subject sub ON ss.subject_id = sub.id;

-- 7. Find the staff record for username 'staff'
SELECT s.id as staff_id, s.staff_code, s.name, s.department, 
       u.id as user_id, u.username, u.role
FROM staff s
JOIN users u ON s.user_id = u.id
WHERE u.username = 'staff';

-- 8. Count total timetable sessions by staff_id
SELECT staff_id, COUNT(*) as session_count
FROM timetable_session
WHERE active = TRUE
GROUP BY staff_id;
