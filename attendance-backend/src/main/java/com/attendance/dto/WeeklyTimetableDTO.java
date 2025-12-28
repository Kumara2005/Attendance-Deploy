package com.attendance.dto;

import java.util.List;
import java.util.Map;

/**
 * DTO for Weekly Timetable
 * Maps to: StudentPortal.tsx -> MASTER_TIMETABLE
 */
public class WeeklyTimetableDTO {
    
    private Map<String, List<TimetableSlotDTO>> schedule;
    
    // Constructors
    public WeeklyTimetableDTO() {}
    
    public WeeklyTimetableDTO(Map<String, List<TimetableSlotDTO>> schedule) {
        this.schedule = schedule;
    }
    
    // Getters and Setters
    public Map<String, List<TimetableSlotDTO>> getSchedule() {
        return schedule;
    }
    
    public void setSchedule(Map<String, List<TimetableSlotDTO>> schedule) {
        this.schedule = schedule;
    }
    
    /**
     * Individual Timetable Slot DTO
     * Maps to: MASTER_TIMETABLE items (startTime, endTime, subject, faculty, location)
     */
    public static class TimetableSlotDTO {
        private String startTime;
        private String endTime;
        private String subject;
        private String faculty;
        private String location;
        
        // Constructors
        public TimetableSlotDTO() {}
        
        public TimetableSlotDTO(String startTime, String endTime, String subject, 
                               String faculty, String location) {
            this.startTime = startTime;
            this.endTime = endTime;
            this.subject = subject;
            this.faculty = faculty;
            this.location = location;
        }
        
        // Getters and Setters
        public String getStartTime() { return startTime; }
        public void setStartTime(String startTime) { this.startTime = startTime; }
        
        public String getEndTime() { return endTime; }
        public void setEndTime(String endTime) { this.endTime = endTime; }
        
        public String getSubject() { return subject; }
        public void setSubject(String subject) { this.subject = subject; }
        
        public String getFaculty() { return faculty; }
        public void setFaculty(String faculty) { this.faculty = faculty; }
        
        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }
    }
}
