package com.attendance.dto;

import java.util.List;

/**
 * DTO for Admin Dashboard - Curriculum Registry
 * Maps to: Admin Dashboard components showing Programme Registry
 */
public class AdminDashboardDTO {
    
    private List<ProgrammeDTO> programmes;
    private Integer totalStudents;
    private Integer totalStaff;
    private Integer totalClasses;
    private Double overallAttendance;
    
    // Constructors
    public AdminDashboardDTO() {}
    
    public AdminDashboardDTO(List<ProgrammeDTO> programmes, Integer totalStudents, 
                            Integer totalStaff, Integer totalClasses, Double overallAttendance) {
        this.programmes = programmes;
        this.totalStudents = totalStudents;
        this.totalStaff = totalStaff;
        this.totalClasses = totalClasses;
        this.overallAttendance = overallAttendance;
    }
    
    // Getters and Setters
    public List<ProgrammeDTO> getProgrammes() { return programmes; }
    public void setProgrammes(List<ProgrammeDTO> programmes) { this.programmes = programmes; }
    
    public Integer getTotalStudents() { return totalStudents; }
    public void setTotalStudents(Integer totalStudents) { this.totalStudents = totalStudents; }
    
    public Integer getTotalStaff() { return totalStaff; }
    public void setTotalStaff(Integer totalStaff) { this.totalStaff = totalStaff; }
    
    public Integer getTotalClasses() { return totalClasses; }
    public void setTotalClasses(Integer totalClasses) { this.totalClasses = totalClasses; }
    
    public Double getOverallAttendance() { return overallAttendance; }
    public void setOverallAttendance(Double overallAttendance) { this.overallAttendance = overallAttendance; }
    
    /**
     * Programme DTO for Admin Dashboard Cards
     */
    public static class ProgrammeDTO {
        private String name;
        private String department;
        private Integer studentCount;
        private Integer facultyCount;
        private Double averageAttendance;
        private List<String> years; // ["Year 1", "Year 2", "Year 3"]
        
        // Constructors
        public ProgrammeDTO() {}
        
        public ProgrammeDTO(String name, String department, Integer studentCount, 
                           Integer facultyCount, Double averageAttendance, List<String> years) {
            this.name = name;
            this.department = department;
            this.studentCount = studentCount;
            this.facultyCount = facultyCount;
            this.averageAttendance = averageAttendance;
            this.years = years;
        }
        
        // Getters and Setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public String getDepartment() { return department; }
        public void setDepartment(String department) { this.department = department; }
        
        public Integer getStudentCount() { return studentCount; }
        public void setStudentCount(Integer studentCount) { this.studentCount = studentCount; }
        
        public Integer getFacultyCount() { return facultyCount; }
        public void setFacultyCount(Integer facultyCount) { this.facultyCount = facultyCount; }
        
        public Double getAverageAttendance() { return averageAttendance; }
        public void setAverageAttendance(Double averageAttendance) { this.averageAttendance = averageAttendance; }
        
        public List<String> getYears() { return years; }
        public void setYears(List<String> years) { this.years = years; }
    }
}
