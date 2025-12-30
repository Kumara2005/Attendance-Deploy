
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  FileSpreadsheet, 
  Settings, 
  LogOut,
  GraduationCap,
  ShieldAlert,
  BookMarked
} from 'lucide-react';
import { User, UserRole } from '../types';

interface SidebarProps {
  user: User;
  logout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, logout }) => {
  const menuItems = [
    { 
      name: 'Dashboard', 
      icon: LayoutDashboard, 
      path: '/dashboard', // All users go to /dashboard, App.tsx handles role-based rendering
      roles: [UserRole.ADMIN, UserRole.STAFF, UserRole.STUDENT] 
    },
    { 
      name: 'Students', 
      icon: Users, 
      path: '/students', 
      roles: [UserRole.ADMIN, UserRole.STAFF],
    },
    { 
      name: 'Faculty Directory', 
      icon: Users, 
      path: '/dashboard', // Students see Faculty tab in StudentPortal
      roles: [UserRole.STUDENT],
      isStudentTab: true
    },
    { 
      name: 'My Timeline', 
      icon: CalendarCheck, 
      path: '/timetable', // Student timetable view
      roles: [UserRole.STUDENT]
    },
    { 
      name: 'Attendance', 
      icon: CalendarCheck, 
      path: '/attendance', 
      roles: [UserRole.STAFF]
    },
    { 
      name: 'My Timetable', 
      icon: BookMarked, 
      path: '/staff/timetable', 
      roles: [UserRole.STAFF]
    },
    { 
      name: 'Reports', 
      icon: FileSpreadsheet, 
      path: '/reports', 
      roles: [UserRole.STAFF, UserRole.STUDENT] 
    },
    { 
      name: 'Settings', 
      icon: Settings, 
      path: '/settings', 
      roles: [UserRole.ADMIN] 
    },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(user.role));

  return (
    <aside className="w-80 bg-white text-slate-900 flex flex-col h-full border-r border-slate-100 relative z-30 shadow-sm">
      {/* Sidebar Header */}
      <div className="p-10 flex items-center gap-5">
        <div className="bg-indigo-600 p-3 rounded-2xl shadow-xl shadow-indigo-600/20 group cursor-pointer hover:rotate-12 transition-transform duration-500">
          <GraduationCap className="w-8 h-8 text-white" />
        </div>
        <div>
           <span className="text-3xl font-black tracking-tighter block leading-none text-slate-900">AttendX</span>
           <span className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.3em] mt-1.5 block opacity-80">Online OS</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-4 px-6 space-y-2 overflow-y-auto custom-scrollbar">
        {filteredItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group relative
                ${isActive 
                  ? 'bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}
              `}
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-5 h-5 transition-transform duration-500 ${isActive ? 'scale-110 text-indigo-600' : 'group-hover:scale-110 group-hover:text-indigo-600'}`} />
                  <span className="font-bold text-sm tracking-tight">{item.name}</span>
                  {isActive && (
                    <div className="absolute right-4 w-1.5 h-1.5 bg-indigo-600 rounded-full shadow-[0_0_8px_rgba(79,70,229,0.4)]"></div>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-8">
        <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100 mb-6 group hover:border-indigo-500/30 transition-all">
           <div className="flex items-center gap-3 mb-2">
              <ShieldAlert className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Compliance Verified</span>
           </div>
           <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-slate-900">100%</span>
              <span className="text-[10px] font-bold text-emerald-600 uppercase">Secure</span>
           </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-4 w-full px-6 py-4 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all font-bold text-sm group"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          End Session
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
