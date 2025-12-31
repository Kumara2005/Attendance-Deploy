import apiClient, { ApiResponse, extractData } from './api';
import { normalizeRole } from './roles';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  username: string;
  role: string; // Can be ROLE_ADMIN, ROLE_STAFF, ROLE_STUDENT
  userId: number | string;
  name: string;
  email: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * Authentication Service
 * Handles JWT-based authentication with the deployed backend
 */
export const authService = {
  /**
   * Login with username and password against the deployed backend
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
    const data = extractData<LoginResponse>(response);
    
    // Store authentication tokens and user data
    if (data.token) {
      // Normalize role before storing (handles ROLE_ADMIN -> ADMIN conversion)
      const normalizedRole = normalizeRole(data.role);
      
      // Store tokens with correct keys
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user_data', JSON.stringify({
        userId: data.userId,
        username: data.username,
        name: data.name,
        email: data.email,
        role: normalizedRole, // Store normalized role for consistency
      }));
    }
    
    return data;
  },

  /**
   * Refresh access token using refresh token
   */
  refreshToken: async (): Promise<LoginResponse> => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      '/auth/refresh', 
      null,
      { params: { refreshToken } }
    );
    const data = extractData<LoginResponse>(response);

    // Update stored tokens
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
    }

    return data;
  },

  /**
   * Logout and clear stored authentication data
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user_data');
  },

  /**
   * Check if user is currently authenticated
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },

  /**
   * Get current user data from localStorage
   */
  getCurrentUser: (): any | null => {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  },
};

export default authService;
