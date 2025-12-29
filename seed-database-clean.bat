@echo off
echo === Database Seeding Started (Clean Version) ===

set MYSQL_PATH="C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
set MYSQL_USER=root
set MYSQL_PASS=vvkumaran_2005
set MYSQL_DB=attendance_db

echo Checking MySQL installation...
if not exist %MYSQL_PATH% (
    echo MySQL not found at default location!
    exit /b 1
)

echo MySQL found. Seeding database with clean script...
%MYSQL_PATH% -u %MYSQL_USER% -p%MYSQL_PASS% %MYSQL_DB% < database\seed-data-clean.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo === SUCCESS - Database Seeded ===
    echo.
    echo Test Login Credentials:
    echo   Username: john.smith
    echo   Password: password
    echo.
    echo Available Teachers:
    echo   - Prof. John Smith (Programming Fundamentals)
    echo   - Dr. Sarah Johnson (Data Structures)
    echo   - Prof. Michael Brown (Database Management)
    echo   - Dr. Emily Davis (Web Development)
    echo   - Prof. Robert Wilson (Computer Networks)
    echo.
    echo Seeded Data:
    echo   - 10 Students in CS Semester 1 Section A
    echo   - 5 Teachers with 5 subjects
    echo   - 20 Timetable sessions (Mon-Fri, 4 periods/day)
) else (
    echo.
    echo === FAILED ===
    exit /b 1
)

pause
