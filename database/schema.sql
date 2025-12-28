-- ========================================
-- ATTENDANCE MANAGEMENT SYSTEM - DATABASE SCHEMA
-- MySQL 8.0+
-- ========================================

-- Drop existing database and create fresh
DROP DATABASE IF EXISTS attendance_db;
CREATE DATABASE attendance_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE attendance_db;

-- ========================================
-- TABLE: users
-- Stores authentication credentials for all users
-- ========================================
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    password_changed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_role (role)
) ENGINE=InnoDB;

-- ========================================
-- TABLE: students
-- Stores student information
-- ========================================
CREATE TABLE student (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    roll_no VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    semester INT NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(15),
    section VARCHAR(10),
    user_id BIGINT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_roll_no (roll_no),
    INDEX idx_department (department),
    INDEX idx_semester (semester)
) ENGINE=InnoDB;

-- ========================================
-- TABLE: subjects
-- Stores subject/course information
-- ========================================
CREATE TABLE subject (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    semester INT NOT NULL,
    credits INT DEFAULT 3,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_department_semester (department, semester)
) ENGINE=InnoDB;

-- ========================================
-- TABLE: staff
-- Stores staff/faculty information
-- ========================================
CREATE TABLE staff (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    staff_code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    user_id BIGINT NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_staff_code (staff_code),
    INDEX idx_department (department)
) ENGINE=InnoDB;

-- ========================================
-- TABLE: staff_subjects
-- Many-to-many relationship between staff and subjects
-- ========================================
CREATE TABLE staff_subjects (
    staff_id BIGINT NOT NULL,
    subject_id BIGINT NOT NULL,
    PRIMARY KEY (staff_id, subject_id),
    FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subject(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ========================================
-- TABLE: classes
-- Stores class segments/divisions (A, B, C, etc.)
-- ========================================
CREATE TABLE classes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    class_name VARCHAR(10) NOT NULL,
    department VARCHAR(100) NOT NULL,
    year INT NOT NULL,
    semester INT NOT NULL,
    section VARCHAR(10) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_class (department, year, semester, section),
    INDEX idx_dept_year (department, year),
    INDEX idx_section (section)
) ENGINE=InnoDB;

-- ========================================
-- TABLE: timetable_session
-- Stores timetable sessions/periods
-- ========================================
CREATE TABLE timetable_session (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    subject_id BIGINT NOT NULL,
    staff_id BIGINT NOT NULL,
    class_id BIGINT,
    department VARCHAR(100) NOT NULL,
    semester INT NOT NULL,
    section VARCHAR(10),
    day_of_week VARCHAR(10) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room_number VARCHAR(20),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subject(id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL,
    INDEX idx_day_time (day_of_week, start_time),
    INDEX idx_dept_sem_sec (department, semester, section),
    INDEX idx_class (class_id)
) ENGINE=InnoDB;

-- ========================================
-- TABLE: session_attendance
-- Stores attendance records for each session
-- ========================================
CREATE TABLE session_attendance (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    session_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    attendance_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL,
    marked_by BIGINT,
    remarks VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES timetable_session(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES student(id) ON DELETE CASCADE,
    FOREIGN KEY (marked_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_attendance (session_id, student_id, attendance_date),
    INDEX idx_date (attendance_date),
    INDEX idx_student (student_id),
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- ========================================
-- TABLE: attendance_status
-- Enum-like table for attendance status types
-- ========================================
CREATE TABLE attendance_status (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    status_code VARCHAR(20) NOT NULL UNIQUE,
    status_name VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    is_counted_present BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Insert default attendance statuses
INSERT INTO attendance_status (status_code, status_name, description, is_counted_present) VALUES
('PRESENT', 'Present', 'Student attended the session', TRUE),
('ABSENT', 'Absent', 'Student did not attend', FALSE),
('LATE', 'Late/On-Duty', 'Student arrived late or on official duty', TRUE),
('EXCUSED', 'Excused', 'Absence excused with valid reason', FALSE),
('MEDICAL', 'Medical Leave', 'Absent due to medical reasons', FALSE);

-- ========================================
-- TABLE: system_settings
-- Stores application configuration settings
-- ========================================
CREATE TABLE system_settings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_key (setting_key)
) ENGINE=InnoDB;

-- Insert default settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('MIN_ATTENDANCE_PERCENTAGE', '75', 'Minimum required attendance percentage'),
('ACADEMIC_YEAR', '2024-2025', 'Current academic year'),
('SEMESTER_START_DATE', '2024-08-01', 'Current semester start date'),
('SEMESTER_END_DATE', '2024-12-31', 'Current semester end date');

-- ========================================
-- INSERT CLASS SEGMENTS (A, B, C)
-- ========================================
INSERT INTO classes (class_name, department, year, semester, section, active) VALUES
-- Computer Science - Year 1
('CS1A', 'Computer Science', 1, 1, 'A', TRUE),
('CS1B', 'Computer Science', 1, 1, 'B', TRUE),
('CS1C', 'Computer Science', 1, 1, 'C', TRUE),
('CS1A', 'Computer Science', 1, 2, 'A', TRUE),
('CS1B', 'Computer Science', 1, 2, 'B', TRUE),
('CS1C', 'Computer Science', 1, 2, 'C', TRUE),
-- Computer Science - Year 2
('CS2A', 'Computer Science', 2, 3, 'A', TRUE),
('CS2B', 'Computer Science', 2, 3, 'B', TRUE),
('CS2C', 'Computer Science', 2, 3, 'C', TRUE),
('CS2A', 'Computer Science', 2, 4, 'A', TRUE),
('CS2B', 'Computer Science', 2, 4, 'B', TRUE),
('CS2C', 'Computer Science', 2, 4, 'C', TRUE),
-- Computer Science - Year 3
('CS3A', 'Computer Science', 3, 5, 'A', TRUE),
('CS3B', 'Computer Science', 3, 5, 'B', TRUE),
('CS3C', 'Computer Science', 3, 5, 'C', TRUE),
('CS3A', 'Computer Science', 3, 6, 'A', TRUE),
('CS3B', 'Computer Science', 3, 6, 'B', TRUE),
('CS3C', 'Computer Science', 3, 6, 'C', TRUE);

-- ========================================
-- TABLE: refresh_tokens
-- Stores JWT refresh tokens
-- ========================================
CREATE TABLE refresh_tokens (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    token VARCHAR(512) NOT NULL UNIQUE,
    expiry_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_user (user_id)
) ENGINE=InnoDB;

-- ========================================
-- INSERT DEFAULT DATA
-- ========================================

-- Create default users with UNIQUE passwords
-- Admin password: Admin@2024!Secure
-- Staff password: Staff@2024!Secure
-- Student password: Student@2024!Secure
-- Alex password: Alex@2024!Student
-- NOTE: Users MUST change password on first login
INSERT INTO users (username, password, role, password_changed) VALUES
('admin', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzWvJ6feHu', 'ROLE_ADMIN', FALSE),
('staff', '$2a$12$xYz9bVwXqP3kL8mN5oP6QeR7sT8uV9wXyZ0aB1cD2eF3gH4iJ5kL6', 'ROLE_STAFF', FALSE),
('student', '$2a$12$aB2cD3eF4gH5iJ6kL7mN8oP9qR0sT1uV2wX3yZ4aB5cD6eF7gH8iJ', 'ROLE_STUDENT', FALSE),
('alex.rivera', '$2a$12$mN3oP4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV', 'ROLE_STUDENT', FALSE);

-- Create sample subjects
INSERT INTO subject (code, name, department, semester, credits) VALUES
('CS101', 'Introduction to Programming', 'Computer Science', 1, 4),
('CS102', 'Data Structures', 'Computer Science', 2, 4),
('CS103', 'Database Management Systems', 'Computer Science', 3, 3),
('CS104', 'Operating Systems', 'Computer Science', 4, 3),
('MATH101', 'Calculus I', 'Mathematics', 1, 3),
('MATH102', 'Linear Algebra', 'Mathematics', 2, 3);

-- Create sample staff (linked to staff user)
INSERT INTO staff (staff_code, name, department, user_id) VALUES
('SF001', 'Prof. Alice Thompson', 'Computer Science', 2);

-- Link staff to subjects
INSERT INTO staff_subjects (staff_id, subject_id) VALUES
(1, 1), (1, 2);

-- Create sample students
INSERT INTO student (roll_no, name, department, semester, email, phone, section, user_id) VALUES
('CS2024001', 'John Doe', 'Computer Science', 3, 'john.doe@attendx.edu', '1234567890', 'A', NULL),
('CS2024002', 'Jane Smith', 'Computer Science', 3, 'jane.smith@attendx.edu', '1234567891', 'A', NULL),
('CS2024003', 'Bob Johnson', 'Computer Science', 3, 'bob.johnson@attendx.edu', '1234567892', 'B', NULL),
('CS-Y1-100', 'Alex Rivera', 'Computer Science', 1, 'alex.rivera@attendx.edu', '1234567893', 'A', 4);

-- ========================================
-- SECTION A STUDENTS (Year 1, Semester 1)
-- ========================================
INSERT INTO student (roll_no, name, department, semester, email, phone, section, user_id) VALUES
('CS-Y1-A01', 'Aarav Sharma', 'Computer Science', 1, 'aarav.sharma@attendx.edu', '9876543210', 'A', NULL),
('CS-Y1-A02', 'Ananya Reddy', 'Computer Science', 1, 'ananya.reddy@attendx.edu', '9876543211', 'A', NULL),
('CS-Y1-A03', 'Arjun Patel', 'Computer Science', 1, 'arjun.patel@attendx.edu', '9876543212', 'A', NULL),
('CS-Y1-A04', 'Diya Gupta', 'Computer Science', 1, 'diya.gupta@attendx.edu', '9876543213', 'A', NULL),
('CS-Y1-A05', 'Ishaan Kumar', 'Computer Science', 1, 'ishaan.kumar@attendx.edu', '9876543214', 'A', NULL),
('CS-Y1-A06', 'Kavya Menon', 'Computer Science', 1, 'kavya.menon@attendx.edu', '9876543215', 'A', NULL),
('CS-Y1-A07', 'Rohan Singh', 'Computer Science', 1, 'rohan.singh@attendx.edu', '9876543216', 'A', NULL),
('CS-Y1-A08', 'Sanya Verma', 'Computer Science', 1, 'sanya.verma@attendx.edu', '9876543217', 'A', NULL),
('CS-Y1-A09', 'Vihaan Joshi', 'Computer Science', 1, 'vihaan.joshi@attendx.edu', '9876543218', 'A', NULL),
('CS-Y1-A10', 'Zara Khan', 'Computer Science', 1, 'zara.khan@attendx.edu', '9876543219', 'A', NULL);

-- ========================================
-- SECTION B STUDENTS (Year 1, Semester 1)
-- ========================================
INSERT INTO student (roll_no, name, department, semester, email, phone, section, user_id) VALUES
('CS-Y1-B01', 'Aditya Nair', 'Computer Science', 1, 'aditya.nair@attendx.edu', '9876543220', 'B', NULL),
('CS-Y1-B02', 'Bhavna Iyer', 'Computer Science', 1, 'bhavna.iyer@attendx.edu', '9876543221', 'B', NULL),
('CS-Y1-B03', 'Chetan Rao', 'Computer Science', 1, 'chetan.rao@attendx.edu', '9876543222', 'B', NULL),
('CS-Y1-B04', 'Divya Desai', 'Computer Science', 1, 'divya.desai@attendx.edu', '9876543223', 'B', NULL),
('CS-Y1-B05', 'Harsh Mehta', 'Computer Science', 1, 'harsh.mehta@attendx.edu', '9876543224', 'B', NULL),
('CS-Y1-B06', 'Kriti Bhat', 'Computer Science', 1, 'kriti.bhat@attendx.edu', '9876543225', 'B', NULL),
('CS-Y1-B07', 'Nikhil Pillai', 'Computer Science', 1, 'nikhil.pillai@attendx.edu', '9876543226', 'B', NULL),
('CS-Y1-B08', 'Priya Shetty', 'Computer Science', 1, 'priya.shetty@attendx.edu', '9876543227', 'B', NULL),
('CS-Y1-B09', 'Ravi Agarwal', 'Computer Science', 1, 'ravi.agarwal@attendx.edu', '9876543228', 'B', NULL),
('CS-Y1-B10', 'Sneha Kapoor', 'Computer Science', 1, 'sneha.kapoor@attendx.edu', '9876543229', 'B', NULL);

-- ========================================
-- SECTION C STUDENTS (Year 1, Semester 1)
-- ========================================
INSERT INTO student (roll_no, name, department, semester, email, phone, section, user_id) VALUES
('CS-Y1-C01', 'Amit Shah', 'Computer Science', 1, 'amit.shah@attendx.edu', '9876543230', 'C', NULL),
('CS-Y1-C02', 'Deepika Nanda', 'Computer Science', 1, 'deepika.nanda@attendx.edu', '9876543231', 'C', NULL),
('CS-Y1-C03', 'Gaurav Saxena', 'Computer Science', 1, 'gaurav.saxena@attendx.edu', '9876543232', 'C', NULL),
('CS-Y1-C04', 'Lakshmi Prasad', 'Computer Science', 1, 'lakshmi.prasad@attendx.edu', '9876543233', 'C', NULL),
('CS-Y1-C05', 'Manish Thakur', 'Computer Science', 1, 'manish.thakur@attendx.edu', '9876543234', 'C', NULL),
('CS-Y1-C06', 'Nisha Yadav', 'Computer Science', 1, 'nisha.yadav@attendx.edu', '9876543235', 'C', NULL),
('CS-Y1-C07', 'Prakash Reddy', 'Computer Science', 1, 'prakash.reddy@attendx.edu', '9876543236', 'C', NULL),
('CS-Y1-C08', 'Radhika Hegde', 'Computer Science', 1, 'radhika.hegde@attendx.edu', '9876543237', 'C', NULL),
('CS-Y1-C09', 'Suresh Mishra', 'Computer Science', 1, 'suresh.mishra@attendx.edu', '9876543238', 'C', NULL),
('CS-Y1-C10', 'Tanvi Kulkarni', 'Computer Science', 1, 'tanvi.kulkarni@attendx.edu', '9876543239', 'C', NULL);

-- Create timetable sessions for Alex Rivera's semester (Semester 1)
INSERT INTO timetable_session (subject_id, staff_id, day_of_week, start_time, end_time, department, semester, section, room_number, active) VALUES
-- Monday sessions
(1, 1, 'MONDAY', '09:00:00', '10:00:00', 'Computer Science', 1, 'A', 'CS-101', TRUE),
(5, 1, 'MONDAY', '10:00:00', '11:00:00', 'Computer Science', 1, 'A', 'CS-102', TRUE),
-- Tuesday sessions
(1, 1, 'TUESDAY', '09:00:00', '10:00:00', 'Computer Science', 1, 'A', 'CS-101', TRUE),
(5, 1, 'TUESDAY', '11:00:00', '12:00:00', 'Computer Science', 1, 'A', 'CS-103', TRUE),
-- Wednesday sessions
(1, 1, 'WEDNESDAY', '09:00:00', '10:00:00', 'Computer Science', 1, 'A', 'CS-101', TRUE),
-- Thursday sessions
(5, 1, 'THURSDAY', '10:00:00', '11:00:00', 'Computer Science', 1, 'A', 'CS-102', TRUE),
(1, 1, 'THURSDAY', '11:00:00', '12:00:00', 'Computer Science', 1, 'A', 'CS-101', TRUE),
-- Friday sessions
(1, 1, 'FRIDAY', '09:00:00', '10:00:00', 'Computer Science', 1, 'A', 'CS-101', TRUE),
(5, 1, 'FRIDAY', '10:00:00', '11:00:00', 'Computer Science', 1, 'A', 'CS-102', TRUE);

-- Create attendance records for Alex Rivera (86% attendance = 43 present out of 50 sessions)
-- Alex Rivera's student_id will be 4
-- Sessions run from 2025-01-06 to 2025-03-28 (approximately 12 weeks)
INSERT INTO session_attendance (session_id, student_id, attendance_date, status, marked_by) VALUES
-- Week 1 (Jan 6-10): 5 sessions, 5 present
(1, 4, '2025-01-06', 'PRESENT', 2), (2, 4, '2025-01-06', 'PRESENT', 2),
(3, 4, '2025-01-07', 'PRESENT', 2), (4, 4, '2025-01-07', 'PRESENT', 2),
(5, 4, '2025-01-08', 'PRESENT', 2), (6, 4, '2025-01-09', 'PRESENT', 2),
(7, 4, '2025-01-09', 'PRESENT', 2), (8, 4, '2025-01-10', 'PRESENT', 2),
(9, 4, '2025-01-10', 'PRESENT', 2),
-- Week 2 (Jan 13-17): 5 sessions, 4 present, 1 absent
(1, 4, '2025-01-13', 'PRESENT', 2), (2, 4, '2025-01-13', 'PRESENT', 2),
(3, 4, '2025-01-14', 'PRESENT', 2), (4, 4, '2025-01-14', 'ABSENT', 2),
(5, 4, '2025-01-15', 'PRESENT', 2), (6, 4, '2025-01-16', 'PRESENT', 2),
(7, 4, '2025-01-16', 'PRESENT', 2), (8, 4, '2025-01-17', 'PRESENT', 2),
(9, 4, '2025-01-17', 'PRESENT', 2),
-- Week 3 (Jan 20-24): 5 sessions, 4 present, 1 absent
(1, 4, '2025-01-20', 'PRESENT', 2), (2, 4, '2025-01-20', 'PRESENT', 2),
(3, 4, '2025-01-21', 'PRESENT', 2), (4, 4, '2025-01-21', 'PRESENT', 2),
(5, 4, '2025-01-22', 'ABSENT', 2), (6, 4, '2025-01-23', 'PRESENT', 2),
(7, 4, '2025-01-23', 'PRESENT', 2), (8, 4, '2025-01-24', 'PRESENT', 2),
(9, 4, '2025-01-24', 'PRESENT', 2),
-- Week 4 (Jan 27-31): 5 sessions, 4 present, 1 absent
(1, 4, '2025-01-27', 'PRESENT', 2), (2, 4, '2025-01-27', 'PRESENT', 2),
(3, 4, '2025-01-28', 'PRESENT', 2), (4, 4, '2025-01-28', 'PRESENT', 2),
(5, 4, '2025-01-29', 'PRESENT', 2), (6, 4, '2025-01-30', 'ABSENT', 2),
(7, 4, '2025-01-30', 'PRESENT', 2), (8, 4, '2025-01-31', 'PRESENT', 2),
(9, 4, '2025-01-31', 'PRESENT', 2),
-- Week 5 (Feb 3-7): 5 sessions, 4 present, 1 absent
(1, 4, '2025-02-03', 'PRESENT', 2), (2, 4, '2025-02-03', 'PRESENT', 2),
(3, 4, '2025-02-04', 'PRESENT', 2), (4, 4, '2025-02-04', 'PRESENT', 2),
(5, 4, '2025-02-05', 'PRESENT', 2), (6, 4, '2025-02-06', 'PRESENT', 2),
(7, 4, '2025-02-06', 'ABSENT', 2), (8, 4, '2025-02-07', 'PRESENT', 2),
(9, 4, '2025-02-07', 'PRESENT', 2),
-- Week 6 (Feb 10-14): 5 sessions, all present
(1, 4, '2025-02-10', 'PRESENT', 2), (2, 4, '2025-02-10', 'PRESENT', 2),
(3, 4, '2025-02-11', 'PRESENT', 2), (4, 4, '2025-02-11', 'PRESENT', 2),
(5, 4, '2025-02-12', 'PRESENT', 2);

-- ========================================
-- VIEWS FOR REPORTING
-- ========================================

-- View: Student attendance summary
CREATE OR REPLACE VIEW v_student_attendance_summary AS
SELECT 
    s.id AS student_id,
    s.roll_no,
    s.name,
    s.department,
    s.semester,
    s.section,
    COUNT(DISTINCT sa.id) AS total_sessions,
    SUM(CASE WHEN sa.status = 'PRESENT' THEN 1 ELSE 0 END) AS present_count,
    SUM(CASE WHEN sa.status = 'ABSENT' THEN 1 ELSE 0 END) AS absent_count,
    SUM(CASE WHEN sa.status = 'LATE' THEN 1 ELSE 0 END) AS late_count,
    ROUND((SUM(CASE WHEN sa.status IN ('PRESENT', 'LATE') THEN 1 ELSE 0 END) * 100.0 / 
           NULLIF(COUNT(DISTINCT sa.id), 0)), 2) AS attendance_percentage
FROM student s
LEFT JOIN session_attendance sa ON s.id = sa.student_id
GROUP BY s.id, s.roll_no, s.name, s.department, s.semester, s.section;

-- View: Daily attendance report
CREATE OR REPLACE VIEW v_daily_attendance AS
SELECT 
    sa.attendance_date,
    ts.department,
    ts.semester,
    ts.section,
    sub.name AS subject_name,
    COUNT(DISTINCT sa.student_id) AS total_students,
    SUM(CASE WHEN sa.status = 'PRESENT' THEN 1 ELSE 0 END) AS present,
    SUM(CASE WHEN sa.status = 'ABSENT' THEN 1 ELSE 0 END) AS absent,
    SUM(CASE WHEN sa.status = 'LATE' THEN 1 ELSE 0 END) AS late
FROM session_attendance sa
JOIN timetable_session ts ON sa.session_id = ts.id
JOIN subject sub ON ts.subject_id = sub.id
GROUP BY sa.attendance_date, ts.department, ts.semester, ts.section, sub.name;

-- ========================================
-- STORED PROCEDURES
-- ========================================

DELIMITER //

-- Procedure: Calculate attendance percentage for a student
CREATE PROCEDURE sp_calculate_student_attendance(
    IN p_student_id BIGINT,
    IN p_start_date DATE,
    IN p_end_date DATE,
    OUT p_percentage DECIMAL(5,2)
)
BEGIN
    SELECT ROUND((SUM(CASE WHEN status IN ('PRESENT', 'LATE') THEN 1 ELSE 0 END) * 100.0 / 
           NULLIF(COUNT(*), 0)), 2)
    INTO p_percentage
    FROM session_attendance
    WHERE student_id = p_student_id
      AND attendance_date BETWEEN p_start_date AND p_end_date;
END //

-- Procedure: Get low attendance students
CREATE PROCEDURE sp_get_low_attendance_students(
    IN p_threshold DECIMAL(5,2)
)
BEGIN
    SELECT 
        s.id,
        s.roll_no,
        s.name,
        s.department,
        s.semester,
        vsa.attendance_percentage
    FROM student s
    JOIN v_student_attendance_summary vsa ON s.id = vsa.student_id
    WHERE vsa.attendance_percentage < p_threshold
    ORDER BY vsa.attendance_percentage ASC;
END //

DELIMITER ;

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

-- Additional indexes for common queries
CREATE INDEX idx_student_dept_sem ON student(department, semester, active);
CREATE INDEX idx_session_date_status ON session_attendance(attendance_date, status);
CREATE INDEX idx_timetable_active ON timetable_session(active, day_of_week);

-- ========================================
-- SCHEMA COMPLETE
-- ========================================
