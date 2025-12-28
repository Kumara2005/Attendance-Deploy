package com.attendance.dto;

import java.util.List;

/**
 * DTO for Staff/Teacher Dashboard
 * Shows classes assigned in format: [Year] [Department] [Class]
 */
public class StaffDashboardDTO {
    
    private StaffInfoDTO staffInfo;
    private List<AssignedClassDTO> assignedClasses;
    private List<TodaySessionDTO> todaySessions;
    
    // Constructors
    public StaffDashboardDTO() {}
    
    public StaffDashboardDTO(StaffInfoDTO staffInfo, List<AssignedClassDTO> assignedClasses, 
                            List<TodaySessionDTO> todaySessions) {
        this.staffInfo = staffInfo;
        this.assignedClasses = assignedClasses;
        this.todaySessions = todaySessions;
    }
    
    // Getters and Setters
    public StaffInfoDTO getStaffInfo() { return staffInfo; }
    public void setStaffInfo(StaffInfoDTO staffInfo) { this.staffInfo = staffInfo; }
    
    public List<AssignedClassDTO> getAssignedClasses() { return assignedClasses; }
    public void setAssignedClasses(List<AssignedClassDTO> assignedClasses) { this.assignedClasses = assignedClasses; }
    
    public List<TodaySessionDTO> getTodaySessions() { return todaySessions; }
    public void setTodaySessions(List<TodaySessionDTO> todaySessions) { this.todaySessions = todaySessions; }
    
    /**
     * Staff Information DTO
     */
    public static class StaffInfoDTO {
        private String id;
        private String name;
        private String email;
        private String department;
        private String subject;
        private String employeeCode;
        
        // Constructors
        public StaffInfoDTO() {}
        
        public StaffInfoDTO(String id, String name, String email, String department, 
                           String subject, String employeeCode) {
            this.id = id;
            this.name = name;
            this.email = email;
            this.department = department;
            this.subject = subject;
            this.employeeCode = employeeCode;
        }
        
        // Getters and Setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        
        public String getDepartment() { return department; }
        public void setDepartment(String department) { this.department = department; }
        
        public String getSubject() { return subject; }
        public void setSubject(String subject) { this.subject = subject; }
        
        public String getEmployeeCode() { return employeeCode; }
        public void setEmployeeCode(String employeeCode) { this.employeeCode = employeeCode; }
    }
    
    /**
     * Assigned Class DTO
     * Format: [Year] [Department] [Class]
     * Example: "Year 1 B.Sc Computer Science Section A"
     */
    public static class AssignedClassDTO {
        private String year;
        private String department;
        private String className;
        private String section;
        private String subject;
        private Integer studentCount;
        private Double averageAttendance;
        
        // Constructors
        public AssignedClassDTO() {}
        
        public AssignedClassDTO(String year, String department, String className, String section, 
                               String subject, Integer studentCount, Double averageAttendance) {
            this.year = year;
            this.department = department;
            this.className = className;
            this.section = section;
            this.subject = subject;
            this.studentCount = studentCount;
            this.averageAttendance = averageAttendance;
        }
        
        // Getters and Setters
        public String getYear() { return year; }
        public void setYear(String year) { this.year = year; }
        
        public String getDepartment() { return department; }
        public void setDepartment(String department) { this.department = department; }
        
        public String getClassName() { return className; }
        public void setClassName(String className) { this.className = className; }
        
        public String getSection() { return section; }
        public void setSection(String section) { this.section = section; }
        
        public String getSubject() { return subject; }
        public void setSubject(String subject) { this.subject = subject; }
        
        public Integer getStudentCount() { return studentCount; }
        public void setStudentCount(Integer studentCount) { this.studentCount = studentCount; }
        
        public Double getAverageAttendance() { return averageAttendance; }
        public void setAverageAttendance(Double averageAttendance) { this.averageAttendance = averageAttendance; }
        
        /**
         * Get formatted class string: [Year] [Department] [Class]
         */
        public String getFormattedClassName() {
            return String.format("%s %s %s", year, department, section != null ? section : className);
        }
    }
    
    /**
     * Today's Session DTO
     */
    public static class TodaySessionDTO {
        private String startTime;
        private String endTime;
        private String subject;
        private String className;
        private String location;
        private Boolean attendanceMarked;
        
        // Constructors
        public TodaySessionDTO() {}
        
        public TodaySessionDTO(String startTime, String endTime, String subject, String className, 
                              String location, Boolean attendanceMarked) {
            this.startTime = startTime;
            this.endTime = endTime;
            this.subject = subject;
            this.className = className;
            this.location = location;
            this.attendanceMarked = attendanceMarked;
        }
        
        // Getters and Setters
        public String getStartTime() { return startTime; }
        public void setStartTime(String startTime) { this.startTime = startTime; }
        
        public String getEndTime() { return endTime; }
        public void setEndTime(String endTime) { this.endTime = endTime; }
        
        public String getSubject() { return subject; }
        public void setSubject(String subject) { this.subject = subject; }
        
        public String getClassName() { return className; }
        public void setClassName(String className) { this.className = className; }
        
        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }
        
        public Boolean getAttendanceMarked() { return attendanceMarked; }
        public void setAttendanceMarked(Boolean attendanceMarked) { this.attendanceMarked = attendanceMarked; }
    }
}
