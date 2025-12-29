-- Update subject table with new fields
USE attendance_db;

-- Add new columns to subject table
ALTER TABLE subject 
ADD COLUMN IF NOT EXISTS subject_code VARCHAR(20) UNIQUE,
ADD COLUMN IF NOT EXISTS credits INT DEFAULT 3,
ADD COLUMN IF NOT EXISTS is_elective BOOLEAN DEFAULT false;

-- Seed subjects for Computer Science Semester 1
INSERT INTO subject (name, subject_code, department, semester, credits)
VALUES 
('Basics of Computer Science', 'CS101', 'Computer Science', 1, 4),
('Digital Electronics', 'CS102', 'Computer Science', 1, 3),
('Mathematical Structures', 'CS103', 'Computer Science', 1, 4),
('Programming in C', 'CS104', 'Computer Science', 1, 4),
('Computer Organization', 'CS105', 'Computer Science', 1, 3),
('English Communication', 'CS106', 'Computer Science', 1, 2)
ON DUPLICATE KEY UPDATE 
  subject_code=VALUES(subject_code), 
  credits=VALUES(credits);

-- Verify the update
SELECT id, name, subject_code, department, semester, credits, is_elective FROM subject LIMIT 10;
