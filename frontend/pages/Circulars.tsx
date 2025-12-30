
import React, { useState } from 'react';
import { Megaphone, Calendar, Clock, Plus, Trash2, Bell, ShieldCheck, Info, FileText, ChevronRight } from 'lucide-react';
import { MOCK_CIRCULARS } from '../constants';
import { UserRole, Circular } from '../types';

const Circulars: React.FC = () => {
  const role = (window as any).currentUserRole || UserRole.ADMIN;
  const isAdmin = role === UserRole.ADMIN;

  const [circulars, setCirculars] = useState<Circular[]>(MOCK_CIRCULARS);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCircular, setNewCircular] = useState<Partial<Circular>>({
    type: 'General',
    date: new Date().toISOString().split('T')[0]
  });

  const handleAdd = () => {
    if (!newCircular.title || !newCircular.description) return;
    const item: Circular = {
      id: Date.now().toString(),
      title: newCircular.title!,
      description: newCircular.description!,
      date: newCircular.date!,
      type: newCircular.type as any,
      publishedAt: new Date().toISOString().split('T')[0]
    };
    setCirculars([item, ...circulars]);
    setShowAddForm(false);
    setNewCircular({ type: 'General', date: new Date().toISOString().split('T')[0] });
  };

  const handleDelete = (id: string) => {
    if (confirm('Permanently withdraw this circular from the network?')) {
      setCirculars(circulars.filter(c => c.id !== id));
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
             <div className="w-1.5 h-8 bg-indigo-600 rounded-full"></div>
             <span className="bg-indigo-50 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border border-indigo-100 text-indigo-700">Official Communication</span>
          </div>
          <h1 className="text-7xl font-black text-slate-900 tracking-tighter leading-none">Circulars <br/>& Notices</h1>
        </div>

        {isAdmin && (
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-10 py-5 bg-indigo-600 text-white rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-indigo-600/20 active:scale-95 transition-all flex items-center gap-3"
          >
            {showAddForm ? <ChevronRight className="w-4 h-4 rotate-90" /> : <Plus className="w-4 h-4" />}
            Publish New Notice
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
        {/* Management Form (Admin Only) */}
        {isAdmin && showAddForm && (
          <div className="xl:col-span-1 animate-in slide-in-from-left-8 duration-500">
            <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 card-shadow sticky top-28">
              <h3 className="font-black text-slate-900 text-2xl tracking-tighter mb-8 flex items-center gap-3">
                <FileText className="w-6 h-6 text-indigo-600" /> Draft Circular
              </h3>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Notice Title</label>
                  <input 
                    type="text"
                    value={newCircular.title || ''}
                    onChange={(e) => setNewCircular({...newCircular, title: e.target.value})}
                    placeholder="e.g., Weekend Holiday Announcement"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Effective Date</label>
                  <input 
                    type="date"
                    value={newCircular.date}
                    onChange={(e) => setNewCircular({...newCircular, date: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                  <select 
                    value={newCircular.type}
                    onChange={(e) => setNewCircular({...newCircular, type: e.target.value as any})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100 transition-all appearance-none cursor-pointer"
                  >
                    <option value="General">General Notice</option>
                    <option value="Holiday">Government/Weekend Holiday</option>
                    <option value="Academic">Academic Schedule Change</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Detailed Description</label>
                  <textarea 
                    value={newCircular.description || ''}
                    onChange={(e) => setNewCircular({...newCircular, description: e.target.value})}
                    rows={4}
                    placeholder="Enter the full context of the announcement here..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-medium text-slate-700 outline-none focus:ring-4 focus:ring-indigo-100 transition-all resize-none"
                  />
                </div>

                <button 
                  onClick={handleAdd}
                  className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
                >
                  Broadcast to Campus
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Circular List */}
        <div className={`${isAdmin && showAddForm ? 'xl:col-span-2' : 'xl:col-span-3'} space-y-8 transition-all duration-500`}>
          {circulars.map((circular) => (
            <div 
              key={circular.id}
              className="bg-white p-12 rounded-[4rem] border border-slate-100 card-shadow group hover:border-indigo-200 transition-all relative overflow-hidden"
            >
              <div className="absolute right-0 top-0 w-32 h-32 bg-slate-50/50 rounded-bl-[4rem] flex items-center justify-center -translate-y-4 translate-x-4 group-hover:bg-indigo-50 group-hover:translate-x-0 group-hover:translate-y-0 transition-all">
                <Megaphone className="w-8 h-8 text-slate-200 group-hover:text-indigo-400 transition-colors" />
              </div>

              <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 relative z-10">
                <div className="flex-1 space-y-6">
                  <div className="flex items-center gap-4">
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                      circular.type === 'Holiday' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                      circular.type === 'Academic' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                      'bg-slate-50 text-slate-400 border-slate-200'
                    }`}>
                      {circular.type}
                    </span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <Clock className="w-3 h-3" /> Published {new Date(circular.publishedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h2 className="text-4xl font-black text-slate-900 tracking-tighter group-hover:text-indigo-600 transition-colors">{circular.title}</h2>
                  <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-3xl">{circular.description}</p>
                  
                  <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 w-fit">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                      <Calendar className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Date</p>
                      <p className="font-black text-slate-900 text-lg tracking-tight">{new Date(circular.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                  </div>
                </div>

                {isAdmin && (
                  <button 
                    onClick={() => handleDelete(circular.id)}
                    className="p-4 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                  >
                    <Trash2 className="w-6 h-6" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {circulars.length === 0 && (
            <div className="py-24 text-center">
              <div className="w-24 h-24 bg-slate-50 rounded-[3rem] flex items-center justify-center mx-auto mb-8">
                <Bell className="w-10 h-10 text-slate-200" />
              </div>
              <h4 className="text-2xl font-black text-slate-300 tracking-tighter uppercase tracking-widest">No active circulars on record</h4>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Circulars;
