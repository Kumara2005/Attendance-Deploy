-- ============================================================================
-- ATTENDX DATABASE SCHEMA
-- Generated based on Frontend TypeScript Types and Components
-- Database: attendx_db
-- ============================================================================

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS attendance_records;
DROP TABLE IF EXISTS timetable_sessions;
DROP TABLE IF EXISTS subjects;
DROP TABLE IF EXISTS circulars;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS staff;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS refresh_tokens;
DROP TABLE IF EXISTS system_settings;

-- ============================================================================
-- USERS TABLE (Base table for all user types)
-- Maps to: types.ts -> User interface
-- ============================================================================
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'STAFF', 'STUDENT') NOT NULL,
    department VARCHAR(100),
    avatar VARCHAR(255),
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- STAFF TABLE (Faculty/Teachers)
-- Maps to: constants.ts -> MOCK_STAFF
-- Extends users table with staff-specific fields
-- ============================================================================
CREATE TABLE staff (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    employee_code VARCHAR(50) UNIQUE,
    subject VARCHAR(100),
    year VARCHAR(20), -- Year 1, Year 2, Year 3
    qualification VARCHAR(100),
    specialization VARCHAR(100),
    joining_date DATE,
    phone VARCHAR(20),
    address TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_subject (subject),
    INDEX idx_year (year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- STUDENTS TABLE
-- Maps to: types.ts -> Student interface
-- Based on: StudentPortal.tsx -> STUDENT_IDENTITY and constants.ts
-- ============================================================================
CREATE TABLE students (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    roll_number VARCHAR(50) UNIQUE NOT NULL,
    class VARCHAR(100) NOT NULL, -- e.g., "B.Sc Computer Science"
    section VARCHAR(50), -- e.g., "Year 1"
    year VARCHAR(20) NOT NULL, -- Year 1, Year 2, Year 3
    admission_date DATE,
    date_of_birth DATE,
    phone VARCHAR(20),
    parent_phone VARCHAR(20),
    address TEXT,
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    last_active DATETIME,
    attendance_percentage DECIMAL(5,2) DEFAULT 0.00,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_roll_number (roll_number),
    INDEX idx_class_year (class, year),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- SUBJECTS TABLE
-- Maps to: StudentPortal.tsx -> ALEX_ATTENDANCE_DATA (subject field)
-- ============================================================================
CREATE TABLE subjects (
    id VARCHAR(50) PRIMARY KEY,
    subject_code VARCHAR(20) UNIQUE NOT NULL,
    subject_name VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    year VARCHAR(20) NOT NULL, -- Year 1, Year 2, Year 3
    credits INT DEFAULT 3,
    is_lab BOOLEAN DEFAULT FALSE,
    faculty_id VARCHAR(50), -- Staff member teaching this subject
    total_classes INT DEFAULT 40, -- Default total classes per subject
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (faculty_id) REFERENCES staff(id) ON DELETE SET NULL,
    INDEX idx_subject_code (subject_code),
    INDEX idx_department_year (department, year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TIMETABLE SESSIONS TABLE
-- Maps to: StudentPortal.tsx -> MASTER_TIMETABLE
-- Structure: Day of week -> Time slots -> Subject/Faculty/Location
-- ============================================================================
CREATE TABLE timetable_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    subject_id VARCHAR(50),
    subject_name VARCHAR(100) NOT NULL, -- Denormalized for quick access
    faculty_id VARCHAR(50),
    faculty_name VARCHAR(100), -- Denormalized for quick access
    location VARCHAR(100), -- e.g., "Room 301 - Block A"
    class VARCHAR(100) NOT NULL, -- e.g., "B.Sc Computer Science"
    year VARCHAR(20) NOT NULL, -- Year 1, Year 2, Year 3
    section VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL,
    FOREIGN KEY (faculty_id) REFERENCES staff(id) ON DELETE SET NULL,
    INDEX idx_day_time (day_of_week, start_time),
    INDEX idx_class_year (class, year),
    INDEX idx_faculty (faculty_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- ATTENDANCE RECORDS TABLE
-- Maps to: types.ts -> AttendanceRecord interface
-- Tracks: StudentPortal.tsx -> ALEX_ATTENDANCE_DATA (attended/total calculation)
-- ============================================================================
CREATE TABLE attendance_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    subject_id VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    status ENUM('Present', 'Absent', 'Late') NOT NULL, -- 'Late' = On-Duty (OD) in UI
    marked_by VARCHAR(50), -- Staff ID who marked attendance
    marked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    session_time TIME, -- Time of the class session
    notes TEXT,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (marked_by) REFERENCES staff(id) ON DELETE SET NULL,
    UNIQUE KEY unique_attendance (student_id, subject_id, date, session_time),
    INDEX idx_student_date (student_id, date),
    INDEX idx_subject_date (subject_id, date),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- CIRCULARS TABLE
-- Maps to: types.ts -> Circular interface
-- Used in admin dashboard for announcements
-- ============================================================================
CREATE TABLE circulars (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    date DATE NOT NULL,
    type ENUM('General', 'Holiday', 'Academic') NOT NULL,
    published_at DATETIME NOT NULL,
    published_by VARCHAR(50), -- Admin user ID
    department VARCHAR(100), -- Target department (NULL = all)
    year VARCHAR(20), -- Target year (NULL = all)
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (published_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_date (date),
    INDEX idx_type (type),
    INDEX idx_published_at (published_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- AUDIT LOGS TABLE
-- Maps to: types.ts -> AuditLog interface
-- Tracks all system actions for security and accountability
-- ============================================================================
CREATE TABLE audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    action VARCHAR(255) NOT NULL, -- e.g., "Updated timetable", "Marked attendance"
    details TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_timestamp (user_id, timestamp),
    INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- REFRESH TOKENS TABLE
-- For JWT authentication and token refresh mechanism
-- ============================================================================
CREATE TABLE refresh_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- SYSTEM SETTINGS TABLE
-- Store application-wide configuration
-- ============================================================================
CREATE TABLE system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by VARCHAR(50),
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- SEED DATA: Default Admin User (Dr. Sarah Jenkins from constants.ts)
-- Password: admin123 (bcrypt hashed)
-- ============================================================================
INSERT INTO users (id, name, email, password, role, department, is_active) VALUES
('u1', 'Dr. Sarah Jenkins', 'sarah.admin@attendx.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN', 'Administration', TRUE);

-- ============================================================================
-- SEED DATA: B.Sc Computer Science Faculty (from constants.ts -> generateCSFaculty)
-- ============================================================================
INSERT INTO users (id, name, email, password, role, department, is_active) VALUES
('cs_f_0', 'Dr. Alan Turing', 'cs.prof0@attendx.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'STAFF', 'B.Sc Computer Science', TRUE),
('cs_f_1', 'Dr. Grace Hopper', 'cs.prof1@attendx.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'STAFF', 'B.Sc Computer Science', TRUE),
('cs_f_2', 'Prof. John McCarthy', 'cs.prof2@attendx.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'STAFF', 'B.Sc Computer Science', TRUE),
('cs_f_3', 'Dr. Ada Lovelace', 'cs.prof3@attendx.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'STAFF', 'B.Sc Computer Science', TRUE),
('cs_f_4', 'Prof. Marvin Minsky', 'cs.prof4@attendx.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'STAFF', 'B.Sc Computer Science', TRUE),
('cs_f_5', 'Dr. Tim Berners-Lee', 'cs.prof5@attendx.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'STAFF', 'B.Sc Computer Science', TRUE),
('cs_f_6', 'Prof. Linus Torvalds', 'cs.prof6@attendx.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'STAFF', 'B.Sc Computer Science', TRUE),
('cs_f_7', 'Dr. Margaret Hamilton', 'cs.prof7@attendx.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'STAFF', 'B.Sc Computer Science', TRUE);

INSERT INTO staff (id, user_id, employee_code, subject, year) VALUES
('cs_f_0', 'cs_f_0', 'EMP001', 'Data Structures', 'Year 1'),
('cs_f_1', 'cs_f_1', 'EMP002', 'Database Management', 'Year 1'),
('cs_f_2', 'cs_f_2', 'EMP003', 'Operating Systems', 'Year 1'),
('cs_f_3', 'cs_f_3', 'EMP004', 'Algorithms', 'Year 2'),
('cs_f_4', 'cs_f_4', 'EMP005', 'Artificial Intelligence', 'Year 3'),
('cs_f_5', 'cs_f_5', 'EMP006', 'Web Technologies', 'Year 1'),
('cs_f_6', 'cs_f_6', 'EMP007', 'Computer Networks', 'Year 1'),
('cs_f_7', 'cs_f_7', 'EMP008', 'Software Engineering', 'Year 1');

-- ============================================================================
-- SEED DATA: Student - Alex Rivera (from StudentPortal.tsx -> STUDENT_IDENTITY)
-- Password: student123 (bcrypt hashed)
-- ============================================================================
INSERT INTO users (id, name, email, password, role, department, is_active) VALUES
('cs_s_0', 'Alex Rivera', 'alex.rivera@student.attendx.edu', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'STUDENT', 'B.Sc Computer Science', TRUE);

INSERT INTO students (id, user_id, roll_number, class, section, year, status, attendance_percentage) VALUES
('cs_s_0', 'cs_s_0', 'CS-Y1-100', 'B.Sc Computer Science', 'Year 1', 'Year 1', 'Active', 86.00);

-- ============================================================================
-- SEED DATA: Subjects for B.Sc Computer Science Year 1
-- Based on: StudentPortal.tsx -> ALEX_ATTENDANCE_DATA
-- ============================================================================
INSERT INTO subjects (id, subject_code, subject_name, department, year, faculty_id, is_lab, total_classes) VALUES
('sub_01', 'CS101', 'Data Structures', 'B.Sc Computer Science', 'Year 1', 'cs_f_0', FALSE, 40),
('sub_02', 'CS102', 'Operating Systems', 'B.Sc Computer Science', 'Year 1', 'cs_f_2', FALSE, 40),
('sub_03', 'CS103', 'Database Management', 'B.Sc Computer Science', 'Year 1', 'cs_f_1', FALSE, 40),
('sub_04', 'CS104', 'Computer Networks', 'B.Sc Computer Science', 'Year 1', 'cs_f_6', FALSE, 40),
('sub_05', 'CS105', 'Software Engineering', 'B.Sc Computer Science', 'Year 1', 'cs_f_7', FALSE, 40),
('sub_06', 'CS106', 'Web Technologies', 'B.Sc Computer Science', 'Year 1', 'cs_f_5', FALSE, 40),
('sub_07', 'CS101L', 'Data Structures Lab', 'B.Sc Computer Science', 'Year 1', 'cs_f_0', TRUE, 20),
('sub_08', 'CS103L', 'Database Management Lab', 'B.Sc Computer Science', 'Year 1', 'cs_f_1', TRUE, 20),
('sub_09', 'CS106L', 'Web Technologies Lab', 'B.Sc Computer Science', 'Year 1', 'cs_f_5', TRUE, 20);

-- ============================================================================
-- SEED DATA: Attendance Records for Alex Rivera
-- Based on: StudentPortal.tsx -> ALEX_ATTENDANCE_DATA
-- Creating historical attendance to match: 86% overall
-- ============================================================================
-- Data Structures: 34/40 = 85%
INSERT INTO attendance_records (student_id, subject_id, date, status, marked_by, session_time) 
SELECT 'cs_s_0', 'sub_01', DATE_SUB(CURDATE(), INTERVAL n DAY), 
       IF(n <= 34, 'Present', 'Absent'), 'cs_f_0', '08:00:00'
FROM (SELECT 1 n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 
      UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10
      UNION SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION SELECT 15
      UNION SELECT 16 UNION SELECT 17 UNION SELECT 18 UNION SELECT 19 UNION SELECT 20
      UNION SELECT 21 UNION SELECT 22 UNION SELECT 23 UNION SELECT 24 UNION SELECT 25
      UNION SELECT 26 UNION SELECT 27 UNION SELECT 28 UNION SELECT 29 UNION SELECT 30
      UNION SELECT 31 UNION SELECT 32 UNION SELECT 33 UNION SELECT 34 UNION SELECT 35
      UNION SELECT 36 UNION SELECT 37 UNION SELECT 38 UNION SELECT 39 UNION SELECT 40) AS nums;

-- Operating Systems: 37/40 = 93%
INSERT INTO attendance_records (student_id, subject_id, date, status, marked_by, session_time) 
SELECT 'cs_s_0', 'sub_02', DATE_SUB(CURDATE(), INTERVAL n DAY), 
       IF(n <= 37, 'Present', 'Absent'), 'cs_f_2', '09:00:00'
FROM (SELECT 1 n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 
      UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10
      UNION SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION SELECT 15
      UNION SELECT 16 UNION SELECT 17 UNION SELECT 18 UNION SELECT 19 UNION SELECT 20
      UNION SELECT 21 UNION SELECT 22 UNION SELECT 23 UNION SELECT 24 UNION SELECT 25
      UNION SELECT 26 UNION SELECT 27 UNION SELECT 28 UNION SELECT 29 UNION SELECT 30
      UNION SELECT 31 UNION SELECT 32 UNION SELECT 33 UNION SELECT 34 UNION SELECT 35
      UNION SELECT 36 UNION SELECT 37 UNION SELECT 38 UNION SELECT 39 UNION SELECT 40) AS nums;

-- Database Management: 32/40 = 80%
INSERT INTO attendance_records (student_id, subject_id, date, status, marked_by, session_time) 
SELECT 'cs_s_0', 'sub_03', DATE_SUB(CURDATE(), INTERVAL n DAY), 
       IF(n <= 32, 'Present', 'Absent'), 'cs_f_1', '10:00:00'
FROM (SELECT 1 n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 
      UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10
      UNION SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION SELECT 15
      UNION SELECT 16 UNION SELECT 17 UNION SELECT 18 UNION SELECT 19 UNION SELECT 20
      UNION SELECT 21 UNION SELECT 22 UNION SELECT 23 UNION SELECT 24 UNION SELECT 25
      UNION SELECT 26 UNION SELECT 27 UNION SELECT 28 UNION SELECT 29 UNION SELECT 30
      UNION SELECT 31 UNION SELECT 32 UNION SELECT 33 UNION SELECT 34 UNION SELECT 35
      UNION SELECT 36 UNION SELECT 37 UNION SELECT 38 UNION SELECT 39 UNION SELECT 40) AS nums;

-- Computer Networks: 36/40 = 90%
INSERT INTO attendance_records (student_id, subject_id, date, status, marked_by, session_time) 
SELECT 'cs_s_0', 'sub_04', DATE_SUB(CURDATE(), INTERVAL n DAY), 
       IF(n <= 36, 'Present', 'Absent'), 'cs_f_6', '12:00:00'
FROM (SELECT 1 n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 
      UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10
      UNION SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION SELECT 15
      UNION SELECT 16 UNION SELECT 17 UNION SELECT 18 UNION SELECT 19 UNION SELECT 20
      UNION SELECT 21 UNION SELECT 22 UNION SELECT 23 UNION SELECT 24 UNION SELECT 25
      UNION SELECT 26 UNION SELECT 27 UNION SELECT 28 UNION SELECT 29 UNION SELECT 30
      UNION SELECT 31 UNION SELECT 32 UNION SELECT 33 UNION SELECT 34 UNION SELECT 35
      UNION SELECT 36 UNION SELECT 37 UNION SELECT 38 UNION SELECT 39 UNION SELECT 40) AS nums;

-- Software Engineering: 38/40 = 95%
INSERT INTO attendance_records (student_id, subject_id, date, status, marked_by, session_time) 
SELECT 'cs_s_0', 'sub_05', DATE_SUB(CURDATE(), INTERVAL n DAY), 
       IF(n <= 38, 'Present', 'Absent'), 'cs_f_7', '13:00:00'
FROM (SELECT 1 n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 
      UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10
      UNION SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION SELECT 15
      UNION SELECT 16 UNION SELECT 17 UNION SELECT 18 UNION SELECT 19 UNION SELECT 20
      UNION SELECT 21 UNION SELECT 22 UNION SELECT 23 UNION SELECT 24 UNION SELECT 25
      UNION SELECT 26 UNION SELECT 27 UNION SELECT 28 UNION SELECT 29 UNION SELECT 30
      UNION SELECT 31 UNION SELECT 32 UNION SELECT 33 UNION SELECT 34 UNION SELECT 35
      UNION SELECT 36 UNION SELECT 37 UNION SELECT 38 UNION SELECT 39 UNION SELECT 40) AS nums;

-- Web Technologies: 33/40 = 83%
INSERT INTO attendance_records (student_id, subject_id, date, status, marked_by, session_time) 
SELECT 'cs_s_0', 'sub_06', DATE_SUB(CURDATE(), INTERVAL n DAY), 
       IF(n <= 33, 'Present', 'Absent'), 'cs_f_5', '08:00:00'
FROM (SELECT 1 n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 
      UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10
      UNION SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION SELECT 15
      UNION SELECT 16 UNION SELECT 17 UNION SELECT 18 UNION SELECT 19 UNION SELECT 20
      UNION SELECT 21 UNION SELECT 22 UNION SELECT 23 UNION SELECT 24 UNION SELECT 25
      UNION SELECT 26 UNION SELECT 27 UNION SELECT 28 UNION SELECT 29 UNION SELECT 30
      UNION SELECT 31 UNION SELECT 32 UNION SELECT 33 UNION SELECT 34 UNION SELECT 35
      UNION SELECT 36 UNION SELECT 37 UNION SELECT 38 UNION SELECT 39 UNION SELECT 40) AS nums;

-- ============================================================================
-- SEED DATA: Master Timetable for B.Sc Computer Science Year 1
-- Based on: StudentPortal.tsx -> MASTER_TIMETABLE
-- ============================================================================

-- Monday Schedule
INSERT INTO timetable_sessions (day_of_week, start_time, end_time, subject_id, subject_name, faculty_id, faculty_name, location, class, year) VALUES
('Monday', '08:00:00', '09:00:00', 'sub_01', 'Data Structures', 'cs_f_0', 'Dr. Alan Turing', 'Room 301 - Block A', 'B.Sc Computer Science', 'Year 1'),
('Monday', '09:00:00', '10:00:00', 'sub_02', 'Operating Systems', 'cs_f_2', 'Prof. John McCarthy', 'Room 302 - Block B', 'B.Sc Computer Science', 'Year 1'),
('Monday', '10:00:00', '11:00:00', 'sub_03', 'Database Management', 'cs_f_1', 'Dr. Grace Hopper', 'Room 205 - Block A', 'B.Sc Computer Science', 'Year 1'),
('Monday', '11:00:00', '12:00:00', NULL, 'Free Period', NULL, '-', '-', 'B.Sc Computer Science', 'Year 1'),
('Monday', '12:00:00', '13:00:00', 'sub_04', 'Computer Networks', 'cs_f_6', 'Prof. Linus Torvalds', 'Room 410 - Block C', 'B.Sc Computer Science', 'Year 1'),
('Monday', '13:00:00', '14:00:00', 'sub_05', 'Software Engineering', 'cs_f_7', 'Dr. Margaret Hamilton', 'Room 305 - Block B', 'B.Sc Computer Science', 'Year 1');

-- Tuesday Schedule
INSERT INTO timetable_sessions (day_of_week, start_time, end_time, subject_id, subject_name, faculty_id, faculty_name, location, class, year) VALUES
('Tuesday', '08:00:00', '09:00:00', 'sub_06', 'Web Technologies', 'cs_f_5', 'Prof. Tim Berners-Lee', 'Room 201 - Block A', 'B.Sc Computer Science', 'Year 1'),
('Tuesday', '09:00:00', '10:00:00', 'sub_07', 'Data Structures Lab', 'cs_f_0', 'Dr. Alan Turing', 'Lab 1 - Block D', 'B.Sc Computer Science', 'Year 1'),
('Tuesday', '10:00:00', '11:00:00', 'sub_07', 'Data Structures Lab', 'cs_f_0', 'Dr. Alan Turing', 'Lab 1 - Block D', 'B.Sc Computer Science', 'Year 1'),
('Tuesday', '11:00:00', '12:00:00', NULL, 'Institutional Break', NULL, '-', 'Cafeteria', 'B.Sc Computer Science', 'Year 1'),
('Tuesday', '12:00:00', '13:00:00', 'sub_02', 'Operating Systems', 'cs_f_2', 'Prof. John McCarthy', 'Room 302 - Block B', 'B.Sc Computer Science', 'Year 1'),
('Tuesday', '13:00:00', '14:00:00', 'sub_03', 'Database Management', 'cs_f_1', 'Dr. Grace Hopper', 'Room 205 - Block A', 'B.Sc Computer Science', 'Year 1');

-- Wednesday Schedule
INSERT INTO timetable_sessions (day_of_week, start_time, end_time, subject_id, subject_name, faculty_id, faculty_name, location, class, year) VALUES
('Wednesday', '08:00:00', '09:00:00', 'sub_05', 'Software Engineering', 'cs_f_7', 'Dr. Margaret Hamilton', 'Room 305 - Block B', 'B.Sc Computer Science', 'Year 1'),
('Wednesday', '09:00:00', '10:00:00', 'sub_04', 'Computer Networks', 'cs_f_6', 'Prof. Linus Torvalds', 'Room 410 - Block C', 'B.Sc Computer Science', 'Year 1'),
('Wednesday', '10:00:00', '11:00:00', 'sub_06', 'Web Technologies', 'cs_f_5', 'Prof. Tim Berners-Lee', 'Room 201 - Block A', 'B.Sc Computer Science', 'Year 1'),
('Wednesday', '11:00:00', '12:00:00', 'sub_01', 'Data Structures', 'cs_f_0', 'Dr. Alan Turing', 'Room 301 - Block A', 'B.Sc Computer Science', 'Year 1'),
('Wednesday', '12:00:00', '13:00:00', NULL, 'Free Period', NULL, '-', '-', 'B.Sc Computer Science', 'Year 1'),
('Wednesday', '13:00:00', '14:00:00', 'sub_02', 'Operating Systems', 'cs_f_2', 'Prof. John McCarthy', 'Room 302 - Block B', 'B.Sc Computer Science', 'Year 1');

-- Thursday Schedule
INSERT INTO timetable_sessions (day_of_week, start_time, end_time, subject_id, subject_name, faculty_id, faculty_name, location, class, year) VALUES
('Thursday', '08:00:00', '09:00:00', 'sub_08', 'Database Management Lab', 'cs_f_1', 'Dr. Grace Hopper', 'Lab 2 - Block D', 'B.Sc Computer Science', 'Year 1'),
('Thursday', '09:00:00', '10:00:00', 'sub_08', 'Database Management Lab', 'cs_f_1', 'Dr. Grace Hopper', 'Lab 2 - Block D', 'B.Sc Computer Science', 'Year 1'),
('Thursday', '10:00:00', '11:00:00', 'sub_05', 'Software Engineering', 'cs_f_7', 'Dr. Margaret Hamilton', 'Room 305 - Block B', 'B.Sc Computer Science', 'Year 1'),
('Thursday', '11:00:00', '12:00:00', NULL, 'Institutional Break', NULL, '-', 'Cafeteria', 'B.Sc Computer Science', 'Year 1'),
('Thursday', '12:00:00', '13:00:00', 'sub_04', 'Computer Networks', 'cs_f_6', 'Prof. Linus Torvalds', 'Room 410 - Block C', 'B.Sc Computer Science', 'Year 1'),
('Thursday', '13:00:00', '14:00:00', 'sub_06', 'Web Technologies', 'cs_f_5', 'Prof. Tim Berners-Lee', 'Room 201 - Block A', 'B.Sc Computer Science', 'Year 1');

-- Friday Schedule
INSERT INTO timetable_sessions (day_of_week, start_time, end_time, subject_id, subject_name, faculty_id, faculty_name, location, class, year) VALUES
('Friday', '08:00:00', '09:00:00', 'sub_01', 'Data Structures', 'cs_f_0', 'Dr. Alan Turing', 'Room 301 - Block A', 'B.Sc Computer Science', 'Year 1'),
('Friday', '09:00:00', '10:00:00', 'sub_02', 'Operating Systems', 'cs_f_2', 'Prof. John McCarthy', 'Room 302 - Block B', 'B.Sc Computer Science', 'Year 1'),
('Friday', '10:00:00', '11:00:00', 'sub_03', 'Database Management', 'cs_f_1', 'Dr. Grace Hopper', 'Room 205 - Block A', 'B.Sc Computer Science', 'Year 1'),
('Friday', '11:00:00', '12:00:00', 'sub_04', 'Computer Networks', 'cs_f_6', 'Prof. Linus Torvalds', 'Room 410 - Block C', 'B.Sc Computer Science', 'Year 1'),
('Friday', '12:00:00', '13:00:00', 'sub_05', 'Software Engineering', 'cs_f_7', 'Dr. Margaret Hamilton', 'Room 305 - Block B', 'B.Sc Computer Science', 'Year 1'),
('Friday', '13:00:00', '14:00:00', NULL, 'Free Period', NULL, '-', '-', 'B.Sc Computer Science', 'Year 1');

-- Saturday Schedule
INSERT INTO timetable_sessions (day_of_week, start_time, end_time, subject_id, subject_name, faculty_id, faculty_name, location, class, year) VALUES
('Saturday', '08:00:00', '09:00:00', 'sub_09', 'Web Technologies Lab', 'cs_f_5', 'Prof. Tim Berners-Lee', 'Lab 3 - Block D', 'B.Sc Computer Science', 'Year 1'),
('Saturday', '09:00:00', '10:00:00', 'sub_09', 'Web Technologies Lab', 'cs_f_5', 'Prof. Tim Berners-Lee', 'Lab 3 - Block D', 'B.Sc Computer Science', 'Year 1'),
('Saturday', '10:00:00', '11:00:00', NULL, 'Project Work', 'cs_f_7', 'Dr. Margaret Hamilton', 'Project Lab - Block C', 'B.Sc Computer Science', 'Year 1'),
('Saturday', '11:00:00', '12:00:00', NULL, 'Project Work', 'cs_f_7', 'Dr. Margaret Hamilton', 'Project Lab - Block C', 'B.Sc Computer Science', 'Year 1'),
('Saturday', '12:00:00', '13:00:00', NULL, 'Free Period', NULL, '-', '-', 'B.Sc Computer Science', 'Year 1'),
('Saturday', '13:00:00', '14:00:00', NULL, 'Free Period', NULL, '-', '-', 'B.Sc Computer Science', 'Year 1');

-- ============================================================================
-- SEED DATA: System Settings
-- ============================================================================
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('minimum_attendance_percentage', '75', 'Minimum attendance required to appear in exams'),
('academic_year', '2024-2025', 'Current academic year'),
('semester', 'Odd', 'Current semester (Odd/Even)'),
('app_name', 'AttendX', 'Application name'),
('default_session_duration', '60', 'Default class session duration in minutes');

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
