$Host.UI.RawUI.WindowTitle = "AttendX Backend - Port 8080"
Set-Location "C:\Users\ashwa\Attendance-Management-System\attendance-backend"
$env:JWT_SECRET = "oo7fBm3airbvtz0WxhopUTnhu7nr4ZhYqbq4HkMLaBhLCuXuQg6f3WPwfVOEjm9liWAeAv6dejDzUijYR8Q2EA=="
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AttendX Backend Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "API URL: http://localhost:8080/api" -ForegroundColor Green
Write-Host "Starting..." -ForegroundColor Yellow
Write-Host ""
.\mvnw.cmd spring-boot:run
