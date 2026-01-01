-- Fix Staff5 Timetable Assignments
-- Assigns Staff5 to all timetable sessions that teach COMPUTER NETWORKS

USE attendance_db;

-- 1. Verify Staff5 and subject exist
SELECT 'Current Staff5 data:' as Info;
SELECT st.id, st.name, st.staff_code, st.subject,
       sub.id as subject_id, sub.name as subject_name
FROM staff st
LEFT JOIN staff_subjects ss ON st.id = ss.staff_id
LEFT JOIN subject sub ON ss.subject_id = sub.id
WHERE st.staff_code = 'STAFF005' OR st.name = 'staff5';

-- 2. Get the subject ID for COMPUTER NETWORKS
SELECT 'Subject ID for COMPUTER NETWORKS:' as Info;
SELECT id, name, code FROM subject 
WHERE LOWER(name) = 'computer networks' OR LOWER(code) = 'cs105';

-- 3. Assign Staff5 to all timetable sessions for COMPUTER NETWORKS
UPDATE timetable_session
SET staff_id = (SELECT id FROM staff WHERE staff_code = 'STAFF005' OR name = 'staff5' LIMIT 1)
WHERE subject_id = (SELECT id FROM subject WHERE LOWER(name) = 'computer networks' OR LOWER(code) = 'cs105' LIMIT 1)
AND active = true;

-- 4. Verify the assignment
SELECT 'Staff5 timetable sessions after update:' as Info;
SELECT 
    ts.id,
    ts.day_of_week,
    ts.start_time,
    ts.end_time,
    st.name as staff_name,
    st.staff_code,
    sub.name as subject_name,
    ts.department,
    ts.semester,
    ts.section
FROM timetable_session ts
JOIN staff st ON ts.staff_id = st.id
JOIN subject sub ON ts.subject_id = sub.id
WHERE st.staff_code = 'STAFF005' OR st.name = 'staff5'
ORDER BY FIELD(ts.day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'), ts.start_time;

-- 5. Count assigned sessions
SELECT CONCAT('Total sessions assigned to Staff5: ', COUNT(*)) as Result
FROM timetable_session ts
WHERE ts.staff_id = (SELECT id FROM staff WHERE staff_code = 'STAFF005' LIMIT 1)
AND ts.active = true;
