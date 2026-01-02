-- ============================================================================
-- FIX: Semester Mismatch Between Students and Timetable Sessions
-- ============================================================================
-- Problem: QuickAttendance shows "0 students" because timetable sessions
--          have different semester than where students are enrolled
-- 
-- Solution: Auto-correct timetable sessions to match student enrollment
-- ============================================================================

USE attendance_db;

-- Show current state
SELECT '=== BEFORE FIX: Current State ===' as status;

SELECT 
    'Timetable Sessions' as table_name,
    department,
    semester,
    section,
    COUNT(*) as count
FROM timetable_session
WHERE active = 1
GROUP BY department, semester, section
ORDER BY department, semester;

SELECT 
    'Students' as table_name,
    department,
    semester,
    section,
    COUNT(*) as count
FROM student
WHERE active = 1
GROUP BY department, semester, section
ORDER BY department, semester;

-- Find mismatches
SELECT '=== MISMATCHES DETECTED ===' as status;

SELECT DISTINCT
    ts.department,
    ts.semester as timetable_semester,
    ts.section,
    (SELECT GROUP_CONCAT(DISTINCT s.semester)
     FROM student s
     WHERE s.department = ts.department
     AND s.section = ts.section
     AND s.active = 1) as student_semesters,
    COUNT(*) as affected_sessions
FROM timetable_session ts
WHERE ts.active = 1
AND NOT EXISTS (
    SELECT 1 FROM student s
    WHERE s.department = ts.department
    AND s.semester = ts.semester
    AND s.section = ts.section
    AND s.active = 1
)
GROUP BY ts.department, ts.semester, ts.section;

-- Apply the fix: Update timetable sessions to match student enrollment
SELECT '=== APPLYING FIX ===' as status;

UPDATE timetable_session ts
SET ts.semester = (
    SELECT s.semester
    FROM student s
    WHERE s.department = ts.department
    AND s.section = ts.section
    AND s.active = 1
    LIMIT 1
)
WHERE ts.active = 1
AND NOT EXISTS (
    SELECT 1 FROM student s
    WHERE s.department = ts.department
    AND s.semester = ts.semester
    AND s.section = ts.section
    AND s.active = 1
);

SELECT CONCAT('Updated ', ROW_COUNT(), ' timetable sessions') as fix_result;

-- Verify the fix
SELECT '=== AFTER FIX: Verification ===' as status;

SELECT 
    'Timetable Sessions' as table_name,
    department,
    semester,
    section,
    COUNT(*) as count
FROM timetable_session
WHERE active = 1
GROUP BY department, semester, section
ORDER BY department, semester;

-- Check for remaining mismatches (should be 0)
SELECT '=== REMAINING MISMATCHES (should be empty) ===' as status;

SELECT DISTINCT
    ts.department,
    ts.semester as timetable_semester,
    COUNT(*) as still_mismatched
FROM timetable_session ts
WHERE ts.active = 1
AND NOT EXISTS (
    SELECT 1 FROM student s
    WHERE s.department = ts.department
    AND s.semester = ts.semester
    AND s.active = 1
)
GROUP BY ts.department, ts.semester;

SELECT '=== FIX COMPLETE ===' as status;
SELECT 'QuickAttendance should now show students correctly!' as message;
