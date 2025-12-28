
import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Users, 
  Briefcase, 
  X, 
  Save,
  CheckCircle2,
  FilterX,
  ChevronDown,
  CalendarDays
} from 'lucide-react';
import { MOCK_STUDENTS as INITIAL_STUDENTS, MOCK_STAFF as INITIAL_STAFF } from '../constants';
import { UserRole, Student, User } from '../types';

interface StudentManagementProps {
  userRole?: UserRole;
}

const StudentManagement: React.FC<StudentManagementProps> = ({ userRole }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isStudent = userRole === UserRole.STUDENT;
  const isAdmin = userRole === UserRole.ADMIN;
  
  // Contextual department filter from URL
  const deptContext = searchParams.get('dept');
  
  // State for registry data
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [staff, setStaff] = useState<User[]>(INITIAL_STAFF);

  // Tab and Search state
  const [activeTab, setActiveTab] = useState<'students' | 'faculty'>(isStudent ? 'faculty' : 'students');
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  
  // Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Filter Logic - Scoped by Department and Year if present
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesYear = yearFilter === '' || s.year === yearFilter || s.section === yearFilter;
      
      if (!deptContext || !isAdmin) return matchesSearch && matchesYear;
      
      const programme = deptContext.toLowerCase();
      const studentClass = s.class.toLowerCase();
      const matchesDept = programme.includes(studentClass) || studentClass.includes(programme);
      
      return matchesSearch && matchesDept && matchesYear;
    });
  }, [students, searchTerm, deptContext, isAdmin, yearFilter]);

  const filteredStaff = useMemo(() => {
    return staff.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           s.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesYear = yearFilter === '' || s.year === yearFilter;

      if (!deptContext || !isAdmin) return matchesSearch && matchesYear;
      
      const programme = deptContext.toLowerCase();
      const staffDept = (s.department || "").toLowerCase();
      const staffSubject = (s.subject || "").toLowerCase();
      
      const matchesDept = programme.includes(staffDept) || staffDept.includes(programme) || 
                          programme.includes(staffSubject) || staffSubject.includes(programme);
                          
      return matchesSearch && matchesDept && matchesYear;
    });
  }, [staff, searchTerm, deptContext, isAdmin, yearFilter]);

  const handleOpenEditModal = (item: any = null) => {
    if (!isAdmin) return;
    setEditingItem(item);
    setIsEditModalOpen(true);
  };

  const handleClearFilter = () => {
    setSearchParams({});
    setYearFilter('');
  };

  const handleSaveEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: any = Object.fromEntries(formData.entries());

    if (activeTab === 'students') {
      if (editingItem) {
        setStudents(prev => prev.map(s => s.id === editingItem.id ? { ...s, ...data } : s));
      } else {
        const newStudent: Student = {
          id: `s_${Date.now()}`,
          name: data.name,
          rollNumber: data.rollNumber,
          class: data.class || (deptContext ? deptContext : 'Arts'),
          section: data.section || 'Year 1',
          year: data.section || 'Year 1',
          attendancePercentage: 0,
          status: (data.status as any) || 'Active',
          lastActive: new Date().toISOString().split('T')[0]
        };
        setStudents(prev => [newStudent, ...prev]);
      }
    } else {
      if (editingItem) {
        setStaff(prev => prev.map(s => s.id === editingItem.id ? { ...s, ...data } : s));
      } else {
        const newFaculty: User = {
          id: `f_${Date.now()}`,
          name: data.name,
          email: data.email,
          role: UserRole.STAFF,
          department: data.department || (deptContext ? deptContext : 'Computer Science'),
          subject: data.department || (deptContext ? deptContext : 'Computer Science'),
          year: data.year || 'Year 1'
        };
        setStaff(prev => [newFaculty, ...prev]);
      }
    }
    setIsEditModalOpen(false);
    setEditingItem(null);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-[1600px] mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
        <div>
          <h1 className="text-6xl font-black text-slate-900 tracking-tighter leading-none">
            {isStudent ? 'Faculty' : (deptContext ? deptContext : 'Registry')} <br/>Directory
          </h1>
          <p className="text-slate-500 font-medium text-xl mt-6">
            {isStudent 
              ? 'Authorized listing of academic faculty and department heads.' 
              : `Institutional ledger for ${deptContext ? `the ${deptContext} stream.` : 'identity management.'}`}
          </p>
          {(deptContext || yearFilter) && isAdmin && (
            <button 
              onClick={handleClearFilter}
              className="mt-6 flex items-center gap-2 px-6 py-2 bg-slate-100 text-slate-400 hover:text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border border-slate-200"
            >
              <FilterX className="w-4 h-4" /> Reset Global Filter
            </button>
          )}
        </div>
        
        <div className="flex flex-col items-end gap-6">
          {isAdmin && (
            <button 
              onClick={() => handleOpenEditModal()}
              className="flex items-center gap-3 px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-95 uppercase tracking-widest"
            >
              <Plus className="w-4 h-4" /> Register {activeTab === 'students' ? 'Student' : 'Staff'}
            </button>
          )}

          {/* Academic Year Selection Dropdown */}
          <div className="relative w-64 group">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <CalendarDays className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            </div>
            <select 
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="w-full bg-white border border-slate-100 rounded-2xl pl-12 pr-10 py-4 font-black text-[10px] text-slate-900 uppercase tracking-widest outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-200 transition-all appearance-none cursor-pointer card-shadow"
            >
              <option value="">Select Academic Year</option>
              <option value="Year 1">Year 1</option>
              <option value="Year 2">Year 2</option>
              <option value="Year 3">Year 3</option>
            </select>
            <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Access Control: Students cannot switch tabs */}
      {!isStudent && (
        <div className="flex p-2 bg-white rounded-[2rem] border border-slate-100 w-fit shadow-sm">
           <TabButton active={activeTab === 'students'} onClick={() => setActiveTab('students')} label="Student Ledger" icon={<Users className="w-4 h-4" />} />
           <TabButton active={activeTab === 'faculty'} onClick={() => setActiveTab('faculty')} label="Faculty Roster" icon={<Briefcase className="w-4 h-4" />} />
        </div>
      )}

      <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 card-shadow overflow-visible">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="relative flex-1 w-full">
             <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
             <input 
               type="text" 
               placeholder={`Search ${activeTab === 'students' ? 'students' : 'faculty'}...`} 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-16 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 font-bold"
             />
          </div>
        </div>

        <div className="mt-10 overflow-visible border border-slate-50 rounded-[2.5rem]">
          <table className="w-full text-left table-fixed">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="w-32 px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{activeTab === 'students' ? 'ROLL ID' : 'STAFF ID'}</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">IDENTITY DETAILS</th>
                <th className="w-56 px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{activeTab === 'students' ? 'ACADEMIC PATHWAY' : 'DEPARTMENT'}</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">CREDENTIAL STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {(activeTab === 'students' ? filteredStudents : filteredStaff).map((item: any) => (
                <tr key={item.id} className="group hover:bg-slate-50/50 transition-all duration-300">
                  <td className="px-8 py-6 font-mono text-xs font-bold text-slate-500 text-center">{item.rollNumber || item.id.toUpperCase().split('_')[1]}</td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm group-hover:scale-110 transition-transform shadow-sm ${activeTab === 'students' ? 'bg-indigo-50 text-indigo-600' : 'bg-violet-50 text-violet-600'}`}>
                        {item.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-lg tracking-tight leading-none mb-1.5">{item.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.email || `${item.class} | ${item.section}`}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {activeTab === 'students' ? (
                       <span className="text-sm font-bold text-slate-600 tracking-tight">{item.class} | {item.section}</span>
                    ) : (
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-600 tracking-tight">{item.department}</span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.year || 'Global'}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-center w-full">
                      <span className={`inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all min-w-[140px] text-center ${
                        activeTab === 'students' 
                          ? (item.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100')
                          : 'bg-violet-50 text-violet-600 border-violet-100'
                      }`}>
                        {activeTab === 'students' ? item.status : 'AUTHORIZED ACCESS'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
              {(activeTab === 'students' ? filteredStudents : filteredStaff).length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-slate-300">
                      <Users className="w-12 h-12 opacity-20" />
                      <p className="font-black uppercase tracking-[0.2em] text-xs">No records found for this criteria.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Modal (Admin Only) */}
      {isEditModalOpen && isAdmin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsEditModalOpen(false)}></div>
          <div className="relative w-full max-w-2xl bg-white rounded-[4rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-12 duration-500">
            <form onSubmit={handleSaveEdit} className="p-12">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
                    {activeTab === 'students' ? <Users className="w-8 h-8" /> : <Briefcase className="w-8 h-8" />}
                  </div>
                  <div>
                    <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{editingItem ? 'Revise' : 'Initialize'} Identity</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Institutional Access Management</p>
                  </div>
                </div>
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 border border-slate-100 transition-all"><X className="w-6 h-6" /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label><input required name="name" defaultValue={editingItem?.name || ''} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100" /></div>
                {activeTab === 'students' ? (
                  <>
                    <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Roll ID</label><input required name="rollNumber" defaultValue={editingItem?.rollNumber || ''} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100" /></div>
                    <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Academic Year</label><input required name="section" defaultValue={editingItem?.section || yearFilter || 'Year 1'} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100" /></div>
                    <div className="space-y-3 md:col-span-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Class Stream</label><input required name="class" defaultValue={editingItem?.class || (deptContext ? deptContext : 'B.Sc Computer Science')} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100" /></div>
                  </>
                ) : (
                  <>
                    <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Institutional Email</label><input required type="email" name="email" defaultValue={editingItem?.email || ''} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100" /></div>
                    <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Academic Year</label><input required name="year" defaultValue={editingItem?.year || yearFilter || 'Year 1'} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100" /></div>
                    <div className="space-y-3 md:col-span-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</label><input required name="department" defaultValue={editingItem?.department || (deptContext ? deptContext : 'B.Sc Computer Science')} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100" /></div>
                  </>
                )}
              </div>
              <div className="mt-12 flex gap-4"><button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-6 bg-slate-50 text-slate-400 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 border border-slate-100 transition-all">Cancel</button><button type="submit" className="flex-[2] py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3"><Save className="w-5 h-5" /> Synchronize Identity</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const TabButton = ({ active, onClick, label, icon }: any) => (
  <button onClick={onClick} className={`flex items-center gap-3 px-10 py-5 rounded-[1.8rem] text-[11px] font-black uppercase tracking-widest transition-all duration-500 ${active ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 scale-105' : 'text-slate-400 hover:text-indigo-600'}`}>{icon}{label}</button>
);

export default StudentManagement;
