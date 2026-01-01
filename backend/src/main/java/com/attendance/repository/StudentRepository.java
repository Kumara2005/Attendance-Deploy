package com.attendance.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.attendance.model.Student;
import java.util.Optional;
import java.util.List;

public interface StudentRepository extends JpaRepository<Student, Long> {
    
    Optional<Student> findByUserId(Long userId);
    
    Optional<Student> findByRollNo(String rollNo);
    
    @Query("SELECT s.department, COUNT(DISTINCT s.id) " +
           "FROM Student s WHERE s.active = true GROUP BY s.department")
    List<Object[]> findDepartmentStatistics();
    
    @Query("SELECT DISTINCT CONCAT('Year ', ((s.semester + 1) / 2)) FROM Student s " +
           "WHERE s.department = :department ORDER BY s.semester")
    List<String> findDistinctYearsByDepartment(@Param("department") String department);
    
    Long countByDepartmentAndSemester(String department, int semester);
    
    @Query("SELECT COUNT(DISTINCT CONCAT(s.department, '-', s.semester)) FROM Student s WHERE s.active = true")
    Integer countDistinctClassYearCombinations();
    
    List<Student> findByDepartmentAndSemester(String department, int semester);
    
    /**
     * Fetch students by department, semester, section and active status
     * Using native SQL to ensure proper boolean handling
     */
    @Query(value = "SELECT * FROM student WHERE department = :department AND semester = :semester AND section = :section AND active = true", 
           nativeQuery = true)
    List<Student> findByDepartmentAndSemesterAndSectionAndActiveTrue(
        @Param("department") String department, 
        @Param("semester") int semester, 
        @Param("section") String section);

    List<Student> findByDepartmentAndSemesterAndActiveTrue(String department, int semester);
}