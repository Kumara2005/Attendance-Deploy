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

export interface Faculty {
  id: string;
  name: string;
  staffCode: string;
  department: string;
  subject: string;
  qualification: string;
  experience: string;
  phone: string;
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
  console.log('🔍 Fetching student dashboard...');
  const response = await apiClient.get<{ data: StudentDashboard }>('/student/dashboard');
  console.log('✅ Dashboard data received:', response.data.data);
  return response.data.data;
};

/**
 * Fetch only attendance data
 * GET /api/student/dashboard/attendance
 */
export const getStudentAttendance = async (): Promise<SubjectAttendance[]> => {
  console.log('🔍 Fetching student attendance...');
  const response = await apiClient.get<{ data: SubjectAttendance[] }>('/student/dashboard/attendance');
  console.log('✅ Attendance data received:', response.data.data);
  return response.data.data;
};

/**
 * Fetch weekly timetable
 * GET /api/student/dashboard/timetable
 */
export const getStudentTimetable = async (): Promise<WeeklyTimetable> => {
  console.log('🔍 Fetching student timetable...');
  const response = await apiClient.get<{ data: WeeklyTimetable }>('/student/dashboard/timetable');
  console.log('✅ Timetable data received:', response.data.data);
  return response.data.data;
};

/**
 * Fetch today's timetable only
 * GET /api/student/dashboard/timetable/today
 */
export const getTodayTimetable = async (): Promise<TimetableSlot[]> => {
  console.log('🔍 Fetching today\'s timetable...');
  const response = await apiClient.get<{ data: TimetableSlot[] }>('/student/dashboard/timetable/today');
  console.log('✅ Today\'s timetable received:', response.data.data);
  return response.data.data;
};

/**
 * Fetch department faculty
 * GET /api/student/dashboard/faculty
 */
export const getDepartmentFaculty = async (): Promise<Faculty[]> => {
  console.log('👥 Fetching department faculty...');
  const response = await apiClient.get<{ data: Faculty[] }>('/student/dashboard/faculty');
  console.log('✅ Faculty data received:', response.data.data);
  return response.data.data;
};
