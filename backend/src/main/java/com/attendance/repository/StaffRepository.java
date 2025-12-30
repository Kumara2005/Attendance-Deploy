package com.attendance.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.attendance.model.Staff;
import java.util.Optional;
import java.util.List;

public interface StaffRepository extends JpaRepository<Staff, Long> {
    
    Optional<Staff> findByUserId(Long userId);
    
    Optional<Staff> findByStaffCode(String staffCode);
    
    Long countByDepartment(String department);
    
    List<Staff> findByDepartment(String department);
    
    List<Staff> findByActiveTrue();
}

