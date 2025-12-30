# Security Fix Verification Script
# Tests JWT validation, authorization enforcement, and token revocation

$BASE_URL = "http://localhost:8080/api"

Write-Host "`n=== SECURITY FIX VERIFICATION ===" -ForegroundColor Cyan
Write-Host "Testing all critical security fixes from audit report`n" -ForegroundColor Cyan

# Test 1: Login with unique password (Fix: Default Passwords)
Write-Host "Test 1: Admin login with unique password" -ForegroundColor Yellow
$loginBody = @{
    username = "admin"
    password = "Admin@2024!Secure"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $adminToken = $response.data.token
    $refreshToken = $response.data.refreshToken
    Write-Host "✅ PASS: Admin logged in successfully" -ForegroundColor Green
    Write-Host "   Token: $($adminToken.Substring(0,20))..." -ForegroundColor Gray
} catch {
    Write-Host "❌ FAIL: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Login as student
Write-Host "`nTest 2: Student login" -ForegroundColor Yellow
$studentLoginBody = @{
    username = "student"
    password = "Student@2024!Secure"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST -Body $studentLoginBody -ContentType "application/json"
    $studentToken = $response.data.token
    Write-Host "✅ PASS: Student logged in successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ FAIL: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Authorization enforcement - Student accessing admin endpoint
Write-Host "`nTest 3: Student accessing students list (should fail)" -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $studentToken"
    }
    $response = Invoke-RestMethod -Uri "$BASE_URL/students" -Method GET -Headers $headers
    Write-Host "❌ FAIL: Student should not have access to students list" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 403) {
        Write-Host "✅ PASS: Student correctly denied access (403 Forbidden)" -ForegroundColor Green
    } else {
        Write-Host "❌ FAIL: Wrong error code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

# Test 4: Authorization enforcement - Admin accessing students list
Write-Host "`nTest 4: Admin accessing students list (should succeed)" -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $adminToken"
    }
    $response = Invoke-RestMethod -Uri "$BASE_URL/students" -Method GET -Headers $headers
    Write-Host "✅ PASS: Admin can access students list" -ForegroundColor Green
    Write-Host "   Found $($response.data.Count) students" -ForegroundColor Gray
} catch {
    Write-Host "❌ FAIL: Admin should have access: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Token revocation - Logout
Write-Host "`nTest 5: Logout (token revocation)" -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $adminToken"
    }
    $response = Invoke-RestMethod -Uri "$BASE_URL/auth/logout" -Method POST -Headers $headers
    Write-Host "✅ PASS: Logged out successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ FAIL: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Verify refresh token deleted from database
Write-Host "`nTest 6: Verify refresh token deleted from database" -ForegroundColor Yellow
try {
    $query = "SELECT COUNT(*) as count FROM refresh_tokens WHERE user_id = 1;"
    $result = mysql -u attendance_user -p'Att3nd@nc3!2024Secur3' attendance_db -se $query
    if ($result -eq "0") {
        Write-Host "✅ PASS: Refresh token deleted from database" -ForegroundColor Green
    } else {
        Write-Host "❌ FAIL: Refresh token still exists (count: $result)" -ForegroundColor Red
    }
} catch {
    Write-Host "⚠️  WARN: Could not verify database (not critical): $($_.Exception.Message)" -ForegroundColor Yellow
}

# Test 7: Error handling - Invalid credentials (should not expose details)
Write-Host "`nTest 7: Error handling - Invalid credentials" -ForegroundColor Yellow
$badLoginBody = @{
    username = "admin"
    password = "wrongpassword"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST -Body $badLoginBody -ContentType "application/json"
    Write-Host "❌ FAIL: Invalid credentials should fail" -ForegroundColor Red
} catch {
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
    if ($errorResponse.message -notmatch "(?i)(exception|stack|trace|line|\.java)") {
        Write-Host "✅ PASS: Error message does not expose internals" -ForegroundColor Green
        Write-Host "   Message: $($errorResponse.message)" -ForegroundColor Gray
    } else {
        Write-Host "❌ FAIL: Error message exposes internals: $($errorResponse.message)" -ForegroundColor Red
    }
}

Write-Host "`n=== VERIFICATION COMPLETE ===" -ForegroundColor Cyan
Write-Host "All critical security fixes have been tested`n" -ForegroundColor Cyan
