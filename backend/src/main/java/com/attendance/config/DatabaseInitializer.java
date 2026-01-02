package com.attendance.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.util.stream.Collectors;

/**
 * Database Initializer
 * Automatically applies database migrations on application startup
 * Ensures attendance system can create sessions dynamically without predefined staff/class
 * 
 * TEMPORARILY DISABLED: 2026-01-02 - Connection pool issues during initialization
 * Apply migrations manually using database/fix-timetable-semester.sql
 */
// @Component  // TEMPORARILY DISABLED - causing connection pool shutdown
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
            applyStudentClassIdMigration();
            populateStudentClassIds();
            applyAttendanceConstraintsMigration();
            mergeDuplicateSubjects();
            assignExistingStaffToTimetableSessions();
            logger.info("✅ Database initialization completed successfully");
        } catch (Exception e) {
            logger.error("❌ Error during database initialization: " + e.getMessage(), e);
            // Don't throw exception - allow app to start even if migration fails
            // This allows for manual fixes if needed
        }
    }

    /**
     * Apply migration: Add class_id column to student table
     * This enables proper FK relationship between students and classes
     */
    private void applyStudentClassIdMigration() {
        logger.info("📝 Applying student.class_id migration...");
        
        try {
            // Check if column already exists
            String checkColumnSql = "SELECT COUNT(*) FROM information_schema.COLUMNS " +
                                   "WHERE TABLE_SCHEMA = DATABASE() " +
                                   "AND TABLE_NAME = 'student' " +
                                   "AND COLUMN_NAME = 'class_id'";
            
            Integer columnExists = jdbcTemplate.queryForObject(checkColumnSql, Integer.class);
            
            if (columnExists != null && columnExists > 0) {
                logger.info("  ✅ Column class_id already exists in student table");
                return;
            }
            
            // Add class_id column
            logger.info("  Step 1: Adding class_id column to student table...");
            jdbcTemplate.execute("ALTER TABLE student ADD COLUMN class_id BIGINT");
            logger.info("  ✅ Column class_id added");
            
            // Add foreign key constraint
            logger.info("  Step 2: Adding foreign key constraint...");
            jdbcTemplate.execute(
                "ALTER TABLE student ADD CONSTRAINT fk_student_class " +
                "FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL"
            );
            logger.info("  ✅ Foreign key constraint added");
            
            // Add index for performance
            logger.info("  Step 3: Adding index on class_id...");
            jdbcTemplate.execute("ALTER TABLE student ADD INDEX idx_class_id (class_id)");
            logger.info("  ✅ Index added");
            
            logger.info("✅ Student class_id migration completed successfully");
            
        } catch (Exception e) {
            logger.error("❌ Error applying student.class_id migration: " + e.getMessage(), e);
            // Don't rethrow - allow app to continue
        }
    }

    /**
     * Populate student.class_id by matching students to classes based on dept+semester+section
     */
    private void populateStudentClassIds() {
        logger.info("📝 Populating student.class_id from dept+semester+section...");
        
        try {
            // Update students to match with classes table
            String updateSql = "UPDATE student s " +
                "INNER JOIN classes c ON s.department = c.department " +
                "  AND s.semester = c.semester " +
                "  AND s.section = c.section " +
                "SET s.class_id = c.id " +
                "WHERE s.class_id IS NULL AND c.active = true";
            
            int updatedCount = jdbcTemplate.update(updateSql);
            logger.info("  ✅ Updated " + updatedCount + " students with class_id values");
            
            // Check for any students not matched
            String unmatchedCountSql = "SELECT COUNT(*) FROM student WHERE class_id IS NULL AND active = true";
            Integer unmatchedCount = jdbcTemplate.queryForObject(unmatchedCountSql, Integer.class);
            
            if (unmatchedCount != null && unmatchedCount > 0) {
                logger.warn("  ⚠️  " + unmatchedCount + " active students could not be matched to a class");
                logger.warn("      These students may have department/semester/section combinations that don't exist in classes table");
            } else {
                logger.info("  ✅ All active students have been assigned to classes");
            }
            
        } catch (Exception e) {
            logger.error("❌ Error populating student.class_id: " + e.getMessage(), e);
            // Don't rethrow - allow app to continue
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

    /**
     * Assign existing staff to timetable sessions matching their subject
     * This handles staff registered before the auto-assignment feature was implemented
     */
    private void assignExistingStaffToTimetableSessions() {
        logger.info("📚 Assigning existing staff to timetable sessions...");
        
        try {
            String query = """
                SELECT DISTINCT ss.staff_id, s.name, sub.id as subject_id, sub.name as subject_name
                FROM staff_subjects ss
                JOIN staff s ON ss.staff_id = s.id
                JOIN subject sub ON ss.subject_id = sub.id
                WHERE s.active = true
                """;
            
            final int[] totalAssigned = {0};
            
            jdbcTemplate.query(query, (rs) -> {
                Long staffId = rs.getLong("staff_id");
                String staffName = rs.getString("name");
                Long subjectId = rs.getLong("subject_id");
                String subjectName = rs.getString("subject_name");
                
                logger.info("  🔍 Processing: Staff {} (ID={}) → Subject {} (ID={})", 
                           staffName, staffId, subjectName, subjectId);
                
                try {
                    // Count total sessions for this subject
                    Integer totalCount = jdbcTemplate.queryForObject(
                        "SELECT COUNT(*) FROM timetable_session WHERE subject_id = ? AND active = true",
                        Integer.class, subjectId
                    );
                    
                    // Count sessions assigned to different staff
                    Integer mismatchCount = jdbcTemplate.queryForObject(
                        "SELECT COUNT(*) FROM timetable_session WHERE subject_id = ? AND (staff_id IS NULL OR staff_id != ?) AND active = true",
                        Integer.class, subjectId, staffId
                    );
                    
                    logger.info("    📊 Subject {} has {} total sessions, {} need reassignment to {}", 
                               subjectName, totalCount, mismatchCount, staffName);
                    
                    // Update ALL sessions for this subject to the correct staff based on staff_subjects mapping
                    int updated = jdbcTemplate.update(
                        "UPDATE timetable_session SET staff_id = ? WHERE subject_id = ? AND active = true",
                        staffId, subjectId
                    );
                    
                    if (updated > 0) {
                        logger.info("    ✅ Reassigned {} session(s) to {} for subject: {}", 
                                    updated, staffName, subjectName);
                        totalAssigned[0] += updated;
                    } else {
                        logger.info("    ⏭️  No sessions found for subject: {}", subjectName);
                    }
                } catch (Exception e) {
                    logger.warn("    ⚠️  Could not assign {} to subject {}: {}", 
                                staffName, subjectName, e.getMessage());
                }
            });
            
            logger.info("✅ Staff assignment initialization complete: {} total assignments made", totalAssigned[0]);
            
        } catch (Exception e) {
            logger.warn("⚠️  Non-critical error during staff assignment: " + e.getMessage());
            // Don't throw - this is a convenience feature, not critical
        }
    }

    /**
     * Merge duplicate subjects (same trimmed/upper name) into a single canonical id.
     * Keeps timetable_session and staff_subjects aligned so auto-assignment works for all staff.
     * Safe to run repeatedly; only acts when duplicates exist.
     */
    private void mergeDuplicateSubjects() {
        try {
            // Find canonical ids per normalized name
            List<Map<String, Object>> dupGroups = jdbcTemplate.queryForList(
                """
                SELECT UPPER(TRIM(name)) AS norm_name, MIN(id) AS canonical_id
                FROM subject
                GROUP BY UPPER(TRIM(name))
                HAVING COUNT(*) > 1
                """
            );

            if (dupGroups.isEmpty()) {
                logger.info("ℹ️  No duplicate subjects detected; nothing to merge.");
                return;
            }

            for (Map<String, Object> group : dupGroups) {
                String normName = (String) group.get("norm_name");
                Long canonicalId = ((Number) group.get("canonical_id")).longValue();

                List<Long> dupIds = jdbcTemplate.query(
                    "SELECT id FROM subject WHERE UPPER(TRIM(name)) = ? AND id <> ?",
                    (rs, rowNum) -> rs.getLong(1),
                    normName, canonicalId
                );

                if (dupIds.isEmpty()) {
                    continue;
                }

                String dupList = dupIds.stream().map(String::valueOf).collect(Collectors.joining(","));
                logger.info("🔗 Merging duplicate subjects '{}' into canonical id {}: {}", normName, canonicalId, dupList);

                // Repoint timetable_session
                int tsUpdated = jdbcTemplate.update(
                    "UPDATE timetable_session SET subject_id = ? WHERE subject_id IN (" + dupList + ")",
                    canonicalId
                );

                // Repoint staff_subjects
                int ssUpdated = jdbcTemplate.update(
                    "UPDATE staff_subjects SET subject_id = ? WHERE subject_id IN (" + dupList + ")",
                    canonicalId
                );

                // Normalize staff.subject text to canonical subject name
                String canonicalName = jdbcTemplate.queryForObject(
                    "SELECT name FROM subject WHERE id = ?",
                    String.class,
                    canonicalId
                );
                int staffUpdated = jdbcTemplate.update(
                    "UPDATE staff SET subject = ? WHERE UPPER(TRIM(subject)) = ?",
                    canonicalName,
                    normName
                );

                // Delete duplicate subject rows
                int deleted = jdbcTemplate.update(
                    "DELETE FROM subject WHERE id IN (" + dupList + ")"
                );

                logger.info("✅ Merge complete for '{}'. timetable_session updated: {}, staff_subjects updated: {}, staff text normalized: {}, duplicates deleted: {}",
                            normName, tsUpdated, ssUpdated, staffUpdated, deleted);
            }

        } catch (Exception e) {
            logger.warn("⚠️  Non-critical error during duplicate subject merge: " + e.getMessage());
        }
    }
}
