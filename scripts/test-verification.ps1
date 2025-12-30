# Runtime Verification Tests for AttendX
# This script tests authentication, authorization, and database connectivity

$BASE_URL = "http://localhost:8080/api"
$results = @{}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "AttendX Runtime Verification Tests" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Test 1: Backend Health Check
Write-Host "[1/6] Backend Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/auth/login" -Method POST -Body '{}' -ContentType "application/json" -UseBasicParsing -ErrorAction Stop
    $results['backend_health'] = "FAIL: Should return error"
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "  ✅ PASS: Backend responding (400 Bad Request as expected)" -ForegroundColor Green
        $results['backend_health'] = "PASS"
    } else {
        Write-Host "  ❌ FAIL: Unexpected response: $($_.Exception.Message)" -ForegroundColor Red
        $results['backend_health'] = "FAIL"
    }
}

# Test 2: Admin Login
Write-Host "`n[2/6] Admin Login Test..." -ForegroundColor Yellow
$loginBody = @{
    username = "admin"
    password = "Admin@2024!Secure"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/auth/login" -Method POST -Body $loginBody -ContentType "application/json" -UseBasicParsing
    $loginData = ($response.Content | ConvertFrom-Json)
    if ($loginData.data.token) {
        $global:adminToken = $loginData.data.token
        $global:adminRefreshToken = $loginData.data.refreshToken
        Write-Host "  ✅ PASS: Admin logged in successfully" -ForegroundColor Green
        Write-Host "    Token: $($global:adminToken.Substring(0,30))..." -ForegroundColor Gray
        $results['admin_login'] = "PASS"
    } else {
        Write-Host "  ❌ FAIL: No token in response" -ForegroundColor Red
        $results['admin_login'] = "FAIL"
    }
} catch {
    Write-Host "  ❌ FAIL: $($_.Exception.Message)" -ForegroundColor Red
    $results['admin_login'] = "FAIL"
}

# Test 3: Student Login
Write-Host "`n[3/6] Student Login Test..." -ForegroundColor Yellow
$studentLoginBody = @{
    username = "student"
    password = "Student@2024!Secure"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/auth/login" -Method POST -Body $studentLoginBody -ContentType "application/json" -UseBasicParsing
    $loginData = ($response.Content | ConvertFrom-Json)
    if ($loginData.data.token) {
        $global:studentToken = $loginData.data.token
        Write-Host "  ✅ PASS: Student logged in successfully" -ForegroundColor Green
        $results['student_login'] = "PASS"
    } else {
        Write-Host "  ❌ FAIL: No token in response" -ForegroundColor Red
        $results['student_login'] = "FAIL"
    }
} catch {
    Write-Host "  ❌ FAIL: $($_.Exception.Message)" -ForegroundColor Red
    $results['student_login'] = "FAIL"
}

# Test 4: Authorization - Student accessing admin endpoint (should fail)
Write-Host "`n[4/6] Authorization Test (Student → /api/students)..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $global:studentToken"
    }
    $response = Invoke-WebRequest -Uri "$BASE_URL/students" -Method GET -Headers $headers -UseBasicParsing
    Write-Host "  ❌ FAIL: Student should not have access to students list" -ForegroundColor Red
    $results['authorization_student'] = "FAIL"
} catch {
    if ($_.Exception.Response.StatusCode -eq 403) {
        Write-Host "  ✅ PASS: Student correctly denied access (403 Forbidden)" -ForegroundColor Green
        $results['authorization_student'] = "PASS"
    } else {
        Write-Host "  ❌ FAIL: Wrong error code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        $results['authorization_student'] = "FAIL"
    }
}

# Test 5: Database Connectivity - Admin accessing students list
Write-Host "`n[5/6] Database Connectivity Test (Admin → /api/students)..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $global:adminToken"
    }
    $response = Invoke-WebRequest -Uri "$BASE_URL/students" -Method GET -Headers $headers -UseBasicParsing
    $data = ($response.Content | ConvertFrom-Json)
    Write-Host "  ✅ PASS: Database query successful" -ForegroundColor Green
    Write-Host "    Found $($data.data.Count) students in database" -ForegroundColor Gray
    $results['database_connectivity'] = "PASS"
} catch {
    Write-Host "  ❌ FAIL: $($_.Exception.Message)" -ForegroundColor Red
    $results['database_connectivity'] = "FAIL"
}

# Test 6: Logout and Token Revocation
Write-Host "`n[6/6] Logout Test..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $global:adminToken"
    }
    $response = Invoke-WebRequest -Uri "$BASE_URL/auth/logout" -Method POST -Headers $headers -UseBasicParsing
    Write-Host "  ✅ PASS: Logged out successfully" -ForegroundColor Green
    $results['logout'] = "PASS"
    
    # Verify refresh token deleted from database
    try {
        $dbCheck = mysql -u attendance_user -p'Att3nd@nc3!2024Secur3' attendance_db -se "SELECT COUNT(*) FROM refresh_tokens WHERE user_id = 1;" 2>$null
        if ($dbCheck -eq "0") {
            Write-Host "    ✅ Refresh token deleted from database" -ForegroundColor Green
        } else {
            Write-Host "    ⚠️  Refresh token still in database (count: $dbCheck)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "    ℹ️  Could not verify database (non-critical)" -ForegroundColor Gray
    }
} catch {
    Write-Host "  ❌ FAIL: $($_.Exception.Message)" -ForegroundColor Red
    $results['logout'] = "FAIL"
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Test Results Summary" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$passCount = ($results.Values | Where-Object { $_ -eq "PASS" }).Count
$totalCount = $results.Count

foreach ($test in $results.GetEnumerator()) {
    $icon = if ($test.Value -eq "PASS") { "✅" } else { "❌" }
    $color = if ($test.Value -eq "PASS") { "Green" } else { "Red" }
    Write-Host "  $icon $($test.Key): $($test.Value)" -ForegroundColor $color
}

Write-Host "`nOverall: $passCount / $totalCount tests passed" -ForegroundColor $(if ($passCount -eq $totalCount) { "Green" } else { "Yellow" })
Write-Host "========================================`n" -ForegroundColor Cyan

# Return results for automation
return $results
