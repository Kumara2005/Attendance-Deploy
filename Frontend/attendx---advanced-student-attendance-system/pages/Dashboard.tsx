
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
            status: dashboardData.overallAttendancePercentage >= 75 ? 'good' : 'warning'
          };
          
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

  const filteredProgrammes = MOCK_CLASSES.filter(p => 
    programmeFilter === 'All Programmes' || p.className.includes(programmeFilter)
  );

  const handleProgrammeClick = (programme: ClassOverview) => {
    // Navigate to the Registry with the department context
    navigate(`/students?dept=${encodeURIComponent(programme.className)}`);
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
        {filteredProgrammes.map((programme, idx) => (
          <ProgrammeCard 
            key={idx} 
            programme={programme} 
            onClick={() => handleProgrammeClick(programme)} 
            isAdmin={true}
          />
        ))}
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
            <QuickStat label="Total Enrollment" value="1,600" sub="Students" icon={Users} color="indigo" />
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
  const [filter, setFilter] = useState<'All' | 'Present' | 'Absent'>('All');
  const [attendanceData, setAttendanceData] = useState<Record<string, string>>({});

  useEffect(() => {
    // Sync data from localStorage
    const stored = localStorage.getItem('attendx_session_attendance');
    if (stored) {
      setAttendanceData(JSON.parse(stored));
    } else {
      const defaultAttendance = Object.fromEntries(MOCK_STUDENTS.map(s => [s.id, 'Present']));
      setAttendanceData(defaultAttendance);
    }
  }, []);

  const totalManaged = MOCK_STUDENTS.length;
  const presentCount = Object.values(attendanceData).filter(v => v === 'Present' || v === 'Late').length;
  const absentCount = Object.values(attendanceData).filter(v => v === 'Absent').length;

  const filteredStudents = MOCK_STUDENTS.filter(student => {
    const status = attendanceData[student.id];
    if (filter === 'All') return true;
    if (filter === 'Present') return status === 'Present' || status === 'Late';
    if (filter === 'Absent') return status === 'Absent';
    return true;
  });

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div 
          onClick={() => setFilter('All')}
          className={`p-10 rounded-[3rem] border transition-all duration-500 cursor-pointer card-shadow group ${
            filter === 'All' ? 'bg-slate-900 border-slate-900 scale-105' : 'bg-white border-slate-100 hover:border-indigo-300'
          }`}
        >
          <p className={`text-[10px] font-black uppercase tracking-widest mb-3 ${filter === 'All' ? 'text-slate-400' : 'text-slate-400'}`}>Students for {user?.subject}</p>
          <p className={`text-5xl font-black tracking-tighter transition-colors ${filter === 'All' ? 'text-white' : 'text-slate-900'}`}>{totalManaged}</p>
          <div className={`mt-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest ${filter === 'All' ? 'text-indigo-400' : 'text-slate-300'}`}>
            <Users className="w-4 h-4" /> Department Registry
          </div>
        </div>

        <div 
          onClick={() => setFilter('Present')}
          className={`p-10 rounded-[3rem] border transition-all duration-500 cursor-pointer card-shadow group ${
            filter === 'Present' ? 'bg-emerald-600 border-emerald-600 scale-105' : 'bg-white border-slate-100 hover:border-emerald-300'
          }`}
        >
          <p className={`text-[10px] font-black uppercase tracking-widest mb-3 ${filter === 'Present' ? 'text-emerald-100' : 'text-emerald-600'}`}>In Class Today</p>
          <p className={`text-5xl font-black tracking-tighter transition-colors ${filter === 'Present' ? 'text-white' : 'text-emerald-600'}`}>{presentCount}</p>
          <div className={`mt-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest ${filter === 'Present' ? 'text-emerald-100' : 'text-slate-300'}`}>
            <CheckCircle2 className="w-4 h-4" /> Verified Presence
          </div>
        </div>

        <div 
          onClick={() => setFilter('Absent')}
          className={`p-10 rounded-[3rem] border transition-all duration-500 cursor-pointer card-shadow group ${
            filter === 'Absent' ? 'bg-rose-600 border-rose-600 scale-105' : 'bg-white border-slate-100 hover:border-rose-300'
          }`}
        >
          <p className={`text-[10px] font-black uppercase tracking-widest mb-3 ${filter === 'Absent' ? 'text-rose-100' : 'text-rose-500'}`}>Not Reporting</p>
          <p className={`text-5xl font-black tracking-tighter transition-colors ${filter === 'Absent' ? 'text-white' : 'text-rose-500'}`}>{absentCount}</p>
          <div className={`mt-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest ${filter === 'Absent' ? 'text-rose-100' : 'text-slate-300'}`}>
            <XCircle className="w-4 h-4" /> Follow-up Required
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[4rem] border border-slate-100 card-shadow overflow-hidden">
        <div className="px-12 py-10 border-b border-slate-50 flex items-center justify-between">
           <div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Subject Registry: {user?.subject}</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                Showing: <span className="text-indigo-600">{filter} Students</span>
              </p>
           </div>
           <Link to="/attendance" className="flex items-center gap-3 px-8 py-4 bg-indigo-50 text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">
             Open Registry Control
           </Link>
        </div>

        <div className="divide-y divide-slate-50">
           {filteredStudents.map((student) => {
             const status = attendanceData[student.id] || 'Present';
             return (
               <div key={student.id} className="px-12 py-8 flex items-center justify-between group hover:bg-slate-50 transition-all duration-500">
                  <div className="flex items-center gap-8">
                    <div className="w-16 h-16 rounded-[1.8rem] bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-slate-400 text-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-2xl tracking-tighter leading-none mb-2">{student.name}</h4>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{student.rollNumber}</p>
                    </div>
                  </div>

                  <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl border ${
                    status === 'Present' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                    status === 'Late' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                    'bg-rose-50 text-rose-600 border-rose-100'
                  }`}>
                    {status === 'Present' && <CheckCircle2 className="w-4 h-4" />}
                    {status === 'Absent' && <XCircle className="w-4 h-4" />}
                    {status === 'Late' && <Briefcase className="w-4 h-4" />}
                    <span className="text-xs font-black uppercase tracking-widest">{status === 'Late' ? 'On-Duty (OD)' : status}</span>
                  </div>
               </div>
             );
           })}
        </div>
      </div>
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

const ProgrammeCard: React.FC<{ programme: ClassOverview; onClick: () => void; isAdmin?: boolean }> = ({ programme, onClick, isAdmin }) => {
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
            programme.trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
          }`}>
            {programme.trend === 'up' ? '↑ Increasing' : '↓ Decreasing'}
          </div>
        )}
      </div>
      
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Institutional Stream</p>
      <h3 className="text-3xl font-black text-slate-900 tracking-tighter leading-tight mb-8 group-hover:text-indigo-600 transition-colors">
        {programme.className}
      </h3>

      <div className="flex items-end justify-between pt-8 border-t border-slate-50">
        <div>
           {isAdmin ? (
             <p className="text-4xl font-black text-slate-900 tracking-tightest leading-none mb-1">{programme.totalStudents}</p>
           ) : (
             <p className="text-5xl font-black text-slate-900 tracking-tightest leading-none mb-1">{programme.averageAttendance}%</p>
           )}
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{isAdmin ? 'Total Enrolled' : `${programme.totalStudents} Enrolled`}</p>
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
