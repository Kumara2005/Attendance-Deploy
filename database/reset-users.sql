-- Reset default users with properly encoded passwords
-- Run this script if you're having login issues

USE attendance_db;

-- Delete existing users to allow re-initialization
DELETE FROM users WHERE username IN ('admin', 'staff', 'student');

-- Note: After running this, restart the Spring Boot application
-- It will automatically create the users with correct BCrypt passwords
