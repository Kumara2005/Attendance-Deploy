package com.attendance.service;

import org.springframework.stereotype.Service;
import com.attendance.dto.StudentDashboardDTO;
import com.attendance.dto.StudentDashboardDTO.SubjectAttendanceDTO;
import com.attendance.dto.WeeklyTimetableDTO;
import com.attendance.dto.WeeklyTimetableDTO.TimetableSlotDTO;
import com.attendance.model.Student;
import com.attendance.model.TimetableSession;
import com.attendance.model.User;
import com.attendance.repository.*;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for Student Dashboard
 * Generates dashboard data matching StudentPortal.tsx frontend requirements
 */
@Service
public class StudentDashboardService {

    private final StudentRepository studentRepository;
    private final SessionAttendanceRepository attendanceRepository;
    private final TimetableSessionRepository timetableRepository;
    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;

    public StudentDashboardService(StudentRepository studentRepository,
                                  SessionAttendanceRepository attendanceRepository,
                                  TimetableSessionRepository timetableRepository,
                                  SubjectRepository subjectRepository,
                                  UserRepository userRepository) {
        this.studentRepository = studentRepository;
        this.attendanceRepository = attendanceRepository;
        this.timetableRepository = timetableRepository;
        this.subjectRepository = subjectRepository;
        this.userRepository = userRepository;
    }

    /**
     * Get complete dashboard for student
     */
    public StudentDashboardDTO getStudentDashboard(String username) {
        // Find student by username
        Student student = findStudentByUsername(username);
        
        // Build identity
        StudentDashboardDTO.StudentIdentityDTO identity = buildStudentIdentity(student);
        
        // Get subject-wise attendance
        SubjectAttendanceDTO[] subjectAttendance = getStudentAttendance(username);
        
        // Calculate overall attendance
        Double overallPercentage = calculateOverallAttendance(subjectAttendance);
        
        // Get weekly timetable
        WeeklyTimetableDTO timetable = getStudentTimetable(username);
        
        return new StudentDashboardDTO(identity, overallPercentage, 
                                      Arrays.asList(subjectAttendance), timetable);
    }

    /**
     * Get subject-wise attendance for student
     * Maps to: ALEX_ATTENDANCE_DATA in StudentPortal.tsx
     */
    public SubjectAttendanceDTO[] getStudentAttendance(String username) {
        Student student = findStudentByUsername(username);
        
        // Query attendance records grouped by subject
        List<Object[]> results = attendanceRepository.findAttendanceByStudentGroupedBySubject(student.getId());
        
        return results.stream()
            .map(row -> {
                String subjectName = (String) row[0];
                Long attended = (Long) row[1];
                Long total = (Long) row[2];
                Double percentage = total > 0 ? (attended * 100.0 / total) : 0.0;
                
                return new SubjectAttendanceDTO(
                    subjectName,
                    attended.intValue(),
                    total.intValue(),
                    Math.round(percentage * 100.0) / 100.0 // Round to 2 decimals
                );
            })
            .toArray(SubjectAttendanceDTO[]::new);
    }

    /**
     * Get weekly timetable for student's class
     * Maps to: MASTER_TIMETABLE in StudentPortal.tsx
     */
    public WeeklyTimetableDTO getStudentTimetable(String username) {
        Student student = findStudentByUsername(username);
        
        // Get all timetable sessions for this student's department and semester
        List<TimetableSession> sessions = timetableRepository
            .findByDepartmentAndSemesterAndActiveTrue(student.getDepartment(), student.getSemester());
        
        // Group by day of week
        Map<String, List<TimetableSlotDTO>> schedule = new LinkedHashMap<>();
        
        // Initialize all days
        String[] daysOfWeek = {"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"};
        for (String day : daysOfWeek) {
            schedule.put(day, new ArrayList<>());
        }
        
        // Populate schedule
        for (TimetableSession session : sessions) {
            String day = session.getDayOfWeek();
            // Ensure the day exists in schedule (handle case variations)
            if (!schedule.containsKey(day)) {
                schedule.put(day, new ArrayList<>());
            }
            TimetableSlotDTO slot = new TimetableSlotDTO(
                session.getStartTime().toString(),
                session.getEndTime().toString(),
                session.getSubjectName(),
                session.getFacultyName() != null ? session.getFacultyName() : "-",
                session.getLocation() != null ? session.getLocation() : "-"
            );
            schedule.get(day).add(slot);
        }
        
        // Sort each day's slots by start time
        schedule.values().forEach(slots -> 
            slots.sort(Comparator.comparing(TimetableSlotDTO::getStartTime))
        );
        
        return new WeeklyTimetableDTO(schedule);
    }

    /**
     * Get today's timetable only
     */
    public TimetableSlotDTO[] getTodayTimetable(String username) {
        Student student = findStudentByUsername(username);
        
        // Get current day of week
        String today = LocalDate.now().getDayOfWeek()
            .getDisplayName(TextStyle.FULL, Locale.ENGLISH);
        
        List<TimetableSession> todaySessions = timetableRepository
            .findByDepartmentAndSemesterAndDayOfWeekAndActiveTrue(
                student.getDepartment(), student.getSemester(), today);
        
        return todaySessions.stream()
            .sorted(Comparator.comparing(TimetableSession::getStartTime))
            .map(session -> new TimetableSlotDTO(
                session.getStartTime().toString(),
                session.getEndTime().toString(),
                session.getSubjectName(),
                session.getFacultyName() != null ? session.getFacultyName() : "-",
                session.getLocation() != null ? session.getLocation() : "-"
            ))
            .toArray(TimetableSlotDTO[]::new);
    }

    // ========== HELPER METHODS ==========

    private Student findStudentByUsername(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found: " + username));
        return studentRepository.findByUserId(user.getId())
            .orElseThrow(() -> new RuntimeException("Student not found for user: " + username));
    }

    private StudentDashboardDTO.StudentIdentityDTO buildStudentIdentity(Student student) {
        return new StudentDashboardDTO.StudentIdentityDTO(
            String.valueOf(student.getId()),
            student.getRollNumber(),
            student.getName(),
            student.getClassName(),
            student.getSection(),
            student.getYear(),
            student.getDepartment()
        );
    }

    private Double calculateOverallAttendance(SubjectAttendanceDTO[] subjects) {
        if (subjects.length == 0) return 0.0;
        
        double totalPercentage = Arrays.stream(subjects)
            .mapToDouble(SubjectAttendanceDTO::getPercentage)
            .sum();
        
        return Math.round((totalPercentage / subjects.length) * 100.0) / 100.0;
    }
}
