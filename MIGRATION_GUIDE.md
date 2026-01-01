# Attendance System Database Migration Guide

## Issue Fixed
The attendance submission was failing with error: `"constraint [staff_id]"` when trying to save attendance records because the database schema had constraints that didn't match the application's dynamic session creation requirements.

## Solution Applied
Updated the database schema to allow `class_id`, `staff_id`, and `subject_id` to be NULL, enabling the attendance system to:
- Create sessions dynamically without requiring pre-assigned staff
- Handle attendance records even when class information isn't available
- Maintain data integrity through proper foreign key constraints

## Migration Steps

### Step 1: Run the Database Migration Script
Execute the migration script on your MySQL database:

```bash
mysql -u [your_username] -p < database/migrate-attendance-constraints.sql
```

Or if you have environment variables set:
```bash
mysql -u $DB_USER -p$DB_PASS < database/migrate-attendance-constraints.sql
```

### Step 2: Restart the Backend Service
```bash
# Kill existing process if running
# Then restart with:
java -jar backend/target/attendance-0.0.1-SNAPSHOT.jar
```

### Step 3: Test the Attendance Submission
- Log in to the system as a staff member
- Navigate to Attendance Marking
- Select students and status
- Click "Save Attendance"
- Attendance records should now be saved to the `session_attendance` table

## Files Modified
- `backend/src/main/java/com/attendance/model/TimetableSession.java` 
  - Made `class_id` nullable
  
- `database/migrate-attendance-constraints.sql` (NEW)
  - Drops existing constraints
  - Modifies columns to allow NULL
  - Re-adds constraints with proper NULL handling

## Technical Details
### Before
```sql
-- class_id was NOT NULL, requiring a predefined class
CREATE TABLE timetable_session (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    subject_id BIGINT,
    staff_id BIGINT,
    class_id BIGINT,  -- NO NULL allowed originally
    ...
)
```

### After
```sql
-- All foreign keys now allow NULL
ALTER TABLE timetable_session 
MODIFY COLUMN subject_id BIGINT NULL;
MODIFY COLUMN staff_id BIGINT NULL;
MODIFY COLUMN class_id BIGINT NULL;
```

## Verification
After running the migration, verify the changes:

```sql
USE attendance_db;
DESCRIBE timetable_session;
-- Check that subject_id, staff_id, and class_id show NULL in the Null column
```

## Rollback (if needed)
If you need to rollback, the old constraints are:
```sql
ALTER TABLE timetable_session 
MODIFY COLUMN class_id BIGINT NOT NULL;
```

## Support
If you encounter any issues after running the migration, check:
1. The database name matches your actual database (current: `attendance_db`)
2. Your user has ALTER TABLE privileges
3. There are no active connections to the database
