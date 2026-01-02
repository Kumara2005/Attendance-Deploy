-- Fix timetable session semester mismatch
-- Problem: Students are in semester 3, but timetable sessions are in semester 6
-- Solution: Update Dhamayenthi's Algorithms sessions to semester 3 to match student enrollment

-- Check current state
SELECT 'BEFORE UPDATE:' AS status;
SELECT id, subject_id, faculty_id, semester, day_of_week, start_time FROM timetable_session 
WHERE faculty_id = 5 AND subject_id = 2;

-- Fix the semester
UPDATE timetable_session 
SET semester = 3 
WHERE faculty_id = 5 AND subject_id = 2 AND semester = 6;

-- Verify the fix
SELECT 'AFTER UPDATE:' AS status;
SELECT id, subject_id, faculty_id, semester, day_of_week, start_time FROM timetable_session 
WHERE faculty_id = 5 AND subject_id = 2;

SELECT CONCAT('✅ Fixed ', ROW_COUNT(), ' timetable sessions for Dhamayenthi (Algorithms, Semester 3)') AS result;
