-- Fix for Issue: Quick Attendance students list empty
-- Root Cause: Timetable sessions for Dhamayenthi (Algorithms) are in semester 6
--             But students are enrolled in semester 3
-- Solution: Update the timetable_session records to use semester 3

-- Only run the UPDATE, nothing else
UPDATE timetable_session 
SET semester = 3 
WHERE faculty_id = 5 AND subject_id = 2 AND semester = 6;
