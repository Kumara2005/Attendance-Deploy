# ATTENDX Backend API Documentation
## Generated from Frontend Analysis

**Database:** attendx_db  
**Host:** localhost:8080  
**Authentication:** JWT Bearer Token

---

## 1. Authentication Endpoints

### POST /api/auth/login
**Access:** Public  
**Request Body:**
```json
{
  "username": "alex.rivera@student.attendx.edu",
  "password": "student123"
}
```
**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "...",
  "user": {
    "id": "cs_s_0",
    "name": "Alex Rivera",
    "email": "alex.rivera@student.attendx.edu",
    "role": "STUDENT"
  }
}
```

---

## 2. Student Endpoints (Role: STUDENT)
**Base Path:** `/api/student/dashboard`  
**Authentication:** Required (JWT)  
**Access:** READ-ONLY

### GET /api/student/dashboard
**Description:** Get complete student dashboard (identity, attendance, timetable)  
**Response Structure:**
```json
{
  "success": true,
  "data": {
    "identity": {
      "id": "cs_s_0",
      "rollNumber": "CS-Y1-100",
      "name": "Alex Rivera",
      "className": "B.Sc Computer Science",
      "section": "Year 1",
      "year": "Year 1",
      "department": "B.Sc Computer Science"
    },
    "overallAttendancePercentage": 86.0,
    "subjectAttendance": [
      {
        "subject": "Data Structures",
        "attended": 34,
        "total": 40,
        "percentage": 85.0
      },
      {
        "subject": "Operating Systems",
        "attended": 37,
        "total": 40,
        "percentage": 93.0
      }
    ],
    "weeklyTimetable": {
      "schedule": {
        "Monday": [
          {
            "startTime": "08:00",
            "endTime": "09:00",
            "subject": "Data Structures",
            "faculty": "Dr. Alan Turing",
            "location": "Room 301 - Block A"
          }
        ]
      }
    }
  }
}
```

### GET /api/student/dashboard/attendance
**Description:** Get ONLY subject-wise attendance data  
**Response:** Array of `SubjectAttendanceDTO`

### GET /api/student/dashboard/timetable
**Description:** Get complete weekly timetable  
**Response:** `WeeklyTimetableDTO` with all 7 days

### GET /api/student/dashboard/timetable/today
**Description:** Get TODAY's timetable only  
**Response:** Array of `TimetableSlotDTO` for current day

---

## 3. Admin Endpoints (Role: ADMIN)
**Base Path:** `/api/admin/dashboard`  
**Authentication:** Required (JWT)  
**Access:** CREATE, READ, UPDATE, DELETE

### GET /api/admin/dashboard
**Description:** Get admin dashboard with Programme Registry  
**Response Structure:**
```json
{
  "success": true,
  "data": {
    "programmes": [
      {
        "name": "B.Sc Computer Science",
        "department": "B.Sc Computer Science",
        "studentCount": 30,
        "facultyCount": 8,
        "averageAttendance": 86.5,
        "years": ["Year 1", "Year 2", "Year 3"]
      }
    ],
    "totalStudents": 150,
    "totalStaff": 25,
    "totalClasses": 12,
    "overallAttendance": 84.2
  }
}
```

### GET /api/admin/dashboard/programmes
**Description:** Get all programmes for Curriculum Registry cards  
**Response:** Array of `ProgrammeDTO`

### Master Timetable Management

#### GET /api/admin/dashboard/timetable
**Description:** Get complete master timetable (all classes, all days)  
**Response:** Array of `TimetableSession` objects

#### POST /api/admin/dashboard/timetable
**Description:** Create new timetable session  
**Request Body:**
```json
{
  "dayOfWeek": "Monday",
  "startTime": "08:00:00",
  "endTime": "09:00:00",
  "subjectId": "sub_01",
  "subjectName": "Data Structures",
  "facultyId": "cs_f_0",
  "facultyName": "Dr. Alan Turing",
  "location": "Room 301 - Block A",
  "className": "B.Sc Computer Science",
  "year": "Year 1",
  "section": "Section A"
}
```

#### PUT /api/admin/dashboard/timetable/{id}
**Description:** Update existing timetable session  
**Parameters:** `id` (Long) - Timetable session ID  
**Request Body:** Same as POST

#### DELETE /api/admin/dashboard/timetable/{id}
**Description:** Delete timetable session  
**Parameters:** `id` (Long) - Timetable session ID

#### GET /api/admin/dashboard/timetable/class/{className}/year/{year}
**Description:** Get timetable for specific class and year  
**Parameters:**  
- `className` - e.g., "B.Sc Computer Science"
- `year` - e.g., "Year 1"

---

## 4. Staff/Teacher Endpoints (Role: STAFF)
**Base Path:** `/api/staff/dashboard`  
**Authentication:** Required (JWT)  
**Access:** READ (own classes), CREATE (attendance marking)

### GET /api/staff/dashboard
**Description:** Get staff dashboard with assigned classes  
**Response Structure:**
```json
{
  "success": true,
  "data": {
    "staffInfo": {
      "id": "cs_f_0",
      "name": "Dr. Alan Turing",
      "email": "cs.prof0@attendx.edu",
      "department": "B.Sc Computer Science",
      "subject": "Data Structures",
      "employeeCode": "EMP001"
    },
    "assignedClasses": [
      {
        "year": "Year 1",
        "department": "B.Sc Computer Science",
        "className": "B.Sc Computer Science",
        "section": "Year 1",
        "subject": "Data Structures",
        "studentCount": 30,
        "averageAttendance": 85.0
      }
    ],
    "todaySessions": [
      {
        "startTime": "08:00",
        "endTime": "09:00",
        "subject": "Data Structures",
        "className": "Year 1 B.Sc Computer Science",
        "location": "Room 301 - Block A",
        "attendanceMarked": false
      }
    ]
  }
}
```

### GET /api/staff/dashboard/classes
**Description:** Get all assigned classes  
**Format:** [Year] [Department] [Class]  
**Response:** Array of `AssignedClassDTO`

### GET /api/staff/dashboard/sessions/today
**Description:** Get today's teaching sessions  
**Response:** Array of `TodaySessionDTO`

---

## 5. Role-Based Access Control (RBAC)

| Endpoint | ADMIN | STAFF | STUDENT |
|----------|-------|-------|---------|
| Student Dashboard | ❌ | ❌ | ✅ READ |
| Admin Dashboard | ✅ FULL | ❌ | ❌ |
| Master Timetable (View) | ✅ | ✅ | ✅ |
| Master Timetable (Modify) | ✅ | ❌ | ❌ |
| Staff Dashboard | ❌ | ✅ READ | ❌ |
| Mark Attendance | ❌ | ✅ CREATE | ❌ |

---

## 6. Database Credentials (from .env)

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=attendx_db
DB_USERNAME=root
DB_PASSWORD=vvkumaran_2005
```

---

## 7. Default User Credentials

### Admin
- **Email:** sarah.admin@attendx.edu
- **Password:** admin123
- **Role:** ADMIN

### Staff (Dr. Alan Turing)
- **Email:** cs.prof0@attendx.edu
- **Password:** admin123
- **Role:** STAFF

### Student (Alex Rivera)
- **Email:** alex.rivera@student.attendx.edu
- **Password:** student123
- **Roll Number:** CS-Y1-100
- **Role:** STUDENT

---

## 8. Frontend Integration

### API Client Configuration
**File:** `services/api.ts`  
**Base URL:** `http://localhost:8080/api`  
**Headers:** `Authorization: Bearer {jwt_token}`

### Mock to API Migration

**Before (Mock Mode):**
```typescript
const mockUsers = {
  'student': { password: 'student123', role: UserRole.STUDENT }
};
```

**After (API Mode):**
```typescript
const response = await authService.login({ username, password });
onLogin(response.user.role, response.user.email);
```

---

## 9. Data Flow

### Student Login Flow
1. Frontend: POST `/api/auth/login` with credentials
2. Backend: Validates credentials, returns JWT token
3. Frontend: Stores token in localStorage (`jwt_token`)
4. Frontend: GET `/api/student/dashboard` with Authorization header
5. Backend: Validates JWT, returns dashboard data
6. Frontend: Renders `StudentPortal.tsx` with API data

### Admin Timetable Management Flow
1. Admin logs in, gets JWT token
2. GET `/api/admin/dashboard/timetable` - View all sessions
3. POST `/api/admin/dashboard/timetable` - Create new session
4. PUT `/api/admin/dashboard/timetable/{id}` - Update session
5. DELETE `/api/admin/dashboard/timetable/{id}` - Remove session

---

## 10. Error Handling

### Standard Error Response
```json
{
  "success": false,
  "message": "Error description",
  "timestamp": "2025-12-28T17:30:00"
}
```

### HTTP Status Codes
- **200 OK** - Successful request
- **201 Created** - Resource created
- **400 Bad Request** - Invalid input
- **401 Unauthorized** - Missing/invalid JWT token
- **403 Forbidden** - Insufficient permissions
- **404 Not Found** - Resource not found
- **500 Internal Server Error** - Server error

---

## 11. Testing Commands

### Test Student Endpoint
```powershell
# Login first
curl -X POST http://localhost:8080/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"username":"alex.rivera@student.attendx.edu","password":"student123"}'

# Get dashboard (replace TOKEN)
curl -X GET http://localhost:8080/api/student/dashboard `
  -H "Authorization: Bearer TOKEN"
```

### Test Admin Endpoint
```powershell
# Login as admin
curl -X POST http://localhost:8080/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"username":"sarah.admin@attendx.edu","password":"admin123"}'

# Get admin dashboard
curl -X GET http://localhost:8080/api/admin/dashboard `
  -H "Authorization: Bearer TOKEN"
```

---

**Generated:** December 28, 2025  
**Source:** Frontend TypeScript files (StudentPortal.tsx, types.ts, constants.ts)  
**Database Schema:** schema.sql (attendx_db)
