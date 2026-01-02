package com.attendance.dto;

import java.util.List;

/**
 * DTO to return subjects along with their assigned staff members
 * Used for timetable management to ensure only subjects with staff can be assigned
 */
public class SubjectWithStaffDTO {
    private Long id;
    private String code;
    private String subjectName;
    private Integer credits;
    private String department;
    private Integer semester;
    private List<StaffInfoDTO> assignedStaff;
    
    public SubjectWithStaffDTO() {}
    
    public SubjectWithStaffDTO(Long id, String code, String subjectName, Integer credits, 
                              String department, Integer semester, List<StaffInfoDTO> assignedStaff) {
        this.id = id;
        this.code = code;
        this.subjectName = subjectName;
        this.credits = credits;
        this.department = department;
        this.semester = semester;
        this.assignedStaff = assignedStaff;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getCode() {
        return code;
    }
    
    public void setCode(String code) {
        this.code = code;
    }
    
    public String getSubjectName() {
        return subjectName;
    }
    
    public void setSubjectName(String subjectName) {
        this.subjectName = subjectName;
    }
    
    public Integer getCredits() {
        return credits;
    }
    
    public void setCredits(Integer credits) {
        this.credits = credits;
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
    
    public List<StaffInfoDTO> getAssignedStaff() {
        return assignedStaff;
    }
    
    public void setAssignedStaff(List<StaffInfoDTO> assignedStaff) {
        this.assignedStaff = assignedStaff;
    }
    
    /**
     * Simple DTO for staff information
     */
    public static class StaffInfoDTO {
        private Long id;
        private String name;
        private String employeeCode;
        private String email;
        
        public StaffInfoDTO() {}
        
        public StaffInfoDTO(Long id, String name, String employeeCode, String email) {
            this.id = id;
            this.name = name;
            this.employeeCode = employeeCode;
            this.email = email;
        }
        
        // Getters and Setters
        public Long getId() {
            return id;
        }
        
        public void setId(Long id) {
            this.id = id;
        }
        
        public String getName() {
            return name;
        }
        
        public void setName(String name) {
            this.name = name;
        }
        
        public String getEmployeeCode() {
            return employeeCode;
        }
        
        public void setEmployeeCode(String employeeCode) {
            this.employeeCode = employeeCode;
        }
        
        public String getEmail() {
            return email;
        }
        
        public void setEmail(String email) {
            this.email = email;
        }
    }
}
