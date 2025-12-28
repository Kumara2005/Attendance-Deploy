import React, { useState, useEffect } from 'react';
import { User, BookOpen, Calendar, Download, Users, TrendingUp, Clock, FileText, GraduationCap, AlertCircle } from 'lucide-react';
import { MOCK_STUDENTS, MOCK_STAFF, SUBJECT_WISE_SUMMARY } from '../constants';
import { UserRole } from '../types';

// Mock data for student's attendance by subject
const STUDENT_ATTENDANCE_BY_SUBJECT = [
  { subject: 'Data Structures', attended: 34, total: 40, percentage: 85, faculty: 'Dr. Alan Turing' },
  { subject: 'Operating Systems', attended: 37, total: 40, percentage: 92, faculty: 'Prof. John McCarthy' },
  { subject: 'Database Management', attended: 32, total: 40, percentage: 80, faculty: 'Dr. Grace Hopper' },
  { subject: 'Computer Networks', attended: 35, total: 40, percentage: 87, faculty: 'Prof. Linus Torvalds' },
  { subject: 'Software Engineering', attended: 38, total: 40, percentage: 95, faculty: 'Dr. Margaret Hamilton' },
  { subject: 'Web Technologies', attended: 33, total: 40, percentage: 82, faculty: 'Prof. Tim Berners-Lee' },
];

// Mock timetable data (should be pulled from attendx_admin_master_timetable in production)
const STUDENT_TIMETABLE = {
  Monday: [
    { period: 1, time: '08:00 - 09:00', subject: 'Data Structures', faculty: 'Dr. Alan Turing' },
    { period: 2, time: '09:00 - 10:00', subject: 'Operating Systems', faculty: 'Prof. John McCarthy' },
    { period: 3, time: '10:00 - 11:00', subject: 'Database Management', faculty: 'Dr. Grace Hopper' },
    { period: 4, time: '11:00 - 12:00', subject: 'Free Period', faculty: '-' },
    { period: 5, time: '12:00 - 13:00', subject: 'Computer Networks', faculty: 'Prof. Linus Torvalds' },
    { period: 6, time: '13:00 - 14:00', subject: 'Software Engineering', faculty: 'Dr. Margaret Hamilton' },
  ],
  Tuesday: [
    { period: 1, time: '08:00 - 09:00', subject: 'Web Technologies', faculty: 'Prof. Tim Berners-Lee' },
    { period: 2, time: '09:00 - 10:00', subject: 'Data Structures Lab', faculty: 'Dr. Alan Turing' },
    { period: 3, time: '10:00 - 11:00', subject: 'Data Structures Lab', faculty: 'Dr. Alan Turing' },
    { period: 4, time: '11:00 - 12:00', subject: 'Institutional Break', faculty: '-' },
    { period: 5, time: '12:00 - 13:00', subject: 'Operating Systems', faculty: 'Prof. John McCarthy' },
    { period: 6, time: '13:00 - 14:00', subject: 'Database Management', faculty: 'Dr. Grace Hopper' },
  ],
  Wednesday: [
    { period: 1, time: '08:00 - 09:00', subject: 'Software Engineering', faculty: 'Dr. Margaret Hamilton' },
    { period: 2, time: '09:00 - 10:00', subject: 'Computer Networks', faculty: 'Prof. Linus Torvalds' },
    { period: 3, time: '10:00 - 11:00', subject: 'Web Technologies', faculty: 'Prof. Tim Berners-Lee' },
    { period: 4, time: '11:00 - 12:00', subject: 'Data Structures', faculty: 'Dr. Alan Turing' },
    { period: 5, time: '12:00 - 13:00', subject: 'Free Period', faculty: '-' },
    { period: 6, time: '13:00 - 14:00', subject: 'Operating Systems', faculty: 'Prof. John McCarthy' },
  ],
  Thursday: [
    { period: 1, time: '08:00 - 09:00', subject: 'Database Management Lab', faculty: 'Dr. Grace Hopper' },
    { period: 2, time: '09:00 - 10:00', subject: 'Database Management Lab', faculty: 'Dr. Grace Hopper' },
    { period: 3, time: '10:00 - 11:00', subject: 'Software Engineering', faculty: 'Dr. Margaret Hamilton' },
    { period: 4, time: '11:00 - 12:00', subject: 'Institutional Break', faculty: '-' },
    { period: 5, time: '12:00 - 13:00', subject: 'Computer Networks', faculty: 'Prof. Linus Torvalds' },
    { period: 6, time: '13:00 - 14:00', subject: 'Web Technologies', faculty: 'Prof. Tim Berners-Lee' },
  ],
  Friday: [
    { period: 1, time: '08:00 - 09:00', subject: 'Data Structures', faculty: 'Dr. Alan Turing' },
    { period: 2, time: '09:00 - 10:00', subject: 'Operating Systems', faculty: 'Prof. John McCarthy' },
    { period: 3, time: '10:00 - 11:00', subject: 'Database Management', faculty: 'Dr. Grace Hopper' },
    { period: 4, time: '11:00 - 12:00', subject: 'Computer Networks', faculty: 'Prof. Linus Torvalds' },
    { period: 5, time: '12:00 - 13:00', subject: 'Software Engineering', faculty: 'Dr. Margaret Hamilton' },
    { period: 6, time: '13:00 - 14:00', subject: 'Free Period', faculty: '-' },
  ],
  Saturday: [
    { period: 1, time: '08:00 - 09:00', subject: 'Web Technologies Lab', faculty: 'Prof. Tim Berners-Lee' },
    { period: 2, time: '09:00 - 10:00', subject: 'Web Technologies Lab', faculty: 'Prof. Tim Berners-Lee' },
    { period: 3, time: '10:00 - 11:00', subject: 'Project Work', faculty: 'Dr. Margaret Hamilton' },
    { period: 4, time: '11:00 - 12:00', subject: 'Project Work', faculty: 'Dr. Margaret Hamilton' },
    { period: 5, time: '12:00 - 13:00', subject: 'Free Period', faculty: '-' },
    { period: 6, time: '13:00 - 14:00', subject: 'Free Period', faculty: '-' },
  ],
};

const StudentPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'faculty' | 'reports'>('overview');
  const [reportPeriod, setReportPeriod] = useState<'semester' | 'yearly'>('semester');
  const [currentStudent] = useState(MOCK_STUDENTS[0]); // Simulating logged-in student

  // Calculate total attendance percentage
  const totalAttendance = Math.round(
    STUDENT_ATTENDANCE_BY_SUBJECT.reduce((acc, s) => acc + s.percentage, 0) / 
    STUDENT_ATTENDANCE_BY_SUBJECT.length
  );

  // Get today's schedule
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = days[new Date().getDay()];
  const todaySchedule = STUDENT_TIMETABLE[today as keyof typeof STUDENT_TIMETABLE] || [];

  // Get faculty for student's department and year
  const departmentFaculty = MOCK_STAFF.filter(
    f => f.department === 'B.Sc Computer Science' && f.year === 'Year 1'
  );

  // Handle PDF download
  const handleDownloadPDF = () => {
    alert(`Generating ${reportPeriod === 'semester' ? 'Semester Wise' : 'Yearly'} Attendance Report PDF...\n\nStudent: ${currentStudent.name}\nRoll No: ${currentStudent.rollNumber}\nClass: ${currentStudent.class}\nSection: ${currentStudent.section}\n\nThis feature will generate a formal PDF report with all attendance details.`);
  };

  // Circular progress calculation
  const circumference = 2 * Math.PI * 70;
  const offset = circumference - (totalAttendance / 100) * circumference;

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-7xl font-black text-slate-900 tracking-tighter flex items-center gap-6 leading-none">
            <div className="w-16 h-16 bg-indigo-600 rounded-[2rem] flex items-center justify-center shadow-xl shadow-indigo-600/20">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            Student <br/>Portal
          </h1>
          <p className="text-slate-500 font-medium text-xl mt-6">Your personal academic dashboard and analytics.</p>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-black text-indigo-600">
              {currentStudent.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-black text-slate-800 tracking-tight">{currentStudent.name}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{currentStudent.rollNumber}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-white p-2.5 rounded-[2.5rem] border border-slate-100 shadow-sm overflow-x-auto">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`px-8 py-4 rounded-[1.8rem] text-xs font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 scale-105' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}
        >
          📊 Overview
        </button>
        <button 
          onClick={() => setActiveTab('timeline')}
          className={`px-8 py-4 rounded-[1.8rem] text-xs font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${activeTab === 'timeline' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 scale-105' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}
        >
          📅 Today's Schedule
        </button>
        <button 
          onClick={() => setActiveTab('faculty')}
          className={`px-8 py-4 rounded-[1.8rem] text-xs font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${activeTab === 'faculty' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 scale-105' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}
        >
          👥 Faculty Directory
        </button>
        <button 
          onClick={() => setActiveTab('reports')}
          className={`px-8 py-4 rounded-[1.8rem] text-xs font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${activeTab === 'reports' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 scale-105' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}
        >
          📄 Reports
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Personal Attendance Overview */}
          <div className="bg-white p-12 rounded-[4rem] border border-slate-100 card-shadow flex flex-col items-center justify-center">
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-8">Overall Attendance</h3>
            
            {/* Circular Progress Gauge */}
            <div className="relative w-48 h-48 mb-8">
              <svg className="transform -rotate-90 w-48 h-48">
                <circle
                  cx="96"
                  cy="96"
                  r="70"
                  stroke="#e5e7eb"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="70"
                  stroke={totalAttendance >= 75 ? '#4f46e5' : '#ef4444'}
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-black text-slate-900">{totalAttendance}%</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Total</span>
              </div>
            </div>

            {/* Status Badge */}
            {totalAttendance >= 75 ? (
              <div className="px-6 py-3 bg-green-50 text-green-600 rounded-[1.5rem] border border-green-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-widest">Compliant</span>
              </div>
            ) : (
              <div className="px-6 py-3 bg-red-50 text-red-600 rounded-[1.5rem] border border-red-100 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-widest">Below Threshold</span>
              </div>
            )}
          </div>

          {/* Subject-wise Breakdown */}
          <div className="lg:col-span-2 bg-white p-12 rounded-[4rem] border border-slate-100 card-shadow">
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-10">Subject-wise Attendance</h3>
            <div className="space-y-6">
              {STUDENT_ATTENDANCE_BY_SUBJECT.map((subject, idx) => (
                <div key={idx} className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="font-black text-slate-800 text-lg tracking-tight">{subject.subject}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        {subject.attended} of {subject.total} classes attended
                      </p>
                    </div>
                    <span className={`text-3xl font-black ${subject.percentage >= 75 ? 'text-indigo-600' : 'text-red-600'}`}>
                      {subject.percentage}%
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${subject.percentage >= 75 ? 'bg-indigo-600' : 'bg-red-600'}`}
                      style={{ width: `${subject.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Today's Timeline Tab */}
      {activeTab === 'timeline' && (
        <div className="bg-white p-12 rounded-[4rem] border border-slate-100 card-shadow">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h3 className="text-4xl font-black text-slate-900 tracking-tighter">Today's Schedule</h3>
              <p className="text-sm text-slate-500 font-bold mt-2 uppercase tracking-widest">{today} • {new Date().toLocaleDateString()}</p>
            </div>
            <div className="w-16 h-16 bg-indigo-50 rounded-3xl flex items-center justify-center border border-indigo-100 text-indigo-600">
              <Calendar className="w-8 h-8" />
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-6">
            {todaySchedule.map((slot, idx) => (
              <div key={idx} className="flex items-start gap-8 relative">
                {/* Timeline connector */}
                {idx < todaySchedule.length - 1 && (
                  <div className="absolute left-6 top-16 w-0.5 h-20 bg-slate-200" />
                )}
                
                {/* Period marker */}
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${
                    slot.subject === 'Free Period' || slot.subject === 'Institutional Break' 
                      ? 'bg-slate-50 text-slate-400 border border-slate-200' 
                      : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  }`}>
                    {slot.period}
                  </div>
                </div>

                {/* Period details */}
                <div className={`flex-1 p-8 rounded-[2.5rem] border transition-all ${
                  slot.subject === 'Free Period' || slot.subject === 'Institutional Break'
                    ? 'bg-slate-50 border-slate-100'
                    : 'bg-indigo-50/50 border-indigo-100 hover:border-indigo-200'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-black text-slate-800 text-xl tracking-tight mb-2">
                        {slot.subject === 'Free Period' ? '⏸️ ' : slot.subject === 'Institutional Break' ? '🍽️ ' : '📚 '}
                        {slot.subject}
                      </h4>
                      {slot.faculty !== '-' && (
                        <p className="text-sm font-bold text-slate-600 mb-3">Faculty: {slot.faculty}</p>
                      )}
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                        <Clock className="w-4 h-4" />
                        {slot.time}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Faculty Directory Tab */}
      {activeTab === 'faculty' && (
        <div className="bg-white p-12 rounded-[4rem] border border-slate-100 card-shadow">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h3 className="text-4xl font-black text-slate-900 tracking-tighter">Department Faculty</h3>
              <p className="text-sm text-slate-500 font-bold mt-2 uppercase tracking-widest">
                B.Sc Computer Science • Year 1
              </p>
            </div>
            <div className="w-16 h-16 bg-indigo-50 rounded-3xl flex items-center justify-center border border-indigo-100 text-indigo-600">
              <Users className="w-8 h-8" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {departmentFaculty.map((faculty) => (
              <div key={faculty.id} className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 hover:border-indigo-200 transition-all">
                <div className="flex items-center gap-6 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center">
                    <img 
                      src={faculty.avatar} 
                      alt={faculty.name}
                      className="w-full h-full rounded-2xl object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-black text-slate-800 tracking-tight text-lg">{faculty.name}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                      {faculty.subject}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    <span className="font-bold">{faculty.email}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="bg-white p-12 rounded-[4rem] border border-slate-100 card-shadow">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h3 className="text-4xl font-black text-slate-900 tracking-tighter">Reports & Analytics</h3>
              <p className="text-sm text-slate-500 font-bold mt-2 uppercase tracking-widest">
                Download formal attendance reports
              </p>
            </div>
            <div className="w-16 h-16 bg-indigo-50 rounded-3xl flex items-center justify-center border border-indigo-100 text-indigo-600">
              <FileText className="w-8 h-8" />
            </div>
          </div>

          <div className="max-w-3xl mx-auto space-y-10">
            {/* Report Type Selection */}
            <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100">
              <h4 className="font-black text-slate-800 text-xl tracking-tight mb-6">Select Report Period</h4>
              <div className="flex gap-6">
                <button
                  onClick={() => setReportPeriod('semester')}
                  className={`flex-1 py-6 rounded-[2rem] text-sm font-black uppercase tracking-[0.2em] transition-all ${
                    reportPeriod === 'semester'
                      ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20'
                      : 'bg-white text-slate-400 border border-slate-200 hover:text-slate-900'
                  }`}
                >
                  📊 Semester Wise
                </button>
                <button
                  onClick={() => setReportPeriod('yearly')}
                  className={`flex-1 py-6 rounded-[2rem] text-sm font-black uppercase tracking-[0.2em] transition-all ${
                    reportPeriod === 'yearly'
                      ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20'
                      : 'bg-white text-slate-400 border border-slate-200 hover:text-slate-900'
                  }`}
                >
                  📅 Yearly
                </button>
              </div>
            </div>

            {/* Report Preview */}
            <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100">
              <h4 className="font-black text-slate-800 text-xl tracking-tight mb-6">Report Details</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-4 border-b border-slate-200">
                  <span className="font-bold text-slate-600">Student Name</span>
                  <span className="font-black text-slate-900">{currentStudent.name}</span>
                </div>
                <div className="flex items-center justify-between py-4 border-b border-slate-200">
                  <span className="font-bold text-slate-600">Roll Number</span>
                  <span className="font-black text-slate-900">{currentStudent.rollNumber}</span>
                </div>
                <div className="flex items-center justify-between py-4 border-b border-slate-200">
                  <span className="font-bold text-slate-600">Class</span>
                  <span className="font-black text-slate-900">{currentStudent.class}</span>
                </div>
                <div className="flex items-center justify-between py-4 border-b border-slate-200">
                  <span className="font-bold text-slate-600">Section</span>
                  <span className="font-black text-slate-900">{currentStudent.section}</span>
                </div>
                <div className="flex items-center justify-between py-4 border-b border-slate-200">
                  <span className="font-bold text-slate-600">Report Period</span>
                  <span className="font-black text-slate-900">{reportPeriod === 'semester' ? 'Semester 1 (2024)' : 'Academic Year 2024'}</span>
                </div>
                <div className="flex items-center justify-between py-4">
                  <span className="font-bold text-slate-600">Overall Attendance</span>
                  <span className={`text-2xl font-black ${totalAttendance >= 75 ? 'text-indigo-600' : 'text-red-600'}`}>
                    {totalAttendance}%
                  </span>
                </div>
              </div>
            </div>

            {/* Download Button */}
            <button
              onClick={handleDownloadPDF}
              className="w-full py-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[2.5rem] font-black text-lg uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-4 active:scale-95"
            >
              <Download className="w-6 h-6" />
              Download PDF Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPortal;
