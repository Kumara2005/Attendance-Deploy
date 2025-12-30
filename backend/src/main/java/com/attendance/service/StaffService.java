package com.attendance.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.attendance.exception.ResourceNotFoundException;
import com.attendance.model.Staff;
import com.attendance.repository.StaffRepository;

@Service
@Transactional
public class StaffService {

    private final StaffRepository staffRepository;

    public StaffService(StaffRepository staffRepository) {
        this.staffRepository = staffRepository;
    }

    public Staff save(Staff staff) {
        return staffRepository.save(staff);
    }

    public List<Staff> getAll() {
        return staffRepository.findAll();
    }

    public Staff getById(Long id) {
        return staffRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff", "id", id));
    }

    public Staff update(Long id, Staff staff) {
        Staff existing = getById(id);
        existing.setName(staff.getName());
        existing.setDepartment(staff.getDepartment());
        existing.setActive(staff.isActive());
        return staffRepository.save(existing);
    }

    public void disable(Long id) {
        Staff staff = getById(id);
        staff.setActive(false);
        staffRepository.save(staff);
    }

    public void delete(Long id) {
        if (!staffRepository.existsById(id)) {
            throw new ResourceNotFoundException("Staff", "id", id);
        }
        staffRepository.deleteById(id);
    }
}
