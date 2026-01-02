package com.attendance.service;

import org.springframework.stereotype.Service;
import com.attendance.dto.StudentDashboardDTO;
import com.attendance.dto.StudentDashboardDTO.SubjectAttendanceDTO;
import com.attendance.dto.WeeklyTimetableDTO;
import com.attendance.dto.WeeklyTimetableDTO.TimetableSlotDTO;
import com.attendance.dto.FacultyDTO;
import com.attendance.model.Student;
import com.attendance.model.Staff;
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
    private final StaffRepository staffRepository;

    public StudentDashboardService(StudentRepository studentRepository,
                                  SessionAttendanceRepository attendanceRepository,
                                  TimetableSessionRepository timetableRepository,
                                  SubjectRepository subjectRepository,
                                  UserRepository userRepository,
                                  StaffRepository staffRepository) {
        this.studentRepository = studentRepository;
        this.attendanceRepository = attendanceRepository;
        this.timetableRepository = timetableRepository;
        this.subjectRepository = subjectRepository;
        this.userRepository = userRepository;
        this.staffRepository = staffRepository;
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
        
        System.out.println("🔍 Fetching attendance for student: " + student.getName() + " (ID: " + student.getId() + ")");
        
        // Query attendance records grouped by subject
        List<Object[]> results = attendanceRepository.findAttendanceByStudentGroupedBySubject(student.getId());
        
        System.out.println("📊 Found " + results.size() + " subjects with attendance data");
        
        SubjectAttendanceDTO[] attendanceArray = results.stream()
            .map(row -> {
                String subjectName = (String) row[0];
                Long attended = (Long) row[1];
                Long total = (Long) row[2];
                Double percentage = total > 0 ? (attended * 100.0 / total) : 0.0;
                
                System.out.println("   📚 " + subjectName + ": " + attended + "/" + total + " = " + percentage + "%");
                
                return new SubjectAttendanceDTO(
                    subjectName,
                    attended.intValue(),
                    total.intValue(),
                    Math.round(percentage * 100.0) / 100.0 // Round to 2 decimals
                );
            })
            .toArray(SubjectAttendanceDTO[]::new);
            
        System.out.println("✅ Returning " + attendanceArray.length + " subject attendance records");
        return attendanceArray;
    }

    /**
     * Get weekly timetable for student's class
     * Maps to: MASTER_TIMETABLE in StudentPortal.tsx
     */
    public WeeklyTimetableDTO getStudentTimetable(String username) {
        Student student = findStudentByUsername(username);
        
        System.out.println("📅 Fetching weekly timetable for: " + student.getName());
        System.out.println("   Department: " + student.getDepartment());
        System.out.println("   Semester: " + student.getSemester());
        System.out.println("   Section: " + student.getSection());
        
        // Get all timetable sessions for this student's department, semester, and section
        List<TimetableSession> sessions = timetableRepository
            .findByDepartmentAndSemesterAndSectionAndActiveTrue(
                student.getDepartment(), 
                student.getSemester(),
                student.getSection()
            );
        
        System.out.println("   ✅ Found " + sessions.size() + " total sessions");
        
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
            String subjectName = session.getSubjectName();
            String facultyName = session.getFacultyName();
            String location = session.getLocation();
            
            System.out.println("   📌 " + day + ": " + subjectName + " by " + facultyName + " at " + location);
            
            // Ensure the day exists in schedule (handle case variations)
            if (!schedule.containsKey(day)) {
                schedule.put(day, new ArrayList<>());
            }
            
            TimetableSlotDTO slot = new TimetableSlotDTO(
                session.getStartTime().toString(),
                session.getEndTime().toString(),
                subjectName != null ? subjectName : "-",
                facultyName != null ? facultyName : "-",
                location != null ? location : "-"
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
        
        System.out.println("📅 Fetching today's timetable for student: " + student.getName());
        System.out.println("   Department: " + student.getDepartment());
        System.out.println("   Semester: " + student.getSemester());
        System.out.println("   Section: " + student.getSection());
        System.out.println("   Today: " + today);
        
        // Use case-insensitive query with section filter
        List<TimetableSession> todaySessions = timetableRepository
            .findByDepartmentAndSemesterAndSectionAndDayOfWeekIgnoreCaseAndActiveTrue(
                student.getDepartment(), 
                student.getSemester(),
                student.getSection(),
                today);
        
        System.out.println("   ✅ Found " + todaySessions.size() + " sessions for today");
        
        TimetableSlotDTO[] slots = todaySessions.stream()
            .sorted(Comparator.comparing(TimetableSession::getStartTime))
            .map(session -> {
                String subjectName = session.getSubjectName();
                String facultyName = session.getFacultyName();
                String location = session.getLocation();
                
                System.out.println("      📌 " + session.getStartTime() + ": " + subjectName + " by " + facultyName);
                
                return new TimetableSlotDTO(
                    session.getStartTime().toString(),
                    session.getEndTime().toString(),
                    subjectName != null ? subjectName : "-",
                    facultyName != null ? facultyName : "-",
                    location != null ? location : "-"
                );
            })
            .toArray(TimetableSlotDTO[]::new);
            
        return slots;
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

    /**
     * Get faculty list for student's department
     */
    public FacultyDTO[] getDepartmentFaculty(String username) {
        Student student = findStudentByUsername(username);
        
        System.out.println("👥 Fetching faculty for department: " + student.getDepartment());
        
        // Get all active staff in the student's department
        List<Staff> staffList = staffRepository.findByDepartmentAndActive(student.getDepartment(), true);
        
        System.out.println("✅ Found " + staffList.size() + " faculty members");
        
        return staffList.stream()
            .map(staff -> new FacultyDTO(
                String.valueOf(staff.getId()),
                staff.getName(),
                staff.getStaffCode(),
                staff.getDepartment(),
                staff.getSubject(),
                staff.getQualification(),
                staff.getExperience() != null ? staff.getExperience().toString() : "0",
                staff.getPhone()
            ))
            .toArray(FacultyDTO[]::new);
    }
}
