import apiClient, { ApiResponse, extractData } from './api';

export interface StudentDTO {
  id?: number;
  rollNo: string;
  name: string;
  department: string;
  semester: number;
  email?: string;
  phone?: string;
  section?: string;
  attendancePercentage?: number;
  status?: string;
}

/**
 * Student Service
 */
export const studentService = {
  /**
   * Get all students
   */
  getAll: async (): Promise<StudentDTO[]> => {
    const response = await apiClient.get<ApiResponse<StudentDTO[]>>('/students');
    return extractData<StudentDTO[]>(response);
  },

  /**
   * Get student by ID
   */
  getById: async (id: number): Promise<StudentDTO> => {
    const response = await apiClient.get<ApiResponse<StudentDTO>>(`/students/${id}`);
    return extractData<StudentDTO>(response);
  },

  /**
   * Create new student
   */
  create: async (student: StudentDTO): Promise<StudentDTO> => {
    const response = await apiClient.post<ApiResponse<StudentDTO>>('/students', student);
    return extractData<StudentDTO>(response);
  },

  /**
   * Update existing student
   */
  update: async (id: number, student: StudentDTO): Promise<StudentDTO> => {
    const response = await apiClient.put<ApiResponse<StudentDTO>>(`/students/${id}`, student);
    return extractData<StudentDTO>(response);
  },

  /**
   * Delete student
   */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/students/${id}`);
  },

  /**
   * Get student dashboard by roll number (public endpoint)
   */
  getDashboardByRollNo: async (rollNo: string): Promise<any> => {
    const response = await apiClient.get<ApiResponse<any>>(`/students/dashboard/${rollNo}`);
    return extractData<any>(response);
  },
};

export default studentService;
