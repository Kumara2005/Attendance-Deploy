
import React from 'react';
import { Bell, Search, User as UserIcon, Command, GraduationCap, Shield } from 'lucide-react';
import { User, UserRole } from '../types';

interface HeaderProps { user: User; }

const Header: React.FC<HeaderProps> = ({ user }) => {
  return (
    <header className="h-20 bg-white border-b border-slate-100 px-10 flex items-center justify-between z-10 sticky top-0 backdrop-blur-xl bg-white/70">
      {/* Role-Based Console Badge */}
      <div className="flex items-center gap-4">
        {user.role === UserRole.STUDENT ? (
          <div className="flex items-center gap-2.5 px-4 py-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/20">
            <GraduationCap className="w-4 h-4 text-white" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Student Console</span>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 px-4 py-2 bg-slate-900 rounded-xl shadow-lg">
            <Shield className="w-4 h-4 text-white" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Admin Console</span>
          </div>
        )}
      </div>

      <div className="relative w-[30rem] hidden md:block">
        <span className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-400" />
        </span>
        <input
          type="text"
          className="block w-full pl-14 pr-16 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all placeholder:text-slate-400 font-medium"
          placeholder="Search datasets, students or archives..."
        />
        <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2 py-1 bg-white rounded-lg border border-slate-200">
           <Command className="w-3 h-3 text-slate-400" />
           <span className="text-[10px] font-bold text-slate-400 uppercase">K</span>
        </div>
      </div>

      <div className="flex items-center gap-8">
        <button className="relative p-3 text-slate-400 hover:bg-slate-50 hover:text-indigo-600 rounded-2xl transition-all group">
          <Bell className="w-5.5 h-5.5" />
          <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-indigo-600 rounded-full border-2 border-white group-hover:animate-ping"></span>
        </button>

        <div className="flex items-center gap-5 pl-8 border-l border-slate-100">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-slate-900 tracking-tight">{user.name}</p>
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-0.5">
              {user.role === UserRole.STUDENT ? 'STUDENT IDENTITY' : `${user.role} IDENTITY`}
            </p>
          </div>
          {user.avatar ? (
            <div className="relative">
               <img src={user.avatar} alt={user.name} className="w-11 h-11 rounded-2xl border-2 border-slate-100 object-cover hover:scale-105 transition-transform cursor-pointer" />
               <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-white"></div>
            </div>
          ) : (
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
              <UserIcon className="w-6 h-6" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
