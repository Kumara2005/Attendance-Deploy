
import React, { useState, useEffect, useMemo } from 'react';
import { MOCK_STUDENTS } from '../constants';
import { 
  CheckCircle2, 
  XCircle, 
  Briefcase, 
  Info, 
  Save, 
  RotateCcw, 
  Calendar, 
  ChevronRight,
  BookOpen,
  Clock,
  Zap,
  ChevronDown,
  CalendarDays,
  Users
} from 'lucide-react';
import { UserRole, User } from '../types';
import apiClient from '../services/api';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** 
 * INSTITUTIONAL TIMETABLE REPOSITORY
 * Strictly mapped by Department -> Year -> Day
 * Prevents cross-department curriculum leakage.
 */
const DEPARTMENT_SCHEDULES: Record<string, Record<string, Record<string, { subject: string, time: string }[]>>> = {
  'B.Sc Computer Science': {
    'Year 1': {
      'Monday': [
        { subject: 'Basics of Computer Science', time: '09:00 AM' },
        { subject: 'Digital Electronics', time: '09:45 AM' },
        { subject: 'Institutional Break', time: '12:00 PM' },
        { subject: 'Mathematical Structures', time: '01:00 PM' },
      ],
      'Tuesday': [
        { subject: 'Computer Organization', time: '09:00 AM' },
        { subject: 'English Communication', time: '09:45 AM' },
        { subject: 'Programming in C', time: '10:45 AM' },
        { subject: 'Free Period', time: '01:00 PM' },
      ],
      'Wednesday': [
        { subject: 'Programming in C (Lab)', time: '09:00 AM' },
        { subject: 'Mathematical Structures', time: '10:45 AM' },
        { subject: 'Basics of Computer Science', time: '11:30 AM' },
        { subject: 'Soft Skills', time: '01:00 PM' },
      ],
      'Thursday': [
        { subject: 'Digital Electronics', time: '09:00 AM' },
        { subject: 'Free Period', time: '09:45 AM' },
        { subject: 'English Communication', time: '11:30 AM' },
        { subject: 'Computer Organization', time: '01:00 PM' },
      ],
      'Friday': [
        { subject: 'Mathematical Structures', time: '09:00 AM' },
        { subject: 'Programming in C', time: '09:45 AM' },
        { subject: 'Basics of Computer Science', time: '10:45 AM' },
        { subject: 'Digital Electronics (Lab)', time: '01:00 PM' },
      ],
      'Saturday': [
        { subject: 'Remedial Session', time: '09:30 AM' },
        { subject: 'Tech Seminar', time: '11:00 AM' },
      ],
    },
    'Year 2': {
      'Monday': [
        { subject: 'Data Structures', time: '09:00 AM' },
        { subject: 'Operating Systems', time: '09:45 AM' },
        { subject: 'Institutional Break', time: '12:00 PM' },
        { subject: 'Java Programming', time: '01:00 PM' },
      ],
      'Tuesday': [
        { subject: 'Database Management', time: '09:00 AM' },
        { subject: 'Computer Networks', time: '10:45 AM' },
        { subject: 'Software Engineering', time: '01:00 PM' },
      ],
      'Wednesday': [
        { subject: 'Data Structures (Lab)', time: '09:00 AM' },
        { subject: 'Java Programming', time: '11:30 AM' },
        { subject: 'Operating Systems', time: '01:00 PM' },
      ],
      'Thursday': [
        { subject: 'Computer Networks', time: '09:00 AM' },
        { subject: 'DBMS (Lab)', time: '10:45 AM' },
        { subject: 'Data Structures', time: '01:00 PM' },
      ],
      'Friday': [
        { subject: 'Java (Lab)', time: '09:00 AM' },
        { subject: 'Software Engineering', time: '11:30 AM' },
        { subject: 'Database Management', time: '01:00 PM' },
      ],
      'Saturday': [
        { subject: 'Project Lab', time: '09:30 AM' },
        { subject: 'Placement Training', time: '11:00 AM' },
      ],
    },
    'Year 3': {
      'Monday': [
        { subject: 'Python Programming', time: '09:00 AM' },
        { subject: 'Artificial Intelligence', time: '09:45 AM' },
        { subject: 'Cloud Computing', time: '01:00 PM' },
      ],
      'Tuesday': [
        { subject: 'Mobile App Development', time: '09:00 AM' },
        { subject: 'Cyber Security', time: '10:45 AM' },
        { subject: 'Final Project', time: '01:00 PM' },
      ],
      'Wednesday': [
        { subject: 'Machine Learning', time: '09:00 AM' },
        { subject: 'Python (Lab)', time: '10:45 AM' },
        { subject: 'Artificial Intelligence', time: '01:00 PM' },
      ],
      'Thursday': [
        { subject: 'Cloud Computing', time: '09:00 AM' },
        { subject: 'Mobile App (Lab)', time: '10:45 AM' },
        { subject: 'Cyber Security', time: '01:00 PM' },
      ],
      'Friday': [
        { subject: 'Advanced Web Tech', time: '09:00 AM' },
        { subject: 'Final Project Lab', time: '11:30 AM' },
        { subject: 'AI Ethics', time: '01:00 PM' },
      ],
      'Saturday': [
        { subject: 'Industry Seminar', time: '09:30 AM' },
        { subject: 'Viva Voce Prep', time: '11:00 AM' },
      ],
    }
  },
  'Arts': {
    'Year 1': {
      'Monday': [
        { subject: 'Political Science', time: '09:00 AM' },
        { subject: 'Psychology', time: '09:45 AM' },
        { subject: 'Sociology', time: '10:45 AM' },
        { subject: 'English Literature', time: '11:30 AM' },
        { subject: 'Institutional Break', time: '12:00 PM' },
        { subject: 'Economics', time: '01:00 PM' },
      ],
      'Tuesday': [
        { subject: 'English Literature', time: '09:00 AM' },
        { subject: 'Fine Arts', time: '09:45 AM' },
        { subject: 'Journalism', time: '10:45 AM' },
        { subject: 'Free Period', time: '11:30 AM' },
        { subject: 'Philosophy', time: '01:00 PM' },
      ],
      'Wednesday': [
        { subject: 'Economics', time: '09:00 AM' },
        { subject: 'Public Administration', time: '09:45 AM' },
        { subject: 'English Literature', time: '10:45 AM' },
        { subject: 'Psychology', time: '11:30 AM' },
        { subject: 'Art History', time: '01:00 PM' },
      ],
      'Thursday': [
        { subject: 'Sociology', time: '09:00 AM' },
        { subject: 'Philosophy', time: '09:45 AM' },
        { subject: 'Free Period', time: '10:45 AM' },
        { subject: 'Political Science', time: '11:30 AM' },
        { subject: 'Fine Arts', time: '01:00 PM' },
      ],
      'Friday': [
        { subject: 'Journalism', time: '09:00 AM' },
        { subject: 'English Literature', time: '09:45 AM' },
        { subject: 'Public Administration', time: '10:45 AM' },
        { subject: 'Economics', time: '11:30 AM' },
        { subject: 'Psychology', time: '01:00 PM' },
      ],
      'Saturday': [
        { subject: 'Seminar Session', time: '09:30 AM' },
        { subject: 'Sociology Workshop', time: '11:00 AM' },
      ],
    }
  },
  'Science': {
    'Year 2': {
      'Monday': [
        { subject: 'Advanced Physics', time: '09:00 AM' },
        { subject: 'Organic Chemistry', time: '10:45 AM' },
        { subject: 'Pure Mathematics', time: '01:00 PM' },
      ],
    }
  },
  'Default': {
    'Global': {
      'Monday': [
        { subject: 'General Assembly', time: '09:00 AM' },
        { subject: 'Institutional Studies', time: '10:00 AM' },
      ],
    }
  }
};

const AttendanceMarking: React.FC = () => {
  const role = (window as any).currentUserRole || UserRole.ADMIN;
  const currentUser = (window as any).currentUser as User;
  const isStudent = role === UserRole.STUDENT;

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Cascading dropdown states
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  
  // Available options for dropdowns
  const [availableYears, setAvailableYears] = useState<number[]>([]);
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

  // Fetch students when all filters are selected
  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
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

  const handleSave = () => {
    if (isStudent) return;
    setSaving(true);
    const history = JSON.parse(localStorage.getItem('attendx_history_attendance') || '{}');
    history[selectedDate] = attendance;
    localStorage.setItem('attendx_history_attendance', JSON.stringify(history));
    localStorage.setItem('attendx_session_attendance', JSON.stringify(attendance));
    setTimeout(() => {
      setSaving(false);
      alert(`Attendance for ${currentUser?.subject || 'Class'} on ${new Date(selectedDate).toLocaleDateString()} has been successfully committed.`);
    }, 1200);
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
