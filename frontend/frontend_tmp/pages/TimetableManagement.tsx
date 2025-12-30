
import React, { useState, useEffect } from 'react';
import { 
  Save, 
  RotateCcw, 
  BookOpen, 
  Coffee, 
  Utensils, 
  Settings2, 
  Timer, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  Clock, 
  ChevronLeft,
  CalendarDays,
  LayoutGrid,
  Settings,
  Layers,
  Users
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { UserRole } from '../types';
import apiClient from '../services/api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const SEMESTER_SUBJECTS: Record<string, string[]> = {
  'Semester 1': [
    'Basics of Computer Science',
    'Digital Electronics',
    'Computer Organization',
    'Mathematical Structures',
    'English / Language',
    'Free Period'
  ],
  'Semester 2': [
    'C++ Programming',
    'Discrete Mathematics',
    'Computer Architecture',
    'Web Technologies Basics',
    'Allied Mathematics / Statistics',
    'Free Period'
  ],
  'Semester 3': [
    'Data Structures',
    'Java Programming',
    'Operating Systems Concepts',
    'System Analysis & Design',
    'Software Engineering',
    'Free Period'
  ],
  'Semester 4': [
    'Database Management Systems (DBMS)',
    'Computer Networks',
    'Numerical Methods',
    'System Programming',
    'Analytical Skills',
    'Free Period'
  ],
  'Semester 5': [
    'Python Programming',
    'Artificial Intelligence / Machine Learning',
    'Mobile Application Development',
    'Cloud Computing',
    'Project Work',
    'Free Period'
  ],
  'Semester 6': [
    'Web Technology',
    'Advanced Programming / Electives',
    'Final Project Work',
    'Cyber Security (Elective)',
    'Free Period'
  ]
};

interface PeriodInterval {
  id: string;
  start: string;
  end: string;
}

const formatTo12h = (time24: string) => {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':').map(Number);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
};

// Helper Components
const ChevronDown = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 9 6 6 6-6"/></svg>
);

const LegendItem = ({ label, color }: { label: string; color: string }) => (
  <div className="flex items-center gap-3 bg-slate-50 px-5 py-2.5 rounded-2xl border border-slate-100">
    <div className={`w-3 h-3 rounded-full ${color}`}></div>
    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
  </div>
);

const FixedBreakInput = ({ label, start, end, icon }: { label: string; start: string; end: string; icon: React.ReactNode }) => {
  const [valStart, setValStart] = useState(start);
  const [valEnd, setValEnd] = useState(end);

  return (
    <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-sm">{icon}</div>
        <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block ml-1 mb-1">From <span className="text-indigo-600">{formatTo12h(valStart)}</span></label>
          <input type="time" value={valStart} onChange={(e) => setValStart(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-black text-slate-700" />
        </div>
        <div className="pt-4 font-black text-slate-300">/</div>
        <div className="flex-1">
          <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block ml-1 mb-1">To <span className="text-indigo-600">{formatTo12h(valEnd)}</span></label>
          <input type="time" value={valEnd} onChange={(e) => setValEnd(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-black text-slate-700" />
        </div>
      </div>
    </div>
  );
};

// Main Component
const TimetableManagement: React.FC = () => {
  const currentUserRole = (window as any).currentUserRole || UserRole.ADMIN;
  const currentUser = (window as any).currentUser;
  const isStaff = currentUserRole === UserRole.STAFF;

  const [periods, setPeriods] = useState<PeriodInterval[]>([
    { id: 'p1', start: '09:00', end: '09:45' },
    { id: 'p2', start: '09:45', end: '10:30' },
    { id: 'p3', start: '10:45', end: '11:30' },
    { id: 'p4', start: '11:30', end: '12:00' },
    { id: 'p5', start: '13:00', end: '13:50' },
    { id: 'p6', start: '14:00', end: '15:00' },
  ]);

  const [timetable, setTimetable] = useState<Record<string, string[]>>(() => {
    const initial: Record<string, string[]> = {};
    DAYS.forEach(day => {
      initial[day] = Array(6).fill('Select Subject');
    });
    return initial;
  });

  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [saving, setSaving] = useState(false);
  
  // Teacher-specific filters
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [availableYears, setAvailableYears] = useState<number[]>([1, 2, 3]);
  const [availableClasses, setAvailableClasses] = useState<string[]>(['A', 'B', 'C']);
  const [scheduleData, setScheduleData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTimetable(prev => {
      const next = { ...prev };
      DAYS.forEach(day => {
        const currentLen = next[day].length;
        if (currentLen < periods.length) {
          next[day] = [...next[day], ...Array(periods.length - currentLen).fill('Select Subject')];
        } else if (currentLen > periods.length) {
          next[day] = next[day].slice(0, periods.length);
        }
      });
      return next;
    });
  }, [periods.length]);

  // Fetch teacher's schedule when filters change (for STAFF role)
  useEffect(() => {
    if (!isStaff || !selectedYear || !selectedSemester || !selectedClass) {
      setScheduleData([]);
      return;
    }

    const fetchSchedule = async () => {
      setLoading(true);
      try {
        const department = currentUser?.department || 'Computer Science';
        const response = await apiClient.get(
          `/teacher/schedule?department=${encodeURIComponent(department)}&year=${selectedYear}&semester=${selectedSemester}&className=${selectedClass}`
        );
        
        console.log('📅 Teacher Schedule API Response:', response.data);
        const data = response.data.data || [];
        setScheduleData(data);
        
        // Convert API data to timetable format
        const newTimetable: Record<string, string[]> = {};
        DAYS.forEach(day => {
          newTimetable[day] = Array(periods.length).fill('Free Period');
        });
        
        data.forEach((session: any) => {
          const dayIndex = DAYS.indexOf(session.dayOfWeek);
          if (dayIndex !== -1) {
            // Find period slot based on start time
            const sessionStart = session.startTime;
            const periodIndex = periods.findIndex(p => p.start === sessionStart.substring(0, 5));
            if (periodIndex !== -1 && newTimetable[DAYS[dayIndex]]) {
              // Show class context: [Year] [Class] - [Department]
              const classContext = session.classContext || `Year ${selectedYear} ${selectedClass} - ${department}`;
              newTimetable[DAYS[dayIndex]][periodIndex] = `${session.subjectName}\n${classContext}`;
            }
          }
        });
        
        setTimetable(newTimetable);
      } catch (error) {
        console.error('❌ Error fetching teacher schedule:', error);
        // Show empty schedule on error
        const emptyTimetable: Record<string, string[]> = {};
        DAYS.forEach(day => {
          emptyTimetable[day] = Array(periods.length).fill('Free Period');
        });
        setTimetable(emptyTimetable);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [isStaff, selectedYear, selectedSemester, selectedClass, periods]);

  // Fetch available years for teacher's department
  useEffect(() => {
    if (!isStaff) return;

    const fetchYears = async () => {
      try {
        const department = currentUser?.department || 'Computer Science';
        const response = await apiClient.get(`/teacher/years?department=${encodeURIComponent(department)}`);
        setAvailableYears(response.data.data || [1, 2, 3]);
      } catch (error) {
        console.error('Error fetching years:', error);
        setAvailableYears([1, 2, 3]);
      }
    };

    fetchYears();
  }, [isStaff, currentUser]);

  // Fetch available classes when year and semester change
  useEffect(() => {
    if (!isStaff || !selectedYear || !selectedSemester) return;

    const fetchClasses = async () => {
      try {
        const department = currentUser?.department || 'Computer Science';
        const response = await apiClient.get(
          `/teacher/classes?department=${encodeURIComponent(department)}&year=${selectedYear}&semester=${selectedSemester}`
        );
        setAvailableClasses(response.data.data || ['A', 'B', 'C']);
      } catch (error) {
        console.error('Error fetching classes:', error);
        setAvailableClasses(['A', 'B', 'C']);
      }
    };

    fetchClasses();
  }, [isStaff, selectedYear, selectedSemester, currentUser]);

  const handlePeriodChange = (id: string, field: 'start' | 'end', value: string) => {
    setPeriods(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const addPeriod = () => {
    const lastPeriod = periods[periods.length - 1];
    const newId = `p${Date.now()}`;
    setPeriods([...periods, { id: newId, start: lastPeriod?.end || '09:00', end: '16:00' }]);
  };

  const removePeriod = (id: string) => {
    if (periods.length <= 1) return;
    setPeriods(periods.filter(p => p.id !== id));
  };

  const handleSubjectChange = (day: string, periodIndex: number, subject: string) => {
    setTimetable(prev => ({
      ...prev,
      [day]: prev[day].map((sub, i) => i === periodIndex ? subject : sub)
    }));
  };

  const checkConflict = (day: string, subject: string) => {
    if (subject === 'Select Subject' || subject === 'Free Period') return false;
    return timetable[day].filter(s => s === subject).length > 1;
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert('Institutional Schedule successfully synchronized.');
    }, 1200);
  };

  const resetTimetable = () => {
    if (confirm('Revert to default institutional 6-period structure?')) {
      setPeriods([
        { id: 'p1', start: '09:00', end: '09:45' },
        { id: 'p2', start: '09:45', end: '10:30' },
        { id: 'p3', start: '10:45', end: '11:30' },
        { id: 'p4', start: '11:30', end: '12:00' },
        { id: 'p5', start: '13:00', end: '13:50' },
        { id: 'p6', start: '14:00', end: '15:00' },
      ]);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20 max-w-[1800px] mx-auto">
      {/* 1. Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-white p-12 rounded-[3.5rem] border border-slate-100 card-shadow">
        <div>
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-6 hover:text-indigo-600 transition-colors group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </Link>
          <h1 className="text-6xl font-black text-slate-900 tracking-tighter leading-none">
            {isStaff ? 'Teaching Schedule' : 'Timetable'} <br/>{isStaff ? 'Manager' : 'Configurator'}
          </h1>
          <p className="text-slate-500 font-medium text-xl mt-6 flex items-center gap-3">
             <LayoutGrid className="w-6 h-6 text-indigo-600 opacity-40" /> 
             {isStaff 
               ? 'View your teaching schedule with class context - read-only mode.'
               : 'Live master schedule view with normal time (12h) mapping.'
             }
          </p>
        </div>

        <div className="flex items-center gap-4">
          {!isStaff && (
            <>
              <button 
                onClick={resetTimetable}
                className="px-8 py-5 bg-slate-50 border border-slate-200 rounded-3xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-rose-500 hover:border-rose-100 transition-all flex items-center gap-3"
              >
                <RotateCcw className="w-4 h-4" /> Reset Layout
              </button>
              <button 
                onClick={handleSave}
                disabled={saving}
                className="px-12 py-5 bg-indigo-600 text-white rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-indigo-600/20 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
              >
                <Save className="w-4 h-4" /> {saving ? 'Synchronizing...' : 'Commit Changes'}
              </button>
            </>
          )}
          {isStaff && (
            <div className="bg-amber-50 border border-amber-200 px-6 py-3 rounded-2xl">
              <p className="text-amber-600 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Read-Only View
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Teacher Filters Section (Only for STAFF role) */}
      {isStaff && (
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 card-shadow">
          <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
            <Settings className="w-6 h-6 text-indigo-600" />
            Teaching Schedule Filter
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Year Dropdown */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Year</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                  <CalendarDays className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                </div>
                <select 
                  value={selectedYear}
                  onChange={(e) => {
                    setSelectedYear(e.target.value);
                    setSelectedClass('');
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-10 py-4 font-black text-[10px] text-slate-900 uppercase tracking-widest outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-200 transition-all appearance-none cursor-pointer shadow-sm"
                >
                  <option value="">Select Year</option>
                  {availableYears.map(year => (
                    <option key={year} value={year}>Year {year}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Semester Dropdown */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Semester</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                  <BookOpen className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                </div>
                <select 
                  value={selectedSemester}
                  onChange={(e) => {
                    setSelectedSemester(e.target.value);
                    setSelectedClass('');
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-10 py-4 font-black text-[10px] text-slate-900 uppercase tracking-widest outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-200 transition-all appearance-none cursor-pointer shadow-sm"
                  disabled={!selectedYear}
                >
                  <option value="">Select Semester</option>
                  {[1, 2, 3, 4, 5, 6].map(sem => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Class Dropdown */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Class</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                  <Users className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                </div>
                <select 
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-10 py-4 font-black text-[10px] text-slate-900 uppercase tracking-widest outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-200 transition-all appearance-none cursor-pointer shadow-sm"
                  disabled={!selectedYear || !selectedSemester}
                >
                  <option value="">Select Class</option>
                  {availableClasses.map(cls => (
                    <option key={cls} value={cls}>Class {cls}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>
          </div>
          
          {(!selectedYear || !selectedSemester || !selectedClass) && (
            <div className="mt-8 text-center py-8 bg-slate-50 rounded-2xl">
              <p className="text-slate-400 font-medium">Please select all filters to view your teaching schedule</p>
            </div>
          )}
          
          {loading && (
            <div className="mt-8 text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
              <p className="text-slate-500">Loading schedule...</p>
            </div>
          )}
        </div>
      )}

      {/* Only show timetable grid for admin or when staff has selected filters */}
      {(!isStaff || (selectedYear && selectedSemester && selectedClass && !loading)) && (
        <>
      {/* 2. Semester Selection Dropdown (Admin Only) */}
      {!isStaff && (
      <div className="bg-white p-8 rounded-[3rem] border border-slate-100 card-shadow flex flex-col md:flex-row items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center border border-indigo-100">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-black text-slate-900 text-lg tracking-tight">Semester Filter</h4>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Academic Term</p>
          </div>
        </div>
        <div className="relative flex-1 max-w-sm">
          <select 
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] px-8 py-4 font-black text-sm text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100 transition-all appearance-none cursor-pointer shadow-inner"
          >
            <option value="">Select Semester</option>
            {Object.keys(SEMESTER_SUBJECTS).map(sem => (
              <option key={sem} value={sem}>{sem}</option>
            ))}
          </select>
          <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {selectedSemester && (
          <div className="px-6 py-4 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 flex items-center gap-3 animate-in zoom-in-95">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
             <span className="text-[10px] font-black uppercase tracking-widest">Mapping: {selectedSemester} Subjects Active</span>
          </div>
        )}
      </div>
      )}

      {/* 3. THE MASTER VIEW */}
      <div className="bg-white rounded-[4rem] border border-slate-100 card-shadow overflow-x-auto min-h-[600px]">
        <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
           <div className="flex items-center gap-4">
              <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Active Academic Grid</h3>
           </div>
           <div className="flex gap-6">
              <LegendItem label="Conflict Detected" color="bg-amber-500" />
              <LegendItem label="Institutional Hour" color="bg-indigo-600" />
           </div>
        </div>

        <div className="min-w-max">
          {/* Dynamic Columns Header */}
          <div className="grid bg-indigo-50/80 border-b border-slate-200" style={{ gridTemplateColumns: `200px repeat(${periods.length}, minmax(220px, 1fr))` }}>
            <div className="p-10 border-r border-slate-200 flex items-center justify-center font-black text-[11px] uppercase tracking-[0.2em] text-slate-500">Week Day</div>
            {periods.map((p, idx) => (
              <div key={p.id} className="p-10 flex flex-col items-center justify-center border-r border-slate-200 last:border-0 bg-white shadow-[inset_0_0_20px_rgba(79,70,229,0.03)]">
                <span className="font-black text-indigo-700 text-lg mb-1 tracking-tight">Period {idx + 1}</span>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 shadow-sm">
                  {formatTo12h(p.start)} - {formatTo12h(p.end)}
                </span>
              </div>
            ))}
          </div>

          {/* Day Rows */}
          <div className="divide-y divide-slate-100">
            {DAYS.map((day) => (
              <div key={day} className="grid group" style={{ gridTemplateColumns: `200px repeat(${periods.length}, minmax(220px, 1fr))` }}>
                <div className="p-10 border-r border-slate-200 flex items-center justify-center bg-slate-100/30">
                  <span className="font-black text-slate-900 text-lg tracking-tight">{day}</span>
                </div>
                
                {timetable[day].map((subject, idx) => {
                  const hasConflict = checkConflict(day, subject);
                  const isPlaceholder = subject === 'Select Subject';
                  const isFree = subject === 'Free Period' || !subject;
                  const availableSubjects = selectedSemester ? SEMESTER_SUBJECTS[selectedSemester] : [];
                  
                  // For teacher view, split subject and class context
                  const subjectParts = subject.split('\n');
                  const subjectName = subjectParts[0];
                  const classContext = subjectParts[1];
                  
                  return (
                    <div key={idx} className={`p-6 border-r border-slate-100 last:border-0 hover:bg-indigo-50/20 transition-all flex flex-col gap-2 relative min-h-[120px] ${hasConflict ? 'bg-amber-50/60' : ''}`}>
                      {isStaff ? (
                        // Teacher Read-Only View
                        <div className={`w-full h-full rounded-2xl px-6 py-6 flex flex-col justify-center ${isFree ? 'bg-slate-50 border border-slate-200' : 'bg-white border-2 border-indigo-200 shadow-sm'}`}>
                          <div className={`font-black text-sm ${isFree ? 'text-slate-400' : 'text-slate-900'} mb-2`}>
                            {subjectName}
                          </div>
                          {classContext && (
                            <div className="text-[10px] font-black text-indigo-600 uppercase tracking-wider px-3 py-1.5 bg-indigo-50 rounded-lg border border-indigo-100 inline-block">
                              {classContext}
                            </div>
                          )}
                          {isFree && (
                            <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1">
                              No Class Scheduled
                            </div>
                          )}
                        </div>
                      ) : (
                        // Admin Edit View
                        <div className="relative group">
                          <select 
                            value={subjectName}
                            disabled={!selectedSemester}
                            onChange={(e) => handleSubjectChange(day, idx, e.target.value)}
                            className={`
                              w-full bg-slate-50/80 border rounded-[1.8rem] px-6 py-7 text-sm font-black outline-none focus:ring-8 focus:ring-indigo-100 focus:bg-white focus:border-indigo-400 transition-all appearance-none cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed
                              ${isPlaceholder ? 'text-indigo-400/60 border-slate-200' : hasConflict ? 'text-amber-900 border-amber-400 bg-white' : 'text-slate-900 border-indigo-100 bg-white'}
                            `}
                          >
                            <option value="Select Subject" className="text-slate-400 bg-white font-bold">
                              {selectedSemester ? 'Select Subject' : 'Select Semester First'}
                            </option>
                            {availableSubjects.map(s => (
                              <option key={s} value={s} className="text-slate-900 font-bold bg-white py-4">{s}</option>
                            ))}
                          </select>
                          <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-indigo-600 transition-colors">
                            <ChevronDown className="w-4 h-4" />
                          </div>
                        </div>
                      )}
                      
                      {hasConflict && (
                        <div className="absolute top-4 right-4 w-7 h-7 bg-amber-500 rounded-full flex items-center justify-center text-white border-2 border-white shadow-lg z-10 animate-bounce">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. CONFIGURATION CONTROLS (Admin Only) */}
      {!isStaff && (
      <div className="space-y-12">
        <div className="flex items-center gap-4 mb-2">
           <div className="bg-indigo-600 p-2 rounded-xl">
             <Settings className="w-5 h-5 text-white" />
           </div>
           <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Architecture Controls</h2>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
          {/* Period Interval Management */}
          <div className="bg-white p-12 rounded-[4rem] border border-slate-100 card-shadow">
            <div className="flex items-center justify-between mb-10">
              <h3 className="font-black text-slate-900 text-2xl tracking-tighter flex items-center gap-3">
                <Clock className="w-7 h-7 text-indigo-600" /> Manage Period Timing
              </h3>
              <button 
                onClick={addPeriod}
                className="px-6 py-3 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center gap-2 hover:bg-indigo-600 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest shadow-sm"
              >
                <Plus className="w-4 h-4" /> Add Slot
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {periods.map((p, idx) => (
                <div key={p.id} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 group hover:border-indigo-200 transition-all">
                   <div className="flex items-center justify-between mb-6">
                      <span className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.2em]">P{idx + 1} ARCHITECTURE</span>
                      <button 
                        onClick={() => removePeriod(p.id)}
                        className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-300 hover:text-rose-500 hover:border-rose-100 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">Start <span className="text-indigo-600">({formatTo12h(p.start)})</span></label>
                        <input 
                          type="time" 
                          value={p.start}
                          onChange={(e) => handlePeriodChange(p.id, 'start', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-4 text-xs font-black text-slate-700 outline-none focus:ring-4 focus:ring-indigo-100"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">End <span className="text-indigo-600">({formatTo12h(p.end)})</span></label>
                        <input 
                          type="time" 
                          value={p.end}
                          onChange={(e) => handlePeriodChange(p.id, 'end', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-4 text-xs font-black text-slate-700 outline-none focus:ring-4 focus:ring-indigo-100"
                        />
                      </div>
                   </div>
                </div>
              ))}
            </div>
          </div>

          {/* Institutional Break Protocols */}
          <div className="bg-white p-12 rounded-[4rem] border border-slate-100 card-shadow h-fit">
            <h3 className="font-black text-slate-900 text-2xl tracking-tighter flex items-center gap-3 mb-10">
              <Settings2 className="w-7 h-7 text-indigo-600" /> Institutional Protocols
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FixedBreakInput label="Morning Recess" start="10:30" end="10:45" icon={<Coffee className="w-5 h-5 text-amber-500" />} />
              <FixedBreakInput label="Academic Lunch" start="12:00" end="13:00" icon={<Utensils className="w-5 h-5 text-emerald-500" />} />
              <div className="md:col-span-2">
                <FixedBreakInput label="Afternoon Break" start="13:50" end="14:00" icon={<Clock className="w-5 h-5 text-indigo-500" />} />
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
      </>
      )}
    </div>
  );
};

export default TimetableManagement;
