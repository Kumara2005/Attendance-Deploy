package com.attendance.dto;

/**
 * DTO for Faculty/Staff Information
 * Used in Student Portal Faculty tab
 */
public class FacultyDTO {
    
    private String id;
    private String name;
    private String staffCode;
    private String department;
    private String subject;
    private String qualification;
    private String experience;
    private String phone;
    
    // Constructors
    public FacultyDTO() {}
    
    public FacultyDTO(String id, String name, String staffCode, String department, 
                     String subject, String qualification, String experience, String phone) {
        this.id = id;
        this.name = name;
        this.staffCode = staffCode;
        this.department = department;
        this.subject = subject;
        this.qualification = qualification;
        this.experience = experience;
        this.phone = phone;
    }
    
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getStaffCode() { return staffCode; }
    public void setStaffCode(String staffCode) { this.staffCode = staffCode; }
    
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    
    public String getQualification() { return qualification; }
    public void setQualification(String qualification) { this.qualification = qualification; }
    
    public String getExperience() { return experience; }
    public void setExperience(String experience) { this.experience = experience; }
    
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
}
