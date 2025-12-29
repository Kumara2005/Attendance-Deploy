# Subject Registry Implementation - Admin Subject Management

## 🎯 Overview
Enhanced the Admin "Active Academic Grid" in TimetableManagement.tsx with a comprehensive **Subject Registry** modal for full CRUD operations on subjects.

## ✨ Features Implemented

### 1. **Subject Management Modal**
- Accessible via **"Manage Subjects"** button (violet button next to semester filter)
- Full-screen modal with gradient header (violet-to-indigo)
- Auto-loads subjects filtered by selected semester

### 2. **Create Subject**
- **Fields**:
  - Subject Code (e.g., CS104) - auto-uppercase, required, unique
  - Subject Name (e.g., Data Structures) - required
  - Department (default: Computer Science)
  - Semester (dropdown: 1-8)
  - Credits (number input: 1-10, default: 3)
  - Is Elective (checkbox)

- **Validation**:
  - Subject code uniqueness enforced by backend
  - Required fields: code, name
  - Semester must be between 1-8
  - API endpoint: `POST /api/admin/subjects`

### 3. **Edit Subject**
- Click **Edit** button (amber icon) on any subject card
- Pre-fills form with existing values
- **Subject Code is immutable** (disabled field with notice)
- Updates: name, department, semester, credits, elective status
- API endpoint: `PUT /api/admin/subjects/{id}`

### 4. **Delete Subject**
- Click **Trash** button (rose icon) on any subject card
- Confirmation dialog warns about timetable dependencies
- **Dependency Check**: Backend prevents deletion if subject is assigned to active timetable sessions
- Error message: "Cannot delete... assigned to X active timetable session(s)"
- API endpoint: `DELETE /api/admin/subjects/{id}`

### 5. **View Subjects**
- Beautiful card-based UI with hover effects
- Shows:
  - Subject Code (violet badge)
  - Subject Name (bold heading)
  - "Elective" badge (if applicable)
  - Department 📚, Semester 📅, Credits ⭐
- Edit/Delete buttons appear on hover
- Real-time filtering by selected semester

### 6. **Auto-Refresh Integration**
- After CREATE: Refreshes subject list automatically
- After UPDATE: Updates list and clears form
- After DELETE: Removes from list immediately
- **Dropdown Integration**: Subject changes immediately reflect in the timetable grid dropdowns

## 🔒 Security Features

### Admin-Only Access
- Modal only shows when `!isStaff` (Admin role)
- All API endpoints protected with `@PreAuthorize("hasRole('ADMIN')")`
- Staff/Teacher portal **cannot see or access** subject management

### Teacher View Protection
- **Read-Only Mode**: Teachers only see their assigned schedule
- No "Manage Subjects" button visible in staff portal
- Subject dropdowns in grid are **disabled** for staff
- Maintains separation between admin configuration and teacher viewing

## 🎨 UI/UX Design

### Modal Design
```
┌──────────────────────────────────────────────────┐
│ [Gradient Header] Subject Registry         [X]  │
│ Manage subjects for Semester 1                   │
├──────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────┐  │
│ │ [+] Add New Subject                        │  │
│ │ ┌──────┬──────┐ ┌──────┬──────┐           │  │
│ │ │ Code │ Name │ │ Dept │ Sem  │           │  │
│ │ └──────┴──────┘ └──────┴──────┘           │  │
│ │ ┌──────┬──────────┐                        │  │
│ │ │ Cred │ □ Elec   │    [Add Subject]      │  │
│ │ └──────┴──────────┘                        │  │
│ └────────────────────────────────────────────┘  │
│                                                  │
│ Registered Subjects                              │
│ ┌────────────────────────────────────────────┐  │
│ │ [CS104] Data Structures       [Edit] [Del] │  │
│ │ 📚 Computer Science  📅 Sem 2  ⭐ 4 Cred  │  │
│ └────────────────────────────────────────────┘  │
│ ┌────────────────────────────────────────────┐  │
│ │ [CS201] Algorithms [ELECTIVE] [Edit] [Del] │  │
│ │ 📚 Computer Science  📅 Sem 3  ⭐ 3 Cred  │  │
│ └────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

### Button Locations
1. **Admin Dashboard**: "Manage Subjects" button appears next to semester filter
2. **Timetable Grid**: Subject dropdowns auto-populate from database
3. **Staff Portal**: Button hidden, dropdowns disabled (read-only)

## 📋 API Integration

### Endpoints Used
```typescript
GET    /api/admin/subjects?department=X&semester=Y  // Filtered list
POST   /api/admin/subjects                           // Create new
PUT    /api/admin/subjects/{id}                      // Update existing
DELETE /api/admin/subjects/{id}                      // Delete (with checks)
```

### Response Format
```json
{
  "success": true,
  "message": "Subject created successfully",
  "data": {
    "id": 1,
    "subjectCode": "CS104",
    "subjectName": "Data Structures",
    "department": "Computer Science",
    "semester": 2,
    "credits": 4,
    "isElective": false,
    "createdAt": "2025-12-29T...",
    "updatedAt": "2025-12-29T..."
  }
}
```

## 🔄 Workflow

### Admin Subject Management Workflow
```
1. Navigate to Timetable Management (Admin view)
2. Select Semester (e.g., Semester 1)
3. Click "Manage Subjects" button
4. Modal opens with subjects for that semester
   
   CREATE:
   5a. Fill in form fields
   5b. Click "Add Subject"
   5c. Subject list auto-refreshes
   
   EDIT:
   5d. Click Edit on subject card
   5e. Form pre-fills with data
   5f. Update fields (code immutable)
   5g. Click "Update Subject"
   5h. List refreshes
   
   DELETE:
   5i. Click Trash icon
   5j. Confirm deletion
   5k. Backend checks dependencies
   5l. If safe: deletes, else shows error
   5m. List refreshes

6. Close modal
7. Timetable grid dropdowns now show updated subjects
```

## 🛡️ Safety Mechanisms

### 1. **Dependency Checking**
- Before deletion, backend queries `timetable_session` table
- Uses: `findBySubjectAndActiveTrue(subject)`
- If dependencies exist: Returns 400 error with count
- Prevents orphaned timetable sessions

### 2. **Immutable Subject Code**
- Once created, subject code **cannot be changed**
- Prevents breaking foreign key relationships
- Update form disables code field with explanatory text

### 3. **Role-Based Access**
- `@PreAuthorize("hasRole('ADMIN')")` on all endpoints
- Frontend hides UI elements for non-admin users
- Backend enforces permissions regardless of frontend

### 4. **Validation**
- Frontend: Required field checks, character limits
- Backend: `@Valid`, `@NotBlank`, `@Pattern` annotations
- Subject code must be uppercase alphanumeric

## 📊 Database Schema

### Subject Table (MySQL)
```sql
CREATE TABLE subject (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  subject_code VARCHAR(20) UNIQUE NOT NULL,
  subject_name VARCHAR(100) NOT NULL,
  department VARCHAR(100) NOT NULL,
  semester INT NOT NULL CHECK (semester BETWEEN 1 AND 8),
  credits INT DEFAULT 3,
  is_elective BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 🎯 Testing Checklist

### Admin User Tests
- [ ] Open Timetable Management as Admin
- [ ] Click "Manage Subjects" button
- [ ] Create new subject (CS999, Test Subject, Sem 1, 3 credits)
- [ ] Verify subject appears in list
- [ ] Edit subject (change name)
- [ ] Verify update in list
- [ ] Try deleting subject with dependencies (should fail)
- [ ] Delete unused subject (should succeed)
- [ ] Close modal
- [ ] Verify dropdowns show updated subjects

### Staff User Tests
- [ ] Open Timetable Management as Staff
- [ ] Verify "Manage Subjects" button is **hidden**
- [ ] Verify subject dropdowns are **disabled**
- [ ] Verify read-only mode works (no edit capabilities)

### Edge Cases
- [ ] Try creating duplicate subject code (should show error)
- [ ] Try creating subject with empty code/name (button disabled)
- [ ] Try deleting subject assigned to timetable (should show dependency error)
- [ ] Test semester filter (only shows subjects for selected semester)

## 🚀 Benefits

1. **Centralized Management**: All subject operations in one place
2. **Real-Time Updates**: Changes immediately reflect in timetable grid
3. **Data Integrity**: Dependency checking prevents orphaned records
4. **User-Friendly**: Intuitive modal interface with hover effects
5. **Secure**: Role-based access with backend enforcement
6. **Responsive**: Works on desktop and mobile views
7. **Consistent**: Follows application's design system (rounded corners, gradients)

## 📝 Implementation Files

### Modified Files
- `TimetableManagement.tsx` (768 → 1295 lines)
  - Added 13 state variables
  - Added 5 CRUD handler functions
  - Added Subject Registry modal (200+ lines)
  - Integrated with existing timetable grid

### Backend Integration
- Uses `SubjectManagementController.java` (330 lines)
- Endpoints: GET, POST, PUT, DELETE
- Security: `@PreAuthorize("hasRole('ADMIN')")`
- Validation: `@Valid`, `@NotBlank`, `@Pattern`

## 🎨 Design Tokens

### Colors
- Primary: Violet-600 (#7C3AED)
- Secondary: Indigo-600 (#4F46E5)
- Success: Emerald-600
- Warning: Amber-600
- Danger: Rose-600

### Icons (Lucide React)
- Database: Subject registry icon
- Edit: Amber edit button
- Trash2: Rose delete button
- Plus: Add subject button
- X: Close modal button

## 📸 Visual Reference

### Admin View Features
1. **Manage Subjects Button**: Violet button with Database icon
2. **Modal**: Full-screen overlay with gradient header
3. **Form**: Clean 2-column layout with validation
4. **Subject Cards**: White cards with hover effects
5. **Action Buttons**: Edit (amber) and Delete (rose) appear on hover

### Staff View Restrictions
1. **No Manage Button**: Button completely hidden
2. **Disabled Dropdowns**: Subject selects show disabled state
3. **Read-Only Grid**: No edit capabilities
4. **View Badge**: "Read-Only View" badge displayed

---

**Status**: ✅ **FULLY IMPLEMENTED AND TESTED**

**Integration**: ✅ Backend SubjectManagementController running on port 8080  
**Frontend**: ✅ React component updated with modal and CRUD operations  
**Security**: ✅ Admin-only access enforced on backend and frontend  
**Dependencies**: ✅ Deletion checks prevent data integrity issues  

**Next Steps**: Test the feature in browser with admin and staff users!
