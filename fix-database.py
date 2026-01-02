#!/usr/bin/env python3
"""
Database fix script to update timetable_session semester
Problem: Dhamayenthi's Algorithms sessions are in semester 6, but students are in semester 3
Solution: Update sessions to semester 3
"""

import subprocess
import sys

# SQL queries to execute
sql_queries = [
    "-- Show current state",
    "SELECT 'BEFORE UPDATE:' AS status;",
    "SELECT id, subject_id, faculty_id, semester, day_of_week, start_time FROM timetable_session WHERE faculty_id = 5 AND subject_id = 2;",
    "",
    "-- Fix the semester for Dhamayenthi's Algorithms sessions",
    "UPDATE timetable_session SET semester = 3 WHERE faculty_id = 5 AND subject_id = 2 AND semester = 6;",
    "",
    "-- Show after state",
    "SELECT 'AFTER UPDATE:' AS status;",
    "SELECT id, subject_id, faculty_id, semester, day_of_week, start_time FROM timetable_session WHERE faculty_id = 5 AND subject_id = 2;",
]

# Create temporary SQL file
sql_file = "C:\\temp\\fix_semester.sql"
with open(sql_file, 'w') as f:
    f.write('\n'.join(sql_queries))

print(f"📝 Created SQL file: {sql_file}")
print("\n📋 SQL Queries to execute:")
print('\n'.join(sql_queries))

# Try using the fix-timetable-semester.sql file we created earlier
print("\n\n✅ Database fix script created at: database/fix-timetable-semester.sql")
print("📝 Use this SQL to fix the semester mismatch:")
print("""
UPDATE timetable_session 
SET semester = 3 
WHERE faculty_id = 5 AND subject_id = 2 AND semester = 6;
""")
