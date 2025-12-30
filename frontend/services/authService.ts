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
  role: string;
  userId: number;
  name: string;
  email: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * Authentication Service
 */
export const authService = {
  /**
   * Login with username and password
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
    const data = extractData<LoginResponse>(response);
    
    // Store authentication data with normalized role
    if (data.token) {
      // Normalize role before storing (handles ROLE_ADMIN -> ADMIN conversion)
      const normalizedRole = normalizeRole(data.role);
      
      localStorage.setItem('jwt_token', data.token);
      localStorage.setItem('refresh_token', data.refreshToken);
      localStorage.setItem('user_data', JSON.stringify({
        userId: data.userId,
        username: data.username,
        name: data.name,
        email: data.email,
        role: normalizedRole, // Store normalized role
      }));
    }
    
    return data;
  },

  /**
   * Refresh access token using refresh token
   */
  refreshToken: async (): Promise<LoginResponse> => {
    const refreshToken = localStorage.getItem('refresh_token');
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
      localStorage.setItem('jwt_token', data.token);
      localStorage.setItem('refresh_token', data.refreshToken);
    }

    return data;
  },

  /**
   * Logout and clear stored data
   */
  logout: () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('jwt_token');
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
