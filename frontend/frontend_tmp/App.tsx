
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardRouter from './pages/DashboardRouter';
import StudentManagement from './pages/StudentManagement';
import AttendanceMarking from './pages/AttendanceMarking';
import StaffTimetable from './pages/StaffTimetable';
import Reports from './pages/Reports';
import AdminSettings from './pages/AdminSettings';
import TimetableManagement from './pages/TimetableManagement';
import StudentPortal from './pages/StudentPortal';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { User, UserRole } from './types';
import { MOCK_ADMIN, MOCK_STAFF } from './constants';
import { getCurrentRole } from './services/roles';

const AppContent: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  // On mount, check if user is already logged in via localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const userData = localStorage.getItem('user_data');
        const token = localStorage.getItem('jwt_token');
        
        if (userData && token) {
          const parsedUser = JSON.parse(userData);
          const role = getCurrentRole();
          
          if (role) {
            // Reconstruct user object from localStorage
            const reconstructedUser: User = {
              id: parsedUser.userId?.toString() || '1',
              name: parsedUser.name || parsedUser.username,
              email: parsedUser.email || `${parsedUser.username}@attendx.edu`,
              role: role
            };
            
            setUser(reconstructedUser);
            (window as any).currentUserRole = role;
            (window as any).currentUser = reconstructedUser;
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear invalid data
        localStorage.removeItem('user_data');
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('refresh_token');
      }
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    if (user) {
      (window as any).currentUserRole = user.role;
      (window as any).currentUser = user;
    }
  }, [user]);

  const login = (role: UserRole, email?: string) => {
    // Get the actual user data from localStorage (already stored by authService)
    const userData = localStorage.getItem('user_data');
    
    if (userData) {
      const parsedUser = JSON.parse(userData);
      const authenticatedUser: User = {
        id: parsedUser.userId?.toString() || '1',
        name: parsedUser.name || parsedUser.username,
        email: parsedUser.email || email || `${parsedUser.username}@attendx.edu`,
        role: role
      };
      setUser(authenticatedUser);
    } else {
      // Fallback to mock data if localStorage is not available (shouldn't happen)
      if (role === UserRole.ADMIN) {
        setUser(MOCK_ADMIN);
      } else if (role === UserRole.STAFF) {
        const staffUser = MOCK_STAFF.find(s => s.email === email) || MOCK_STAFF[0];
        setUser(staffUser);
      } else {
        setUser({ 
          id: 's_1',
          name: 'Alex Rivera',
          email: 'alex@attendx.edu',
          role: UserRole.STUDENT
        });
      }
    }
  };

  const logout = () => {
    setUser(null);
    (window as any).currentUserRole = undefined;
    (window as any).currentUser = undefined;
    // Clear ALL localStorage including admin cache
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('attendx_admin_master_timetable');
    localStorage.removeItem('attendx_admin_period_timings');
    localStorage.removeItem('attendx_admin_break_timings');
    localStorage.removeItem('attendx_admin_curriculum');
    console.log('Logout: All cache cleared');
  };

  if (!user && !isLoginPage) {
    return <Navigate to="/login" replace />;
  }

  if (user && isLoginPage) {
    return <Navigate to="/dashboard" replace />;
  }

  // CRITICAL: Role-based component resolver with STRICT IDENTITY CHECK
  const getDashboardComponent = () => {
    // HARD-SWAP: Force student dashboard for Alex Rivera or any STUDENT role
    if (user?.name === 'Alex Rivera' || user?.role === UserRole.STUDENT) {
      console.log('🎓 STUDENT IDENTITY CONFIRMED: Rendering StudentPortal for', user?.name);
      return <StudentPortal key={user?.role} />; // key forces re-render on role change
    }
    console.log('👔 ADMIN/STAFF DETECTED: Rendering DashboardRouter for', user?.name);
    return <DashboardRouter key={user?.role} />;
  };

  const getTimetableComponent = () => {
    if (user?.role === UserRole.STUDENT) {
      console.log('🎓 STUDENT DETECTED: Rendering StudentPortal (Timetable)');
      return <StudentPortal />;
    }
    console.log('👔 ADMIN/STAFF DETECTED: Rendering TimetableManagement');
    return <TimetableManagement />;
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {!isLoginPage && user && <Sidebar user={user} logout={logout} />}
      
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {!isLoginPage && user && <Header user={user} />}
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Routes>
            <Route path="/login" element={<LoginPage onLogin={login} />} />
            <Route path="/dashboard" element={getDashboardComponent()} />
            <Route path="/student-portal" element={<StudentPortal />} />
            <Route path="/timetable" element={getTimetableComponent()} />
            <Route path="/students" element={<StudentManagement userRole={user?.role} />} />
            <Route path="/attendance" element={<AttendanceMarking />} />
            <Route path="/staff/timetable" element={<StaffTimetable />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<AdminSettings />} />
            <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
