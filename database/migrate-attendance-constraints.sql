-- ============================================================================
-- Migration: Fix attendance-related constraints
-- Date: 2026-01-01
-- Reason: Ensure class_id, staff_id, and subject_id can be NULL for dynamic session creation
-- ============================================================================

USE attendance_db;

-- Step 1: Drop existing constraints if they exist
ALTER TABLE timetable_session 
DROP FOREIGN KEY IF EXISTS timetable_session_ibfk_1;

ALTER TABLE timetable_session 
DROP FOREIGN KEY IF EXISTS timetable_session_ibfk_2;

ALTER TABLE timetable_session 
DROP FOREIGN KEY IF EXISTS timetable_session_ibfk_3;

-- Step 2: Modify columns to allow NULL (if not already)
ALTER TABLE timetable_session 
MODIFY COLUMN subject_id BIGINT NULL;

ALTER TABLE timetable_session 
MODIFY COLUMN staff_id BIGINT NULL;

ALTER TABLE timetable_session 
MODIFY COLUMN class_id BIGINT NULL;

-- Step 3: Re-add foreign key constraints with NULL support
ALTER TABLE timetable_session 
ADD CONSTRAINT timetable_session_ibfk_1 
FOREIGN KEY (subject_id) REFERENCES subject(id) ON DELETE CASCADE;

ALTER TABLE timetable_session 
ADD CONSTRAINT timetable_session_ibfk_2 
FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE;

ALTER TABLE timetable_session 
ADD CONSTRAINT timetable_session_ibfk_3 
FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL;

-- Step 4: Verify the changes
DESCRIBE timetable_session;

-- Success message
SELECT '✅ Migration completed: subject_id, staff_id, and class_id are now nullable' AS status;
