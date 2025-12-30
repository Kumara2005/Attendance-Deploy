
import React, { useState, useMemo } from 'react';
import { FileText, PieChart as PieIcon, CheckCircle2, ShieldCheck, User, ChevronDown, CalendarDays } from 'lucide-react';
import { MOCK_STUDENTS } from '../constants';
import { UserRole, User as UserType, Student } from '../types';

const Reports: React.FC = () => {
  const role = (window as any).currentUserRole || UserRole.ADMIN;
  const currentUser = (window as any).currentUser as UserType;
  const isStudent = role === UserRole.STUDENT;

  const [reportType, setReportType] = useState<'Daily' | 'Monthly' | 'Semester'>('Daily');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('');

  const handleExport = (format: string) => {
    const reportSubject = isStudent ? 'Your personal' : reportType;
    const yearDetail = selectedYear ? ` for ${selectedYear}` : ' (All Years)';
    alert(`${reportSubject} Report${yearDetail} generated and downloaded as ${format.toUpperCase()}`);
  };

  // Filter Logic: Scoped by Student Identity (if student) and Academic Year
  const displayStudents = useMemo(() => {
    let filtered = MOCK_STUDENTS;
    
    // 1. Identity Isolation
    if (isStudent) {
      filtered = filtered.filter(s => s.name === currentUser?.name);
    }

    // 2. Academic Year Filter (Department Scoped by default if admin/staff usually looks at their own context)
    // For B.Sc Computer Science specifically as per requirements
    if (selectedYear && selectedYear !== 'All Years') {
      filtered = filtered.filter(s => s.year === selectedYear || s.section === selectedYear);
    }

    return filtered;
  }, [isStudent, currentUser, selectedYear]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">
            {isStudent ? 'My Attendance Reports' : 'Reports Module'}
          </h1>
          <p className="text-slate-500 font-medium mt-4">
            {isStudent 
              ? 'Download and review your historical institutional attendance records.' 
              : 'Quick report generation for analytical decision-making.'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleExport('pdf')}
            className="px-8 py-4 bg-rose-50 text-rose-600 border border-rose-200 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-rose-100 transition-all shadow-sm"
          >
            PDF Export
          </button>
          <button 
            onClick={() => handleExport('excel')}
            className="px-8 py-4 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-emerald-100 transition-all shadow-sm"
          >
            Excel Export
          </button>
        </div>
      </div>

      {isStudent && (
        <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white flex items-center justify-between shadow-xl shadow-indigo-600/10">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
              <User className="w-8 h-8" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-100">Authenticated Student</p>
              <h3 className="text-2xl font-black tracking-tight">{currentUser?.name}</h3>
            </div>
          </div>
          <div className="flex items-center gap-3 px-6 py-2 bg-white/10 rounded-xl border border-white/20">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Private Access Only</span>
          </div>
        </div>
      )}

      {/* Report Type Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <ReportTypeCard 
            title="Daily Summary" 
            active={reportType === 'Daily'} 
            onClick={() => setReportType('Daily')}
            description={isStudent ? "Your session analytics for today's classes." : "Specific session analytics for a single 24-hour cycle."}
          />
         <ReportTypeCard 
            title="Periodic (Range)" 
            active={reportType === 'Monthly'} 
            onClick={() => setReportType('Monthly')}
            description={isStudent ? "Your aggregated data for a selected date range." : "Aggregated data from specified start and end timestamps."}
          />
         <ReportTypeCard 
            title="Semester-wise" 
            active={reportType === 'Semester'} 
            onClick={() => setReportType('Semester')}
            description={isStudent ? "Your full academic period performance summary." : "Full academic period summary and trend analysis."}
          />
      </div>

      {/* Filters */}
      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
        <div className="flex flex-wrap gap-8 items-end">
          {/* Year Selection Dropdown - Added contextual filter */}
          {!isStudent && (
            <div className="flex-1 min-w-[200px]">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Select Academic Year</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                  <CalendarDays className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                </div>
                <select 
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-10 py-4 font-black text-sm text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100 transition-all appearance-none cursor-pointer"
                >
                  <option value="">All Years</option>
                  <option value="Year 1">Year 1</option>
                  <option value="Year 2">Year 2</option>
                  <option value="Year 3">Year 3</option>
                </select>
                <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>
          )}

          {reportType === 'Daily' && (
            <div className="flex-1 min-w-[200px]">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Target Date</label>
              <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-indigo-100 transition-all font-bold text-slate-900" />
            </div>
          )}
          {reportType === 'Monthly' && (
            <>
              <div className="flex-1 min-w-[180px]">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">From</label>
                <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-indigo-100 transition-all font-bold text-slate-900" />
              </div>
              <div className="flex-1 min-w-[180px]">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">To</label>
                <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-indigo-100 transition-all font-bold text-slate-900" />
              </div>
            </>
          )}
          {reportType === 'Semester' && (
            <div className="flex-1 min-w-[200px]">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Semester Period</label>
              <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-indigo-100 transition-all font-bold text-slate-900 appearance-none">
                 <option>Spring Semester 2024</option>
                 <option>Fall Semester 2023</option>
              </select>
            </div>
          )}
          <button className="px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 transition-all">
             Generate {isStudent ? 'My View' : 'Results'}
          </button>
        </div>
      </div>

      {/* Table Results */}
      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-10 py-8 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
           <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">
             {isStudent ? 'Personal Registry Performance' : `${selectedYear || 'All Years'} Detailed Results`}
           </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Identity</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Academic Year</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Periods</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Presence</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Registry Ratio</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Compliance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayStudents.map((student) => (
                <tr key={student.id} className="group hover:bg-slate-50 transition-colors">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm">
                         {student.name.charAt(0)}
                       </div>
                       <div className="flex flex-col">
                         <div className="font-black text-slate-900 text-sm">{student.name}</div>
                         <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{student.rollNumber}</div>
                       </div>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-sm font-bold text-slate-500">{student.year || student.section}</td>
                  <td className="px-10 py-6 text-sm font-bold text-slate-500">45</td>
                  <td className="px-10 py-6 text-sm font-black text-emerald-600">42</td>
                  <td className="px-10 py-6 font-black text-slate-900">{student.attendancePercentage}%</td>
                  <td className="px-10 py-6">
                     <div className={`inline-flex px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                       student.attendancePercentage >= 75 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                     }`}>
                        {student.attendancePercentage >= 75 ? 'Qualified' : 'Shortage'}
                     </div>
                  </td>
                </tr>
              ))}
              {displayStudents.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-10 py-20 text-center">
                    <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No records available for the selected parameters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ReportTypeCard = ({ title, active, onClick, description }: { title: string; active: boolean; onClick: () => void; description: string }) => (
  <button 
    onClick={onClick}
    className={`p-10 rounded-[3rem] border transition-all text-left group ${
      active ? 'bg-white border-indigo-600 shadow-2xl shadow-indigo-600/10' : 'bg-slate-50 border-slate-100 hover:bg-white hover:border-slate-300'
    }`}
  >
    <div className={`w-12 h-12 rounded-2xl mb-6 flex items-center justify-center transition-all ${active ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
       <PieIcon className="w-6 h-6" />
    </div>
    <h4 className={`text-2xl font-black tracking-tighter mb-2 ${active ? 'text-indigo-600' : 'text-slate-900'}`}>{title}</h4>
    <p className="text-sm font-medium text-slate-500 leading-relaxed">{description}</p>
  </button>
);

export default Reports;
