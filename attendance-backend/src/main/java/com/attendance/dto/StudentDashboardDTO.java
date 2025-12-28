package com.attendance.dto;

import java.util.List;

/**
 * DTO for Student Dashboard - Alex Rivera's Student Portal
 * Maps to: StudentPortal.tsx -> ALEX_ATTENDANCE_DATA and STUDENT_IDENTITY
 */
public class StudentDashboardDTO {
    
    private StudentIdentityDTO identity;
    private Double overallAttendancePercentage;
    private List<SubjectAttendanceDTO> subjectAttendance;
    private WeeklyTimetableDTO weeklyTimetable;
    
    // Constructors
    public StudentDashboardDTO() {}
    
    public StudentDashboardDTO(StudentIdentityDTO identity, Double overallAttendancePercentage, 
                               List<SubjectAttendanceDTO> subjectAttendance, 
                               WeeklyTimetableDTO weeklyTimetable) {
        this.identity = identity;
        this.overallAttendancePercentage = overallAttendancePercentage;
        this.subjectAttendance = subjectAttendance;
        this.weeklyTimetable = weeklyTimetable;
    }
    
    // Getters and Setters
    public StudentIdentityDTO getIdentity() {
        return identity;
    }
    
    public void setIdentity(StudentIdentityDTO identity) {
        this.identity = identity;
    }
    
    public Double getOverallAttendancePercentage() {
        return overallAttendancePercentage;
    }
    
    public void setOverallAttendancePercentage(Double overallAttendancePercentage) {
        this.overallAttendancePercentage = overallAttendancePercentage;
    }
    
    public List<SubjectAttendanceDTO> getSubjectAttendance() {
        return subjectAttendance;
    }
    
    public void setSubjectAttendance(List<SubjectAttendanceDTO> subjectAttendance) {
        this.subjectAttendance = subjectAttendance;
    }
    
    public WeeklyTimetableDTO getWeeklyTimetable() {
        return weeklyTimetable;
    }
    
    public void setWeeklyTimetable(WeeklyTimetableDTO weeklyTimetable) {
        this.weeklyTimetable = weeklyTimetable;
    }
    
    /**
     * Student Identity DTO
     * Maps to: STUDENT_IDENTITY in StudentPortal.tsx
     */
    public static class StudentIdentityDTO {
        private String id;
        private String rollNumber;
        private String name;
        private String className; // "B.Sc Computer Science"
        private String section;   // "Year 1"
        private String year;      // "Year 1"
        private String department;
        
        // Constructors
        public StudentIdentityDTO() {}
        
        public StudentIdentityDTO(String id, String rollNumber, String name, String className, 
                                 String section, String year, String department) {
            this.id = id;
            this.rollNumber = rollNumber;
            this.name = name;
            this.className = className;
            this.section = section;
            this.year = year;
            this.department = department;
        }
        
        // Getters and Setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        
        public String getRollNumber() { return rollNumber; }
        public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public String getClassName() { return className; }
        public void setClassName(String className) { this.className = className; }
        
        public String getSection() { return section; }
        public void setSection(String section) { this.section = section; }
        
        public String getYear() { return year; }
        public void setYear(String year) { this.year = year; }
        
        public String getDepartment() { return department; }
        public void setDepartment(String department) { this.department = department; }
    }
    
    /**
     * Subject Attendance DTO
     * Maps to: ALEX_ATTENDANCE_DATA items in StudentPortal.tsx
     */
    public static class SubjectAttendanceDTO {
        private String subject;
        private Integer attended;
        private Integer total;
        private Double percentage;
        
        // Constructors
        public SubjectAttendanceDTO() {}
        
        public SubjectAttendanceDTO(String subject, Integer attended, Integer total, Double percentage) {
            this.subject = subject;
            this.attended = attended;
            this.total = total;
            this.percentage = percentage;
        }
        
        // Getters and Setters
        public String getSubject() { return subject; }
        public void setSubject(String subject) { this.subject = subject; }
        
        public Integer getAttended() { return attended; }
        public void setAttended(Integer attended) { this.attended = attended; }
        
        public Integer getTotal() { return total; }
        public void setTotal(Integer total) { this.total = total; }
        
        public Double getPercentage() { return percentage; }
        public void setPercentage(Double percentage) { this.percentage = percentage; }
    }
}
