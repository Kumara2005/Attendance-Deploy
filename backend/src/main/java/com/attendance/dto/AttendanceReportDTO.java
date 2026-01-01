package com.attendance.dto;

public class AttendanceReportDTO {
    private Long studentId;
    private String studentName;
    private String rollNumber;
    private String department;
    private Integer semester;
    private String section;
    private String year;
    private Long totalSessions;
    private Long presentSessions;
    private Double attendancePercentage;
    private String complianceStatus;

    public AttendanceReportDTO() {
    }

    public AttendanceReportDTO(Long studentId, String studentName, String rollNumber, 
                              String department, Integer semester, String section,
                              Long totalSessions, Long presentSessions, 
                              Double attendancePercentage) {
        this.studentId = studentId;
        this.studentName = studentName;
        this.rollNumber = rollNumber;
        this.department = department;
        this.semester = semester;
        this.section = section;
        this.totalSessions = totalSessions;
        this.presentSessions = presentSessions;
        this.attendancePercentage = attendancePercentage;
        this.complianceStatus = attendancePercentage >= 75.0 ? "Qualified" : "Shortage";
        // Calculate year from semester
        this.year = "Year " + ((semester + 1) / 2);
    }

    // Getters and Setters
    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getRollNumber() {
        return rollNumber;
    }

    public void setRollNumber(String rollNumber) {
        this.rollNumber = rollNumber;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public Integer getSemester() {
        return semester;
    }

    public void setSemester(Integer semester) {
        this.semester = semester;
    }

    public String getSection() {
        return section;
    }

    public void setSection(String section) {
        this.section = section;
    }

    public String getYear() {
        return year;
    }

    public void setYear(String year) {
        this.year = year;
    }

    public Long getTotalSessions() {
        return totalSessions;
    }

    public void setTotalSessions(Long totalSessions) {
        this.totalSessions = totalSessions;
    }

    public Long getPresentSessions() {
        return presentSessions;
    }

    public void setPresentSessions(Long presentSessions) {
        this.presentSessions = presentSessions;
    }

    public Double getAttendancePercentage() {
        return attendancePercentage;
    }

    public void setAttendancePercentage(Double attendancePercentage) {
        this.attendancePercentage = attendancePercentage;
        this.complianceStatus = attendancePercentage >= 75.0 ? "Qualified" : "Shortage";
    }

    public String getComplianceStatus() {
        return complianceStatus;
    }

    public void setComplianceStatus(String complianceStatus) {
        this.complianceStatus = complianceStatus;
    }
}
