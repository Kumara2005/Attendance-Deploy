package com.attendance.config;

import com.attendance.model.Student;
import com.attendance.model.TimetableSession;
import com.attendance.repository.StudentRepository;
import com.attendance.repository.TimetableSessionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Auto Data Fix on Startup
 * Automatically fixes semester mismatches when application starts
 * Ensures QuickAttendance always has correct data
 * 
 * Uses Hibernate/JPA only - NO SQL FILES
 */
@Component
@Order(100) // Run after database is initialized
public class AutoDataFix implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(AutoDataFix.class);

    private final TimetableSessionRepository timetableRepository;
    private final StudentRepository studentRepository;

    public AutoDataFix(TimetableSessionRepository timetableRepository,
                       StudentRepository studentRepository) {
        this.timetableRepository = timetableRepository;
        this.studentRepository = studentRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        logger.info("🔧 AUTO DATA FIX: Checking for semester mismatches...");
        
        try {
            // First, show what we have in database
            showDatabaseState();
            
            int fixed = fixSemesterMismatches();
            
            if (fixed > 0) {
                logger.info("✅ AUTO DATA FIX: Fixed {} timetable sessions", fixed);
                showDatabaseState(); // Show state after fix
            } else {
                logger.info("✅ AUTO DATA FIX: No mismatches found - data is correct");
            }
        } catch (Exception e) {
            logger.error("❌ AUTO DATA FIX failed: {}", e.getMessage(), e);
            // Don't fail application startup
        }
    }
    
    /**
     * Show current database state for debugging
     */
    private void showDatabaseState() {
        logger.info("📊 DATABASE STATE:");
        
        // Show students
        List<Student> allStudents = studentRepository.findAll();
        Map<String, Long> studentCounts = allStudents.stream()
            .filter(Student::isActive)
            .collect(java.util.stream.Collectors.groupingBy(
                s -> String.format("%s Sem%d Sec%s", s.getDepartment(), s.getSemester(), s.getSection()),
                java.util.stream.Collectors.counting()
            ));
        
        logger.info("   STUDENTS:");
        studentCounts.forEach((key, count) -> logger.info("      {} = {} students", key, count));
        
        // Show sessions
        List<TimetableSession> allSessions = timetableRepository.findByActiveTrue();
        Map<String, Long> sessionCounts = allSessions.stream()
            .collect(java.util.stream.Collectors.groupingBy(
                s -> String.format("%s Sem%d Sec%s", s.getDepartment(), s.getSemester(), s.getSection()),
                java.util.stream.Collectors.counting()
            ));
        
        logger.info("   TIMETABLE SESSIONS:");
        sessionCounts.forEach((key, count) -> logger.info("      {} = {} sessions", key, count));
    }

    /**
     * Fix semester mismatches between timetable sessions and students
     * Returns number of sessions fixed
     */
    private int fixSemesterMismatches() {
        int totalFixed = 0;

        // Get all active students and sessions
        List<Student> allStudents = studentRepository.findAll().stream()
            .filter(Student::isActive)
            .collect(Collectors.toList());
        
        List<TimetableSession> allSessions = timetableRepository.findByActiveTrue();
        
        if (allStudents.isEmpty() || allSessions.isEmpty()) {
            logger.info("ℹ️  No students or sessions found");
            return 0;
        }

        logger.info("📊 Checking {} students and {} sessions", allStudents.size(), allSessions.size());

        // Fix section mismatches: Students' section should match session section for same dept/semester
        // Group students by department + semester
        Map<String, List<Student>> studentsByDeptSem = allStudents.stream()
            .collect(Collectors.groupingBy(s -> s.getDepartment() + "_" + s.getSemester()));

        for (Map.Entry<String, List<Student>> entry : studentsByDeptSem.entrySet()) {
            List<Student> students = entry.getValue();
            if (students.isEmpty()) continue;

            String department = students.get(0).getDepartment();
            int semester = students.get(0).getSemester();

            // Find the section from timetable sessions for this dept/semester
            String correctSection = allSessions.stream()
                .filter(s -> s.getDepartment().equals(department) && s.getSemester() == semester)
                .map(TimetableSession::getSection)
                .distinct()
                .findFirst()
                .orElse(null);

            if (correctSection != null) {
                // Fix all students with wrong section
                for (Student student : students) {
                    if (!student.getSection().equals(correctSection)) {
                        logger.info("🔧 Fixing section: {} ({}) {} → {}", 
                            student.getName(), student.getRollNo(), 
                            student.getSection(), correctSection);
                        student.setSection(correctSection);
                        studentRepository.save(student);
                        totalFixed++;
                    }
                }
                
                if (totalFixed > 0) {
                    logger.info("✅ Fixed {} students in {} semester {}", 
                        totalFixed, department, semester);
                }
            }
        }

        return totalFixed;
    }
}
