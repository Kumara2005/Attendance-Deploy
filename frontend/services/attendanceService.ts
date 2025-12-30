import apiClient, { ApiResponse, extractData } from './api';

export interface AttendanceRecord {
  id?: number;
  studentId: number;
  sessionId: number;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  markedBy: string;
  remarks?: string;
}

export interface SessionAttendance {
  id?: number;
  sessionId: number;
  date: string;
  studentId: number;
  status: string;
}

/**
 * Attendance Service
 */
export const attendanceService = {
  /**
   * Mark attendance for a session
   */
  markAttendance: async (attendance: SessionAttendance): Promise<SessionAttendance> => {
    const response = await apiClient.post<ApiResponse<SessionAttendance>>(
      '/attendance/session',
      attendance
    );
    return extractData<SessionAttendance>(response);
  },

  /**
   * Get attendance records by date
   */
  getByDate: async (date: string): Promise<AttendanceRecord[]> => {
    const response = await apiClient.get<ApiResponse<AttendanceRecord[]>>(
      '/attendance/date',
      { params: { date } }
    );
    return extractData<AttendanceRecord[]>(response);
  },

  /**
   * Get attendance records for a student
   */
  getByStudent: async (studentId: number): Promise<AttendanceRecord[]> => {
    const response = await apiClient.get<ApiResponse<AttendanceRecord[]>>(
      `/attendance/student/${studentId}`
    );
    return extractData<AttendanceRecord[]>(response);
  },

  /**
   * Get attendance report
   */
  getReport: async (filters: {
    startDate?: string;
    endDate?: string;
    department?: string;
    semester?: number;
  }): Promise<any> => {
    const response = await apiClient.get<ApiResponse<any>>('/reports/attendance', {
      params: filters,
    });
    return extractData<any>(response);
  },
};

export default attendanceService;
