-- ============================================
-- Seed Data for Computer Science Class A
-- Timetable-to-Attendance Workflow - CLEAN VERSION
-- ============================================

USE attendance_db;

-- Step 1: Clean existing test data (ignore errors if not exists)
SET FOREIGN_KEY_CHECKS=0;

-- Delete timetable sessions
DELETE FROM timetable_session WHERE department='Computer Science' AND semester=1 AND section='A';

-- Delete staff_subjects relationships
DELETE FROM staff_subjects WHERE staff_id IN (SELECT id FROM staff WHERE staff_code IN ('STAFF001', 'STAFF002', 'STAFF003', 'STAFF004', 'STAFF005'));

-- Delete subjects
DELETE FROM subject WHERE code IN ('CS101', 'CS102', 'CS103', 'CS104', 'CS105');

-- Delete students
DELETE FROM student WHERE roll_no LIKE 'CS-S1-A%';

-- Delete staff
DELETE FROM staff WHERE staff_code IN ('STAFF001', 'STAFF002', 'STAFF003', 'STAFF004', 'STAFF005');

-- Delete users
DELETE FROM users WHERE username IN ('john.smith', 'sarah.johnson', 'michael.brown', 'emily.davis', 'robert.wilson');

SET FOREIGN_KEY_CHECKS=1;

-- Step 2: Create Users for Teachers (password = 'password' hashed with BCrypt)
INSERT INTO users (username, password, role, enabled) VALUES
('john.smith', '$2a$10$N9qo8Jqz5VYqY9WB3e0.ROXvxQxYYP8Q9T1x5v1P3gV9yW1P3xY5e', 'STAFF', true),
('sarah.johnson', '$2a$10$N9qo8Jqz5VYqY9WB3e0.ROXvxQxYYP8Q9T1x5v1P3gV9yW1P3xY5e', 'STAFF', true),
('michael.brown', '$2a$10$N9qo8Jqz5VYqY9WB3e0.ROXvxQxYYP8Q9T1x5v1P3gV9yW1P3xY5e', 'STAFF', true),
('emily.davis', '$2a$10$N9qo8Jqz5VYqY9WB3e0.ROXvxQxYYP8Q9T1x5v1P3gV9yW1P3xY5e', 'STAFF', true),
('robert.wilson', '$2a$10$N9qo8Jqz5VYqY9WB3e0.ROXvxQxYYP8Q9T1x5v1P3gV9yW1P3xY5e', 'STAFF', true);

-- Step 3: Insert 5 Teachers/Staff
INSERT INTO staff (staff_code, name, department, user_id, active) VALUES
('STAFF001', 'Prof. John Smith', 'Computer Science', (SELECT id FROM users WHERE username='john.smith'), true),
('STAFF002', 'Dr. Sarah Johnson', 'Computer Science', (SELECT id FROM users WHERE username='sarah.johnson'), true),
('STAFF003', 'Prof. Michael Brown', 'Computer Science', (SELECT id FROM users WHERE username='michael.brown'), true),
('STAFF004', 'Dr. Emily Davis', 'Computer Science', (SELECT id FROM users WHERE username='emily.davis'), true),
('STAFF005', 'Prof. Robert Wilson', 'Computer Science', (SELECT id FROM users WHERE username='robert.wilson'), true);

-- Step 4: Insert 5 Subjects
INSERT INTO subject (code, name, credits, department, semester) VALUES
('CS101', 'Programming Fundamentals', 4, 'Computer Science', 1),
('CS102', 'Data Structures', 4, 'Computer Science', 1),
('CS103', 'Database Management', 3, 'Computer Science', 1),
('CS104', 'Web Development', 3, 'Computer Science', 1),
('CS105', 'Computer Networks', 4, 'Computer Science', 1);

-- Step 5: Link Staff to Subjects
INSERT INTO staff_subjects (staff_id, subject_id) VALUES
((SELECT id FROM staff WHERE staff_code='STAFF001'), (SELECT id FROM subject WHERE code='CS101')),
((SELECT id FROM staff WHERE staff_code='STAFF002'), (SELECT id FROM subject WHERE code='CS102')),
((SELECT id FROM staff WHERE staff_code='STAFF003'), (SELECT id FROM subject WHERE code='CS103')),
((SELECT id FROM staff WHERE staff_code='STAFF004'), (SELECT id FROM subject WHERE code='CS104')),
((SELECT id FROM staff WHERE staff_code='STAFF005'), (SELECT id FROM subject WHERE code='CS105'));

-- Step 6: Insert 10 Students
INSERT INTO student (roll_no, name, email, phone, department, semester, section, active) VALUES
('CS-S1-A01', 'Aarav Sharma', 'aarav.sharma@college.edu', '9876543210', 'Computer Science', 1, 'A', true),
('CS-S1-A02', 'Ananya Reddy', 'ananya.reddy@college.edu', '9876543211', 'Computer Science', 1, 'A', true),
('CS-S1-A03', 'Rohan Kumar', 'rohan.kumar@college.edu', '9876543212', 'Computer Science', 1, 'A', true),
('CS-S1-A04', 'Priya Singh', 'priya.singh@college.edu', '9876543213', 'Computer Science', 1, 'A', true),
('CS-S1-A05', 'Arjun Patel', 'arjun.patel@college.edu', '9876543214', 'Computer Science', 1, 'A', true),
('CS-S1-A06', 'Meera Iyer', 'meera.iyer@college.edu', '9876543215', 'Computer Science', 1, 'A', true),
('CS-S1-A07', 'Vikram Desai', 'vikram.desai@college.edu', '9876543216', 'Computer Science', 1, 'A', true),
('CS-S1-A08', 'Kavya Nair', 'kavya.nair@college.edu', '9876543217', 'Computer Science', 1, 'A', true),
('CS-S1-A09', 'Aditya Verma', 'aditya.verma@college.edu', '9876543218', 'Computer Science', 1, 'A', true),
('CS-S1-A10', 'Ishita Kapoor', 'ishita.kapoor@college.edu', '9876543219', 'Computer Science', 1, 'A', true);

-- Step 7: Create Timetable Sessions (20 sessions for Mon-Fri, 4 periods each day)
INSERT INTO timetable_session (day_of_week, start_time, end_time, subject_id, staff_id, department, semester, section, room_number, active) VALUES
-- Monday
('Monday', '09:00:00', '09:50:00', (SELECT id FROM subject WHERE code='CS101'), (SELECT id FROM staff WHERE staff_code='STAFF001'), 'Computer Science', 1, 'A', 'R101', true),
('Monday', '10:00:00', '10:50:00', (SELECT id FROM subject WHERE code='CS102'), (SELECT id FROM staff WHERE staff_code='STAFF002'), 'Computer Science', 1, 'A', 'R102', true),
('Monday', '11:00:00', '11:50:00', (SELECT id FROM subject WHERE code='CS103'), (SELECT id FROM staff WHERE staff_code='STAFF003'), 'Computer Science', 1, 'A', 'R103', true),
('Monday', '12:00:00', '12:50:00', (SELECT id FROM subject WHERE code='CS104'), (SELECT id FROM staff WHERE staff_code='STAFF004'), 'Computer Science', 1, 'A', 'R104', true),

-- Tuesday
('Tuesday', '09:00:00', '09:50:00', (SELECT id FROM subject WHERE code='CS102'), (SELECT id FROM staff WHERE staff_code='STAFF002'), 'Computer Science', 1, 'A', 'R102', true),
('Tuesday', '10:00:00', '10:50:00', (SELECT id FROM subject WHERE code='CS105'), (SELECT id FROM staff WHERE staff_code='STAFF005'), 'Computer Science', 1, 'A', 'R105', true),
('Tuesday', '11:00:00', '11:50:00', (SELECT id FROM subject WHERE code='CS101'), (SELECT id FROM staff WHERE staff_code='STAFF001'), 'Computer Science', 1, 'A', 'R101', true),
('Tuesday', '12:00:00', '12:50:00', (SELECT id FROM subject WHERE code='CS103'), (SELECT id FROM staff WHERE staff_code='STAFF003'), 'Computer Science', 1, 'A', 'R103', true),

-- Wednesday
('Wednesday', '09:00:00', '09:50:00', (SELECT id FROM subject WHERE code='CS104'), (SELECT id FROM staff WHERE staff_code='STAFF004'), 'Computer Science', 1, 'A', 'R104', true),
('Wednesday', '10:00:00', '10:50:00', (SELECT id FROM subject WHERE code='CS101'), (SELECT id FROM staff WHERE staff_code='STAFF001'), 'Computer Science', 1, 'A', 'R101', true),
('Wednesday', '11:00:00', '11:50:00', (SELECT id FROM subject WHERE code='CS105'), (SELECT id FROM staff WHERE staff_code='STAFF005'), 'Computer Science', 1, 'A', 'R105', true),
('Wednesday', '12:00:00', '12:50:00', (SELECT id FROM subject WHERE code='CS102'), (SELECT id FROM staff WHERE staff_code='STAFF002'), 'Computer Science', 1, 'A', 'R102', true),

-- Thursday
('Thursday', '09:00:00', '09:50:00', (SELECT id FROM subject WHERE code='CS103'), (SELECT id FROM staff WHERE staff_code='STAFF003'), 'Computer Science', 1, 'A', 'R103', true),
('Thursday', '10:00:00', '10:50:00', (SELECT id FROM subject WHERE code='CS104'), (SELECT id FROM staff WHERE staff_code='STAFF004'), 'Computer Science', 1, 'A', 'R104', true),
('Thursday', '11:00:00', '11:50:00', (SELECT id FROM subject WHERE code='CS102'), (SELECT id FROM staff WHERE staff_code='STAFF002'), 'Computer Science', 1, 'A', 'R102', true),
('Thursday', '12:00:00', '12:50:00', (SELECT id FROM subject WHERE code='CS105'), (SELECT id FROM staff WHERE staff_code='STAFF005'), 'Computer Science', 1, 'A', 'R105', true),

-- Friday
('Friday', '09:00:00', '09:50:00', (SELECT id FROM subject WHERE code='CS101'), (SELECT id FROM staff WHERE staff_code='STAFF001'), 'Computer Science', 1, 'A', 'R101', true),
('Friday', '10:00:00', '10:50:00', (SELECT id FROM subject WHERE code='CS103'), (SELECT id FROM staff WHERE staff_code='STAFF003'), 'Computer Science', 1, 'A', 'R103', true),
('Friday', '11:00:00', '11:50:00', (SELECT id FROM subject WHERE code='CS104'), (SELECT id FROM staff WHERE staff_code='STAFF004'), 'Computer Science', 1, 'A', 'R104', true),
('Friday', '12:00:00', '12:50:00', (SELECT id FROM subject WHERE code='CS105'), (SELECT id FROM staff WHERE staff_code='STAFF005'), 'Computer Science', 1, 'A', 'R105', true);

SELECT 'Database seeded successfully!' AS Status;
SELECT COUNT(*) AS 'Students Created' FROM student WHERE department='Computer Science' AND semester=1 AND section='A';
SELECT COUNT(*) AS 'Staff Created' FROM staff WHERE department='Computer Science';
SELECT COUNT(*) AS 'Subjects Created' FROM subject WHERE department='Computer Science' AND semester=1;
SELECT COUNT(*) AS 'Timetable Sessions Created' FROM timetable_session WHERE department='Computer Science' AND semester=1 AND section='A';
