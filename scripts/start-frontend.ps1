$Host.UI.RawUI.WindowTitle = "AttendX Frontend - Port 5173"
Set-Location "C:\Users\ashwa\Attendance-Management-System\Frontend\attendx---advanced-student-attendance-system"
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AttendX Frontend Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Web URL: http://localhost:5173" -ForegroundColor Green
Write-Host "Starting..." -ForegroundColor Yellow
Write-Host ""
npm run dev
