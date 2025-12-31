-- ============================================================================
-- Migration: Make subject_id and staff_id nullable in timetable_session table
-- Date: 2025-12-31
-- Reason: Allow timetable grid configuration before staff assignment
-- ============================================================================

USE attendx_db;

-- Drop foreign key constraints first
ALTER TABLE timetable_session 
DROP FOREIGN KEY timetable_session_ibfk_1;

ALTER TABLE timetable_session 
DROP FOREIGN KEY timetable_session_ibfk_2;

-- Modify columns to allow NULL
ALTER TABLE timetable_session 
MODIFY COLUMN subject_id BIGINT NULL;

ALTER TABLE timetable_session 
MODIFY COLUMN staff_id BIGINT NULL;

-- Re-add foreign key constraints with NULL support
ALTER TABLE timetable_session 
ADD CONSTRAINT timetable_session_ibfk_1 
FOREIGN KEY (subject_id) REFERENCES subject(id) ON DELETE CASCADE;

ALTER TABLE timetable_session 
ADD CONSTRAINT timetable_session_ibfk_2 
FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE;

-- Verify the changes
DESCRIBE timetable_session;

-- Success message
SELECT '✅ Migration completed: subject_id and staff_id are now nullable' AS status;
