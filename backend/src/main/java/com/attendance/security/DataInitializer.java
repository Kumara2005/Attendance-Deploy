package com.attendance.security;

import com.attendance.model.User;
import com.attendance.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initUsers(
            UserRepository repo,
            PasswordEncoder encoder) {

        return args -> {

            if (repo.count() == 0) {

                User admin = new User();
                admin.setUsername("admin");
                admin.setPassword(encoder.encode("admin123"));
                admin.setRole("ROLE_ADMIN");

                User staff = new User();
                staff.setUsername("staff");
                staff.setPassword(encoder.encode("staff123"));
                staff.setRole("ROLE_STAFF");

                User student = new User();
                student.setUsername("student");
                student.setPassword(encoder.encode("student123"));
                student.setRole("ROLE_STUDENT");

                repo.save(admin);
                repo.save(staff);
                repo.save(student);
            }
        };
    }
}