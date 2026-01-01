-- ============================================
-- Populate Staff4 with Subjects and Timetable
-- ============================================

USE attendance_db;

-- Step 1: Ensure Staff4 has a subject (update from NULL)
UPDATE staff 
SET subject = 'Data Structures' 
WHERE staff_code = 'STAFF004' OR name = 'Staff4';

-- Step 2: Insert/Update Subjects if they don't exist
INSERT IGNORE INTO subject (code, name, department, semester, credits) VALUES
('CS102', 'Data Structures', 'Computer Science', 1, 4),
('CS201', 'Advanced Algorithms', 'Computer Science', 3, 4),
('CS301', 'Distributed Systems', 'Computer Science', 5, 4);

-- Step 3: Link Staff4 to Subjects (staff_subjects)
-- Get Staff4's ID and link to subjects
INSERT IGNORE INTO staff_subjects (staff_id, subject_id)
SELECT 
    s.id,
    sub.id
FROM staff s, subject sub
WHERE (s.staff_code = 'STAFF004' OR s.name = 'Staff4')
  AND sub.code IN ('CS102', 'CS201', 'CS301');

-- Step 4: Create Timetable Sessions for Staff4
-- Monday: Data Structures (CS102) - Semester 1, Section A
INSERT INTO timetable_session (day_of_week, start_time, end_time, subject_id, staff_id, department, semester, section, room_number, active)
SELECT 'Monday', '10:00:00', '10:50:00', s.id, st.id, 'Computer Science', 1, 'A', 'R102', true
FROM subject s, staff st
WHERE s.code = 'CS102' AND (st.staff_code = 'STAFF004' OR st.name = 'Staff4');

-- Tuesday: Data Structures (CS102) - Semester 1, Section A
INSERT INTO timetable_session (day_of_week, start_time, end_time, subject_id, staff_id, department, semester, section, room_number, active)
SELECT 'Tuesday', '11:00:00', '11:50:00', s.id, st.id, 'Computer Science', 1, 'A', 'R102', true
FROM subject s, staff st
WHERE s.code = 'CS102' AND (st.staff_code = 'STAFF004' OR st.name = 'Staff4');

-- Wednesday: Advanced Algorithms (CS201) - Semester 3, Section B
INSERT INTO timetable_session (day_of_week, start_time, end_time, subject_id, staff_id, department, semester, section, room_number, active)
SELECT 'Wednesday', '09:00:00', '09:50:00', s.id, st.id, 'Computer Science', 3, 'B', 'R201', true
FROM subject s, staff st
WHERE s.code = 'CS201' AND (st.staff_code = 'STAFF004' OR st.name = 'Staff4');

-- Thursday: Advanced Algorithms (CS201) - Semester 3, Section B
INSERT INTO timetable_session (day_of_week, start_time, end_time, subject_id, staff_id, department, semester, section, room_number, active)
SELECT 'Thursday', '10:00:00', '10:50:00', s.id, st.id, 'Computer Science', 3, 'B', 'R201', true
FROM subject s, staff st
WHERE s.code = 'CS201' AND (st.staff_code = 'STAFF004' OR st.name = 'Staff4');

-- Friday: Distributed Systems (CS301) - Semester 5, Section C
INSERT INTO timetable_session (day_of_week, start_time, end_time, subject_id, staff_id, department, semester, section, room_number, active)
SELECT 'Friday', '14:00:00', '14:50:00', s.id, st.id, 'Computer Science', 5, 'C', 'R301', true
FROM subject s, staff st
WHERE s.code = 'CS301' AND (st.staff_code = 'STAFF004' OR st.name = 'Staff4');

-- Step 5: Verify the data was inserted
SELECT 'Staff4 Subjects' as Info;
SELECT s.name, s.staff_code, sub.name, sub.code 
FROM staff s 
JOIN staff_subjects ss ON s.id = ss.staff_id 
JOIN subject sub ON ss.subject_id = sub.id
WHERE s.staff_code = 'STAFF004' OR s.name = 'Staff4';

SELECT 'Staff4 Timetable Sessions' as Info;
SELECT 
    ts.day_of_week, 
    ts.start_time, 
    ts.end_time,
    sub.name,
    ts.department,
    ts.semester,
    ts.section,
    ts.room_number
FROM timetable_session ts
JOIN staff st ON ts.staff_id = st.id
JOIN subject sub ON ts.subject_id = sub.id
WHERE st.staff_code = 'STAFF004' OR st.name = 'Staff4'
ORDER BY 
    FIELD(ts.day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'),
    ts.start_time;
