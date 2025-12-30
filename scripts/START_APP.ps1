# ====================================
# AttendX Application Startup Script
# ====================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AttendX Application Startup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "⚠️  NOT RUNNING AS ADMINISTRATOR" -ForegroundColor Yellow
    Write-Host "   MySQL service start may fail. Right-click and 'Run as Administrator' if needed." -ForegroundColor Yellow
    Write-Host ""
}

# Step 1: Check and start MySQL
Write-Host "[1/3] Checking MySQL service..." -ForegroundColor Green
$mysqlService = Get-Service -Name MYSQL80 -ErrorAction SilentlyContinue

if ($mysqlService) {
    if ($mysqlService.Status -eq 'Running') {
        Write-Host "✅ MySQL is already running" -ForegroundColor Green
    } else {
        Write-Host "⏳ Starting MySQL service..." -ForegroundColor Yellow
        try {
            Start-Service -Name MYSQL80 -ErrorAction Stop
            Write-Host "✅ MySQL service started successfully" -ForegroundColor Green
        } catch {
            Write-Host "❌ Failed to start MySQL. Please run as Administrator or start MySQL manually." -ForegroundColor Red
            Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host ""
            Write-Host "   Alternative: Start Docker Desktop and run: docker-compose up -d mysql" -ForegroundColor Yellow
            Read-Host "Press Enter to exit"
            exit 1
        }
    }
} else {
    Write-Host "⚠️  MySQL service not found. Checking Docker..." -ForegroundColor Yellow
    
    # Check if Docker is available
    try {
        docker ps | Out-Null
        Write-Host "⏳ Starting MySQL via Docker..." -ForegroundColor Yellow
        docker-compose up -d mysql
        Write-Host "⏳ Waiting for MySQL to be healthy..." -ForegroundColor Yellow
        Start-Sleep -Seconds 15
        Write-Host "✅ MySQL container started" -ForegroundColor Green
    } catch {
        Write-Host "❌ Neither MySQL service nor Docker is available." -ForegroundColor Red
        Write-Host "   Please install MySQL or Docker Desktop first." -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

Write-Host ""

# Step 2: Start Backend
Write-Host "[2/3] Starting Backend Server..." -ForegroundColor Green
Write-Host "   This will open a new window for the backend." -ForegroundColor Gray

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\attendance-backend'; Write-Host 'Starting Spring Boot Backend...' -ForegroundColor Cyan; ./mvnw spring-boot:run"

Write-Host "⏳ Waiting for backend to initialize (30 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Step 3: Start Frontend
Write-Host "[3/3] Starting Frontend Server..." -ForegroundColor Green
Write-Host "   This will open a new window for the frontend." -ForegroundColor Gray

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\Frontend\attendx---advanced-student-attendance-system'; Write-Host 'Starting Vite Frontend...' -ForegroundColor Cyan; npm run dev"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  🎉 Application Starting!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📱 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔧 Backend:  http://localhost:8080" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔑 Login Credentials:" -ForegroundColor Yellow
Write-Host "   Admin:   username: admin   password: admin123" -ForegroundColor Gray
Write-Host "   Staff:   username: staff   password: staff123" -ForegroundColor Gray
Write-Host "   Student: username: student password: student123" -ForegroundColor Gray
Write-Host ""
Write-Host "⏳ Please wait 30-60 seconds for both services to fully start..." -ForegroundColor Yellow
Write-Host ""

# Open browser after a delay
Start-Sleep -Seconds 10
Write-Host "🌐 Opening browser..." -ForegroundColor Green
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "✅ Startup complete! Check the opened windows for logs." -ForegroundColor Green
Write-Host "   Press Ctrl+C in those windows to stop the services." -ForegroundColor Gray
Write-Host ""
Read-Host "Press Enter to close this window"
