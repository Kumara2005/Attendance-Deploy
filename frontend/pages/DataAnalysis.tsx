
import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, Zap, TrendingUp, Target, BarChart2, AlertCircle, Bell } from 'lucide-react';
import { getAttendanceInsights } from '../geminiService';
import { ATTENDANCE_TREND_DATA, SUBJECT_WISE_SUMMARY, MOCK_STUDENTS } from '../constants';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DataAnalysis: React.FC = () => {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInsights() {
      const data = await getAttendanceInsights([...ATTENDANCE_TREND_DATA, ...SUBJECT_WISE_SUMMARY]);
      setInsights(data);
      setLoading(false);
    }
    fetchInsights();
  }, []);

  const lowAttendanceStudents = MOCK_STUDENTS.filter(s => s.attendancePercentage < 75);

  return (
    <div className="space-y-12 pb-12 animate-in fade-in duration-700 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-6xl font-black text-slate-900 tracking-tighter flex items-center gap-6 leading-none">
          <div className="w-16 h-16 bg-indigo-600 rounded-[2rem] flex items-center justify-center shadow-xl shadow-indigo-600/20">
            <Brain className="w-10 h-10 text-white" />
          </div>
          Data Analysis <br/>Module
        </h1>
        <p className="text-slate-500 font-medium text-xl mt-6">Automatic calculation of percentages and risk identification.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Gemini AI Insights Section */}
        <div className="bg-white border border-slate-100 rounded-[4rem] p-12 text-slate-900 relative overflow-hidden card-shadow">
          <div className="flex items-center gap-3 mb-12">
            <div className="bg-indigo-50 p-3 rounded-2xl border border-indigo-100">
              <Zap className="w-6 h-6 text-indigo-600" />
            </div>
            <span className="text-[11px] font-black tracking-[0.3em] uppercase text-indigo-600">SMART ANALYSIS ENGINE</span>
          </div>

          {loading ? (
            <div className="space-y-8 animate-pulse">
              <div className="h-10 bg-slate-50 rounded-2xl w-3/4"></div>
              <div className="h-40 bg-slate-50 rounded-[3rem]"></div>
            </div>
          ) : (
            <div className="space-y-12 relative z-10">
              <h2 className="text-4xl font-black leading-tight tracking-tighter text-slate-900">{insights?.summary}</h2>
              <div className="bg-indigo-50/50 border border-indigo-100 p-8 rounded-[3rem]">
                <p className="text-slate-600 font-bold italic text-lg leading-relaxed">"{insights?.prediction}"</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {insights?.interventions?.map((action: string, idx: number) => (
                  <div key={idx} className="bg-slate-50 border border-slate-100 p-8 rounded-[2.5rem]">
                    <p className="text-sm font-black text-slate-700 leading-snug tracking-tight">{action}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Low Attendance Alerts - NEW SECTION */}
        <div className="bg-white p-12 rounded-[4rem] border border-slate-100 card-shadow flex flex-col">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Low Attendance Alerts</h3>
              <p className="text-sm text-slate-500 font-bold mt-2 uppercase tracking-widest">Identifying students under 75% threshold</p>
            </div>
            <div className="w-16 h-16 bg-rose-50 rounded-3xl flex items-center justify-center border border-rose-100 text-rose-600">
               <AlertCircle className="w-8 h-8" />
            </div>
          </div>

          <div className="flex-1 space-y-4">
             {lowAttendanceStudents.map((student) => (
               <div key={student.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 hover:border-rose-200 transition-all">
                  <div className="flex items-center gap-6">
                     <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center font-black text-rose-500">
                        {student.name.charAt(0)}
                     </div>
                     <div>
                        <h5 className="font-black text-slate-800 tracking-tight">{student.name}</h5>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{student.rollNumber}</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <span className="text-xl font-black text-rose-600">{student.attendancePercentage}%</span>
                     <button 
                        onClick={() => alert(`Critical notification sent to ${student.name} and their advisor.`)}
                        className="ml-6 p-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
                      >
                        <Bell className="w-4 h-4" />
                     </button>
                  </div>
               </div>
             ))}
             {lowAttendanceStudents.length === 0 && (
               <div className="h-full flex items-center justify-center text-slate-300 font-bold">
                  All student attendance levels optimal.
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataAnalysis;
