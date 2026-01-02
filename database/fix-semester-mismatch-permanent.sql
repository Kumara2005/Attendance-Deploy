-- ============================================
-- FIX: Correct Timetable Sessions Semester Mismatch
-- ============================================
-- Problem: Timetable sessions created with semester=6 
-- but students enrolled in semester=3
--
-- Solution: Auto-correct sessions to match actual student enrollment

USE attendance_db;

-- Step 1: Check current state
SELECT '=== BEFORE FIX ===' as step;
SELECT department, semester, COUNT(*) as session_count 
FROM timetable_session 
GROUP BY department, semester;

SELECT 'Students per semester:' as label;
SELECT department, semester, COUNT(*) as student_count 
FROM student 
WHERE active = TRUE 
GROUP BY department, semester;

-- Step 2: For Computer Science department - update sessions from semester 6 → 3 (where students actually are)
UPDATE timetable_session
SET semester = 3
WHERE department = 'Computer Science' 
  AND semester = 6 
  AND active = TRUE;

-- Step 3: Verify the fix
SELECT '=== AFTER FIX ===' as step;
SELECT department, semester, COUNT(*) as session_count 
FROM timetable_session 
GROUP BY department, semester;

-- Step 4: Show what students we should find now
SELECT '=== Students that will be found ===' as label;
SELECT 
    s.roll_no, 
    s.name, 
    s.department, 
    s.semester, 
    s.section
FROM student s
WHERE s.department = 'Computer Science' 
  AND s.semester = 3 
  AND s.active = TRUE;

-- Step 5: Show the corrected session-student mapping
SELECT '=== Corrected Timetable Sessions ===' as label;
SELECT 
    ts.id as session_id,
    ts.day_of_week,
    ts.start_time,
    ts.department,
    ts.semester,
    ts.section,
    COUNT(s.id) as matching_student_count
FROM timetable_session ts
LEFT JOIN student s ON (
    s.department = ts.department 
    AND s.semester = ts.semester 
    AND s.section = ts.section 
    AND s.active = TRUE
)
WHERE ts.department = 'Computer Science'
  AND ts.active = TRUE
GROUP BY ts.id, ts.day_of_week, ts.start_time, ts.department, ts.semester, ts.section;
