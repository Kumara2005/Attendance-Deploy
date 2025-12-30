package com.attendance.service;

import org.springframework.stereotype.Service;
import com.attendance.model.TimetableSession;
import com.attendance.repository.TimetableSessionRepository;

import java.util.List;

/**
 * Service for Timetable Management
 * Admin operations for Master Timetable
 */
@Service
public class TimetableManagementService {

    private final TimetableSessionRepository repository;

    public TimetableManagementService(TimetableSessionRepository repository) {
        this.repository = repository;
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
     */
    public TimetableSession createSession(TimetableSession session) {
        session.setActive(true);
        return repository.save(session);
    }

    /**
     * Update existing session
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
        
        return repository.save(existing);
    }

    /**
     * Delete session
     */
    public void deleteSession(Long id) {
        repository.deleteById(id);
    }
}
