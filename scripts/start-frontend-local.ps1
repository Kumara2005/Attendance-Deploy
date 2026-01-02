# =====================================
# AttendX Frontend - Local Development
# =====================================

$Host.UI.RawUI.WindowTitle = "AttendX Frontend - Local Development (Port 3000)"
Set-Location "c:\Users\donys\Downloads\Attendance-Deploy\frontend"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AttendX Frontend - Local Development" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 Frontend URL: http://localhost:3000" -ForegroundColor Green
Write-Host "📍 API Proxy: http://localhost:8080/api" -ForegroundColor Green
Write-Host ""
Write-Host "Prerequisites:" -ForegroundColor Yellow
Write-Host "  ✓ Node.js and npm installed" -ForegroundColor Yellow
Write-Host "  ✓ Dependencies installed (npm install)" -ForegroundColor Yellow
Write-Host "  ✓ Backend running on http://localhost:8080" -ForegroundColor Yellow
Write-Host ""
Write-Host "Starting Frontend with Vite..." -ForegroundColor Yellow
Write-Host ""

# Run dev server
npm run dev
