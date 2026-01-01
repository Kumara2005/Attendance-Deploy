package com.attendance.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.attendance.model.SessionAttendance;
import com.attendance.model.Student;
import com.attendance.model.TimetableSession;
import com.attendance.dto.AttendanceSubmissionDTO;
import com.attendance.repository.SessionAttendanceRepository;
import com.attendance.repository.TimetableSessionRepository;
import com.attendance.repository.StudentRepository;

@Service
public class SessionAttendanceService {

    private final SessionAttendanceRepository repo;
    private final TimetableSessionRepository timetableSessionRepository;
    private final StudentRepository studentRepository;

    public SessionAttendanceService(SessionAttendanceRepository repo,
                                    TimetableSessionRepository timetableSessionRepository,
                                    StudentRepository studentRepository) {
        this.repo = repo;
        this.timetableSessionRepository = timetableSessionRepository;
        this.studentRepository = studentRepository;
    }

    /**
     * Mark attendance using simplified DTO
     * This method handles finding/creating TimetableSession if needed
     */
    public SessionAttendance markAttendance(AttendanceSubmissionDTO dto) {
        System.out.println("📝 Processing attendance submission: " + dto);
        
        LocalDate today = LocalDate.now();
        
        // Find or create Student
        Student student = studentRepository.findById(dto.getStudentId())
            .orElseThrow(() -> new RuntimeException("Student not found with ID: " + dto.getStudentId()));
        
        System.out.println("✅ Found student: " + student.getName());
        
        // Find or create TimetableSession
        TimetableSession session;
        if (dto.getTimetableSessionId() != null && dto.getTimetableSessionId() > 0) {
            // Try to find existing session by ID
            session = timetableSessionRepository.findById(dto.getTimetableSessionId())
                .orElse(null);
            
            if (session == null) {
                System.out.println("⚠️  Session with ID " + dto.getTimetableSessionId() + " not found, creating new one");
                session = createTimetableSession(dto);
            }
        } else {
            // Session ID is 0 or null, find or create one based on metadata
            System.out.println("🔍 Searching for existing session with subject: " + dto.getSubjectName());
            session = findOrCreateTimetableSession(dto);
        }
        
        System.out.println("✅ Using session ID: " + session.getId());
        
        // Check if attendance already exists for today
        Optional<SessionAttendance> existing =
            repo.findByStudentIdAndTimetableSessionIdAndDate(
                student.getId(),
                session.getId(),
                today
            );
        
        SessionAttendance attendance;
        if (existing.isPresent()) {
            System.out.println("📝 Updating existing attendance record");
            attendance = existing.get();
            attendance.setStatus(dto.getStatus());
        } else {
            System.out.println("📝 Creating new attendance record");
            attendance = new SessionAttendance();
            attendance.setStudent(student);
            attendance.setTimetableSession(session);
            attendance.setDate(today);
            attendance.setStatus(dto.getStatus());
        }
        
        // Save and return
        SessionAttendance saved = repo.save(attendance);
        System.out.println("✅ Attendance record saved with ID: " + saved.getId());
        return saved;
    }

    /**
     * Find existing TimetableSession or create a new one
     */
    private TimetableSession findOrCreateTimetableSession(AttendanceSubmissionDTO dto) {
        // Search for existing session by department, semester, section, and subject name
        java.util.List<TimetableSession> allSessions = timetableSessionRepository.findAll();
        
        String subjectName = dto.getSubjectName() != null ? dto.getSubjectName() : "Unknown";
        String department = dto.getDepartment() != null ? dto.getDepartment() : "Unknown";
        int semester = dto.getSemester() != null ? dto.getSemester() : 1;
        String section = dto.getSection() != null ? dto.getSection() : "A";
        
        for (TimetableSession session : allSessions) {
            if (session.getDepartment() != null && session.getDepartment().equals(department) &&
                session.getSemester() == semester &&
                (session.getSection() == null || session.getSection().equals(section))) {
                
                String sessionSubject = session.getSubjectName();
                if (sessionSubject != null && sessionSubject.equals(subjectName)) {
                    System.out.println("✅ Found matching existing session with ID: " + session.getId());
                    return session;
                }
            }
        }
        
        System.out.println("➕ Creating new TimetableSession for subject: " + subjectName);
        return createTimetableSession(dto);
    }

    /**
     * Create a new TimetableSession with provided metadata
     */
    private TimetableSession createTimetableSession(AttendanceSubmissionDTO dto) {
        TimetableSession session = new TimetableSession();
        session.setSubjectName(dto.getSubjectName() != null ? dto.getSubjectName() : "Unknown Subject");
        session.setDepartment(dto.getDepartment() != null ? dto.getDepartment() : "Unknown");
        session.setSemester(dto.getSemester() != null ? dto.getSemester() : 1);
        session.setSection(dto.getSection() != null ? dto.getSection() : "A");
        session.setDayOfWeek("Monday");
        session.setStartTime(LocalTime.of(9, 0));
        session.setEndTime(LocalTime.of(10, 0));
        session.setActive(true);
        
        TimetableSession saved = timetableSessionRepository.save(session);
        System.out.println("✅ New TimetableSession created with ID: " + saved.getId());
        return saved;
    }

    /**
     * Legacy method for backward compatibility
     */
    public SessionAttendance mark(SessionAttendance attendance) {

        LocalDate today = LocalDate.now();

        // If TimetableSession ID is 0 or null, find or create one based on subject/department/semester/section
        if (attendance.getTimetableSession() == null || attendance.getTimetableSession().getId() == null || attendance.getTimetableSession().getId() == 0) {
            TimetableSession session = findOrCreateTimetableSessionFromEntity(attendance);
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
     * Find or create TimetableSession from SessionAttendance entity
     */
    private TimetableSession findOrCreateTimetableSessionFromEntity(SessionAttendance attendance) {
        TimetableSession sessionFromRequest = attendance.getTimetableSession();
        
        if (sessionFromRequest == null) {
            TimetableSession newSession = new TimetableSession();
            newSession.setDepartment("Unknown");
            newSession.setSemester(1);
            newSession.setSection("A");
            newSession.setDayOfWeek("Monday");
            newSession.setStartTime(LocalTime.now());
            newSession.setEndTime(LocalTime.now().plusHours(1));
            newSession.setActive(true);
            return timetableSessionRepository.save(newSession);
        }
        
        String subjectName = sessionFromRequest.getSubjectName() != null ? sessionFromRequest.getSubjectName() : "Unknown";
        String department = sessionFromRequest.getDepartment() != null ? sessionFromRequest.getDepartment() : "Unknown";
        int semester = sessionFromRequest.getSemester() > 0 ? sessionFromRequest.getSemester() : 1;
        String section = sessionFromRequest.getSection() != null ? sessionFromRequest.getSection() : "A";
        
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
        
        sessionFromRequest.setDepartment(department);
        sessionFromRequest.setSemester(semester);
        sessionFromRequest.setSection(section);
        if (sessionFromRequest.getDayOfWeek() == null) {
            sessionFromRequest.setDayOfWeek("Monday");
        }
        if (sessionFromRequest.getStartTime() == null) {
            sessionFromRequest.setStartTime(LocalTime.now());
        }
        if (sessionFromRequest.getEndTime() == null) {
            sessionFromRequest.setEndTime(LocalTime.now().plusHours(1));
        }
        sessionFromRequest.setActive(true);
        
        return timetableSessionRepository.save(sessionFromRequest);
    }
}
