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

  // NOTE: Student routing is handled in App.tsx now
  // This component should only be reached by Admin/Staff
  console.log('DashboardRouter: Rendering for role:', role);

  // Pass the role to Dashboard component via window
  (window as any).currentUserRole = role;

  return <Dashboard />;
};

export default DashboardRouter;
