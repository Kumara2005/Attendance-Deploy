import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

/**
 * Axios instance configured for the attendance management API
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 10000,
});

/**
 * Request interceptor - Add JWT token to requests (except teacher endpoints)
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Skip authentication for teacher endpoints (they're public)
    const isTeacherEndpoint = config.url?.includes('/teacher/');
    
    if (!isTeacherEndpoint) {
      const token = localStorage.getItem('jwt_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - Handle errors globally
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const isTeacherEndpoint = error.config?.url?.includes('/teacher/');
    
    if (error.response?.status === 401) {
      // Token expired or invalid - but don't redirect for teacher endpoints
      if (!isTeacherEndpoint) {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
        window.location.href = '/#/login';
      } else {
        console.warn('Authentication issue on teacher endpoint (endpoint should be public)');
      }
    } else if (error.response?.status === 403) {
      if (!isTeacherEndpoint) {
        console.error('Access denied');
      } else {
        console.error('Access denied to teacher endpoint - this should not happen!');
      }
    } else if (error.response?.status === 500) {
      console.error('Server error');
    }
    return Promise.reject(error);
  }
);

export default apiClient;

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: string;
}

/**
 * Helper function to extract data from API response
 */
export function extractData<T>(response: any): T {
  return response.data?.data || response.data;
}
