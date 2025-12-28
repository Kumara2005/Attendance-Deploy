# Backend Connection Guide

## Current Status

### ✅ Frontend Configuration
- Running on: `http://localhost:3003`
- API Base URL: `http://localhost:8080/api` (configured in services/api.ts)
- Mode: **MOCK MODE** (works without backend)

### ❌ Backend Status
- Port: `8080`
- Status: **NOT RUNNING**
- Database: MySQL `attendance_db` on `localhost:3306`

---

## Steps to Connect Frontend & Backend

### 1. Install Prerequisites

**Option A: Install Maven**
```powershell
# Using Chocolatey
choco install maven

# Or download from: https://maven.apache.org/download.cgi
```

**Option B: Use IDE**
- IntelliJ IDEA (recommended)
- Eclipse with Spring Tools
- VS Code with Spring Boot Extension

### 2. Start MySQL Database

```powershell
# If using Docker
docker run -d -p 3306:3306 --name mysql-attendance `
  -e MYSQL_ROOT_PASSWORD=root `
  -e MYSQL_DATABASE=attendance_db `
  mysql:8.0

# Or install MySQL locally from: https://dev.mysql.com/downloads/mysql/
```

### 3. Build & Run Backend

**Using Maven:**
```powershell
cd attendance-backend
mvn clean install -DskipTests
mvn spring-boot:run
```

**Using IntelliJ IDEA:**
1. Open `attendance-backend` folder
2. Wait for Maven dependencies to download
3. Right-click `AttendanceBackendApplication.java`
4. Select "Run"

### 4. Verify Backend is Running

Open browser: `http://localhost:8080/api/health` (if health endpoint exists)

Or check terminal for:
```
Tomcat started on port(s): 8080 (http)
```

### 5. Switch Frontend to API Mode

Currently, the frontend uses **mock authentication**. To use real backend:

**Remove mock code from `LoginPage.tsx`:**

```typescript
// CURRENT (Mock Mode):
const handleLoginSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setError('');

  try {
    await new Promise(resolve => setTimeout(resolve, 800)); // Mock delay
    
    const mockUsers = {
      'admin': { password: 'admin123', role: UserRole.ADMIN, ... },
      // ... mock users
    };
    
    const user = mockUsers[username];
    if (!user || user.password !== password) {
      throw new Error('Invalid credentials');
    }
    
    localStorage.setItem('user_data', JSON.stringify({...}));
    onLogin(user.role, user.email);
  } catch (err) {
    setError(err.message);
  } finally {
    setIsLoading(false);
  }
};
```

**Replace with API Mode:**

```typescript
// API MODE (Uses Real Backend):
const handleLoginSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setError('');

  try {
    const response = await authService.login({ username, password });
    onLogin(normalizeRole(response.role), response.email);
  } catch (err: any) {
    setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
  } finally {
    setIsLoading(false);
  }
};
```

---

## Testing Connection

### Frontend API Endpoints (configured)

All in `services/` folder:

1. **Authentication** (`authService.ts`):
   - `POST /api/auth/login` - Login
   - `POST /api/auth/refresh` - Refresh token
   - `POST /api/auth/logout` - Logout

2. **Students** (`studentService.ts`):
   - `GET /api/students` - Get all students
   - `POST /api/students` - Create student
   - `PUT /api/students/{id}` - Update student
   - `DELETE /api/students/{id}` - Delete student

3. **Attendance** (`attendanceService.ts`):
   - `POST /api/attendance/session` - Mark attendance
   - `GET /api/attendance/date?date={date}` - Get by date
   - `GET /api/attendance/student/{id}` - Get student attendance

### Test with cURL

Once backend is running:

```powershell
# Test login
curl -X POST http://localhost:8080/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"username\":\"admin\",\"password\":\"admin123\"}'

# Test students endpoint (with token)
curl -X GET http://localhost:8080/api/students `
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

---

## Current Backend Database Schema

Located in: `attendance-backend/src/main/resources/schema.sql` or `database/schema.sql`

Tables:
- `users` - Admin, staff, student accounts
- `students` - Student records
- `attendance_records` - Attendance data
- `sessions` - Class sessions

---

## Troubleshooting

### Issue: "Connection refused" error in frontend

**Solution**: Backend not running. Start backend first.

### Issue: "CORS error" in browser console

**Solution**: Backend needs CORS configuration for `http://localhost:3003`

Add to Spring Boot:
```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins("http://localhost:3003")
                    .allowedMethods("GET", "POST", "PUT", "DELETE")
                    .allowCredentials(true);
            }
        };
    }
}
```

### Issue: "401 Unauthorized" on every request

**Solution**: JWT token expired or invalid. Clear localStorage and login again.

```javascript
localStorage.clear();
```

### Issue: Database connection error

**Solution**: 
1. Check MySQL is running: `netstat -an | findstr :3306`
2. Verify credentials in `application.properties`
3. Create database: `CREATE DATABASE attendance_db;`

---

## Quick Status Check

Run this to verify everything:

```powershell
# Check Frontend
curl http://localhost:3003

# Check Backend (should return 404 or JSON, not "connection refused")
curl http://localhost:8080/api

# Check MySQL
Test-NetConnection -ComputerName localhost -Port 3306
```

---

## Summary

**Current Setup**: ✅ Frontend works standalone with mock data  
**To Connect**: ❌ Need Maven + MySQL + Backend running  
**Next Step**: Install Maven OR use IntelliJ IDEA to run backend
