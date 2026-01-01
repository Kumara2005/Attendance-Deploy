import React, { useState } from 'react';
import { Zap, Users, CheckCircle2, AlertCircle } from 'lucide-react';
import apiClient from '../services/api';

const TestDataSetup: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);

  const seedStudents = async () => {
    setLoading(true);
    setStatus('Creating test students...');
    setSuccess(false);

    try {
      const response = await apiClient.post('/test/seed-students');
      console.log('✅ Response:', response.data);
      setStatus(response.data.data || 'Students created successfully!');
      setSuccess(true);
    } catch (error: any) {
      console.error('❌ Error:', error);
      setStatus(`Error: ${error.response?.data?.message || error.message}`);
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const seedAttendance = async () => {
    setLoading(true);
    setStatus('Creating test attendance records...');
    setSuccess(false);

    try {
      const response = await apiClient.post('/test/seed-attendance');
      console.log('✅ Response:', response.data);
      setStatus(response.data.data || 'Attendance records created successfully!');
      setSuccess(true);
    } catch (error: any) {
      console.error('❌ Error:', error);
      setStatus(`Error: ${error.response?.data?.message || error.message}`);
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const clearAttendance = async () => {
    if (!window.confirm('⚠️ This will delete ALL attendance records. Continue?')) {
      return;
    }

    setLoading(true);
    setStatus('Clearing attendance records...');
    setSuccess(false);

    try {
      const response = await apiClient.post('/test/clear-attendance');
      console.log('✅ Response:', response.data);
      setStatus(response.data.data || 'Attendance records cleared successfully!');
      setSuccess(true);
    } catch (error: any) {
      console.error('❌ Error:', error);
      setStatus(`Error: ${error.response?.data?.message || error.message}`);
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-white p-12 rounded-[3.5rem] border border-slate-100 card-shadow">
        <div>
          <h1 className="text-6xl font-black tracking-tighter text-slate-900 leading-none mb-4">
            Test Data Setup
          </h1>
          <p className="text-sm font-black text-slate-400 uppercase tracking-widest">
            Development - Seed Test Data for Testing
          </p>
        </div>
        <div className="flex items-center gap-4 px-8 py-4 bg-amber-50 border border-amber-100 rounded-[2rem]">
          <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></div>
          <span className="text-xs font-black text-amber-600 uppercase tracking-widest">Development Only</span>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-[2rem] p-8">
        <h2 className="text-2xl font-black text-blue-900 mb-4 flex items-center gap-3">
          <AlertCircle className="w-6 h-6" />
          Getting Started
        </h2>
        <ol className="space-y-3 text-blue-900 font-bold">
          <li className="flex gap-3">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-black flex-shrink-0">1</span>
            <span>Click <strong>"Seed Test Students"</strong> to create 10 test students</span>
          </li>
          <li className="flex gap-3">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-black flex-shrink-0">2</span>
            <span>Click <strong>"Seed Test Attendance"</strong> to create attendance records</span>
          </li>
          <li className="flex gap-3">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-black flex-shrink-0">3</span>
            <span>Go to <strong>Staff Portal → My Timetable</strong> and click a session</span>
          </li>
          <li className="flex gap-3">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-black flex-shrink-0">4</span>
            <span>You should see <strong>student names in the Quick Attendance modal</strong> ✅</span>
          </li>
        </ol>
      </div>

      {/* Test Data Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Seed Students Button */}
        <div className="bg-white rounded-[2rem] border border-slate-100 card-shadow overflow-hidden">
          <div className="bg-gradient-to-br from-emerald-50 to-white p-8 border-b border-slate-100">
            <Users className="w-12 h-12 text-emerald-600 mb-4" />
            <h3 className="text-2xl font-black text-slate-900 mb-2">Create Students</h3>
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">
              Creates 10 test students for Computer Science Year 1 Class A
            </p>
          </div>
          <div className="p-8">
            <button
              onClick={seedStudents}
              disabled={loading}
              className="w-full px-6 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-colors uppercase tracking-widest text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : '+ Seed Test Students'}
            </button>
          </div>
        </div>

        {/* Seed Attendance Button */}
        <div className="bg-white rounded-[2rem] border border-slate-100 card-shadow overflow-hidden">
          <div className="bg-gradient-to-br from-indigo-50 to-white p-8 border-b border-slate-100">
            <CheckCircle2 className="w-12 h-12 text-indigo-600 mb-4" />
            <h3 className="text-2xl font-black text-slate-900 mb-2">Create Attendance</h3>
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">
              Creates sample attendance for today (01-01-2026)
            </p>
          </div>
          <div className="p-8">
            <button
              onClick={seedAttendance}
              disabled={loading}
              className="w-full px-6 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-colors uppercase tracking-widest text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : '+ Seed Attendance'}
            </button>
          </div>
        </div>

        {/* Clear Attendance Button */}
        <div className="bg-white rounded-[2rem] border border-slate-100 card-shadow overflow-hidden">
          <div className="bg-gradient-to-br from-rose-50 to-white p-8 border-b border-slate-100">
            <AlertCircle className="w-12 h-12 text-rose-600 mb-4" />
            <h3 className="text-2xl font-black text-slate-900 mb-2">Clear Attendance</h3>
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">
              Delete all attendance records (development only)
            </p>
          </div>
          <div className="p-8">
            <button
              onClick={clearAttendance}
              disabled={loading}
              className="w-full px-6 py-4 bg-rose-600 text-white font-black rounded-2xl hover:bg-rose-700 transition-colors uppercase tracking-widest text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Clearing...' : '🗑️ Clear Attendance'}
            </button>
          </div>
        </div>
      </div>

      {/* Status Message */}
      {status && (
        <div className={`rounded-[2rem] p-8 border-2 ${
          success 
            ? 'bg-emerald-50 border-emerald-200' 
            : 'bg-rose-50 border-rose-200'
        }`}>
          <div className="flex items-start gap-4">
            <div className={`w-6 h-6 rounded-full flex-shrink-0 ${
              success 
                ? 'bg-emerald-500' 
                : 'bg-rose-500'
            }`}></div>
            <div>
              <p className={`font-black text-sm ${
                success
                  ? 'text-emerald-900'
                  : 'text-rose-900'
              }`}>
                {status}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Test Data Info */}
      <div className="bg-white rounded-[2rem] border border-slate-100 card-shadow p-8">
        <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
          <Zap className="w-6 h-6 text-amber-500" />
          Test Data Created
        </h3>
        <div className="space-y-6">
          <div>
            <h4 className="font-black text-slate-900 mb-3">📚 Test Students</h4>
            <div className="bg-slate-50 rounded-xl p-4 font-mono text-xs text-slate-700 space-y-1 overflow-x-auto">
              <div>Department: Computer Science</div>
              <div>Semester: 1</div>
              <div>Section: A</div>
              <div>Count: 10 students</div>
              <div className="mt-3">Names:</div>
              <ul className="ml-4 space-y-1 list-disc">
                <li>Aarav Sharma (CS-S1-A01)</li>
                <li>Ananya Reddy (CS-S1-A02)</li>
                <li>Rohan Kumar (CS-S1-A03)</li>
                <li>... and 7 more</li>
              </ul>
            </div>
          </div>

          <div>
            <h4 className="font-black text-slate-900 mb-3">📅 Test Attendance</h4>
            <div className="bg-slate-50 rounded-xl p-4 font-mono text-xs text-slate-700 space-y-1">
              <div>Date: 2026-01-01 (Today)</div>
              <div>Sessions: 4 sessions from Monday timetable</div>
              <div>Pattern:</div>
              <div className="ml-4">
                <div>✅ 7 students: PRESENT</div>
                <div>❌ 2 students: ABSENT</div>
                <div>⚠️ 1 student: OD</div>
              </div>
              <div className="mt-3">This allows testing varied attendance scenarios</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestDataSetup;
