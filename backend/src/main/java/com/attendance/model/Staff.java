package com.attendance.model;

import java.util.List;

import jakarta.persistence.*;

@Entity
@Table(name = "staff")
public class Staff {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String staffCode;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String department;

    // One staff has one login user
    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // One staff can handle multiple subjects
    @ManyToMany
    @JoinTable(
        name = "staff_subjects",
        joinColumns = @JoinColumn(name = "staff_id"),
        inverseJoinColumns = @JoinColumn(name = "subject_id")
    )
    private List<Subject> subjects;

    private boolean active = true;


    public Staff() {
    }

    public Staff(String staffCode, String name, String department, User user) {
        this.staffCode = staffCode;
        this.name = name;
        this.department = department;
        this.user = user;
    }


    public Long getId() {
        return id;
    }

    public String getStaffCode() {
        return staffCode;
    }

    public void setStaffCode(String staffCode) {
        this.staffCode = staffCode;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public List<Subject> getSubjects() {
        return subjects;
    }

    public void setSubjects(List<Subject> subjects) {
        this.subjects = subjects;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    // Additional getters for DTO mapping
    public String getEmail() {
        return user != null ? user.getUsername() : null;
    }

    public String getSubject() {
        return subjects != null && !subjects.isEmpty() ? subjects.get(0).getSubjectName() : null;
    }

    public String getEmployeeCode() {
        return staffCode;
    }

    public String getEmployeeId() {
        return staffCode;
    }

    public String getDesignation() {
        return "Professor"; // Default designation
    }

    public String getAssignedClasses() {
        return department; // Simplified for now
    }
}
