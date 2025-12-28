package com.attendance;

import com.attendance.model.SessionAttendance;
import com.attendance.model.Student;
import com.attendance.repository.SessionAttendanceRepository;
import com.attendance.repository.StudentRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class StudentAttendanceIntegrationTest {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private SessionAttendanceRepository sessionAttendanceRepository;

    @Test
    public void testAlexRiveraAttendance() {
        // Find Alex Rivera by roll number
        Optional<Student> alexOpt = studentRepository.findByRollNo("CS-Y1-100");
        assertTrue(alexOpt.isPresent(), "Alex Rivera (CS-Y1-100) should exist in database");
        
        Student alex = alexOpt.get();
        assertEquals("Alex Rivera", alex.getName());
        assertEquals("Computer Science", alex.getDepartment());
        
        // Get all attendance records for Alex
        List<SessionAttendance> attendanceRecords = sessionAttendanceRepository.findByStudentId(alex.getId());
        assertFalse(attendanceRecords.isEmpty(), "Alex should have attendance records");
        
        // Calculate attendance percentage
        long presentCount = attendanceRecords.stream()
                .filter(record -> "Present".equals(record.getStatus().toString()))
                .count();
        
        double attendancePercentage = (presentCount * 100.0) / attendanceRecords.size();
        
        System.out.println("=== Alex Rivera Attendance Test ===");
        System.out.println("Student ID: " + alex.getId());
        System.out.println("Roll No: " + alex.getRollNo());
        System.out.println("Name: " + alex.getName());
        System.out.println("Department: " + alex.getDepartment());
        System.out.println("Semester: " + alex.getSemester());
        System.out.println("Total Sessions: " + attendanceRecords.size());
        System.out.println("Present Count: " + presentCount);
        System.out.println("Attendance Percentage: " + String.format("%.2f", attendancePercentage) + "%");
        System.out.println("===================================");
        
        // Verify attendance is close to 86% (allowing some tolerance)
        assertTrue(attendancePercentage >= 85.0 && attendancePercentage <= 87.0, 
                   "Attendance should be approximately 86%, but was " + attendancePercentage + "%");
    }
}
