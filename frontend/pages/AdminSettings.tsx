
import React, { useState, useEffect } from 'react';
import { Shield, BookOpen, Plus, Trash2, Edit, Sliders, Check, X, Save, FileText, Grid3x3 } from 'lucide-react';
import { classService, ClassDTO } from '../services/classService';

interface InstitutionalSubject {
  name: string;
  description?: string;
}

interface TabState {
  subjects: boolean;
  classes: boolean;
}

const AdminSettings: React.FC = () => {
  // Tab management
  const [activeTab, setActiveTab] = useState<'subjects' | 'classes'>('subjects');

  // Subjects state
  const [subjects, setSubjects] = useState<InstitutionalSubject[]>([
    { name: 'English Literature', description: 'Study of literary works in the English language.' },
    { name: 'Psychology', description: 'Scientific study of the human mind and its functions.' },
    { name: 'Sociology', description: 'Study of the development, structure, and functioning of human society.' },
    { name: 'Political Science', description: 'Systems of government and the analysis of political activity.' },
    { name: 'Fine Arts', description: 'Creative art, especially visual art whose products are to be appreciated primarily or solely for their imaginative, aesthetic, or intellectual content.' },
    { name: 'Economics', description: 'Social science that studies the production, distribution, and consumption of goods and services.' }
  ]);
  
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectDesc, setNewSubjectDesc] = useState('');
  const [subjectValidationError, setSubjectValidationError] = useState('');
  const [editingSubjectIdx, setEditingSubjectIdx] = useState<number | null>(null);
  const [editSubjectValue, setEditSubjectValue] = useState('');

  // Classes state
  const [classes, setClasses] = useState<ClassDTO[]>([]);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [classValidationError, setClassValidationError] = useState('');
  const [editingClassIdx, setEditingClassIdx] = useState<number | null>(null);
  const [newClass, setNewClass] = useState<ClassDTO>({
    className: '',
    department: '',
    year: 1,
    semester: 1,
    section: '',
    active: true
  });
  
  const [threshold, setThreshold] = useState(75);

  // Load classes on mount
  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      setIsLoadingClasses(true);
      const data = await classService.getAll();
      setClasses(data);
    } catch (error) {
      console.error('Error loading classes:', error);
    } finally {
      setIsLoadingClasses(false);
    }
  };

  // ========== SUBJECT HANDLERS ==========
  const handleOpenSubjectModal = () => {
    setNewSubjectName('');
    setNewSubjectDesc('');
    setSubjectValidationError('');
    setIsSubjectModalOpen(true);
  };

  const addSubject = () => {
    const trimmedName = newSubjectName.trim();
    if (!trimmedName) {
      setSubjectValidationError('Subject name is required.');
      return;
    }

    if (subjects.some(s => s.name.toLowerCase() === trimmedName.toLowerCase())) {
      setSubjectValidationError('Subject name must be unique.');
      return;
    }

    setSubjects([...subjects, { name: trimmedName, description: newSubjectDesc.trim() }]);
    setIsSubjectModalOpen(false);
  };

  const removeSubject = (idx: number) => {
    const subjectName = subjects[idx].name;
    if (confirm(`CRITICAL ACTION: Are you sure you want to delete "${subjectName}"? This will remove the subject from all institutional academic mappings.`)) {
      setSubjects(prev => prev.filter((_, i) => i !== idx));
    }
  };

  const startEditingSubject = (idx: number) => {
    setEditingSubjectIdx(idx);
    setEditSubjectValue(subjects[idx].name);
  };

  const saveSubjectEdit = () => {
    if (editingSubjectIdx !== null && editSubjectValue.trim()) {
      const trimmedValue = editSubjectValue.trim();
      
      if (subjects.some((s, i) => i !== editingSubjectIdx && s.name.toLowerCase() === trimmedValue.toLowerCase())) {
        alert('Subject name must be unique.');
        return;
      }

      const updated = [...subjects];
      updated[editingSubjectIdx] = { ...updated[editingSubjectIdx], name: trimmedValue };
      setSubjects(updated);
      setEditingSubjectIdx(null);
      setEditSubjectValue('');
    }
  };

  // ========== CLASS HANDLERS ==========
  const handleOpenClassModal = () => {
    setNewClass({
      className: '',
      department: '',
      year: 1,
      semester: 1,
      section: '',
      active: true
    });
    setClassValidationError('');
    setEditingClassIdx(null);
    setIsClassModalOpen(true);
  };

  const addOrUpdateClass = async () => {
    if (!newClass.className.trim()) {
      setClassValidationError('Class name is required.');
      return;
    }
    if (!newClass.department.trim()) {
      setClassValidationError('Department is required.');
      return;
    }
    if (!newClass.section.trim()) {
      setClassValidationError('Section is required.');
      return;
    }

    try {
      if (editingClassIdx !== null) {
        // Update existing class
        const updated = await classService.update(newClass.id!, newClass);
        const updatedClasses = [...classes];
        updatedClasses[editingClassIdx] = updated;
        setClasses(updatedClasses);
      } else {
        // Create new class
        const created = await classService.create(newClass);
        setClasses([...classes, created]);
      }
      setIsClassModalOpen(false);
    } catch (error: any) {
      setClassValidationError(error.response?.data?.message || 'Failed to save class');
    }
  };

  const startEditingClass = (idx: number) => {
    setEditingClassIdx(idx);
    setNewClass(classes[idx]);
    setIsClassModalOpen(true);
  };

  const deleteClass = async (idx: number) => {
    const classData = classes[idx];
    if (confirm(`Delete class ${classData.className} (${classData.section})? This action cannot be undone.`)) {
      try {
        await classService.delete(classData.id!);
        setClasses(prev => prev.filter((_, i) => i !== idx));
      } catch (error: any) {
        alert('Failed to delete class: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  return (
    <div className="space-y-12 pb-20 max-w-[1400px] mx-auto animate-in fade-in duration-700">
      <div>
        <h1 className="text-6xl font-black text-slate-900 tracking-tighter leading-none">Global Settings</h1>
        <p className="text-slate-500 font-medium text-xl mt-6">Architectural configuration for subjects, classes, and institutional thresholds.</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 border-b border-slate-100 bg-slate-50 rounded-t-3xl p-2 sticky top-0 z-10">
        <button
          onClick={() => setActiveTab('subjects')}
          className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
            activeTab === 'subjects'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-5 h-5" /> Academic Architecture
        </button>
        <button
          onClick={() => setActiveTab('classes')}
          className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
            activeTab === 'classes'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Grid3x3 className="w-5 h-5" /> Classes Management
        </button>
      </div>

      <div className="grid grid-cols-1 gap-12">
        {/* SUBJECTS TAB */}
        {activeTab === 'subjects' && (
          <section className="bg-white rounded-[4rem] border border-slate-100 card-shadow overflow-hidden p-12">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-indigo-600 rounded-[2rem] flex items-center justify-center shadow-xl shadow-indigo-600/20">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-3xl tracking-tighter">Academic Architecture</h3>
                  <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">Institutional Curriculum Ledger</p>
                </div>
              </div>
              <button 
                onClick={handleOpenSubjectModal}
                className="bg-indigo-600 text-white px-10 py-5 rounded-[1.8rem] shadow-lg shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 font-black text-[10px] uppercase tracking-widest"
              >
                <Plus className="w-5 h-5" /> Add Asset
              </button>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjects.map((sub, i) => (
                  <div key={i} className={`flex flex-col px-8 py-7 rounded-[2.5rem] border transition-all duration-300 ${editingSubjectIdx === i ? 'bg-white border-indigo-400 shadow-xl ring-4 ring-indigo-50' : 'bg-slate-50/50 border-slate-100 group hover:border-indigo-200 hover:bg-white hover:shadow-lg'}`}>
                    <div className="flex items-center justify-between">
                      {editingSubjectIdx === i ? (
                        <div className="flex-1 flex items-center gap-3">
                          <input 
                            autoFocus
                            value={editSubjectValue}
                            onChange={(e) => setEditSubjectValue(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && saveSubjectEdit()}
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-900 outline-none focus:bg-white transition-all"
                          />
                          <button onClick={saveSubjectEdit} className="p-2 text-emerald-600 hover:scale-110 transition-transform"><Check className="w-5 h-5" /></button>
                          <button onClick={() => setEditingSubjectIdx(null)} className="p-2 text-rose-400 hover:scale-110 transition-transform"><X className="w-5 h-5" /></button>
                        </div>
                      ) : (
                        <>
                          <span className="font-black text-slate-800 tracking-tight text-lg">{sub.name}</span>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => startEditingSubject(i)}
                              className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                              title="Edit"
                            >
                              <Edit className="w-4.5 h-4.5" />
                            </button>
                            <button 
                              onClick={() => removeSubject(i)} 
                              className="p-2.5 text-rose-300 hover:text-white hover:bg-rose-500 rounded-xl transition-all border border-transparent hover:border-rose-600"
                              title="Delete"
                            >
                              <Trash2 className="w-4.5 h-4.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                    {sub.description && editingSubjectIdx !== i && (
                      <p className="mt-3 text-[11px] font-medium text-slate-400 line-clamp-2 leading-relaxed">
                        {sub.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CLASSES TAB */}
        {activeTab === 'classes' && (
          <section className="bg-white rounded-[4rem] border border-slate-100 card-shadow overflow-hidden p-12">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-emerald-600 rounded-[2rem] flex items-center justify-center shadow-xl shadow-emerald-600/20">
                  <Grid3x3 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-3xl tracking-tighter">Classes Management</h3>
                  <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">Institutional Class Registry</p>
                </div>
              </div>
              <button 
                onClick={handleOpenClassModal}
                className="bg-emerald-600 text-white px-10 py-5 rounded-[1.8rem] shadow-lg shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 font-black text-[10px] uppercase tracking-widest"
              >
                <Plus className="w-5 h-5" /> Create Class
              </button>
            </div>

            {isLoadingClasses ? (
              <div className="text-center py-12">
                <p className="text-slate-400 font-medium">Loading classes...</p>
              </div>
            ) : classes.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-medium">No classes created yet. Click "Create Class" to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-slate-200">
                      <th className="text-left py-4 px-6 font-black text-slate-700 text-sm uppercase tracking-widest">Class Name</th>
                      <th className="text-left py-4 px-6 font-black text-slate-700 text-sm uppercase tracking-widest">Department</th>
                      <th className="text-left py-4 px-6 font-black text-slate-700 text-sm uppercase tracking-widest">Year</th>
                      <th className="text-left py-4 px-6 font-black text-slate-700 text-sm uppercase tracking-widest">Semester</th>
                      <th className="text-left py-4 px-6 font-black text-slate-700 text-sm uppercase tracking-widest">Section</th>
                      <th className="text-left py-4 px-6 font-black text-slate-700 text-sm uppercase tracking-widest">Status</th>
                      <th className="text-center py-4 px-6 font-black text-slate-700 text-sm uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classes.map((classItem, idx) => (
                      <tr key={classItem.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-6 font-bold text-slate-900">{classItem.className}</td>
                        <td className="py-4 px-6 text-slate-700">{classItem.department}</td>
                        <td className="py-4 px-6 text-slate-700">Year {classItem.year}</td>
                        <td className="py-4 px-6 text-slate-700">Sem {classItem.semester}</td>
                        <td className="py-4 px-6 font-bold text-emerald-600">{classItem.section}</td>
                        <td className="py-4 px-6">
                          <span className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest ${classItem.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                            {classItem.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center flex items-center justify-center gap-2">
                          <button 
                            onClick={() => startEditingClass(idx)}
                            className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                            title="Edit"
                          >
                            <Edit className="w-4.5 h-4.5" />
                          </button>
                          <button 
                            onClick={() => deleteClass(idx)} 
                            className="p-2.5 text-rose-300 hover:text-white hover:bg-rose-500 rounded-xl transition-all border border-transparent hover:border-rose-600"
                            title="Delete"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* Module: Thresholds */}
        <section className="bg-white p-12 rounded-[4rem] border border-slate-100 card-shadow">
          <div className="flex items-center gap-6 mb-12">
            <div className="w-16 h-16 bg-amber-500 rounded-[2rem] flex items-center justify-center shadow-xl shadow-amber-600/20">
              <Sliders className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Engagement Thresholds</h3>
              <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">Minimum Compliance Mapping</p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 p-10 bg-slate-50 rounded-[3rem] border border-slate-100">
            <div className="flex-1">
              <h4 className="font-black text-xl text-slate-900 tracking-tight">Minimum Attendance %</h4>
              <p className="text-sm text-slate-500 mt-2 max-w-sm">Threshold required for institutional credit eligibility.</p>
            </div>
            <div className="flex items-center gap-8">
              <input 
                type="range" 
                min="50" max="95" step="5" 
                value={threshold} 
                onChange={(e) => setThreshold(parseInt(e.target.value))}
                className="w-48 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <span className="text-5xl font-black text-indigo-600 tracking-tighter w-20 text-center">{threshold}%</span>
            </div>
          </div>
        </section>

        <div className="p-12 bg-slate-900 rounded-[4rem] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 border border-white/5">
          <div>
            <div className="flex items-center gap-5 mb-4">
              <Shield className="w-8 h-8 text-indigo-400" />
              <h4 className="text-3xl font-black text-white tracking-tighter">System Security</h4>
            </div>
            <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-lg">Registry architecture is synchronized across all institutional nodes. All curricular changes are logged for internal audit.</p>
          </div>
          <button className="px-10 py-5 bg-white text-slate-900 rounded-[2rem] font-black uppercase tracking-widest text-[10px] hover:bg-indigo-50 transition-all active:scale-95">
            Review System Logs
          </button>
        </div>
      </div>

      {/* Subject Add/Edit Modal */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsSubjectModalOpen(false)}></div>
          <div className="relative w-full max-w-lg bg-white rounded-[4rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-12 duration-500">
            <div className="p-12">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
                    <BookOpen className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-4xl font-black text-slate-900 tracking-tighter">Initialize Asset</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Curriculum Component Registry</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsSubjectModalOpen(false)} 
                  className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 border border-slate-100 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject Name</label>
                  <input 
                    required 
                    value={newSubjectName}
                    onChange={(e) => {
                      setNewSubjectName(e.target.value);
                      if (subjectValidationError) setSubjectValidationError('');
                    }}
                    placeholder="Enter subject name"
                    className={`w-full bg-slate-50 border rounded-2xl px-6 py-5 font-bold text-slate-900 outline-none focus:ring-4 transition-all ${subjectValidationError ? 'border-rose-300 focus:ring-rose-100' : 'border-slate-100 focus:ring-indigo-100'}`} 
                  />
                  {subjectValidationError && (
                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest ml-1 animate-in fade-in slide-in-from-top-1">
                      {subjectValidationError}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject Description (Optional)</label>
                  <textarea 
                    value={newSubjectDesc}
                    onChange={(e) => setNewSubjectDesc(e.target.value)}
                    placeholder="Enter a brief description of the subject"
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100 transition-all resize-none" 
                  />
                </div>
              </div>

              <div className="mt-12 flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setIsSubjectModalOpen(false)} 
                  className="flex-1 py-6 bg-slate-50 text-slate-400 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 border border-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  onClick={addSubject}
                  className="flex-[2] py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3"
                >
                  <Save className="w-5 h-5" /> Synchronize Asset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Class Add/Edit Modal */}
      {isClassModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300 overflow-y-auto">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsClassModalOpen(false)}></div>
          <div className="relative w-full max-w-lg bg-white rounded-[4rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-12 duration-500 my-8">
            <div className="p-12">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-emerald-600 rounded-[2rem] flex items-center justify-center text-white shadow-xl shadow-emerald-600/20">
                    <Grid3x3 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{editingClassIdx !== null ? 'Edit' : 'Create'} Class</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Class Configuration</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsClassModalOpen(false)} 
                  className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 border border-slate-100 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Class Name</label>
                  <input 
                    type="text"
                    value={newClass.className}
                    onChange={(e) => {
                      setNewClass({...newClass, className: e.target.value});
                      if (classValidationError) setClassValidationError('');
                    }}
                    placeholder="e.g., CS-101"
                    className={`w-full bg-slate-50 border rounded-2xl px-6 py-5 font-bold text-slate-900 outline-none focus:ring-4 transition-all ${classValidationError ? 'border-rose-300 focus:ring-rose-100' : 'border-slate-100 focus:ring-emerald-100'}`} 
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</label>
                  <input 
                    type="text"
                    value={newClass.department}
                    onChange={(e) => setNewClass({...newClass, department: e.target.value})}
                    placeholder="e.g., Computer Science"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-emerald-100 transition-all" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Year</label>
                    <input 
                      type="number"
                      min="1"
                      value={newClass.year}
                      onChange={(e) => setNewClass({...newClass, year: parseInt(e.target.value)})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-emerald-100 transition-all" 
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Semester</label>
                    <input 
                      type="number"
                      min="1"
                      value={newClass.semester}
                      onChange={(e) => setNewClass({...newClass, semester: parseInt(e.target.value)})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-emerald-100 transition-all" 
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Section</label>
                  <input 
                    type="text"
                    value={newClass.section}
                    onChange={(e) => setNewClass({...newClass, section: e.target.value})}
                    placeholder="e.g., A, B, C"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-emerald-100 transition-all" 
                  />
                </div>

                <div className="flex items-center gap-4">
                  <input 
                    type="checkbox"
                    id="activeCheckbox"
                    checked={newClass.active}
                    onChange={(e) => setNewClass({...newClass, active: e.target.checked})}
                    className="w-5 h-5 accent-emerald-600"
                  />
                  <label htmlFor="activeCheckbox" className="text-sm font-bold text-slate-900">Active</label>
                </div>

                {classValidationError && (
                  <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest ml-1 bg-rose-50 p-3 rounded-xl">
                    {classValidationError}
                  </p>
                )}
              </div>

              <div className="mt-12 flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setIsClassModalOpen(false)} 
                  className="flex-1 py-6 bg-slate-50 text-slate-400 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 border border-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  onClick={addOrUpdateClass}
                  className="flex-[2] py-6 bg-emerald-600 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3"
                >
                  <Save className="w-5 h-5" /> {editingClassIdx !== null ? 'Update' : 'Create'} Class
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
};

export default AdminSettings;
