package com.attendance.service;

import org.springframework.stereotype.Service;
import com.attendance.model.TimetableSession;
import com.attendance.model.Staff;
import com.attendance.model.Student;
import com.attendance.repository.TimetableSessionRepository;
import com.attendance.repository.StaffRepository;
import com.attendance.repository.StudentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Optional;

/**
 * Service for Timetable Management
 * Admin operations for Master Timetable
 * 
 * PERMANENT FIX: Validates student enrollment before creating sessions
 * Prevents "NO STUDENTS FOUND" errors in QuickAttendance
 */
@Service
public class TimetableManagementService {

    private static final Logger logger = LoggerFactory.getLogger(TimetableManagementService.class);

    private final TimetableSessionRepository repository;
    private final StaffRepository staffRepository;
    private final StudentRepository studentRepository;

    public TimetableManagementService(TimetableSessionRepository repository,
                                     StaffRepository staffRepository,
                                     StudentRepository studentRepository) {
        this.repository = repository;
        this.staffRepository = staffRepository;
        this.studentRepository = studentRepository;
    }

    /**
     * Get all timetable sessions
     */
    public List<TimetableSession> getAllSessions() {
        return repository.findAll();
    }

    /**
     * Get sessions by department and semester
     */
    public List<TimetableSession> getSessionsByDepartmentAndSemester(String department, int semester) {
        return repository.findByDepartmentAndSemesterAndActiveTrue(department, semester);
    }

    /**
     * PERMANENT FIX: Validate and correct semester before creating session
     * Ensures students exist for the department/semester/section combo
     * Auto-corrects to correct semester if mismatch detected
     */
    private void validateAndCorrectStudentEnrollment(TimetableSession session) {
        // Get department, semester, and section
        String department = session.getDepartment();
        Integer givenSemester = session.getSemester();
        String section = session.getSection();
        
        // Skip if department not set
        if (department == null || department.trim().isEmpty()) {
            return;
        }
        
        // Skip if semester not set
        if (givenSemester == null || givenSemester.intValue() < 1) {
            return;
        }

        // Skip if section not set
        if (section == null || section.trim().isEmpty()) {
            section = "A"; // Default section
            session.setSection(section);
        }

        // Step 1: Check if students exist for the exact combination (dept + semester + section)
        List<Student> studentsInGivenSemester = studentRepository
            .findByDepartmentAndSemesterAndSectionAndActiveTrue(department, givenSemester, section);

        if (!studentsInGivenSemester.isEmpty()) {
            // Perfect match - students exist for this exact combination
            logger.info("✅ Validation PASSED: {} students found in {} semester {} section {}", 
                        studentsInGivenSemester.size(), department, givenSemester, section);
            return;
        }

        // Step 2: Semester mismatch detected - try to find correct semester for this section
        logger.warn("⚠️  No students found for {} semester {} section {}. Searching for correct semester...", 
                    department, givenSemester, section);

        Integer correctSemester = null;
        
        // Check semesters 1-8 to find where students with this section exist
        for (int sem = 1; sem <= 8; sem++) {
            List<Student> students = studentRepository
                .findByDepartmentAndSemesterAndSectionAndActiveTrue(department, sem, section);
            
            if (!students.isEmpty()) {
                correctSemester = Integer.valueOf(sem);
                logger.info("🔍 Found {} students in {} semester {} section {}",
                           students.size(), department, sem, section);
                break;
            }
        }

        if (correctSemester != null) {
            // Auto-correct: Use the semester where students actually exist
            logger.info("🔧 AUTO-CORRECTING: Changing semester from {} → {} (where students exist)", 
                        givenSemester, correctSemester);
            session.setSemester(correctSemester);
            logger.info("✅ Validation PASSED (after correction): Students found in {} semester {} section {}", 
                        department, correctSemester, section);
        } else {
            // No students exist for this department/section combination
            logger.error("❌ VALIDATION FAILED: No students found in department '{}' section '{}' (requested semester: {})", 
                        department, section, givenSemester);
            throw new IllegalArgumentException(
                String.format("Cannot create timetable sessions: No students found in department '%s' section '%s'", 
                            department, section)
            );
        }
    }

    /**
     * Create new session
     * PERMANENT FIX: Validates student enrollment before creating
     * Auto-assigns staff if a staff member teaches this subject
     */
    public TimetableSession createSession(TimetableSession session) {
        session.setActive(true);

        // PERMANENT FIX: Validate and correct student enrollment
        try {
            validateAndCorrectStudentEnrollment(session);
        } catch (IllegalArgumentException e) {
            logger.error("❌ Session creation rejected: {}", e.getMessage());
            throw e;
        }
        
        // Auto-assign staff if subject is assigned and staff exists for this subject
        if (session.getSubject() != null && session.getStaff() == null) {
            autoAssignStaffToSession(session);
        }
        
        TimetableSession saved = repository.save(session);
        int studentCount = studentRepository.findByDepartmentAndSemesterAndActiveTrue(
            session.getDepartment(), session.getSemester()).size();
        logger.info("✅ Created session: {} {} at {} for subject: {} with {} students", 
                    session.getDayOfWeek(), session.getStartTime(), session.getRoomNumber(),
                    session.getSubject() != null ? session.getSubject().getSubjectName() : "N/A",
                    studentCount);
        return saved;
    }

    /**
     * Update existing session
     * PERMANENT FIX: Re-validates student enrollment after update
     * Auto-assigns staff if subject changed and staff exists for the new subject
     */
    public TimetableSession updateSession(Long id, TimetableSession updatedSession) {
        TimetableSession existing = repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Timetable session not found: " + id));
        
        // Update fields
        existing.setDayOfWeek(updatedSession.getDayOfWeek());
        existing.setStartTime(updatedSession.getStartTime());
        existing.setEndTime(updatedSession.getEndTime());
        existing.setSubject(updatedSession.getSubject());
        existing.setStaff(updatedSession.getStaff());
        existing.setDepartment(updatedSession.getDepartment());
        existing.setSemester(updatedSession.getSemester());
        existing.setSection(updatedSession.getSection());
        existing.setRoomNumber(updatedSession.getRoomNumber());
        
        // PERMANENT FIX: Re-validate after update
        try {
            validateAndCorrectStudentEnrollment(existing);
        } catch (IllegalArgumentException e) {
            logger.error("❌ Session update rejected: {}", e.getMessage());
            throw e;
        }
        
        // Auto-assign staff if subject is set and staff is not manually assigned
        if (existing.getSubject() != null && existing.getStaff() == null) {
            autoAssignStaffToSession(existing);
        }
        
        int studentCount = studentRepository.findByDepartmentAndSemesterAndActiveTrue(
            existing.getDepartment(), existing.getSemester()).size();
        logger.info("✅ Updated session {}: Department={}, Semester={}, Students={}", 
                    id, existing.getDepartment(), existing.getSemester(), studentCount);
        
        return repository.save(existing);
    }

    /**
     * Auto-assign staff to session based on subject
     * Finds ALL staff members who teach this subject (prioritizing recently registered staff)
     * If multiple staff teach the same subject, assigns the most recently registered one
     */
    private void autoAssignStaffToSession(TimetableSession session) {
        if (session.getSubject() == null) {
            logger.warn("⚠️  Cannot auto-assign staff: Session has no subject");
            return;
        }
        
        Long subjectId = session.getSubject().getId();
        
        // Find all active staff who have this subject in their subjects list
        List<Staff> allStaff = staffRepository.findAll();
        List<Staff> staffForSubject = new java.util.ArrayList<>();
        
        for (Staff staff : allStaff) {
            if (staff.isActive() && staff.getSubjects() != null) {
                boolean hasSubject = staff.getSubjects().stream()
                    .anyMatch(subject -> subject.getId().equals(subjectId));
                if (hasSubject) {
                    staffForSubject.add(staff);
                }
            }
        }
        
        if (!staffForSubject.isEmpty()) {
            // Assign the last (most recently registered) staff for this subject
            // This ensures newer registrations take precedence
            Staff assignedStaff = staffForSubject.get(staffForSubject.size() - 1);
            session.setStaff(assignedStaff);
            logger.info("🔗 Auto-assigned staff {} (ID={}) to session for subject: {} (Found {} staff)", 
                        assignedStaff.getName(), assignedStaff.getId(), 
                        session.getSubject().getSubjectName(), staffForSubject.size());
        } else {
            logger.info("⚠️  No staff found for subject: {}", 
                        session.getSubject().getSubjectName());
        }
    }

    /**
     * Delete session
     */
    public void deleteSession(Long id) {
        repository.deleteById(id);
    }
}

