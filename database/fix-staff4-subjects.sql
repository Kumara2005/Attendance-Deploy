-- Quick fix to populate staff_subjects for existing Staff4
-- This simulates what would happen if Staff4 was registered through the new auto-sync logic

USE attendance_db;

-- 1. Ensure Staff4 has subject field populated
UPDATE staff 
SET subject = 'Data Structures' 
WHERE staff_code = 'STAFF004' OR name = 'Staff4';

-- 2. Create the subject if it doesn't exist
INSERT IGNORE INTO subject (code, name, department, semester, credits) 
VALUES ('DS101', 'Data Structures', 'Computer Science', 1, 4);

-- 3. Manually populate staff_subjects for Staff4 (simulating auto-sync)
INSERT IGNORE INTO staff_subjects (staff_id, subject_id)
SELECT s.id, sub.id
FROM staff s, subject sub
WHERE (s.staff_code = 'STAFF004' OR s.name = 'Staff4')
  AND sub.name = 'Data Structures';

-- 4. Verify the link was created
SELECT 'Staff4 now linked to subjects:' as Status;
SELECT 
    st.name as StaffName,
    st.staff_code as StaffCode,
    sub.name as SubjectName,
    sub.code as SubjectCode
FROM staff st
JOIN staff_subjects ss ON st.id = ss.staff_id
JOIN subject sub ON ss.subject_id = sub.id
WHERE st.staff_code = 'STAFF004' OR st.name = 'Staff4';
