package com.attendance.service;

import java.time.LocalDate;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.attendance.model.SessionAttendance;
import com.attendance.model.TimetableSession;
import com.attendance.repository.SessionAttendanceRepository;
import com.attendance.repository.TimetableSessionRepository;

@Service
public class SessionAttendanceService {

    private final SessionAttendanceRepository repo;
    private final TimetableSessionRepository timetableSessionRepository;

    public SessionAttendanceService(SessionAttendanceRepository repo,
                                    TimetableSessionRepository timetableSessionRepository) {
        this.repo = repo;
        this.timetableSessionRepository = timetableSessionRepository;
    }

    public SessionAttendance mark(SessionAttendance attendance) {

        LocalDate today = LocalDate.now();

        // If TimetableSession ID is 0 or null, find or create one based on subject/department/semester/section
        if (attendance.getTimetableSession() == null || attendance.getTimetableSession().getId() == null || attendance.getTimetableSession().getId() == 0) {
            TimetableSession session = findOrCreateTimetableSession(attendance);
            attendance.setTimetableSession(session);
        }

        Optional<SessionAttendance> existing =
            repo.findByStudentIdAndTimetableSessionIdAndDate(
                attendance.getStudent().getId(),
                attendance.getTimetableSession().getId(),
                today
            );

        if (existing.isPresent()) {
            SessionAttendance record = existing.get();

            record.setStatus(attendance.getStatus());

            return repo.save(record);
        }

        attendance.setDate(today);
        return repo.save(attendance);
    }

    /**
     * Find an existing TimetableSession or create a placeholder one
     * Based on subject name, department, semester, and section
     */
    private TimetableSession findOrCreateTimetableSession(SessionAttendance attendance) {
        TimetableSession sessionFromRequest = attendance.getTimetableSession();
        
        if (sessionFromRequest == null) {
            // Create a minimal session if none provided
            TimetableSession newSession = new TimetableSession();
            newSession.setDepartment("Unknown");
            newSession.setSemester(1);
            newSession.setSection("A");
            newSession.setDayOfWeek("Monday");
            newSession.setStartTime(java.time.LocalTime.now());
            newSession.setEndTime(java.time.LocalTime.now().plusHours(1));
            newSession.setActive(true);
            return timetableSessionRepository.save(newSession);
        }
        
        // Try to find existing session by department, semester, section, and subject name
        String subjectName = sessionFromRequest.getSubjectName() != null ? sessionFromRequest.getSubjectName() : "Unknown";
        String department = sessionFromRequest.getDepartment() != null ? sessionFromRequest.getDepartment() : "Unknown";
        int semester = sessionFromRequest.getSemester() > 0 ? sessionFromRequest.getSemester() : 1;
        String section = sessionFromRequest.getSection() != null ? sessionFromRequest.getSection() : "A";
        
        // Search for existing session
        java.util.List<TimetableSession> existingSessions = timetableSessionRepository.findAll();
        for (TimetableSession session : existingSessions) {
            if (session.getDepartment().equals(department) &&
                session.getSemester() == semester &&
                (session.getSection() == null || session.getSection().equals(section)) &&
                session.getSubjectName() != null &&
                session.getSubjectName().equals(subjectName)) {
                return session;
            }
        }
        
        // If not found, save the new session
        sessionFromRequest.setDepartment(department);
        sessionFromRequest.setSemester(semester);
        sessionFromRequest.setSection(section);
        if (sessionFromRequest.getDayOfWeek() == null) {
            sessionFromRequest.setDayOfWeek("Monday");
        }
        if (sessionFromRequest.getStartTime() == null) {
            sessionFromRequest.setStartTime(java.time.LocalTime.now());
        }
        if (sessionFromRequest.getEndTime() == null) {
            sessionFromRequest.setEndTime(java.time.LocalTime.now().plusHours(1));
        }
        sessionFromRequest.setActive(true);
        
        return timetableSessionRepository.save(sessionFromRequest);
    }
}
