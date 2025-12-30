import React from 'react';
import { GraduationCap } from 'lucide-react';

const StudentPortalTest: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="text-center p-16 bg-white rounded-[4rem] border-4 border-indigo-600 shadow-2xl">
        <div className="w-24 h-24 bg-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-indigo-600/20">
          <GraduationCap className="w-16 h-16 text-white" />
        </div>
        <h1 className="text-7xl font-black text-slate-900 tracking-tighter mb-6">
          ✅ Student Dashboard Active
        </h1>
        <p className="text-2xl font-bold text-indigo-600 mb-4">
          Routing is working correctly!
        </p>
        <p className="text-lg text-slate-600 font-medium">
          Identity: Alex Rivera (CS-Y1-100)
        </p>
        <div className="mt-8 px-8 py-4 bg-green-50 text-green-600 rounded-[2rem] border border-green-100 inline-block">
          <span className="text-sm font-black uppercase tracking-widest">✓ Component Loaded Successfully</span>
        </div>
      </div>
    </div>
  );
};

export default StudentPortalTest;
