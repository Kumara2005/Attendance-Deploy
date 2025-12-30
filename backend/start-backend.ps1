$env:JWT_SECRET = 'oo7fBm3airbvtz0WxhopUTnhu7nr4ZhYqbq4HkMLaBhLCuXuQg6f3WPwfVOEjm9liWAeAv6dejDzUijYR8Q2EA=='
Write-Host '========================================' -ForegroundColor Cyan
Write-Host 'Starting AttendX Backend Server' -ForegroundColor Cyan
Write-Host '========================================' -ForegroundColor Cyan
Write-Host 'API will be available at: http://localhost:8080/api' -ForegroundColor Green
Write-Host ''
.\mvnw.cmd spring-boot:run
