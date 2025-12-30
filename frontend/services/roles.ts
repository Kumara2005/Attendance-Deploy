/**
 * Role Management Service
 * Centralizes role handling and normalization
 */

export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  STUDENT = 'STUDENT'
}

/**
 * Normalizes role strings from backend to standard UserRole enum
 * Handles both ROLE_ADMIN and ADMIN formats
 */
export const normalizeRole = (role: string): UserRole => {
  const upperRole = role.toUpperCase();
  
  // Handle ROLE_ADMIN format
  if (upperRole === 'ROLE_ADMIN' || upperRole === 'ADMIN') {
    return UserRole.ADMIN;
  }
  if (upperRole === 'ROLE_STAFF' || upperRole === 'STAFF') {
    return UserRole.STAFF;
  }
  if (upperRole === 'ROLE_STUDENT' || upperRole === 'STUDENT') {
    return UserRole.STUDENT;
  }
  
  throw new Error(`Unknown role: ${role}`);
};

/**
 * Gets the current user's role from localStorage
 * Returns null if not authenticated
 */
export const getCurrentRole = (): UserRole | null => {
  try {
    const authData = localStorage.getItem('user_data');
    if (!authData) return null;
    
    const user = JSON.parse(authData);
    return normalizeRole(user.role);
  } catch (error) {
    console.error('Error reading role from localStorage:', error);
    return null;
  }
};

/**
 * Checks if user has a specific role
 */
export const hasRole = (requiredRole: UserRole): boolean => {
  const currentRole = getCurrentRole();
  return currentRole === requiredRole;
};

/**
 * Checks if user is authenticated (has any valid role)
 */
export const isAuthenticated = (): boolean => {
  return getCurrentRole() !== null && !!localStorage.getItem('jwt_token');
};
