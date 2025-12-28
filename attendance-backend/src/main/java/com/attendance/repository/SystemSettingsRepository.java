package com.attendance.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.attendance.model.SystemSettings;
import java.util.Optional;

public interface SystemSettingsRepository
        extends JpaRepository<SystemSettings, Long> {
    
    Optional<SystemSettings> findBySettingKey(String settingKey);
}
