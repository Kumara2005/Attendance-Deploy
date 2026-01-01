package com.attendance.service;

import org.springframework.stereotype.Service;
import com.attendance.model.TimetableSession;
import com.attendance.model.Staff;
import com.attendance.repository.TimetableSessionRepository;
import com.attendance.repository.StaffRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

/**
 * Service for Timetable Management
 * Admin operations for Master Timetable
 */
@Service
public class TimetableManagementService {

    private static final Logger logger = LoggerFactory.getLogger(TimetableManagementService.class);

    private final TimetableSessionRepository repository;
    private final StaffRepository staffRepository;

    public TimetableManagementService(TimetableSessionRepository repository,
                                     StaffRepository staffRepository) {
        this.repository = repository;
        this.staffRepository = staffRepository;
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
     * Create new session
     * Auto-assigns staff if a staff member teaches this subject
     */
    public TimetableSession createSession(TimetableSession session) {
        session.setActive(true);
        
        // Auto-assign staff if subject is assigned and staff exists for this subject
        if (session.getSubject() != null && session.getStaff() == null) {
            autoAssignStaffToSession(session);
        }
        
        TimetableSession saved = repository.save(session);
        logger.info("✅ Created timetable session: {} {} at {} for subject: {}", 
                    session.getDayOfWeek(), session.getStartTime(), session.getRoomNumber(),
                    session.getSubject() != null ? session.getSubject().getSubjectName() : "N/A");
        return saved;
    }

    /**
     * Update existing session
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
        
        // Auto-assign staff if subject is set and staff is not manually assigned
        if (existing.getSubject() != null && existing.getStaff() == null) {
            autoAssignStaffToSession(existing);
        }
        
        return repository.save(existing);
    }

    /**
     * Auto-assign staff to session based on subject
     * Finds staff members who teach this subject and assigns the first one
     */
    private void autoAssignStaffToSession(TimetableSession session) {
        if (session.getSubject() == null) {
            return;
        }
        
        Long subjectId = session.getSubject().getId();
        
        // Find all active staff who have this subject in their subjects list
        List<Staff> allStaff = staffRepository.findAll();
        Staff assignedStaff = null;
        
        for (Staff staff : allStaff) {
            if (staff.isActive() && staff.getSubjects() != null) {
                boolean hasSubject = staff.getSubjects().stream()
                    .anyMatch(subject -> subject.getId().equals(subjectId));
                if (hasSubject) {
                    assignedStaff = staff;
                    break;
                }
            }
        }
        
        if (assignedStaff != null) {
            session.setStaff(assignedStaff);
            logger.info("🔗 Auto-assigned staff {} to session for subject: {}", 
                        assignedStaff.getName(), session.getSubject().getSubjectName());
        } else {
            logger.info("⚠️  No staff found for subject: {} - session will remain unassigned", 
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
