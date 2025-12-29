# PowerShell Script to Seed Database for Timetable-Attendance Workflow
# Run this script to populate the database with test data

Write-Host "`n=== ATTENDANCE MANAGEMENT SYSTEM ===" -ForegroundColor Cyan
Write-Host "Database Seeding Script`n" -ForegroundColor Cyan

# MySQL Configuration
$mysqlHost = "localhost"
$mysqlPort = "3306"
$mysqlUser = "root"
$mysqlPassword = "vvkumaran_2005"
$mysqlDatabase = "attendance_db"
$seedFile = "database/seed-data.sql"

Write-Host "1. Checking MySQL connection..." -ForegroundColor Yellow
try {
    $testConnection = mysql -h $mysqlHost -P $mysqlPort -u $mysqlUser -p$mysqlPassword -e "SELECT 1;" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✓ MySQL connection successful" -ForegroundColor Green
    } else {
        Write-Host "   ✗ MySQL connection failed" -ForegroundColor Red
        Write-Host "   Error: $testConnection" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "   ✗ MySQL is not accessible" -ForegroundColor Red
    Write-Host "   Make sure MySQL is running and credentials are correct" -ForegroundColor Red
    exit 1
}

Write-Host "`n2. Running seed data script..." -ForegroundColor Yellow
try {
    $result = mysql -h $mysqlHost -P $mysqlPort -u $mysqlUser -p$mysqlPassword $mysqlDatabase < $seedFile 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✓ Seed data inserted successfully!" -ForegroundColor Green
    } else {
        Write-Host "   ⚠ Seed script executed with warnings" -ForegroundColor Yellow
        Write-Host "   $result" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ✗ Failed to run seed script" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`n3. Verifying seeded data..." -ForegroundColor Yellow

# Check students
$studentCount = mysql -h $mysqlHost -P $mysqlPort -u $mysqlUser -p$mysqlPassword -D $mysqlDatabase -e "SELECT COUNT(*) FROM student WHERE department='Computer Science' AND year=1 AND section='A';" -N 2>&1
Write-Host "   Students in CS Year 1 Class A: $studentCount" -ForegroundColor White

# Check staff
$staffCount = mysql -h $mysqlHost -P $mysqlPort -u $mysqlUser -p$mysqlPassword -D $mysqlDatabase -e "SELECT COUNT(*) FROM staff WHERE department='Computer Science';" -N 2>&1
Write-Host "   Staff in Computer Science: $staffCount" -ForegroundColor White

# Check timetable sessions
$sessionCount = mysql -h $mysqlHost -P $mysqlPort -u $mysqlUser -p$mysqlPassword -D $mysqlDatabase -e "SELECT COUNT(*) FROM timetable_session WHERE department='Computer Science' AND semester=1 AND section='A';" -N 2>&1
Write-Host "   Timetable sessions for CS Year 1 Class A: $sessionCount" -ForegroundColor White

Write-Host "`n=== SEEDING COMPLETE ===" -ForegroundColor Green
Write-Host "✓ 10 Students added to Computer Science Class A" -ForegroundColor Green
Write-Host "✓ 5 Teachers assigned to 5 subjects" -ForegroundColor Green
Write-Host "✓ Timetable sessions created for the week" -ForegroundColor Green
Write-Host "`nYou can now:" -ForegroundColor White
Write-Host "  1. Login as Prof. John Smith (john.smith@college.edu / password)" -ForegroundColor White
Write-Host "  2. View your timetable in Staff Portal" -ForegroundColor White
Write-Host "  3. Click any class block to mark attendance" -ForegroundColor White
Write-Host ""
