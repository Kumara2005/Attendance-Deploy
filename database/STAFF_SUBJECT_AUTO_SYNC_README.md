# Staff-Subject Auto-Sync Feature

## Overview
The system now **automatically populates** the `staff_subjects` table whenever a staff member is registered or updated through the Staff Registration Form.

## How It Works

### 1. **Staff Registration** (POST `/api/admin/staff/register`)
When a new staff member is registered with a subject:
```json
{
  "name": "Prof. John Doe",
  "email": "john.doe@college.edu",
  "staffCode": "STAFF006",
  "department": "Computer Science",
  "subject": "Data Structures",  // ← This field triggers auto-sync
  "phone": "1234567890",
  "qualification": "PhD",
  "experience": 5,
  "password": "password123"
}
```

**Backend automatically:**
1. ✅ Checks if subject exists in `subject` table
2. ✅ If not found, creates new subject with auto-generated code (e.g., "DS123")
3. ✅ Links staff to subject in `staff_subjects` table (M-M relationship)
4. ✅ Staff dashboard immediately shows the subject

### 2. **Staff Update** (PUT `/api/admin/staff/{id}`)
When a staff member's subject is updated:
- Same logic applies - automatically syncs `staff_subjects` table
- If subject changes, the relationship is updated

## Database Changes

### Modified Files
- `StaffController.java` - Added auto-sync logic in `registerStaff()` and `update()`
- `SubjectRepository.java` - Added `findBySubjectName()` method

### Tables Affected
```
staff (has subject field - string)
   ↓ Auto-sync ↓
staff_subjects (join table)
   ↓
subject (created if doesn't exist)
```

## For Existing Staff Records

If you have existing staff records (like Staff4) that need the `staff_subjects` table populated:

### Option 1: Update via Admin Panel
1. Login as ADMIN
2. Go to "Faculty Roster"
3. Click "Edit" on the staff member
4. Ensure the "Subject" field is filled
5. Click "Update" - this will trigger auto-sync

### Option 2: Run SQL Script
Execute the SQL file to manually populate for existing staff:

```sql
-- File: database/fix-staff4-subjects.sql
USE attendance_db;

UPDATE staff SET subject = 'Data Structures' WHERE staff_code = 'STAFF004';

INSERT IGNORE INTO subject (code, name, department, semester, credits) 
VALUES ('DS101', 'Data Structures', 'Computer Science', 1, 4);

INSERT IGNORE INTO staff_subjects (staff_id, subject_id)
SELECT s.id, sub.id
FROM staff s, subject sub
WHERE s.staff_code = 'STAFF004' AND sub.name = 'Data Structures';
```

## Subject Code Generation

When a new subject is auto-created, the system generates a code using:
- **First letters of each word** in the subject name
- **Random 3-digit number** for uniqueness

Examples:
- "Data Structures" → `DS847`
- "Advanced Algorithms" → `AA234`
- "Database Management" → `DM512`

## Benefits

1. ✅ **No manual SQL needed** - staff_subjects populated automatically
2. ✅ **Consistent data** - Subject field and staff_subjects always in sync
3. ✅ **Auto-create subjects** - New subjects created on-the-fly if needed
4. ✅ **Dashboard works immediately** - Staff sees their subjects right after registration

## Testing

After registering a new staff with subject "Database Systems":

```sql
-- Verify staff_subjects was auto-populated
SELECT st.name, sub.name 
FROM staff st
JOIN staff_subjects ss ON st.id = ss.staff_id
JOIN subject sub ON ss.subject_id = sub.id
WHERE st.staff_code = 'STAFF006';
```

Expected result:
```
+------------------+------------------+
| name             | name             |
+------------------+------------------+
| Prof. John Doe   | Database Systems |
+------------------+------------------+
```

## Future Enhancements

- [ ] Allow multiple subjects per staff in registration form
- [ ] Subject dropdown instead of free text
- [ ] Subject validation against approved curriculum
- [ ] Bulk import staff with auto-subject linking
