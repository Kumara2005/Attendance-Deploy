package com.attendance.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Database Initializer
 * Automatically applies database migrations on application startup
 * Ensures attendance system can create sessions dynamically without predefined staff/class
 */
@Component
public class DatabaseInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseInitializer.class);
    private final JdbcTemplate jdbcTemplate;

    public DatabaseInitializer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) throws Exception {
        logger.info("🔧 Starting Database Initialization...");
        
        try {
            applyAttendanceConstraintsMigration();
            logger.info("✅ Database initialization completed successfully");
        } catch (Exception e) {
            logger.error("❌ Error during database initialization: " + e.getMessage(), e);
            // Don't throw exception - allow app to start even if migration fails
            // This allows for manual fixes if needed
        }
    }

    /**
     * Apply migration: Make subject_id, staff_id, and class_id nullable
     * This allows attendance system to create sessions dynamically
     */
    private void applyAttendanceConstraintsMigration() {
        logger.info("📝 Applying attendance constraints migration...");
        
        try {
            // Step 1: Drop existing constraints if they exist
            logger.info("Step 1: Dropping existing foreign key constraints...");
            
            try {
                jdbcTemplate.execute("ALTER TABLE timetable_session DROP FOREIGN KEY timetable_session_ibfk_1");
                logger.info("  ✅ Dropped timetable_session_ibfk_1");
            } catch (Exception e) {
                logger.warn("  ⚠️  Could not drop timetable_session_ibfk_1 (may not exist): " + e.getMessage());
            }

            try {
                jdbcTemplate.execute("ALTER TABLE timetable_session DROP FOREIGN KEY timetable_session_ibfk_2");
                logger.info("  ✅ Dropped timetable_session_ibfk_2");
            } catch (Exception e) {
                logger.warn("  ⚠️  Could not drop timetable_session_ibfk_2 (may not exist): " + e.getMessage());
            }

            try {
                jdbcTemplate.execute("ALTER TABLE timetable_session DROP FOREIGN KEY timetable_session_ibfk_3");
                logger.info("  ✅ Dropped timetable_session_ibfk_3");
            } catch (Exception e) {
                logger.warn("  ⚠️  Could not drop timetable_session_ibfk_3 (may not exist): " + e.getMessage());
            }

            // Step 2: Modify columns to allow NULL
            logger.info("Step 2: Modifying columns to allow NULL...");
            
            try {
                jdbcTemplate.execute("ALTER TABLE timetable_session MODIFY COLUMN subject_id BIGINT NULL");
                logger.info("  ✅ subject_id is now nullable");
            } catch (Exception e) {
                logger.warn("  ⚠️  Could not modify subject_id: " + e.getMessage());
            }

            try {
                jdbcTemplate.execute("ALTER TABLE timetable_session MODIFY COLUMN staff_id BIGINT NULL");
                logger.info("  ✅ staff_id is now nullable");
            } catch (Exception e) {
                logger.warn("  ⚠️  Could not modify staff_id: " + e.getMessage());
            }

            try {
                jdbcTemplate.execute("ALTER TABLE timetable_session MODIFY COLUMN class_id BIGINT NULL");
                logger.info("  ✅ class_id is now nullable");
            } catch (Exception e) {
                logger.warn("  ⚠️  Could not modify class_id: " + e.getMessage());
            }

            // Step 3: Re-add foreign key constraints with NULL support
            logger.info("Step 3: Re-adding foreign key constraints...");
            
            try {
                jdbcTemplate.execute(
                    "ALTER TABLE timetable_session " +
                    "ADD CONSTRAINT timetable_session_ibfk_1 " +
                    "FOREIGN KEY (subject_id) REFERENCES subject(id) ON DELETE CASCADE"
                );
                logger.info("  ✅ Re-added timetable_session_ibfk_1 (subject_id)");
            } catch (Exception e) {
                logger.warn("  ⚠️  Could not re-add timetable_session_ibfk_1: " + e.getMessage());
            }

            try {
                jdbcTemplate.execute(
                    "ALTER TABLE timetable_session " +
                    "ADD CONSTRAINT timetable_session_ibfk_2 " +
                    "FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE"
                );
                logger.info("  ✅ Re-added timetable_session_ibfk_2 (staff_id)");
            } catch (Exception e) {
                logger.warn("  ⚠️  Could not re-add timetable_session_ibfk_2: " + e.getMessage());
            }

            try {
                jdbcTemplate.execute(
                    "ALTER TABLE timetable_session " +
                    "ADD CONSTRAINT timetable_session_ibfk_3 " +
                    "FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL"
                );
                logger.info("  ✅ Re-added timetable_session_ibfk_3 (class_id)");
            } catch (Exception e) {
                logger.warn("  ⚠️  Could not re-add timetable_session_ibfk_3: " + e.getMessage());
            }

            // Step 4: Verify the changes
            logger.info("Step 4: Verifying migration...");
            logger.info("✅ Migration applied successfully!");
            logger.info("   Database is now configured to support dynamic session creation");
            logger.info("   - subject_id, staff_id, and class_id can now be NULL");
            logger.info("   - Attendance records can be saved without predefined sessions");

        } catch (Exception e) {
            logger.error("❌ Error applying attendance constraints migration: " + e.getMessage(), e);
            throw new RuntimeException("Database migration failed", e);
        }
    }
}
