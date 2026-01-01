import apiClient, { ApiResponse, extractData } from './api';

export interface AttendanceReportDTO {
  studentId: number;
  studentName: string;
  rollNumber: string;
  department: string;
  semester: number;
  section: string;
  year: string;
  totalSessions: number;
  presentSessions: number;
  attendancePercentage: number;
  complianceStatus: string;
}

/**
 * Report Service
 * Handles attendance report generation
 */
export const reportService = {
  /**
   * Get daily attendance report
   */
  getDailyReport: async (
    date: string,
    department?: string,
    year?: number
  ): Promise<AttendanceReportDTO[]> => {
    const params: any = { date };
    if (department) params.department = department;
    if (year) params.year = year;

    const response = await apiClient.get<ApiResponse<AttendanceReportDTO[]>>(
      '/reports/daily',
      { params }
    );
    return extractData<AttendanceReportDTO[]>(response);
  },

  /**
   * Get periodic (date range) attendance report
   */
  getPeriodicReport: async (
    fromDate: string,
    toDate: string,
    department?: string,
    year?: number
  ): Promise<AttendanceReportDTO[]> => {
    const params: any = { fromDate, toDate };
    if (department) params.department = department;
    if (year) params.year = year;

    const response = await apiClient.get<ApiResponse<AttendanceReportDTO[]>>(
      '/reports/periodic',
      { params }
    );
    return extractData<AttendanceReportDTO[]>(response);
  },

  /**
   * Get semester-wise attendance report
   */
  getSemesterReport: async (
    department?: string,
    year?: number,
    semester?: number
  ): Promise<AttendanceReportDTO[]> => {
    const params: any = {};
    if (department) params.department = department;
    if (year) params.year = year;
    if (semester) params.semester = semester;

    const response = await apiClient.get<ApiResponse<AttendanceReportDTO[]>>(
      '/reports/semester-wise',
      { params }
    );
    return extractData<AttendanceReportDTO[]>(response);
  },

  /**
   * Get attendance report for a specific student
   */
  getStudentReport: async (
    rollNumber: string,
    fromDate?: string,
    toDate?: string
  ): Promise<AttendanceReportDTO> => {
    const params: any = {};
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;

    const response = await apiClient.get<ApiResponse<AttendanceReportDTO>>(
      `/reports/student/${rollNumber}`,
      { params }
    );
    return extractData<AttendanceReportDTO>(response);
  },
};

export default reportService;
