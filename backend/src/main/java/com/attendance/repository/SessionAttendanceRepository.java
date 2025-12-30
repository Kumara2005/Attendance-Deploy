package com.attendance.repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.attendance.model.SessionAttendance;


public interface SessionAttendanceRepository extends JpaRepository<SessionAttendance, Long> {

	List<SessionAttendance> findByStudentId(Long studentId);

	List<SessionAttendance> findByTimetableSessionId(Long sessionId);

	List<SessionAttendance> findByTimetableSessionSubjectId(Long subjectId);

	List<SessionAttendance> findByDate(LocalDate date);

	List<SessionAttendance> findByDateBetween(LocalDate from, LocalDate to);
	
	Optional<SessionAttendance>
	findByStudentIdAndTimetableSessionIdAndDate(
	    Long studentId,
	    Long sessionId,
	    LocalDate date
	);
	
	// Additional queries for statistics
	@Query("SELECT ts.subject.subjectName, " +
	       "SUM(CASE WHEN sa.status = 'Present' THEN 1 ELSE 0 END), " +
	       "COUNT(sa) " +
	       "FROM SessionAttendance sa " +
	       "JOIN sa.timetableSession ts " +
	       "WHERE sa.student.id = :studentId " +
	       "GROUP BY ts.subject.subjectName")
	List<Object[]> findAttendanceByStudentGroupedBySubject(@Param("studentId") Long studentId);
	
	@Query("SELECT AVG(CAST(SUM(CASE WHEN sa.status = 'Present' THEN 1 ELSE 0 END) AS double) * 100.0 / COUNT(sa)) " +
	       "FROM SessionAttendance sa GROUP BY sa.student.id")
	Double calculateOverallAttendancePercentage();
	
	@Query("SELECT AVG(CAST(SUM(CASE WHEN sa.status = 'Present' THEN 1 ELSE 0 END) AS double) * 100.0 / COUNT(sa)) " +
	       "FROM SessionAttendance sa " +
	       "JOIN sa.timetableSession ts " +
	       "WHERE ts.department = :department AND ts.semester = :semester " +
	       "GROUP BY sa.student.id")
	Double calculateAverageAttendanceByDepartmentAndSemester(
	        @Param("department") String department, 
	        @Param("semester") int semester);
	
	boolean existsByTimetableSessionSubjectIdAndDateAndTimetableSessionStartTime(
	        Long subjectId, LocalDate date, LocalTime sessionTime);

}