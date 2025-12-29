@echo off
echo === Database Seeding Started ===

set MYSQL_PATH="C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
set MYSQL_USER=root
set MYSQL_PASS=vvkumaran_2005
set MYSQL_DB=attendance_db

echo Checking MySQL installation...
if not exist %MYSQL_PATH% (
    echo MySQL not found at default location!
    echo Please update MYSQL_PATH in this script.
    exit /b 1
)

echo MySQL found. Seeding database...
%MYSQL_PATH% -u %MYSQL_USER% -p%MYSQL_PASS% %MYSQL_DB% < database\seed-data.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo === SUCCESS ===
    echo Database seeded successfully!
    echo.
    echo Verifying data...
    %MYSQL_PATH% -u %MYSQL_USER% -p%MYSQL_PASS% -D %MYSQL_DB% -e "SELECT COUNT(*) AS 'Students' FROM student WHERE department='Computer Science' AND year=1 AND section='A';"
    %MYSQL_PATH% -u %MYSQL_USER% -p%MYSQL_PASS% -D %MYSQL_DB% -e "SELECT COUNT(*) AS 'Staff' FROM staff WHERE department='Computer Science';"
    %MYSQL_PATH% -u %MYSQL_USER% -p%MYSQL_PASS% -D %MYSQL_DB% -e "SELECT COUNT(*) AS 'Sessions' FROM timetable_session WHERE department='Computer Science' AND semester=1 AND section='A';"
    echo.
    echo You can now test the workflow:
    echo 1. Login: john.smith@college.edu / password
    echo 2. Go to Staff Portal - My Timetable
    echo 3. Click any class block to mark attendance
) else (
    echo.
    echo === FAILED ===
    echo Seeding failed. Check MySQL credentials and database.
    exit /b 1
)

pause
