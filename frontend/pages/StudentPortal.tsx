import React, { useState, useEffect } from 'react';
import { Calendar, Download, Users, TrendingUp, Clock, FileText, GraduationCap, AlertCircle, MapPin, Play, BookMarked } from 'lucide-react';
import { UserRole } from '../types';
import { getCurrentRole } from '../services/roles';
import { getStudentDashboard, StudentDashboard, SubjectAttendance, TimetableSlot } from '../services/studentDashboardService';

// AttendanceDashboard Component (Student Only)
interface AttendanceDashboardProps {
  attendanceData: SubjectAttendance[];
  overallPercentage: number;
}

const AttendanceDashboard: React.FC<AttendanceDashboardProps> = ({ attendanceData, overallPercentage }) => {
  const totalAttendance = Math.round(overallPercentage);

  const circumference = 2 * Math.PI * 80;
  const offset = circumference - (totalAttendance / 100) * circumference;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      {/* Circular Progress Gauge */}
      <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-lg flex flex-col items-center justify-center">
        <h3 className="text-xl font-black text-slate-900 tracking-tighter mb-8 uppercase text-center">Total Attendance</h3>
        
        <div className="relative w-56 h-56 mb-8">
          <svg className="transform -rotate-90 w-56 h-56">
            <circle cx="112" cy="112" r="80" stroke="#e5e7eb" strokeWidth="16" fill="none" />
            <circle
              cx="112" cy="112" r="80"
              stroke={totalAttendance >= 75 ? '#4f46e5' : '#ef4444'}
              strokeWidth="16" fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-6xl font-black text-slate-900">{totalAttendance}%</span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-3">Overall</span>
          </div>
        </div>

        {totalAttendance >= 75 ? (
          <div className="px-8 py-4 bg-green-50 text-green-600 rounded-[1.8rem] border border-green-100 flex items-center gap-3 shadow-sm">
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm font-black uppercase tracking-widest">Compliant</span>
          </div>
        ) : (
          <div className="px-8 py-4 bg-red-50 text-red-600 rounded-[1.8rem] border border-red-100 flex items-center gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-black uppercase tracking-widest">Action Required</span>
          </div>
        )}
      </div>

      {/* Subject-wise List */}
      <div className="lg:col-span-2 bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-lg">
        <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-8">Subject Breakdown</h3>
        <div className="space-y-5">
          {attendanceData.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="font-bold text-lg">No attendance data available</p>
            </div>
          ) : (
            attendanceData.map((subject, idx) => (
              <div key={idx} className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 hover:border-indigo-200 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-black text-slate-800 text-base tracking-tight">{subject.subject}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                      {subject.attended}/{subject.total} Classes
                    </p>
                  </div>
                  <span className={`text-3xl font-black ${subject.percentage >= 75 ? 'text-indigo-600' : 'text-red-600'}`}>
                    {Math.round(subject.percentage)}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-700 ${subject.percentage >= 75 ? 'bg-indigo-600' : 'bg-red-600'}`}
                    style={{ width: `${subject.percentage}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const StudentPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'timetable' | 'faculty' | 'reports'>('dashboard');
  const [reportPeriod, setReportPeriod] = useState<'semester' | 'yearly'>('semester');
  
  // State for dashboard data
  const [dashboardData, setDashboardData] = useState<StudentDashboard | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // CRITICAL: Verify student role
  const currentRole = getCurrentRole();
  
  useEffect(() => {
    // Clear any admin-cached data for student view
    if (currentRole === UserRole.STUDENT) {
      localStorage.removeItem('attendx_admin_master_timetable');
      localStorage.removeItem('attendx_admin_period_timings');
      localStorage.removeItem('attendx_admin_break_timings');
      console.log('Student Portal: Admin cache cleared');
      
      // Fetch dashboard data
      fetchDashboardData();
    }
  }, [currentRole]);
  
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getStudentDashboard();
      setDashboardData(data);
    } catch (err: any) {
      console.error('Failed to fetch student dashboard:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Get today's schedule from timetable
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = days[new Date().getDay()];
  const todaySchedule: TimetableSlot[] = dashboardData?.weeklyTimetable?.[today] || [];

  // Check if a period is currently live
  const isPeriodLive = (startTime: string, endTime: string): boolean => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const currentTime = currentHour * 60 + currentMin;
    
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const startTimeMin = startHour * 60 + startMin;
    const endTimeMin = endHour * 60 + endMin;
    
    return currentTime >= startTimeMin && currentTime <= endTimeMin;
  };

  // PDF Download Handler
  const handleDownloadReport = () => {
    if (!dashboardData) return;
    alert(`Generating ${reportPeriod === 'semester' ? 'Semester' : 'Yearly'} Report...\n\nStudent: ${dashboardData.identity.name}\nRoll: ${dashboardData.identity.rollNumber}\nClass: ${dashboardData.identity.className}\nAttendance: ${Math.round(dashboardData.overallAttendancePercentage)}%`);
  };

  // CRITICAL: Student-only rendering
  if (currentRole !== UserRole.STUDENT) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-slate-900">Access Denied</h2>
          <p className="text-slate-600 mt-2">This portal is only accessible to students.</p>
        </div>
      </div>
    );
  }
  
  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-bold">Loading your dashboard...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error || !dashboardData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-slate-900">Error Loading Dashboard</h2>
          <p className="text-slate-600 mt-2">{error || 'Failed to load dashboard data'}</p>
          <button 
            onClick={fetchDashboardData}
            className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Calculate overall attendance percentage
  const overallAttendance = Math.round(dashboardData.overallAttendancePercentage);

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-16 max-w-[1600px] mx-auto" key={currentRole}>
      {/* Attendance Presence Banner - HARD-CODED DARK BLUE */}
      <div className="w-full bg-[#1e3a8a] rounded-3xl p-8 shadow-2xl border border-blue-900/50">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
                <GraduationCap className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-white tracking-tight">{dashboardData.identity.name}</h2>
                <p className="text-indigo-200 font-bold text-sm mt-1">Matric Number: {dashboardData.identity.rollNumber}</p>
              </div>
            </div>
            <div className="flex items-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <BookMarked className="w-4 h-4 text-indigo-300" />
                <span className="text-sm font-medium text-indigo-200">{dashboardData.identity.className}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-300" />
                <span className="text-sm font-medium text-indigo-200">{dashboardData.identity.section}</span>
              </div>
            </div>
          </div>
          <div className="flex-shrink-0 ml-8">
            <div className="bg-white/10 rounded-2xl p-8 border border-white/20 min-w-[200px]" style={{ backdropFilter: 'blur(16px)' }}>
              <p className="text-white text-xs font-black uppercase tracking-widest mb-3">Presence</p>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-black text-white">{overallAttendance}</span>
                <span className="text-3xl font-black text-indigo-300">%</span>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-300 rounded-full transition-all duration-700"
                    style={{ width: `${overallAttendance}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter flex items-center gap-4 leading-none">
            Student Dashboard
          </h1>
          <p className="text-slate-500 font-medium text-base mt-4">Your personalized attendance and schedule overview</p>
        </div>
        <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-black text-indigo-600 text-lg">
              {dashboardData.identity.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-black text-slate-800 tracking-tight">{dashboardData.identity.name}</h3>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{dashboardData.identity.rollNumber}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex bg-white p-2 rounded-[2rem] border border-slate-100 shadow-sm overflow-x-auto gap-1">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`px-7 py-3.5 rounded-[1.5rem] text-xs font-black uppercase tracking-[0.15em] transition-all whitespace-nowrap ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}
        >
          📊 Dashboard
        </button>
        <button 
          onClick={() => setActiveTab('timetable')}
          className={`px-7 py-3.5 rounded-[1.5rem] text-xs font-black uppercase tracking-[0.15em] transition-all whitespace-nowrap ${activeTab === 'timetable' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}
        >
          📅 My Timetable
        </button>
        <button 
          onClick={() => setActiveTab('faculty')}
          className={`px-7 py-3.5 rounded-[1.5rem] text-xs font-black uppercase tracking-[0.15em] transition-all whitespace-nowrap ${activeTab === 'faculty' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}
        >
          👥 Faculty
        </button>
        <button 
          onClick={() => setActiveTab('reports')}
          className={`px-7 py-3.5 rounded-[1.5rem] text-xs font-black uppercase tracking-[0.15em] transition-all whitespace-nowrap ${activeTab === 'reports' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}
        >
          📄 Reports
        </button>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <AttendanceDashboard 
          attendanceData={dashboardData.subjectAttendance} 
          overallPercentage={dashboardData.overallAttendancePercentage} 
        />
      )}

      {/* My Timetable Tab - Vertical Card List */}
      {activeTab === 'timetable' && (
        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-lg">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-4xl font-black text-slate-900 tracking-tighter">Today's Schedule</h3>
              <p className="text-sm text-slate-500 font-bold mt-2 uppercase tracking-widest">
                {today} • {new Date().toLocaleDateString()}
              </p>
            </div>
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100 text-indigo-600">
              <Calendar className="w-7 h-7" />
            </div>
          </div>

          <div className="space-y-5">
            {todaySchedule.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <Calendar className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="font-bold text-lg">No classes scheduled for today</p>
              </div>
            ) : (
              todaySchedule.map((period, idx) => {
                const isLive = isPeriodLive(period.startTime, period.endTime);
                const isSpecial = period.subject === 'Free Period' || period.subject === 'Institutional Break';
                
                return (
                  <div 
                    key={idx}
                    className={`p-7 rounded-[2.5rem] border transition-all relative ${
                      isSpecial 
                        ? 'bg-slate-50 border-slate-200' 
                        : isLive 
                        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 shadow-xl shadow-green-500/10' 
                        : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-lg'
                    }`}
                  >
                    {isLive && !isSpecial && (
                      <div className="absolute top-5 right-5 px-4 py-2 bg-green-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg animate-pulse">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        Live Now
                      </div>
                    )}
                    
                    <div className="flex items-start gap-6">
                      <div className="flex-shrink-0">
                        <div className={`text-center min-w-[100px] p-4 rounded-2xl ${
                          isSpecial ? 'bg-slate-100' : isLive ? 'bg-green-600 text-white' : 'bg-indigo-600 text-white'
                        }`}>
                          <div className="text-2xl font-black">{period.startTime}</div>
                          <div className="text-xs font-bold opacity-70 mt-1">to</div>
                          <div className="text-2xl font-black">{period.endTime}</div>
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                          {isSpecial ? (period.subject === 'Free Period' ? '⏸️ ' : '🍽️ ') : '📚 '}
                          {period.subject}
                        </h4>
                        {!isSpecial && (
                          <>
                            <p className="text-sm font-bold text-slate-600 mb-2">
                              👨‍🏫 {period.faculty}
                            </p>
                            <div className="flex items-center gap-4 flex-wrap">
                              <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200">
                                <MapPin className="w-4 h-4 text-indigo-600" />
                                <span className="text-sm font-bold text-slate-700">{period.location}</span>
                              </div>
                              {isLive && (
                                <button className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-md font-bold text-sm">
                                  <Play className="w-4 h-4" />
                                  Join Class
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Faculty Tab */}
      {activeTab === 'faculty' && (
        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-lg">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-4xl font-black text-slate-900 tracking-tighter">Department Faculty</h3>
              <p className="text-sm text-slate-500 font-bold mt-2 uppercase tracking-widest">
                {dashboardData.identity.department} • {dashboardData.identity.year}
              </p>
            </div>
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100 text-indigo-600">
              <Users className="w-7 h-7" />
            </div>
          </div>

          <div className="text-center py-16 text-slate-400">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="font-bold text-lg">Faculty directory coming soon</p>
            <p className="text-sm mt-2">Contact your class coordinator for faculty information</p>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-lg">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-4xl font-black text-slate-900 tracking-tighter">Reports & Analytics</h3>
              <p className="text-sm text-slate-500 font-bold mt-2 uppercase tracking-widest">
                Download attendance reports
              </p>
            </div>
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100 text-indigo-600">
              <FileText className="w-7 h-7" />
            </div>
          </div>

          <div className="max-w-2xl mx-auto space-y-8">
            <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
              <h4 className="font-black text-slate-800 text-lg tracking-tight mb-5">Select Period</h4>
              <div className="flex gap-4">
                <button
                  onClick={() => setReportPeriod('semester')}
                  className={`flex-1 py-5 rounded-[1.8rem] text-sm font-black uppercase tracking-wider transition-all ${
                    reportPeriod === 'semester'
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'bg-white text-slate-400 border-2 border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  📊 Semester
                </button>
                <button
                  onClick={() => setReportPeriod('yearly')}
                  className={`flex-1 py-5 rounded-[1.8rem] text-sm font-black uppercase tracking-wider transition-all ${
                    reportPeriod === 'yearly'
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'bg-white text-slate-400 border-2 border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  📅 Yearly
                </button>
              </div>
            </div>

            <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
              <h4 className="font-black text-slate-800 text-lg tracking-tight mb-5">Report Details</h4>
              <div className="space-y-3">
                <div className="flex justify-between py-3 border-b border-slate-200">
                  <span className="font-bold text-slate-600">Student</span>
                  <span className="font-black text-slate-900">{dashboardData.identity.name}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-slate-200">
                  <span className="font-bold text-slate-600">Roll Number</span>
                  <span className="font-black text-slate-900">{dashboardData.identity.rollNumber}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-slate-200">
                  <span className="font-bold text-slate-600">Class</span>
                  <span className="font-black text-slate-900">{dashboardData.identity.className}</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="font-bold text-slate-600">Period</span>
                  <span className="font-black text-slate-900">
                    {reportPeriod === 'semester' ? 'Semester 1 (2024)' : 'Academic Year 2024'}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleDownloadReport}
              className="w-full py-7 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[2.5rem] font-black text-base uppercase tracking-widest shadow-2xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-3 active:scale-98"
            >
              <Download className="w-6 h-6" />
              Download PDF Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPortal;
