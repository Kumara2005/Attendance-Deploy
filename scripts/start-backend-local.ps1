# =====================================
# AttendX Backend - Local Development
# =====================================

$Host.UI.RawUI.WindowTitle = "AttendX Backend - Local Development (Port 8080)"
Set-Location "c:\Users\donys\Downloads\Attendance-Deploy\backend"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AttendX Backend - Local Development" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📍 API URL: http://localhost:8080/api" -ForegroundColor Green
Write-Host "💾 Database: localhost:3306/attendance_db" -ForegroundColor Green
Write-Host "🌍 CORS Origins: http://localhost:5173, http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "Prerequisites:" -ForegroundColor Yellow
Write-Host "  ✓ MySQL running on localhost:3306" -ForegroundColor Yellow
Write-Host "  ✓ Database 'attendance_db' exists (will be auto-created)" -ForegroundColor Yellow
Write-Host "  ✓ Username: root, Password: root" -ForegroundColor Yellow
Write-Host ""
Write-Host "Starting Backend with LOCAL profile..." -ForegroundColor Yellow
Write-Host ""

# Run with local profile
& .\mvnw.cmd spring-boot:run "-Dspring-boot.run.arguments=--spring.profiles.active=local"
