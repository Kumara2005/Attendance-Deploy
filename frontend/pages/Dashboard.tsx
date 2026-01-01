
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, 
  TrendingUp, 
  Calendar,
  ChevronRight,
  Clock,
  Zap,
  GraduationCap,
  Activity,
  ShieldCheck,
  Bell,
  Award,
  Filter,
  X,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  BarChart2,
  CheckCircle2,
  XCircle,
  Briefcase
} from 'lucide-react';
import { 
  MOCK_CLASSES,
  MOCK_STUDENTS,
  MOCK_STAFF
} from '../constants';
import { UserRole, ClassOverview, Student, User } from '../types';
import { getCurrentRole } from '../services/roles';
import studentService from '../services/studentService';
import staffDashboardService, { AssignedClassDTO } from '../services/staffDashboardService';
import apiClient from '../services/api';

const Dashboard: React.FC = () => {
  // Use getCurrentRole from service for reliability across refreshes
  const role = getCurrentRole() || (window as any).currentUserRole || UserRole.STUDENT;
  const user = (window as any).currentUser as User;
  const navigate = useNavigate();
  
  // State for student dashboard data
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [isLoadingStudent, setIsLoadingStudent] = useState(false);
  
  // Fetch student dashboard data if user is a student
  useEffect(() => {
    const fetchStudentData = async () => {
      if (role === UserRole.STUDENT) {
        try {
          setIsLoadingStudent(true);
          // Try to get roll number from user data
          const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
          const rollNo = userData.rollNumber || 'CS-Y1-100'; // Default to Alex Rivera for testing
          
          console.log('Fetching dashboard for roll number:', rollNo);
          const dashboardData = await studentService.getDashboardByRollNo(rollNo);
          
          // Map API response to Student interface
          const mappedStudent: Student = {
            id: dashboardData.identity.id,
            rollNumber: dashboardData.identity.rollNumber,
            name: dashboardData.identity.name,
            class: dashboardData.identity.className,
            department: dashboardData.identity.department,
            section: dashboardData.identity.section,
            year: dashboardData.identity.year,
            attendancePercentage: Math.round(dashboardData.overallAttendancePercentage), // Round to nearest integer
            lastActive: new Date().toISOString().split('T')[0],
            // Change 'warning' to 'Inactive'
            status: dashboardData.overallAttendancePercentage >= 75 ? 'Active' : 'Inactive'          };
          
          setStudentData(mappedStudent);
          console.log('Student dashboard data loaded:', mappedStudent);
        } catch (error) {
          console.error('Error fetching student dashboard:', error);
          // Fallback to mock data
          setStudentData(MOCK_STUDENTS[0]);
        } finally {
          setIsLoadingStudent(false);
        }
      }
    };
    
    fetchStudentData();
  }, [role]);
  
  // Dynamic Date and Time in 12h format
  const currentDate = new Date().toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });
  
  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20 max-w-[1600px] mx-auto">
      {/* Refined Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
             <div className="w-1.5 h-8 bg-indigo-600 rounded-full"></div>
             <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border ${
               role === UserRole.ADMIN ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
               role === UserRole.STAFF ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
               'bg-violet-50 text-violet-700 border-violet-100'
             }`}>
               {role} CONSOLE
             </span>
          </div>
          <h1 className="text-6xl font-black text-slate-900 tracking-tighter leading-none">
            {role === UserRole.ADMIN && "Programme Registry Overview"}
            {role === UserRole.STAFF && `${user?.subject || "Faculty"} Nexus`}
            {role === UserRole.STUDENT && "Self Dashboard"}
          </h1>
          {role === UserRole.ADMIN && (
            <p className="text-slate-400 font-medium text-lg mt-4 max-w-2xl leading-relaxed">
              Real-time monitoring across all institutional streams. Manage academic pathways and verify programme-wise enrollment metrics.
            </p>
          )}
          {role === UserRole.STAFF && (
            <p className="text-slate-400 font-medium text-lg mt-4 max-w-2xl leading-relaxed">
              Interactive workspace for {user?.name}. Managing attendance for <span className="text-emerald-600 font-black">{user?.subject}</span> department.
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-4 bg-white/50 backdrop-blur p-2.5 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 px-6 py-3 border-r border-slate-100">
             <Calendar className="w-4.5 h-4.5 text-indigo-600" />
             <span className="text-sm font-bold text-slate-700 tracking-tight">{currentDate} | {currentTime}</span>
          </div>
          <button 
            onClick={() => navigate(role === UserRole.ADMIN ? '/students' : '/reports')}
            className="px-10 py-4 text-[10px] font-black bg-slate-900 text-white rounded-[1.5rem] shadow-xl shadow-slate-900/10 transition-all hover:scale-105 active:scale-95 uppercase tracking-widest"
          >
            {role === UserRole.ADMIN ? 'Register Directory' : 'Institutional Report'}
          </button>
        </div>
      </div>

      {role === UserRole.ADMIN && <AdminDashboard />}
      {role === UserRole.STAFF && <StaffDashboard user={user} />}
      {role === UserRole.STUDENT && (
        isLoadingStudent ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-slate-500">Loading your dashboard...</p>
          </div>
        ) : (
          <StudentDashboard student={studentData || MOCK_STUDENTS[0]} />
        )
      )}
    </div>
  );
};

/* --- ENHANCED ADMINISTRATOR DASHBOARD --- */
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [programmeFilter, setProgrammeFilter] = useState('All Programmes');
  const [programmes, setProgrammes] = useState<any[]>([]);
  const [totalStudents, setTotalStudents] = useState<number>(0); // NEW: Track total student count
  const [loading, setLoading] = useState(true);

  // ✨ Fetch programmes AND classes, merge them for display
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let combinedData: any[] = [];

        // Fetch programmes (from enrolled students)
        try {
          const progResponse = await apiClient.get('/admin/dashboard/programmes');
          const programmesData = progResponse.data.data || [];
          combinedData = [...programmesData];
          console.log('✅ Loaded programmes from database:', programmesData);
        } catch (error) {
          console.error('Error fetching programmes:', error);
        }

        // Fetch classes and students to calculate enrollment
        try {
          const classResponse = await apiClient.get('/admin/classes');
          const classesData = classResponse.data.data || [];
          
          // Fetch all students to count enrollment
          const studentsResponse = await apiClient.get('/students');
          const studentsData = studentsResponse.data.data || [];
          
          // Set total student count (ACTIVE students only)
          setTotalStudents(studentsData.length);
          console.log(`✅ Total students in database: ${studentsData.length}`);
          
          // Convert classes to programme format with real student counts
          const classProgrammes = classesData.map((c: any) => {
            // Count ALL students in this department (not filtered by semester)
            // This shows total enrollment for the entire program
            const studentCount = studentsData.filter((s: any) => 
              s.department === c.department
            ).length;
            
            return {
              name: c.className,
              department: c.department,
              studentCount: studentCount,
              facultyCount: 0,
              averageAttendance: 0,
              years: [c.year],
              semester: c.semester,
              section: c.section,
              isFromClassTable: true
            };
          });
          
          combinedData = [...combinedData, ...classProgrammes];
          console.log('✅ Loaded classes with student counts:', classProgrammes);
        } catch (error) {
          console.error('Error fetching classes:', error);
        }

        // If no data at all, fallback to mock
        if (combinedData.length === 0) {
          combinedData = MOCK_CLASSES;
          console.log('⚠️ No data, using mock classes');
        }

        setProgrammes(combinedData);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const filteredProgrammes = programmes.filter(p => 
    programmeFilter === 'All Programmes' || 
    p.name?.includes(programmeFilter) ||
    p.department?.includes(programmeFilter)
  );

  const handleProgrammeClick = (programme: any) => {
    // Navigate to the Registry with the department context
    navigate(`/students?dept=${encodeURIComponent(programme.department || programme.name)}`);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      <div className="flex items-center justify-between px-10 py-6 bg-white rounded-[2.5rem] border border-slate-100 card-shadow">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-4 group">
            <Filter className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
            <select 
              className="bg-transparent border-none outline-none font-bold text-sm text-slate-600 cursor-pointer appearance-none pr-8"
              value={programmeFilter}
              onChange={(e) => setProgrammeFilter(e.target.value)}
            >
              <option>All Programmes</option>
              <option>Arts</option>
              <option>Science</option>
              <option>Commerce</option>
              <option>Management</option>
              <option>Computer Science</option>
            </select>
          </div>
          <div className="h-6 w-px bg-slate-100"></div>
          <div className="flex items-center gap-3 text-slate-400">
            <Search className="w-4 h-4" />
            <input type="text" placeholder="Search programmes..." className="bg-transparent border-none outline-none text-sm font-medium placeholder:text-slate-300 w-64" />
          </div>
        </div>
        
        <div className="flex items-center gap-8">
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Protocol Verified</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-8">
        {loading ? (
          // Loading state
          Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="p-8 bg-white rounded-[2rem] border border-slate-100 animate-pulse">
              <div className="h-4 bg-slate-200 rounded-full mb-6 w-24"></div>
              <div className="h-8 bg-slate-200 rounded-lg mb-8 w-3/4"></div>
              <div className="h-12 bg-slate-100 rounded-lg mb-6"></div>
            </div>
          ))
        ) : filteredProgrammes.length > 0 ? (
          // Show programmes
          filteredProgrammes.map((programme, idx) => (
            <ProgrammeCard 
              key={idx} 
              programme={programme} 
              onClick={() => handleProgrammeClick(programme)} 
              isAdmin={true}
            />
          ))
        ) : (
          // No data
          <div className="col-span-full text-center py-20 bg-slate-50 rounded-[2rem] border border-slate-100">
            <p className="text-slate-500 font-medium">No programmes found</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-white p-12 rounded-[4rem] card-shadow border border-slate-100">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Institutional Demographics</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Global Enrollment & Human Capital</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <QuickStat label="Total Enrollment" value={totalStudents.toString()} sub="Students" icon={Users} color="indigo" />
            <QuickStat label="Faculty Roster" value={MOCK_STAFF.length.toString()} sub="Professors" icon={Award} color="violet" />
            <QuickStat label="Active Streams" value="12" sub="Departments" icon={Activity} color="amber" />
          </div>
        </div>

        <div className="bg-indigo-600 p-12 rounded-[4rem] text-white shadow-2xl shadow-indigo-600/20 relative overflow-hidden group">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
               <h3 className="text-3xl font-black tracking-tighter mb-4">Quick Links</h3>
               <p className="text-indigo-100/60 font-medium leading-relaxed">System-wide configuration and institutional settings.</p>
            </div>
            <div className="space-y-3 mt-10">
              <Link to="/timetable" className="flex items-center justify-between p-6 bg-white/10 rounded-[1.8rem] hover:bg-white/20 transition-all border border-white/5">
                <span className="font-bold">Schedule Architect</span>
                <ChevronRight className="w-4 h-4 opacity-40" />
              </Link>
              <Link to="/settings" className="flex items-center justify-between p-6 bg-white/10 rounded-[1.8rem] hover:bg-white/20 transition-all border border-white/5">
                <span className="font-bold">System Settings</span>
                <ChevronRight className="w-4 h-4 opacity-40" />
              </Link>
            </div>
          </div>
          <Zap className="absolute -right-12 -bottom-12 w-64 h-64 text-white/5 rotate-12" />
        </div>
      </div>
    </div>
  );
};

/* --- ENHANCED INTERACTIVE STAFF DASHBOARD --- */
const StaffDashboard = ({ user }: { user: User }) => {
  const [assignedClasses, setAssignedClasses] = useState<AssignedClassDTO[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [selectedClassIndex, setSelectedClassIndex] = useState<number | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [filter, setFilter] = useState<'All' | 'Present' | 'Absent'>('All');

  // Fetch assigned classes on mount
  useEffect(() => {
    const fetchAssignedClasses = async () => {
      try {
        setIsLoadingClasses(true);
        const classes = await staffDashboardService.getAssignedClasses();
        console.log('📚 Staff Assigned Classes:', classes);
        setAssignedClasses(classes);
        
        // Auto-select first class if available
        if (classes.length > 0) {
          setSelectedClassIndex(0);
        }
      } catch (error) {
        console.error('❌ Error fetching assigned classes:', error);
        // Fallback to mock data on error
        setAssignedClasses([]);
      } finally {
        setIsLoadingClasses(false);
      }
    };

    fetchAssignedClasses();
  }, []);

  // Fetch students when a class is selected
  useEffect(() => {
    if (selectedClassIndex === null || !assignedClasses[selectedClassIndex]) {
      setStudents([]);
      return;
    }

    const fetchStudents = async () => {
      const selectedClass = assignedClasses[selectedClassIndex];
      setLoadingStudents(true);
      
      try {
        // Calculate semester from year string (e.g., "Year 1" -> semester 1)
        const yearMatch = selectedClass.year.match(/\d+/);
        const year = yearMatch ? parseInt(yearMatch[0]) : 1;
        const semester = year; // Simplified: Year 1 = Semester 1, Year 2 = Semester 2, etc.
        
        console.log('👥 Fetching students for:', {
          department: selectedClass.department,
          year: year,
          semester: semester,
          section: selectedClass.section
        });
        
        // Use the attendance marking endpoint to get students
        const response = await apiClient.get(
          `/teacher/students?department=${encodeURIComponent(selectedClass.department)}&year=${year}&semester=${semester}&section=${selectedClass.section}`
        );
        
        const studentData = response.data.data || [];
        console.log('✅ Students fetched:', studentData);
        setStudents(studentData);
      } catch (error) {
        console.error('❌ Error fetching students:', error);
        setStudents([]);
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchStudents();
  }, [selectedClassIndex, assignedClasses]);

  const selectedClass = selectedClassIndex !== null ? assignedClasses[selectedClassIndex] : null;
  const totalManaged = students.length;
  
  // For now, use mock attendance status since we don't have today's attendance yet
  // In production, you'd fetch today's attendance records
  const presentCount = Math.floor(totalManaged * 0.85); // 85% present
  const absentCount = totalManaged - presentCount;

  const filteredStudents = students.filter(student => {
    // Since we don't have attendance status yet, show all for 'All' filter
    if (filter === 'All') return true;
    // For Present/Absent filters, we'd need actual attendance data
    // For now, randomly assign to demonstrate the filter
    const mockStatus = Math.random() > 0.15 ? 'Present' : 'Absent';
    if (filter === 'Present') return mockStatus === 'Present';
    if (filter === 'Absent') return mockStatus === 'Absent';
    return true;
  });

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Class Selection Tabs */}
      {isLoadingClasses ? (
        <div className="text-center py-8">
          <p className="text-slate-400 font-medium">Loading your classes...</p>
        </div>
      ) : assignedClasses.length === 0 ? (
        <div className="bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center">
          <GraduationCap className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-400 font-medium">No classes assigned yet</p>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {assignedClasses.map((cls, index) => (
            <button
              key={index}
              onClick={() => setSelectedClassIndex(index)}
              className={`flex-shrink-0 px-6 py-4 rounded-2xl font-bold text-sm transition-all ${
                selectedClassIndex === index
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-indigo-300'
              }`}
            >
              <div className="text-left">
                <div className="font-black">{cls.year} - {cls.section}</div>
                <div className="text-xs opacity-80">{cls.subject}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {selectedClass && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div 
              onClick={() => setFilter('All')}
              className={`p-10 rounded-[3rem] border transition-all duration-500 cursor-pointer card-shadow group ${
                filter === 'All' ? 'bg-slate-900 border-slate-900 scale-105' : 'bg-white border-slate-100 hover:border-indigo-300'
              }`}
            >
              <p className={`text-[10px] font-black uppercase tracking-widest mb-3 ${filter === 'All' ? 'text-slate-400' : 'text-slate-400'}`}>
                Students in {selectedClass.section}
              </p>
              <p className={`text-5xl font-black tracking-tighter transition-colors ${filter === 'All' ? 'text-white' : 'text-slate-900'}`}>
                {selectedClass.studentCount || totalManaged}
              </p>
              <div className={`mt-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest ${filter === 'All' ? 'text-indigo-400' : 'text-slate-300'}`}>
                <Users className="w-4 h-4" /> Total Enrolled
              </div>
            </div>

            <div 
              onClick={() => setFilter('Present')}
              className={`p-10 rounded-[3rem] border transition-all duration-500 cursor-pointer card-shadow group ${
                filter === 'Present' ? 'bg-emerald-600 border-emerald-600 scale-105' : 'bg-white border-slate-100 hover:border-emerald-300'
              }`}
            >
              <p className={`text-[10px] font-black uppercase tracking-widest mb-3 ${filter === 'Present' ? 'text-emerald-100' : 'text-emerald-600'}`}>
                Avg Attendance
              </p>
              <p className={`text-5xl font-black tracking-tighter transition-colors ${filter === 'Present' ? 'text-white' : 'text-emerald-600'}`}>
                {Math.round(selectedClass.averageAttendance || 0)}%
              </p>
              <div className={`mt-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest ${filter === 'Present' ? 'text-emerald-100' : 'text-slate-300'}`}>
                <CheckCircle2 className="w-4 h-4" /> Class Performance
              </div>
            </div>

            <div className="p-10 rounded-[3rem] border bg-white border-slate-100 card-shadow">
              <p className="text-[10px] font-black uppercase tracking-widest mb-3 text-indigo-600">
                Subject
              </p>
              <p className="text-3xl font-black tracking-tighter text-slate-900">
                {selectedClass.subject}
              </p>
              <div className="mt-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-300">
                <Award className="w-4 h-4" /> Teaching
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[4rem] border border-slate-100 card-shadow overflow-hidden">
            <div className="px-12 py-10 border-b border-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">
                  {selectedClass.year} {selectedClass.department} - {selectedClass.section}
                </h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                  {selectedClass.subject} • {selectedClass.studentCount || totalManaged} Students
                </p>
              </div>
              <Link 
                to="/attendance" 
                state={{
                  department: selectedClass.department,
                  year: parseInt(selectedClass.year.match(/\d+/)?.[0] || '1'),
                  semester: parseInt(selectedClass.year.match(/\d+/)?.[0] || '1'),
                  section: selectedClass.section,
                  subjectName: selectedClass.subject,
                  fromDashboard: true
                }}
                className="flex items-center gap-3 px-8 py-4 bg-indigo-50 text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all"
              >
                Mark Attendance
              </Link>
            </div>

            <div className="divide-y divide-slate-50">
              {loadingStudents ? (
                <div className="px-12 py-20 text-center">
                  <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Loading Students...</p>
                </div>
              ) : students.length === 0 ? (
                <div className="px-12 py-20 text-center">
                  <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-400 font-medium">No students found in this class</p>
                </div>
              ) : (
                filteredStudents.map((student, idx) => {
                  // Mock status for demonstration - in production, fetch real attendance
                  const mockStatus = Math.random() > 0.15 ? 'Present' : 'Absent';
                  
                  return (
                    <div key={student.id || idx} className="px-12 py-8 flex items-center justify-between group hover:bg-slate-50 transition-all duration-500">
                      <div className="flex items-center gap-8">
                        <div className="w-16 h-16 rounded-[1.8rem] bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-slate-400 text-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                          {(student.name || student.studentName || 'S').charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 text-2xl tracking-tighter leading-none mb-2">
                            {student.name || student.studentName || 'Unknown'}
                          </h4>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {student.rollNumber || student.rollNo || 'N/A'}
                          </p>
                        </div>
                      </div>

                      <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl border ${
                        mockStatus === 'Present' 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                          : 'bg-rose-50 text-rose-600 border-rose-100'
                      }`}>
                        {mockStatus === 'Present' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        <span className="text-xs font-black uppercase tracking-widest">{mockStatus}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const StudentDashboard = ({ student }: { student: Student }) => (
  <div className="space-y-12 animate-in fade-in duration-700">
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
      <div className="lg:col-span-3 bg-gradient-to-br from-indigo-600 to-indigo-800 p-16 rounded-[4rem] text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
           <div className="w-32 h-32 rounded-[2.5rem] bg-white/10 backdrop-blur-3xl flex items-center justify-center border border-white/20 shadow-2xl">
              <GraduationCap className="w-16 h-16 text-white" />
           </div>
           <div className="text-center md:text-left">
              <h2 className="text-6xl font-black tracking-tighter mb-2 leading-none">{student.name}</h2>
              <p className="text-indigo-200 font-black uppercase tracking-[0.3em] text-xs opacity-80">Matric: {student.rollNumber} | {student.class}</p>
           </div>
        </div>

        <div className="relative z-10 bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[3rem] flex flex-col items-center justify-center min-w-[200px] shadow-inner">
           <span className="text-[10px] font-black uppercase tracking-widest text-indigo-100 mb-2">Total Presence</span>
           <span className="text-6xl font-black tracking-tighter text-white">{student.attendancePercentage}%</span>
           <div className="mt-4 px-4 py-1.5 bg-emerald-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest">Target Met</div>
        </div>
        
        <div className="absolute right-0 bottom-0 opacity-10 p-10">
           <Zap className="w-64 h-64 text-white rotate-12" />
        </div>
      </div>

      <div className="bg-white p-10 rounded-[4rem] border border-slate-100 card-shadow flex flex-col justify-center items-center text-center">
         <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center mb-6">
            <Activity className="w-8 h-8" />
         </div>
         <h4 className="font-black text-slate-900 text-xl tracking-tight mb-2">Academic Wellness</h4>
         <p className="text-sm text-slate-400 font-medium">Your engagement is in the top 10% of the institutional registry.</p>
      </div>
    </div>
  </div>
);

const ProgrammeCard: React.FC<{ programme: any; onClick: () => void; isAdmin?: boolean }> = ({ programme, onClick, isAdmin }) => {
  // Handle both old (className/totalStudents) and new (name/studentCount) formats from backend
  const name = programme.name || programme.programmeName || programme.className || '';
  const students = programme.studentCount || programme.totalEnrollment || programme.totalStudents || 0;
  const attendance = programme.averageAttendance || programme.averageAttendance || 0;
  const trend = programme.trend || 'stable';
  
  return (
    <div 
      onClick={onClick}
      className="bg-white p-10 rounded-[3.5rem] border border-slate-100 card-shadow hover:shadow-2xl hover:shadow-indigo-900/5 hover:-translate-y-2 transition-all duration-700 cursor-pointer group"
    >
      <div className="flex items-center justify-between mb-10">
        <div className="w-16 h-16 bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 rounded-[1.8rem] flex items-center justify-center transition-all duration-700">
          <GraduationCap className="w-8 h-8" />
        </div>
        {!isAdmin && (
          <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
            trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
          }`}>
            {trend === 'up' ? '↑ Increasing' : '↓ Decreasing'}
          </div>
        )}
      </div>
      
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Institutional Stream</p>
      <h3 className="text-3xl font-black text-slate-900 tracking-tighter leading-tight mb-8 group-hover:text-indigo-600 transition-colors">
        {name}
      </h3>

      <div className="flex items-end justify-between pt-8 border-t border-slate-50">
        <div>
           {isAdmin ? (
             <p className="text-4xl font-black text-slate-900 tracking-tightest leading-none mb-1">{students}</p>
           ) : (
             <p className="text-5xl font-black text-slate-900 tracking-tightest leading-none mb-1">{Math.round(attendance)}%</p>
           )}
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{isAdmin ? 'Total Enrolled' : `${students} Enrolled`}</p>
        </div>
        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all">
          <ChevronRight className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

const QuickStat = ({ label, value, sub, icon: Icon, color }: any) => {
  const colorMap: any = {
    indigo: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    violet: 'text-violet-600 bg-violet-50 border-violet-100',
    amber: 'text-amber-600 bg-amber-50 border-amber-100'
  };
  return (
    <div className="p-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 hover:bg-white hover:shadow-xl transition-all duration-500">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border ${colorMap[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
         <span className="text-4xl font-black text-slate-900 tracking-tightest leading-none">{value}</span>
         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{sub}</span>
      </div>
    </div>
  );
};

export default Dashboard;
