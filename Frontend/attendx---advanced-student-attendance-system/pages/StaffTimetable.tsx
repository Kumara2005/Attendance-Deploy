import React, { useState, useEffect } from 'react';
import { Calendar, Clock, BookOpen, Users, ChevronDown, AlertCircle } from 'lucide-react';
import apiClient from '../services/api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface TimetableSession {
  id: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  subjectName: string;
  classContext: string;
}

const formatTo12h = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${period}`;
};

const StaffTimetable: React.FC = () => {
  const currentUser = (window as any).currentUser || { department: 'Computer Science' };
  
  const [selectedDepartment] = useState(currentUser.department || 'Computer Science');
  const [selectedYear, setSelectedYear] = useState<number | ''>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [scheduleData, setScheduleData] = useState<TimetableSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [availableYears] = useState([1, 2, 3]);
  const [availableClasses] = useState(['A', 'B', 'C']);

  // Fetch teacher's schedule when filters change
  useEffect(() => {
    if (!selectedYear || !selectedClass) {
      setScheduleData([]);
      return;
    }

    const fetchSchedule = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get(
          `/staff/timetable?department=${encodeURIComponent(selectedDepartment)}&year=${selectedYear}&className=${selectedClass}`
        );
        
        console.log('📅 Staff Timetable API Response:', response.data);
        setScheduleData(response.data.data || []);
      } catch (error) {
        console.error('❌ Error fetching staff timetable:', error);
        setScheduleData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [selectedYear, selectedClass, selectedDepartment]);

  // Group sessions by day
  const getSessionsForDay = (day: string): TimetableSession[] => {
    return scheduleData
      .filter(session => session.dayOfWeek === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20 max-w-[1800px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-white p-12 rounded-[3.5rem] border border-slate-100 card-shadow">
        <div>
          <h1 className="text-6xl font-black tracking-tighter text-slate-900 leading-none mb-4">
            My Timetable
          </h1>
          <p className="text-sm font-black text-slate-400 uppercase tracking-widest">
            View your teaching schedule - Read-only mode
          </p>
        </div>
        <div className="flex items-center gap-4 px-8 py-4 bg-emerald-50 border border-emerald-100 rounded-[2rem]">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">View Only Mode</span>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 card-shadow">
        <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-8 flex items-center gap-3">
          <Calendar className="w-7 h-7 text-indigo-600" />
          Select Your Class
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Department Display (Read-only) */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department Stream</label>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-black text-sm text-slate-700">
              {selectedDepartment}
            </div>
          </div>

          {/* Year Dropdown */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Year</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                <BookOpen className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
              </div>
              <select 
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value ? Number(e.target.value) : '');
                  setSelectedClass(''); // Reset class when year changes
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
                disabled={!selectedYear}
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
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white p-20 rounded-[3rem] border border-slate-100 card-shadow flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
          <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Loading Schedule...</p>
        </div>
      )}

      {/* Schedule Grid */}
      {!loading && selectedYear && selectedClass && (
        <div className="bg-white rounded-[4rem] border border-slate-100 card-shadow overflow-hidden">
          <div className="p-10 border-b border-slate-100 bg-gradient-to-br from-indigo-50 to-white">
            <h3 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Clock className="w-8 h-8 text-indigo-600" />
              Weekly Schedule - Year {selectedYear} Class {selectedClass}
            </h3>
            <p className="text-xs font-black text-indigo-600 uppercase tracking-widest mt-2">
              {selectedDepartment}
            </p>
          </div>

          <div className="p-6">
            {scheduleData.length === 0 ? (
              <div className="py-20 text-center">
                <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-lg font-black text-slate-400 uppercase tracking-widest">
                  No Classes Scheduled
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {DAYS.map(day => {
                  const sessions = getSessionsForDay(day);
                  return (
                    <div key={day} className="bg-slate-50 rounded-[2rem] p-6 border border-slate-200">
                      <h4 className="text-lg font-black text-slate-900 tracking-tight mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                        {day}
                      </h4>
                      
                      {sessions.length === 0 ? (
                        <div className="py-8 text-center">
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No Classes</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {sessions.map(session => (
                            <div 
                              key={session.id}
                              className="bg-white rounded-xl p-4 border border-slate-200 hover:border-indigo-300 transition-colors"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">
                                  {formatTo12h(session.startTime)} - {formatTo12h(session.endTime)}
                                </span>
                              </div>
                              <h5 className="text-sm font-black text-slate-900 mb-1">
                                {session.subjectName}
                              </h5>
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                {session.classContext}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && (!selectedYear || !selectedClass) && (
        <div className="bg-gradient-to-br from-slate-50 to-white p-20 rounded-[3rem] border-2 border-dashed border-slate-200 text-center">
          <Calendar className="w-20 h-20 text-slate-300 mx-auto mb-6" />
          <h3 className="text-2xl font-black text-slate-400 uppercase tracking-widest mb-2">
            Select Your Class
          </h3>
          <p className="text-sm text-slate-400 font-black">
            Choose a year and class to view your teaching schedule
          </p>
        </div>
      )}
    </div>
  );
};

export default StaffTimetable;
