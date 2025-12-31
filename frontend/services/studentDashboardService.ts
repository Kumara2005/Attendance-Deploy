import apiClient from './api';

/**
 * Student Dashboard Service
 * Handles all API calls for Student Portal (StudentPortal.tsx)
 */

// Types matching backend DTOs
export interface StudentIdentity {
  id: string;
  rollNumber: string;
  name: string;
  className: string;
  section: string;
  year: string;
  department: string;
}

export interface SubjectAttendance {
  subject: string;
  attended: number;
  total: number;
  percentage: number;
}

export interface TimetableSlot {
  startTime: string;
  endTime: string;
  subject: string;
  faculty: string;
  location: string;
}

export interface WeeklyTimetable {
  [day: string]: TimetableSlot[];
}

export interface StudentDashboard {
  identity: StudentIdentity;
  overallAttendancePercentage: number;
  subjectAttendance: SubjectAttendance[];
  weeklyTimetable: WeeklyTimetable;
}

/**
 * Fetch complete student dashboard
 * GET /student/dashboard
 */
export const getStudentDashboard = async (): Promise<StudentDashboard> => {
  const response = await apiClient.get<{ data: StudentDashboard }>('/student/dashboard');
  return response.data.data;
};

/**
 * Fetch only attendance data
 * GET /student/dashboard/attendance
 */
export const getStudentAttendance = async (): Promise<SubjectAttendance[]> => {
  const response = await apiClient.get<{ data: SubjectAttendance[] }>('/student/dashboard/attendance');
  return response.data.data;
};

/**
 * Fetch weekly timetable
 * GET /student/dashboard/timetable
 */
export const getStudentTimetable = async (): Promise<WeeklyTimetable> => {
  const response = await apiClient.get<{ data: WeeklyTimetable }>('/student/dashboard/timetable');
  return response.data.data;
};

/**
 * Fetch today's timetable only
 * GET /student/dashboard/timetable/today
 */
export const getTodayTimetable = async (): Promise<TimetableSlot[]> => {
  const response = await apiClient.get<{ data: TimetableSlot[] }>('/student/dashboard/timetable/today');
  return response.data.data;
};
