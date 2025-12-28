import React from 'react';
import { Navigate } from 'react-router-dom';
import { UserRole } from '../types';
import { getCurrentRole } from '../services/roles';
import Dashboard from './Dashboard';

const DashboardRouter: React.FC = () => {
  const role = getCurrentRole();

  // If no role found, redirect to login
  if (!role) {
    console.warn('No role found in localStorage, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Redirect students to their dedicated portal
  if (role === UserRole.STUDENT) {
    return <Navigate to="/student-portal" replace />;
  }

  // Pass the role to Dashboard component via window (temporary solution for existing Dashboard structure)
  // Set on window before rendering to ensure Dashboard reads the correct role
  (window as any).currentUserRole = role;

  // For now, we render the unified Dashboard component which internally handles role-based rendering
  // In future refactor, you could create separate AdminDashboard, StaffDashboard, StudentDashboard components
  return <Dashboard />;
};

export default DashboardRouter;
