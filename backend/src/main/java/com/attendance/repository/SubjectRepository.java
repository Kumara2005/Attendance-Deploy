package com.attendance.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.attendance.model.Subject;
import java.util.List;
import java.util.Optional;

public interface SubjectRepository extends JpaRepository<Subject, Long> {
    
    Optional<Subject> findBySubjectCode(String subjectCode);
    
    List<Subject> findByDepartmentAndSemester(String department, int semester);
    
    List<Subject> findByDepartment(String department);
}
