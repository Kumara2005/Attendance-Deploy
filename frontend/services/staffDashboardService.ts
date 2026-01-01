import apiClient, { ApiResponse, extractData } from './api';

export interface StaffInfoDTO {
  id: string;
  name: string;
  email: string;
  department: string;
  subject?: string;
  employeeCode?: string;
}

export interface AssignedClassDTO {
  year: string;
  department: string;
  className: string;
  section: string;
  subject: string;
  studentCount: number;
  averageAttendance: number;
}

export interface TodaySessionDTO {
  sessionId: number;
  startTime: string;
  endTime: string;
  subject: string;
  className: string;
  location?: string;
  attendanceMarked: boolean;
  department: string;
  semester: number;
  section: string;
}

export interface StaffDashboardDTO {
  staffInfo: StaffInfoDTO;
  assignedClasses: AssignedClassDTO[];
  todaySessions: TodaySessionDTO[];
}

/**
 * Staff Dashboard Service
 * Handles staff-specific dashboard data
 */
export const staffDashboardService = {
  /**
   * Get complete staff dashboard data
   * Requires authentication
   */
  getDashboard: async (): Promise<StaffDashboardDTO> => {
    const response = await apiClient.get<ApiResponse<StaffDashboardDTO>>('/staff/dashboard');
    return extractData<StaffDashboardDTO>(response);
  },

  /**
   * Get assigned classes for the logged-in staff member
   */
  getAssignedClasses: async (): Promise<AssignedClassDTO[]> => {
    const response = await apiClient.get<ApiResponse<AssignedClassDTO[]>>('/staff/dashboard/classes');
    return extractData<AssignedClassDTO[]>(response);
  },

  /**
   * Get today's teaching sessions
   */
  getTodaySessions: async (): Promise<TodaySessionDTO[]> => {
    const response = await apiClient.get<ApiResponse<TodaySessionDTO[]>>('/staff/dashboard/sessions/today');
    return extractData<TodaySessionDTO[]>(response);
  }
};

export default staffDashboardService;
