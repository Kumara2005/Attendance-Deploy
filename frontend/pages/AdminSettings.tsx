
import React, { useState } from 'react';
import { Shield, BookOpen, Plus, Trash2, Edit, Sliders, Check, X, Save, FileText } from 'lucide-react';

interface InstitutionalSubject {
  name: string;
  description?: string;
}

const AdminSettings: React.FC = () => {
  const [subjects, setSubjects] = useState<InstitutionalSubject[]>([
    { name: 'English Literature', description: 'Study of literary works in the English language.' },
    { name: 'Psychology', description: 'Scientific study of the human mind and its functions.' },
    { name: 'Sociology', description: 'Study of the development, structure, and functioning of human society.' },
    { name: 'Political Science', description: 'Systems of government and the analysis of political activity.' },
    { name: 'Fine Arts', description: 'Creative art, especially visual art whose products are to be appreciated primarily or solely for their imaginative, aesthetic, or intellectual content.' },
    { name: 'Economics', description: 'Social science that studies the production, distribution, and consumption of goods and services.' }
  ]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectDesc, setNewSubjectDesc] = useState('');
  const [validationError, setValidationError] = useState('');
  
  const [threshold, setThreshold] = useState(75);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleOpenModal = () => {
    setNewSubjectName('');
    setNewSubjectDesc('');
    setValidationError('');
    setIsModalOpen(true);
  };

  const addSubject = () => {
    const trimmedName = newSubjectName.trim();
    if (!trimmedName) {
      setValidationError('Subject name is required.');
      return;
    }

    if (subjects.some(s => s.name.toLowerCase() === trimmedName.toLowerCase())) {
      setValidationError('Subject name must be unique.');
      return;
    }

    setSubjects([...subjects, { name: trimmedName, description: newSubjectDesc.trim() }]);
    setIsModalOpen(false);
  };

  const removeSubject = (idx: number) => {
    const subjectName = subjects[idx].name;
    if (confirm(`CRITICAL ACTION: Are you sure you want to delete "${subjectName}"? This will remove the subject from all institutional academic mappings.`)) {
      setSubjects(prev => prev.filter((_, i) => i !== idx));
    }
  };

  const startEditing = (idx: number) => {
    setEditingIdx(idx);
    setEditValue(subjects[idx].name);
  };

  const saveEdit = () => {
    if (editingIdx !== null && editValue.trim()) {
      const trimmedValue = editValue.trim();
      
      // Check for uniqueness during edit (excluding itself)
      if (subjects.some((s, i) => i !== editingIdx && s.name.toLowerCase() === trimmedValue.toLowerCase())) {
        alert('Subject name must be unique.');
        return;
      }

      const updated = [...subjects];
      updated[editingIdx] = { ...updated[editingIdx], name: trimmedValue };
      setSubjects(updated);
      setEditingIdx(null);
      setEditValue('');
    }
  };

  return (
    <div className="space-y-12 pb-20 max-w-[1400px] mx-auto animate-in fade-in duration-700">
      <div>
        <h1 className="text-6xl font-black text-slate-900 tracking-tighter leading-none">Global Settings</h1>
        <p className="text-slate-500 font-medium text-xl mt-6">Architectural configuration for subjects and institutional thresholds.</p>
      </div>

      <div className="grid grid-cols-1 gap-12">
        {/* Module 1: Curriculum Management */}
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
              onClick={handleOpenModal}
              className="bg-indigo-600 text-white px-10 py-5 rounded-[1.8rem] shadow-lg shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 font-black text-[10px] uppercase tracking-widest"
            >
              <Plus className="w-5 h-5" /> Add Asset
            </button>
          </div>

          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {subjects.map((sub, i) => (
                 <div key={i} className={`flex flex-col px-8 py-7 rounded-[2.5rem] border transition-all duration-300 ${editingIdx === i ? 'bg-white border-indigo-400 shadow-xl ring-4 ring-indigo-50' : 'bg-slate-50/50 border-slate-100 group hover:border-indigo-200 hover:bg-white hover:shadow-lg'}`}>
                    <div className="flex items-center justify-between">
                      {editingIdx === i ? (
                        <div className="flex-1 flex items-center gap-3">
                          <input 
                            autoFocus
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-900 outline-none focus:bg-white transition-all"
                          />
                          <button onClick={saveEdit} className="p-2 text-emerald-600 hover:scale-110 transition-transform"><Check className="w-5 h-5" /></button>
                          <button onClick={() => setEditingIdx(null)} className="p-2 text-rose-400 hover:scale-110 transition-transform"><X className="w-5 h-5" /></button>
                        </div>
                      ) : (
                        <>
                          <span className="font-black text-slate-800 tracking-tight text-lg">{sub.name}</span>
                          <div className="flex items-center gap-2">
                             <button 
                               onClick={() => startEditing(i)}
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
                    {sub.description && editingIdx !== i && (
                      <p className="mt-3 text-[11px] font-medium text-slate-400 line-clamp-2 leading-relaxed">
                        {sub.description}
                      </p>
                    )}
                 </div>
               ))}
            </div>
          </div>
        </section>

        {/* Module 2: Thresholds */}
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

      {/* Add Asset Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
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
                  onClick={() => setIsModalOpen(false)} 
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
                      if (validationError) setValidationError('');
                    }}
                    placeholder="Enter subject name"
                    className={`w-full bg-slate-50 border rounded-2xl px-6 py-5 font-bold text-slate-900 outline-none focus:ring-4 transition-all ${validationError ? 'border-rose-300 focus:ring-rose-100' : 'border-slate-100 focus:ring-indigo-100'}`} 
                  />
                  {validationError && (
                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest ml-1 animate-in fade-in slide-in-from-top-1">
                      {validationError}
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
                  onClick={() => setIsModalOpen(false)} 
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
    </div>
  );
};

export default AdminSettings;
