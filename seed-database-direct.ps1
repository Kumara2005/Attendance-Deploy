# Direct Database Seeding via MySQL
Write-Host "`n=== Database Seeding Started ===" -ForegroundColor Cyan

$mysqlPath = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
$seedFile = "database\seed-data.sql"

# Check if MySQL exists
if (-Not (Test-Path $mysqlPath)) {
    Write-Host "MySQL not found at default location. Searching..." -ForegroundColor Yellow
    $mysqlPath = Get-ChildItem "C:\Program Files\MySQL" -Recurse -Filter "mysql.exe" -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName
    if (-Not $mysqlPath) {
        Write-Host "✗ MySQL not found. Please install MySQL or add it to PATH" -ForegroundColor Red
        exit 1
    }
}

Write-Host "Found MySQL at: $mysqlPath" -ForegroundColor Green

# Run seed script
Write-Host "`nExecuting seed data..." -ForegroundColor Yellow
& $mysqlPath -h localhost -u root -pvvkumaran_2005 attendance_db -e "source database/seed-data.sql" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Database seeded successfully!" -ForegroundColor Green
    
    # Verify data
    Write-Host "`nVerifying..." -ForegroundColor Yellow
    $students = & $mysqlPath -h localhost -u root -pvvkumaran_2005 -D attendance_db -N -e "SELECT COUNT(*) FROM student WHERE department='Computer Science' AND year=1 AND section='A';" 2>&1
    $staff = & $mysqlPath -h localhost -u root -pvvkumaran_2005 -D attendance_db -N -e "SELECT COUNT(*) FROM staff WHERE department='Computer Science';" 2>&1
    $sessions = & $mysqlPath -h localhost -u root -pvvkumaran_2005 -D attendance_db -N -e "SELECT COUNT(*) FROM timetable_session WHERE department='Computer Science' AND semester=1 AND section='A';" 2>&1
    
    Write-Host "Students: $students" -ForegroundColor White
    Write-Host "Staff: $staff" -ForegroundColor White
    Write-Host "Timetable Sessions: $sessions" -ForegroundColor White
} else {
    Write-Host "✗ Seeding failed" -ForegroundColor Red
}
