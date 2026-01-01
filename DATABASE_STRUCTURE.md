# 📊 Database Table Structure & Data Flow

## **Core Tables Involved:**

### **1. `student` Table**
- **Purpose**: Stores all student information
- **Key Columns**:
  - `id` (Primary Key)
  - `name` - Student's full name
  - `roll_no` - Unique roll number (e.g., CS-S1-A01)
  - `department` - Department (e.g., Computer Science)
  - `semester` - Semester (1, 2, 3, etc.)
  - `section` - Class section (A, B, C, etc.)
  - `email` - Email address
  - `phone` - Phone number
  - `active` - Active status (true/false)

**Used by**: QuickAttendance Modal to fetch student list

---

### **2. `timetable_session` Table**
- **Purpose**: Stores all teaching sessions/classes
- **Key Columns**:
  - `id` (Primary Key)
  - `day_of_week` - Day (Monday, Tuesday, etc.)
  - `start_time` - Session start time (09:00:00)
  - `end_time` - Session end time (09:50:00)
  - `subject_id` (Foreign Key) → References `subject` table
  - `staff_id` (Foreign Key) → References `staff` table
  - `department` - Department (Computer Science)
  - `semester` - Year/semester (1, 2, 3)
  - `section` - Class section (A, B, C)
  - `active` - Active status

**Used by**: StaffTimetable to display available sessions

---

### **3. `session_attendance` Table** ⭐
- **Purpose**: Stores attendance records per student per session per date
- **Key Columns**:
  - `id` (Primary Key)
  - `student_id` (Foreign Key) → References `student.id`
  - `session_id` (Foreign Key) → References `timetable_session.id`
  - `attendance_date` - Date of attendance (2026-01-01)
  - `status` - Attendance status (PRESENT, ABSENT, OD)
  - **Unique Constraint**: (student_id, session_id, attendance_date) - Only one record per student per session per date

**Used by**: Reports to calculate attendance percentages

---

### **4. Supporting Tables**:

#### **`subject` Table**
- Stores subject information
- Referenced by `timetable_session`
- Columns: `id`, `code`, `name`, `credits`, `department`, `semester`

#### **`staff` Table**
- Stores teacher information
- Referenced by `timetable_session`
- Columns: `id`, `staff_code`, `name`, `department`, `user_id`

#### **`users` Table**
- Stores login credentials
- Columns: `id`, `username`, `password`, `role`, `enabled`

---

## **Data Flow Diagram:**

```
┌─────────────────────────────────────────────────────────────────┐
│                     STAFF PORTAL                                 │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
                  ┌──────────────────┐
                  │  My Timetable    │
                  │  (StaffTimetable)│
                  └──────────────────┘
                            │
              ┌─────────────┴─────────────┐
              ▼                           ▼
        ┌──────────────────┐    ┌──────────────────┐
        │ Select Year, Class│   │ Fetch Sessions   │
        └──────────────────┘    │ FROM timetable_  │
                                │ session WHERE    │
                                │ department="..." │
                                │ semester=...     │
                                │ section="..."    │
                                └──────────────────┘
                                      │
                                      ▼
                        ┌─────────────────────────┐
                        │  Click Session Block    │
                        │  (Open QuickAttendance) │
                        └─────────────────────────┘
                                      │
              ┌───────────────────────┼───────────────────────┐
              ▼                       ▼                       ▼
    ┌──────────────────┐   ┌──────────────────┐  ┌──────────────────┐
    │  Fetch Students  │   │  Session Info    │  │  Display Stats   │
    │  FROM student    │   │  (Time, Subject) │  │  (P/A/OD counts) │
    │  WHERE           │   └──────────────────┘  └──────────────────┘
    │  department="..."│
    │  semester=...    │
    │  section="..."   │
    │  active=true     │
    └──────────────────┘
              │
              ▼
    ┌──────────────────────────────────┐
    │  Mark Attendance (P/A/OD)        │
    │  FOR EACH STUDENT                │
    └──────────────────────────────────┘
              │
              ▼
    ┌──────────────────────────────────┐
    │  SAVE ATTENDANCE                 │
    │  INSERT INTO session_attendance  │
    │  (student_id, session_id,        │
    │   attendance_date, status)       │
    └──────────────────────────────────┘
              │
              ▼
    ┌──────────────────────────────────┐
    │  REPORTS PAGE                    │
    │  SELECT * FROM session_          │
    │  attendance WHERE                │
    │  attendance_date='2026-01-01'    │
    │  GROUP BY student_id             │
    │  CALCULATE PERCENTAGES           │
    └──────────────────────────────────┘
```

---

## **🔄 Complete Data Flow Summary:**

### **Step 1: Get Available Sessions**
```sql
SELECT * FROM timetable_session
WHERE department='Computer Science' 
  AND semester=1 
  AND section='A'
ORDER BY day_of_week, start_time
```
**Source**: `timetable_session` table

---

### **Step 2: Get Students for Session**
```sql
SELECT * FROM student
WHERE department='Computer Science'
  AND semester=1
  AND section='A'
  AND active=true
```
**Source**: `student` table

---

### **Step 3: Save Attendance**
```sql
INSERT INTO session_attendance 
(student_id, session_id, attendance_date, status)
VALUES (?, ?, '2026-01-01', 'PRESENT')
```
**Target**: `session_attendance` table

---

### **Step 4: Generate Reports**
```sql
SELECT 
  s.id,
  s.name,
  s.roll_no,
  s.department,
  s.semester,
  s.section,
  COUNT(*) as total_sessions,
  SUM(CASE WHEN sa.status IN ('PRESENT','OD') THEN 1 ELSE 0 END) as present,
  (SUM(CASE WHEN sa.status IN ('PRESENT','OD') THEN 1 ELSE 0 END) * 100 / COUNT(*)) as percentage
FROM student s
LEFT JOIN session_attendance sa ON s.id = sa.student_id
WHERE sa.attendance_date='2026-01-01'
GROUP BY s.id, s.name, s.roll_no, s.department, s.semester, s.section
```
**Source**: `student` + `session_attendance` tables

---

## **🎯 Key Relationships:**

| From Table | Foreign Key | To Table | Usage |
|-----------|-------------|----------|-------|
| `session_attendance` | `student_id` | `student` | Know which student attended |
| `session_attendance` | `session_id` | `timetable_session` | Know which session was attended |
| `timetable_session` | `subject_id` | `subject` | Know what subject was taught |
| `timetable_session` | `staff_id` | `staff` | Know which teacher taught |
| `staff` | `user_id` | `users` | Link to staff login |
| `student` | `user_id` | `users` | Link to student login |

---

## **💾 Which Table Has What Data:**

| Feature | Primary Table | Supporting Tables |
|---------|---------------|-------------------|
| **Student List** | `student` | - |
| **Schedule/Sessions** | `timetable_session` | `subject`, `staff` |
| **Attendance Records** | `session_attendance` | `student`, `timetable_session` |
| **Reports/Aggregations** | `session_attendance` | `student` |
| **Login Credentials** | `users` | - |

---

## **🔍 Example: Trace One Attendance Record**

When you mark **Aarav Sharma** as **PRESENT** for **Computer Networks** on **01-01-2026**:

1. **Student data** comes from `student` table
   ```
   student_id = 1 (Aarav Sharma, CS-S1-A01)
   ```

2. **Session data** comes from `timetable_session` table
   ```
   session_id = 5 (10:45 AM - Computer Networks)
   ```

3. **Attendance record** stored in `session_attendance` table
   ```
   id = 101
   student_id = 1
   session_id = 5
   attendance_date = 2026-01-01
   status = PRESENT
   ```

4. **Report query** joins both tables to show:
   ```
   Student: Aarav Sharma (CS-S1-A01)
   Department: Computer Science
   Total Sessions: 4
   Present: 4
   Percentage: 100%
   Status: Qualified ✅
   ```

---

## **📝 Summary:**

| Layer | Table | Data Type | Purpose |
|-------|-------|-----------|---------|
| **Master Data** | `student`, `subject`, `staff`, `users` | Configuration | Define who teaches/studies what |
| **Schedule** | `timetable_session` | Configuration | When/where classes happen |
| **Transactions** | `session_attendance` | Operational | Actual attendance records |
| **Analytics** | (Join of above) | Analysis | Reports and statistics |

---

## **🚀 To View Database:**

If you have MySQL access, run:
```bash
# Show all tables
SHOW TABLES;

# Show student table structure
DESC student;

# Show attendance table structure
DESC session_attendance;

# View all students
SELECT * FROM student LIMIT 10;

# View all attendance records
SELECT * FROM session_attendance LIMIT 10;

# View attendance for 2026-01-01
SELECT * FROM session_attendance 
WHERE attendance_date='2026-01-01';
```
