# ==========================================
# GitHub Push - Quick Setup Script
# ==========================================
# Run this script to prepare and push to GitHub
# Repository: https://github.com/Kumara2005/Attendance-Final.git

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  ATTENDANCE SYSTEM - GITHUB SETUP" -ForegroundColor White
Write-Host "========================================`n" -ForegroundColor Cyan

# Step 1: Verify we're in the right directory
$currentDir = Get-Location
if ($currentDir.Path -notlike "*Attendance-Management-System*") {
    Write-Host "❌ ERROR: Please run this script from the project root directory" -ForegroundColor Red
    Write-Host "Expected: C:\Users\vvkum\Downloads\Attendance-Management-System" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Current directory: $($currentDir.Path)" -ForegroundColor Green

# Step 2: Verify sensitive files are protected
Write-Host "`n[Step 1/5] Verifying sensitive data protection..." -ForegroundColor Cyan

if (Test-Path "attendance-backend\.env") {
    Write-Host "✅ .env file exists (will be ignored by Git)" -ForegroundColor Green
} else {
    Write-Host "⚠️  WARNING: .env file not found. Using defaults from application.properties" -ForegroundColor Yellow
}

if (Test-Path ".gitignore") {
    Write-Host "✅ .gitignore exists" -ForegroundColor Green
} else {
    Write-Host "❌ ERROR: .gitignore missing!" -ForegroundColor Red
    exit 1
}

# Step 3: Configure Git
Write-Host "`n[Step 2/5] Configuring Git line endings..." -ForegroundColor Cyan

git config core.autocrlf true
git config core.safecrlf warn

Write-Host "✅ Git line ending configuration applied" -ForegroundColor Green

# Step 4: Initialize repository
Write-Host "`n[Step 3/5] Initializing Git repository..." -ForegroundColor Cyan

# Check if .git exists
if (Test-Path ".git") {
    Write-Host "✅ Git repository already initialized" -ForegroundColor Green
} else {
    git init
    Write-Host "✅ Git repository initialized" -ForegroundColor Green
}

# Add remote
$remoteUrl = "https://github.com/Kumara2005/Attendance-Final.git"
$existingRemote = git remote get-url origin 2>$null

if ($existingRemote) {
    Write-Host "ℹ️  Remote 'origin' already exists: $existingRemote" -ForegroundColor Yellow
    $response = Read-Host "Do you want to update it to $remoteUrl? (y/n)"
    if ($response -eq 'y') {
        git remote set-url origin $remoteUrl
        Write-Host "✅ Remote updated" -ForegroundColor Green
    }
} else {
    git remote add origin $remoteUrl
    Write-Host "✅ Remote 'origin' added: $remoteUrl" -ForegroundColor Green
}

# Step 5: Stage files
Write-Host "`n[Step 4/5] Staging files for commit..." -ForegroundColor Cyan

git add .

Write-Host "✅ Files staged" -ForegroundColor Green

# Show what will be committed
Write-Host "`nFiles to be committed:" -ForegroundColor Yellow
git status --short | Select-Object -First 20
$fileCount = (git status --short | Measure-Object).Count
Write-Host "... and $fileCount more files" -ForegroundColor Yellow

# Check for ignored files
Write-Host "`nVerifying sensitive files are ignored:" -ForegroundColor Yellow
$ignored = git check-ignore attendance-backend/.env
if ($ignored) {
    Write-Host "✅ attendance-backend/.env is IGNORED (safe)" -ForegroundColor Green
} else {
    Write-Host "❌ WARNING: .env might be committed!" -ForegroundColor Red
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne 'y') {
        exit 1
    }
}

# Step 6: Create commit
Write-Host "`n[Step 5/5] Creating commit..." -ForegroundColor Cyan

$commitMessage = @"
Initial commit: Attendance Management System

Features:
- Spring Boot backend with JWT authentication
- React frontend with TypeScript
- Subject Management (Admin CRUD)
- Timetable Management
- Attendance Tracking
- Role-based access (Admin, Staff, Student)

Security:
- Environment variables for credentials
- Comprehensive .gitignore
- Line ending normalization
"@

git commit -m $commitMessage

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Commit created successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Commit failed" -ForegroundColor Red
    exit 1
}

# Step 7: Push to GitHub
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  READY TO PUSH TO GITHUB" -ForegroundColor White
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Repository: $remoteUrl" -ForegroundColor Yellow
Write-Host "`nPush commands:" -ForegroundColor Cyan
Write-Host "  First time: git branch -M main; git push -u origin main" -ForegroundColor White
Write-Host "  Force push: git push -u origin main --force" -ForegroundColor Yellow
Write-Host "  Merge push: git pull origin main --allow-unrelated-histories; git push`n" -ForegroundColor White

$pushNow = Read-Host "Do you want to push to GitHub now? (y/n)"

if ($pushNow -eq 'y') {
    Write-Host "`nPushing to GitHub..." -ForegroundColor Cyan
    
    # Try to push
    git branch -M main
    git push -u origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ SUCCESS! Project pushed to GitHub" -ForegroundColor Green
        Write-Host "View at: $remoteUrl" -ForegroundColor Cyan
    } else {
        Write-Host "`n⚠️  Push failed. Common solutions:" -ForegroundColor Yellow
        Write-Host "1. If remote has content: git pull origin main --allow-unrelated-histories" -ForegroundColor White
        Write-Host "2. Force push (overwrites remote): git push -u origin main --force" -ForegroundColor White
        Write-Host "3. Check authentication (use Personal Access Token, not password)" -ForegroundColor White
    }
} else {
    Write-Host "`nℹ️  Commit created but not pushed." -ForegroundColor Yellow
    Write-Host "Push manually when ready:" -ForegroundColor Yellow
    Write-Host "  git push -u origin main`n" -ForegroundColor White
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  SETUP COMPLETE" -ForegroundColor White
Write-Host "========================================`n" -ForegroundColor Cyan
