
import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, Clock, Users, MapPin, AlertCircle } from 'lucide-react';
import { UserRole, User } from '../types';
import { staffDashboardService, TodaySessionDTO } from '../services/staffDashboardService';
import QuickAttendance from '../components/QuickAttendance';

/**
 * Staff Attendance by Period
 * Shows today's sessions for the logged-in staff member and enables per-period attendance marking.
 */
const AttendanceMarking: React.FC = () => {
  const role = (window as any).currentUserRole || UserRole.STAFF;
  const user = (window as any).currentUser as User;

  const [sessions, setSessions] = useState<TodaySessionDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSession, setSelectedSession] = useState<TodaySessionDTO | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      try {
        const data = await staffDashboardService.getTodaySessions();
        setSessions(data || []);
      } catch (error) {
        console.error('Error fetching today sessions for staff:', error);
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const sessionsByTime = useMemo(() => {
    return [...sessions].sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [sessions]);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const handleSessionClick = (session: TodaySessionDTO) => {
    setSelectedSession(session);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <header className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col gap-3">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Attendance · Per Period</p>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">Today's Sessions</h1>
        <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
          <Calendar className="w-4 h-4 text-indigo-500" />
          <span>{today}</span>
          <span className="text-slate-300">•</span>
          <span>{user?.name}</span>
        </div>
      </header>

      <section className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Scheduled Periods</p>
            <h3 className="text-2xl font-black text-slate-900">Tap a period to mark attendance</h3>
          </div>
          <div className="text-xs font-bold text-slate-500">Auto-filtered to your timetable</div>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 text-slate-500 font-bold">
            <div className="w-6 h-6 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            Loading sessions...
          </div>
        ) : sessionsByTime.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-slate-400">
            <AlertCircle className="w-10 h-10" />
            <p className="font-bold">No sessions scheduled for today.</p>
            <p className="text-sm font-medium text-slate-400">Once the admin assigns timetable periods to you, they'll appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sessionsByTime.map((session) => (
              <button
                key={session.sessionId}
                onClick={() => handleSessionClick(session)}
                className="text-left p-5 rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-slate-50 hover:from-indigo-50 hover:border-indigo-200 transition-all shadow-sm hover:shadow-md"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600">{session.className}</span>
                  <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${session.attendanceMarked ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {session.attendanceMarked ? 'Attendance Marked' : 'Pending'}
                  </span>
                </div>
                <div className="text-2xl font-black text-slate-900 leading-tight">{session.subject}</div>
                <div className="mt-3 flex items-center gap-4 text-sm font-bold text-slate-600">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-indigo-500" /> {session.startTime} – {session.endTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-indigo-500" /> {session.section || 'Section'}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-indigo-500" /> {session.location || 'Room TBD'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {selectedSession && (
        <QuickAttendance
          sessionId={selectedSession.sessionId}
          sessionTime={`${selectedSession.startTime} - ${selectedSession.endTime}`}
          subjectName={selectedSession.subject}
          department={selectedSession.department}
          semester={selectedSession.semester}
          section={selectedSession.section}
          onClose={() => setSelectedSession(null)}
          onSaved={() => {
            setSessions((prev) =>
              prev.map((s) =>
                s.sessionId === selectedSession.sessionId ? { ...s, attendanceMarked: true } : s
              )
            );
          }}
        />
      )}
    </div>
  );
};

export default AttendanceMarking;
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [availableSemesters] = useState<number[]>([1, 2, 3, 4, 5, 6]);
  
  // Students data
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [attendance, setAttendance] = useState<Record<string, 'Present' | 'Absent' | 'Late'>>({});
  const [saving, setSaving] = useState(false);

  // Fetch available years when component mounts
  useEffect(() => {
    if (isStudent) return;
    
    const fetchYears = async () => {
      try {
        const department = currentUser?.department || 'Computer Science';
        const response = await apiClient.get(`/teacher/years?department=${encodeURIComponent(department)}`);
        setAvailableYears(response.data.data || [1, 2, 3]);
      } catch (error) {
        console.error('Error fetching years:', error);
        setAvailableYears([1, 2, 3]); // Fallback
      }
    };
    
    fetchYears();
  }, [isStudent, currentUser]);

  // Fetch available classes when year and semester are selected
  useEffect(() => {
    if (isStudent || !selectedYear || !selectedSemester) return;
    
    const fetchClasses = async () => {
      try {
        const department = currentUser?.department || 'Computer Science';
        const response = await apiClient.get(
          `/teacher/classes?department=${encodeURIComponent(department)}&year=${selectedYear}&semester=${selectedSemester}`
        );
        setAvailableClasses(response.data.data || ['A', 'B', 'C']);
      } catch (error) {
        console.error('Error fetching classes:', error);
        setAvailableClasses(['A', 'B', 'C']); // Fallback
      }
    };
    
    fetchClasses();
  }, [selectedYear, selectedSemester, isStudent, currentUser]);

  // Auto-trigger student fetch when navigating from timetable with pre-filled filters
  useEffect(() => {
    if (fromTimetable && selectedYear && selectedSemester && selectedClass) {
      console.log('🎯 Auto-fetching students from timetable navigation:', {
        year: selectedYear,
        semester: selectedSemester,
        section: selectedClass,
        department: currentUser?.department
      });
      // Student fetch will be triggered automatically by the existing useEffect
      // that watches selectedYear, selectedClass, selectedSemester
    }
  }, [fromTimetable]); // Only run once on mount when coming from timetable

  // Fetch students when all filters are selected
  useEffect(() => {
    // Use the same token key as authService to ensure Authorization header is present
    const token = localStorage.getItem('token');
    console.log('🔍 Fetch students effect triggered:', {
      isStudent,
      selectedYear,
      selectedSemester,
      selectedClass,
      currentUser: currentUser?.name,
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'NO TOKEN'
    });
    
    if (isStudent || !selectedYear || !selectedClass || !selectedSemester) {
      console.log('⚠️ Skipping fetch - conditions not met');
      setStudents([]);
      return;
    }
    
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const department = currentUser?.department || 'Computer Science';
        const url = `/teacher/students?department=${encodeURIComponent(department)}&year=${selectedYear}&semester=${selectedSemester}&section=${selectedClass}`;
        const fullUrl = `http://localhost:8080/api${url}`;
        console.log('📡 Fetching students from:', url);
        console.log('🌐 Full URL:', fullUrl);
        console.log('👤 Department:', department);
        console.log('🔑 JWT Token exists:', !!token);
        console.log('🔑 Token value:', token || 'NO TOKEN');
        
        // Check what headers are being sent
        const headers = apiClient.defaults.headers.common;
        console.log('📤 Request headers:', headers);
        console.log('📤 Authorization header:', headers['Authorization'] || 'NO AUTH HEADER');
        
        const response = await apiClient.get(url);
        console.log('✅ Students API response:', response.data);
        console.log('✅ Response status:', response.status);
        console.log('✅ Full response object:', response);
        
        const studentData = response.data.data || [];
        console.log('📚 Student data:', studentData.length, 'students', studentData);
        setStudents(studentData);
        
        // Initialize attendance to Present for all students
        const initialAttendance: Record<string, 'Present' | 'Absent' | 'Late'> = {};
        studentData.forEach((student: any) => {
          initialAttendance[student.id] = 'Present';
        });
        setAttendance(initialAttendance);
      } catch (error: any) {
        console.error('❌ Error fetching students:', error);
        console.error('❌ Error status:', error.response?.status);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error response:', error.response?.data);
        
        // Fallback to mock data if API fails
        const mockFiltered = MOCK_STUDENTS.filter(s => 
          s.year === `Year ${selectedYear}` && s.section === selectedClass
        );
        console.log('📋 Using mock data:', mockFiltered.length, 'students');
        setStudents(mockFiltered);
        
        const initialAttendance: Record<string, 'Present' | 'Absent' | 'Late'> = {};
        mockFiltered.forEach((student: any) => {
          initialAttendance[student.id] = 'Present';
        });
        setAttendance(initialAttendance);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudents();
  }, [selectedYear, selectedClass, selectedSemester, isStudent, currentUser]);

  // Load saved attendance for selected date
  useEffect(() => {
    if (isStudent) return;
    const history = JSON.parse(localStorage.getItem('attendx_history_attendance') || '{}');
    if (history[selectedDate]) {
      setAttendance(history[selectedDate]);
    }
  }, [selectedDate, isStudent]);

  const filteredStudents = useMemo(() => {
    return students;
  }, [students]);

  const handleStatusChange = (id: string, status: 'Present' | 'Absent' | 'Late') => {
    if (isStudent) return;
    setAttendance(prev => ({ ...prev, [id]: status }));
  };

  const handleSave = async () => {
    if (isStudent) return;
    setSaving(true);
    
    try {
      // Collect attendance records for submission using simplified DTO
      const attendanceSubmissions = students.map(student => {
        const status = attendance[student.id] || 'Present';
        // Map frontend status to backend enum
        const backendStatus = status === 'Late' ? 'PRESENT' : status.toUpperCase();
        
        return {
          studentId: student.id,
          timetableSessionId: navigationState?.sessionId || 0,
          date: selectedDate,
          status: backendStatus,
          // Metadata for backend to find or create TimetableSession
          subjectName: navigationState?.subjectName || currentUser?.subject || 'Unknown Subject',
          department: currentUser?.department || 'Unknown',
          semester: parseInt(selectedSemester) || 1,
          section: selectedClass || 'A'
        };
      });
      
      console.log('📤 Submitting attendance records:', JSON.stringify(attendanceSubmissions, null, 2));
      
      // Submit each attendance record to the backend
      let successCount = 0;
      for (const record of attendanceSubmissions) {
        try {
          console.log('📡 Posting simplified DTO record:', record);
          const response = await apiClient.post('/attendance/session', record);
          console.log('✅ Attendance saved:', response.data);
          successCount++;
        } catch (error: any) {
          console.error('❌ Error saving attendance for student', record.studentId);
          console.error('Error details:', error.response?.data || error.message);
          // Continue saving other records even if one fails
        }
      }
      
      // Also save to localStorage for local history
      const history = JSON.parse(localStorage.getItem('attendx_history_attendance') || '{}');
      history[selectedDate] = attendance;
      localStorage.setItem('attendx_history_attendance', JSON.stringify(history));
      localStorage.setItem('attendx_session_attendance', JSON.stringify(attendance));
      
      setSaving(false);
      alert(`✅ Attendance committed: ${successCount}/${students.length} records saved to database for ${currentUser?.subject || 'Class'} on ${new Date(selectedDate).toLocaleDateString()}`);
    } catch (error: any) {
      console.error('❌ Error in handleSave:', error);
      setSaving(false);
      alert(`❌ Error saving attendance: ${error.message || 'Unknown error'}`);
    }
  };

  const resetFeed = () => {
    if (isStudent) return;
    if(confirm("CRITICAL: Reset all statuses for this date to 'Present'? This will overwrite any unsaved changes.")) {
      const resetData: Record<string, 'Present' | 'Absent' | 'Late'> = {};
      MOCK_STUDENTS.forEach(student => { resetData[student.id] = 'Present'; });
      setAttendance(resetData);
      const history = JSON.parse(localStorage.getItem('attendx_history_attendance') || '{}');
      history[selectedDate] = resetData;
      localStorage.setItem('attendx_history_attendance', JSON.stringify(history));
      localStorage.setItem('attendx_session_attendance', JSON.stringify(resetData));
    }
  };

  if (isStudent) {
    return <StudentAttendanceFeed currentUser={currentUser} />;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-16 max-w-[1200px] mx-auto">
      {/* Navigation Banner - Show when coming from timetable */}
      {fromTimetable && navigationState?.subjectName && (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-[2rem] border-2 border-indigo-300 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-black text-white tracking-tight">
                Mark Attendance for {navigationState.subjectName}
              </h3>
              <p className="text-xs font-black text-indigo-100 uppercase tracking-widest mt-1">
                Year {navigationState.year} • Class {navigationState.class} • {navigationState.department}
              </p>
            </div>
            <div className="px-4 py-2 bg-white/20 rounded-xl">
              <p className="text-[10px] font-black text-white uppercase tracking-widest">
                From Timetable
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Registry Controls */}
      <div className="p-10 rounded-[2.5rem] text-slate-900 shadow-lg relative overflow-hidden bg-white border border-slate-100">
        <div className="absolute right-[-40px] top-[-40px] w-64 h-64 bg-indigo-50 rounded-full blur-[80px]"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-indigo-50 px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border border-indigo-100 text-indigo-600">
                {currentUser?.subject || 'Daily Attendance Entry'}
              </span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter mb-2 leading-none text-slate-900">Registry Control</h1>
            <p className="text-slate-500 font-medium text-lg flex items-center gap-3">
              <Calendar className="w-5 h-5 text-indigo-600 opacity-40" /> {currentUser?.name || 'Staff'} marking for {currentUser?.subject || 'Assigned Subject'}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            {/* Year Dropdown */}
            <div className="space-y-2 w-full sm:w-48">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Year</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                  <CalendarDays className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                </div>
                <select 
                  value={selectedYear}
                  onChange={(e) => {
                    setSelectedYear(e.target.value);
                    setSelectedClass(''); // Reset class when year changes
                    setStudents([]);
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
            <div className="space-y-2 w-full sm:w-48">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Semester</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                  <BookOpen className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                </div>
                <select 
                  value={selectedSemester}
                  onChange={(e) => {
                    setSelectedSemester(e.target.value);
                    setSelectedClass(''); // Reset class when semester changes
                    setStudents([]);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-10 py-4 font-black text-[10px] text-slate-900 uppercase tracking-widest outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-200 transition-all appearance-none cursor-pointer shadow-sm"
                  disabled={!selectedYear}
                >
                  <option value="">Select Semester</option>
                  {availableSemesters.map(sem => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Class Dropdown (Sections A, B, C) */}
            <div className="space-y-2 w-full sm:w-48">
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
        </div>
      </div>

      {/* Show message when filters not selected */}
      {(!selectedYear || !selectedSemester || !selectedClass) && (
        <div className="text-center py-20">
          <Users className="w-20 h-20 text-slate-300 mx-auto mb-4" />
          <h3 className="text-2xl font-black text-slate-400 mb-2">Select Filters</h3>
          <p className="text-slate-400">Please select Year, Semester, and Class to view students</p>
        </div>
      )}

      {/* Show loading state */}
      {loading && selectedYear && selectedSemester && selectedClass && (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-500">Loading students...</p>
        </div>
      )}

      {/* Students Registry */}
      {!loading && filteredStudents.length > 0 && (
        <>
      {/* Date Picker Section */}
      <div className="bg-white p-8 rounded-[3rem] border border-slate-100 card-shadow">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="space-y-2 w-full sm:w-56">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Active Date</label>
              <div className="relative">
                <input 
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm font-black text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100 transition-all cursor-pointer shadow-sm"
                />
              </div>
            </div>
          </div>
      </div>

      {/* Main Student List */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden card-shadow">
        <div className="px-8 py-6 border-b border-slate-50 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-8">
            <LegendItem color="bg-emerald-500" label="Present" />
            <LegendItem color="bg-rose-500" label="Absent" />
            <LegendItem color="bg-indigo-500" label="On-Duty (OD)" />
          </div>
          
          <div className="flex items-center gap-6">
            <button 
              onClick={resetFeed}
              className="flex items-center gap-3 px-4 py-2 text-[10px] font-black text-slate-400 hover:text-indigo-600 transition-all uppercase tracking-[0.2em] group"
            >
              <RotateCcw className="w-4 h-4 group-hover:rotate-[-90deg] transition-transform" /> Reset Feed
            </button>
            <div className="h-8 w-px bg-slate-100"></div>
            <div className="flex items-center gap-3 text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100">
              <Info className="w-4 h-4" /> Secure Marking Active
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-50">
          {filteredStudents.map((student) => (
            <div key={student.id} className="px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-8 group hover:bg-slate-50/50 transition-all duration-500">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-slate-400 text-xl group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-sm">
                  {student.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-xl tracking-tighter group-hover:text-indigo-600 transition-colors leading-none mb-1.5">{student.name}</h4>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{student.rollNumber} • {student.year || student.section}</p>
                </div>
              </div>

              <div className="flex items-center p-1.5 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
                <StatusButton 
                  active={attendance[student.id] === 'Present'} 
                  onClick={() => handleStatusChange(student.id, 'Present')}
                  icon={<CheckCircle2 className="w-5 h-5" />}
                  label="Present"
                  activeColor="bg-emerald-600"
                />
                <StatusButton 
                  active={attendance[student.id] === 'Absent'} 
                  onClick={() => handleStatusChange(student.id, 'Absent')}
                  icon={<XCircle className="w-5 h-5" />}
                  label="Absent"
                  activeColor="bg-rose-600"
                />
                <StatusButton 
                  active={attendance[student.id] === 'Late'} 
                  onClick={() => handleStatusChange(student.id, 'Late')}
                  icon={<Briefcase className="w-5 h-5" />}
                  label="On-Duty (OD)"
                  activeColor="bg-indigo-600"
                />
              </div>
            </div>
          ))}

          {filteredStudents.length === 0 && (
            <div className="p-20 text-center text-slate-300">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-sm">
                <Users className="w-8 h-8 opacity-20" />
              </div>
              <p className="font-black uppercase tracking-widest text-xs">No students matching the criteria</p>
            </div>
          )}
        </div>

        <div className="px-10 py-8 bg-slate-50/50 border-t border-slate-100 flex flex-col lg:flex-row justify-end items-center gap-8">
          <div className="flex-1 flex items-center gap-4 text-slate-400">
             <Clock className="w-5 h-5" />
             <span className="text-[10px] font-black uppercase tracking-widest">Marking for: <span className="text-indigo-600">{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span></span>
          </div>
          <button 
            onClick={handleSave}
            disabled={saving || filteredStudents.length === 0}
            className="flex-1 lg:flex-none flex items-center justify-center gap-3 px-12 py-4 rounded-2xl font-black bg-indigo-600 text-white hover:bg-indigo-700 shadow-2xl shadow-indigo-600/10 transition-all active:scale-95 disabled:opacity-30 uppercase tracking-[0.2em] text-[10px] group"
          >
            {saving ? (
              <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Commit Registry
              </>
            )}
          </button>
        </div>
      </div>
      </>
      )}
    </div>
  );
};

/* --- STUDENT DASHBOARD: DEPARTMENT-ALIGNED TIMELINE --- */
const StudentAttendanceFeed = ({ currentUser }: { currentUser: User }) => {
  const currentDay = DAYS[new Date().getDay()];
  const isWeekend = currentDay === 'Sunday';

  // Identify Student Identity from Registry
  const studentData = useMemo(() => {
    return MOCK_STUDENTS.find(s => s.name === currentUser.name) || { class: 'Default', year: 'Global' };
  }, [currentUser]);

  // Resolve Department-Scoped Timetable
  const todayClasses = useMemo(() => {
    const dept = studentData.class;
    const year = studentData.year || 'Global';
    
    // Resolve timetable based on Department + Year hierarchy
    const deptSchedules = DEPARTMENT_SCHEDULES[dept] || DEPARTMENT_SCHEDULES['Default'];
    const yearSchedules = deptSchedules[year] || deptSchedules['Global'] || DEPARTMENT_SCHEDULES['Default']['Global'];
    
    return yearSchedules[currentDay] || [];
  }, [studentData, currentDay]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-16 max-w-[1200px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
             <Calendar className="w-5 h-5 text-indigo-600" />
             <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">
               {currentDay} / {studentData.class} / {studentData.year} Timeline
             </span>
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none mb-3">Daily Timeline</h1>
          <p className="text-slate-500 font-medium text-lg leading-relaxed">Verified session schedule aligned with your department and year.</p>
        </div>
        
        <div className="bg-white px-6 py-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
           <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Registry Pulse: Active</span>
        </div>
      </div>

      {isWeekend ? (
        <div className="p-20 bg-white border border-slate-100 rounded-[4rem] text-center card-shadow">
          <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-slate-300">
             <Calendar className="w-10 h-10" />
          </div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Academic Respite</h3>
          <p className="text-slate-400 font-medium mt-2">No scheduled classes for {currentDay}. Review your previous logs in the Archives.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {todayClasses.map((log, i) => (
            <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/30 rounded-bl-[4rem] -translate-y-4 translate-x-4 group-hover:bg-indigo-600/5 transition-colors"></div>
              
              <div className="flex items-center justify-between mb-8 relative z-10">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{currentDay.slice(0, 3)} Slot</span>
                <div className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[0.1em] border ${
                  log.subject === 'Institutional Break' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                  log.subject === 'Free Period' ? 'bg-slate-50 text-slate-400 border-slate-100' :
                  'bg-indigo-50 text-indigo-600 border-indigo-100'
                }`}>
                  {log.subject === 'Institutional Break' ? 'RECESS' : log.subject === 'Free Period' ? 'FREE' : 'CORE'}
                </div>
              </div>
              
              <h5 className="text-2xl font-black text-slate-900 tracking-tighter mb-4 group-hover:text-indigo-600 transition-colors leading-tight relative z-10">
                {log.subject}
              </h5>
              
              <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-[0.1em] relative z-10">
                <Clock className="w-4 h-4 text-indigo-500" /> {log.time}
              </div>
            </div>
          ))}
          {todayClasses.length === 0 && (
             <div className="col-span-full p-20 text-center bg-white border border-dashed border-slate-200 rounded-[3rem]">
                <p className="text-slate-300 font-black uppercase tracking-widest text-xs">No classes scheduled for your track today.</p>
             </div>
          )}
        </div>
      )}
    </div>
  );
};

const LegendItem = ({ color, label }: { color: string; label: string }) => (
  <div className="flex items-center gap-3">
    <div className={`w-3 h-3 rounded-full ${color} shadow-sm`}></div>
    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</span>
  </div>
);

const StatusButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string; activeColor: string }> = ({ active, onClick, icon, label, activeColor }) => (
  <button
    onClick={onClick}
    className={`
      flex items-center gap-3 px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.1em] transition-all duration-500
      ${active ? `${activeColor} text-white shadow-lg scale-105 z-10 border border-white/10` : 'text-slate-400 hover:text-indigo-600 hover:bg-white'}
    `}
  >
    {icon}
    {label}
  </button>
);

export default AttendanceMarking;
