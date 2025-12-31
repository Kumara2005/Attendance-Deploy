import { apiClient } from './api';

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
 * GET /api/student/dashboard
 */
export const getStudentDashboard = async (): Promise<StudentDashboard> => {
  const response = await apiClient.get<{ data: StudentDashboard }>('/api/student/dashboard');
  return response.data.data;
};

/**
 * Fetch only attendance data
 * GET /api/student/dashboard/attendance
 */
export const getStudentAttendance = async (): Promise<SubjectAttendance[]> => {
  const response = await apiClient.get<{ data: SubjectAttendance[] }>('/api/student/dashboard/attendance');
  return response.data.data;
};

/**
 * Fetch weekly timetable
 * GET /api/student/dashboard/timetable
 */
export const getStudentTimetable = async (): Promise<WeeklyTimetable> => {
  const response = await apiClient.get<{ data: WeeklyTimetable }>('/api/student/dashboard/timetable');
  return response.data.data;
};

/**
 * Fetch today's timetable only
 * GET /api/student/dashboard/timetable/today
 */
export const getTodayTimetable = async (): Promise<TimetableSlot[]> => {
  const response = await apiClient.get<{ data: TimetableSlot[] }>('/api/student/dashboard/timetable/today');
  return response.data.data;
};
