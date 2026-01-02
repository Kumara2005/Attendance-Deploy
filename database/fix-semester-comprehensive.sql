-- ============================================
-- COMPREHENSIVE FIX FOR SEMESTER MISMATCH
-- ============================================
-- This script will:
-- 1. Analyze current state
-- 2. Find correct semester for each department
-- 3. Update ALL timetable sessions to correct semester

USE attendance_db;

-- STEP 1: Show current problematic state
SELECT '===========================================' as '';
SELECT '1. CURRENT STATE - Sessions with wrong semester' as '';
SELECT '===========================================' as '';

SELECT 
    ts.id,
    ts.department,
    ts.semester as session_semester,
    ts.day_of_week,
    ts.start_time,
    COALESCE((SELECT semester FROM student 
              WHERE department = ts.department 
              AND active = true LIMIT 1), 0) as actual_student_semester,
    (SELECT COUNT(*) FROM student 
     WHERE department = ts.department 
     AND semester = ts.semester 
     AND active = true) as matching_students_at_session_semester
FROM timetable_session ts
WHERE active = true
ORDER BY ts.department, ts.semester;

-- STEP 2: Show where students actually are
SELECT '===========================================' as '';
SELECT '2. WHERE STUDENTS ACTUALLY ARE' as '';
SELECT '===========================================' as '';

SELECT 
    department,
    semester,
    COUNT(*) as student_count
FROM student
WHERE active = true
GROUP BY department, semester
ORDER BY department, semester;

-- STEP 3: Create mapping of correct semester for each department
SELECT '===========================================' as '';
SELECT '3. CORRECT SEMESTER MAPPING (per department)' as '';
SELECT '===========================================' as '';

SELECT 
    ts.department,
    ts.semester as current_wrong_semester,
    (SELECT semester FROM student 
     WHERE department = ts.department 
     AND active = true 
     LIMIT 1) as correct_semester_to_use
FROM timetable_session ts
WHERE active = true
GROUP BY ts.department, ts.semester;

-- STEP 4: Execute the fix
SELECT '===========================================' as '';
SELECT '4. APPLYING FIX...' as '';
SELECT '===========================================' as '';

-- For each department, find the semester where students actually are
-- and update ALL sessions to match
UPDATE timetable_session ts
SET ts.semester = (
    SELECT semester FROM student s
    WHERE s.department = ts.department 
    AND s.active = true
    LIMIT 1
)
WHERE ts.active = true 
AND ts.semester NOT IN (
    SELECT DISTINCT semester FROM student s
    WHERE s.department = ts.department 
    AND s.active = true
);

SELECT CONCAT('✅ Updated ', ROW_COUNT(), ' timetable sessions to correct semester') as result;

-- STEP 5: Show result after fix
SELECT '===========================================' as '';
SELECT '5. STATE AFTER FIX' as '';
SELECT '===========================================' as '';

SELECT 
    ts.department,
    ts.semester,
    COUNT(*) as session_count,
    (SELECT COUNT(*) FROM student s 
     WHERE s.department = ts.department 
     AND s.semester = ts.semester 
     AND s.active = true) as matching_student_count
FROM timetable_session ts
WHERE active = true
GROUP BY ts.department, ts.semester
ORDER BY ts.department, ts.semester;

-- STEP 6: Verify each session now has students
SELECT '===========================================' as '';
SELECT '6. SESSION-STUDENT MATCHING VERIFICATION' as '';
SELECT '===========================================' as '';

SELECT 
    ts.id as session_id,
    ts.day_of_week,
    ts.start_time,
    ts.department,
    ts.semester,
    ts.section,
    COUNT(DISTINCT s.id) as student_count_in_this_session,
    GROUP_CONCAT(DISTINCT s.name SEPARATOR ', ') as student_names
FROM timetable_session ts
LEFT JOIN student s ON (
    s.department = ts.department 
    AND s.semester = ts.semester 
    AND (ts.section IS NULL OR s.section = ts.section)
    AND s.active = true
)
WHERE ts.active = true
GROUP BY ts.id, ts.day_of_week, ts.start_time, ts.department, ts.semester, ts.section
ORDER BY ts.department, ts.day_of_week, ts.start_time;

SELECT '===========================================' as '';
SELECT '✅ FIX COMPLETE - Sessions are now aligned with student enrollment' as '';
SELECT '===========================================' as '';
