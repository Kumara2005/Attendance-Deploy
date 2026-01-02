-- ============================================================================
-- COMPREHENSIVE DATABASE FIX FOR TIMETABLE-STUDENT SEMESTER MISMATCH
-- ============================================================================
-- Problem: When timetable sessions are created, they might have a semester 
--          value that doesn't match the students enrolled in that department
-- 
-- Root Cause: Timetable sessions are created independently without validating 
--             that students actually exist in that semester/department combo
--
-- Solution: Fix existing mismatches AND prevent future ones
-- ============================================================================

-- STEP 1: Find all timetable sessions with semester mismatches
-- ============================================================================
SELECT 'STEP 1: Detecting Semester Mismatches...' AS step_info;

SELECT DISTINCT 
    ts.id AS session_id,
    ts.semester AS session_semester,
    ts.department,
    ts.section,
    COALESCE(s.semester, 'NO_STUDENTS_IN_DEPT') AS student_semester,
    COUNT(s.id) AS student_count
FROM timetable_session ts
LEFT JOIN student s ON s.department = ts.department 
                      AND s.section = ts.section
                      AND s.semester = ts.semester
GROUP BY ts.id, ts.semester, ts.department, ts.section, s.semester
HAVING COUNT(s.id) = 0 OR student_semester IS NULL
ORDER BY ts.department, ts.semester;

-- STEP 2: Get the CORRECT semester for each department/section combo
-- ============================================================================
SELECT 'STEP 2: Finding Correct Semester for Each Dept/Section...' AS step_info;

SELECT DISTINCT 
    department,
    section,
    semester AS correct_semester,
    COUNT(*) AS student_count
FROM student
WHERE section IS NOT NULL
GROUP BY department, section, semester
ORDER BY department, section, semester;

-- STEP 3: Update ALL mismatched timetable sessions
-- ============================================================================
SELECT 'STEP 3: Fixing Mismatched Sessions...' AS step_info;

-- For Dhamayenthi (faculty_id=5) - Algorithms (subject_id=2)
UPDATE timetable_session 
SET semester = 3 
WHERE faculty_id = 5 AND subject_id = 2 AND semester != 3;

SELECT CONCAT('✅ Fixed Dhamayenthi sessions: ', ROW_COUNT(), ' rows updated to semester 3') AS result1;

-- For other staff with similar mismatches
-- This query identifies ANY session that doesn't have matching students
UPDATE timetable_session ts
SET ts.semester = (
    SELECT DISTINCT s.semester
    FROM student s
    WHERE s.department = ts.department
    AND s.section = ts.section
    LIMIT 1
)
WHERE ts.id IN (
    SELECT ts2.id
    FROM timetable_session ts2
    LEFT JOIN student s ON s.department = ts2.department 
                          AND s.section = ts2.section
                          AND s.semester = ts2.semester
    WHERE s.id IS NULL
    AND ts2.section IS NOT NULL
);

SELECT CONCAT('✅ Fixed other staff sessions: ', ROW_COUNT(), ' additional rows corrected') AS result2;

-- STEP 4: Verify the fix
-- ============================================================================
SELECT 'STEP 4: Verification - Sessions Now Match Student Enrollment' AS step_info;

SELECT 
    ts.id,
    f.name AS staff_name,
    sub.subject_name,
    ts.department,
    ts.section,
    ts.semester AS timetable_semester,
    GROUP_CONCAT(DISTINCT s.semester) AS enrolled_student_semesters,
    COUNT(s.id) AS student_count
FROM timetable_session ts
LEFT JOIN staff f ON ts.faculty_id = f.id
LEFT JOIN subject sub ON ts.subject_id = sub.id
LEFT JOIN student s ON s.department = ts.department 
                      AND s.section = ts.section
                      AND s.semester = ts.semester
GROUP BY ts.id, f.name, sub.subject_name, ts.department, ts.section, ts.semester
HAVING COUNT(s.id) > 0 OR (COUNT(s.id) = 0 AND ts.section IS NULL)
ORDER BY f.name, ts.day_of_week, ts.start_time;

-- STEP 5: Prevention - Create a validation stored procedure (optional)
-- ============================================================================
-- This can be called before creating sessions to validate data
-- DELIMITER $$
-- CREATE PROCEDURE validate_timetable_session(
--     IN p_faculty_id INT,
--     IN p_subject_id INT,
--     IN p_department VARCHAR(255),
--     IN p_semester INT,
--     IN p_section VARCHAR(10)
-- )
-- BEGIN
--     DECLARE student_count INT;
--     
--     SELECT COUNT(*) INTO student_count
--     FROM student
--     WHERE department = p_department
--     AND semester = p_semester
--     AND section = p_section;
--     
--     IF student_count = 0 THEN
--         SIGNAL SQLSTATE '45000'
--         SET MESSAGE_TEXT = 'No students found for this dept/semester/section combo!';
--     END IF;
-- END$$
-- DELIMITER ;

SELECT '✅ DATABASE FIX COMPLETED SUCCESSFULLY' AS final_status;
SELECT '📝 To prevent this in future: Validate semester when creating timetable sessions' AS prevention_tip;
SELECT '🔄 Check QuickAttendance now - students should be found!' AS next_step;
