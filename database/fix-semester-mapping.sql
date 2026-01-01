-- ============================================================
-- Fix Semester Mapping to be Consistent with Years
-- Year 1 → Semesters 1 & 2
-- Year 2 → Semesters 3 & 4
-- Year 3 → Semesters 5 & 6
-- ============================================================

-- First, view what we have currently
-- SELECT id, name, semester, section FROM student WHERE department='Computer Science' ORDER BY semester, name;

-- Update test students seeded by old script
-- Old: CS-S1-A01 to CS-S1-A10 (Semester 1)
-- These are correct, keep as is

-- Old: CS-S3-A01 to CS-S3-A10 (Semester 3)
-- These are correct, keep as is

-- Old: CS-S5-A01 to CS-S5-A10 (Semester 5)
-- These are correct, keep as is

-- Update any old students with wrong semester values
-- For example, if there are students with semester=6 from manual entry, 
-- we might need to adjust them

-- Fix all students where semester doesn't match the Year pattern
-- This assumes:
-- - Semesters should only be: 1, 2, 3, 4, 5, 6
-- - No other semester values exist

-- View all students before update
SELECT 
  id, 
  name, 
  roll_no, 
  department, 
  semester, 
  section, 
  active,
  CASE 
    WHEN semester IN (1,2) THEN 'Year 1'
    WHEN semester IN (3,4) THEN 'Year 2'
    WHEN semester IN (5,6) THEN 'Year 3'
    ELSE 'Unknown'
  END as year_mapping
FROM student 
WHERE department='Computer Science'
ORDER BY semester, section, name;

-- After verifying the mapping above is correct, 
-- you can update incorrect records manually as needed.
-- For example:
-- UPDATE student SET semester=1 WHERE id IN (...);
