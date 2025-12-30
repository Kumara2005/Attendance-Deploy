package com.attendance.repository;

import com.attendance.model.Classes;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClassRepository extends JpaRepository<Classes, Long> {

    /**
     * Find all classes by department
     */
    List<Classes> findByDepartmentAndActiveTrue(String department);

    /**
     * Find classes by department and year
     */
    List<Classes> findByDepartmentAndYearAndActiveTrue(String department, int year);

    /**
     * Find classes by department, year, and semester
     */
    List<Classes> findByDepartmentAndYearAndSemesterAndActiveTrue(
        String department, int year, int semester
    );

    /**
     * Find a specific class by all criteria
     */
    Optional<Classes> findByDepartmentAndYearAndSemesterAndSection(
        String department, int year, int semester, String section
    );

    /**
     * Get distinct years for a department
     */
    @Query("SELECT DISTINCT c.year FROM Classes c WHERE c.department = :department AND c.active = true ORDER BY c.year")
    List<Integer> findDistinctYearsByDepartment(@Param("department") String department);

    /**
     * Get distinct sections for a department, year, and semester
     */
    @Query("SELECT DISTINCT c.section FROM Classes c WHERE c.department = :department AND c.year = :year AND c.semester = :semester AND c.active = true ORDER BY c.section")
    List<String> findDistinctSectionsByDepartmentAndYearAndSemester(
        @Param("department") String department,
        @Param("year") int year,
        @Param("semester") int semester
    );
}
