import React, { useState, useEffect } from 'react';
import { Clock, Users, CheckCircle2, XCircle, AlertCircle, Save, X } from 'lucide-react';
import apiClient from '../services/api';
import { AttendanceReportDTO } from '../services/reportService';

interface AttendanceRecord {
  studentId: number;
  studentName: string;
  rollNumber: string;
  status: 'PRESENT' | 'ABSENT' | 'OD';
}

interface QuickAttendanceProps {
  sessionId: number;
  sessionTime: string;
  subjectName: string;
  classId?: number;
  department: string;
  semester: number;
  section: string;
  onClose: () => void;
  onSaved: () => void;
}

export const QuickAttendance: React.FC<QuickAttendanceProps> = ({
  sessionId,
  sessionTime,
  subjectName,
  classId,
  department,
  semester,
  section,
  onClose,
  onSaved,
}) => {
  const [students, setStudents] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<Record<number, 'PRESENT' | 'ABSENT' | 'OD'>>({});

  // Fetch students for this class
  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        let url: string;
        if (classId) {
          // Use classId if available (PREFERRED)
          url = `/students?classId=${classId}`;
        } else {
          // Fallback to department+semester+section
          url = `/students?department=${encodeURIComponent(department)}&semester=${semester}&section=${section}`;
        }
        
        const response = await apiClient.get(url);
        const studentList: AttendanceRecord[] = response.data.data || [];
        setStudents(studentList);

        // Initialize all as PRESENT
        const initialStatuses: Record<number, 'PRESENT' | 'ABSENT' | 'OD'> = {};
        studentList.forEach((s) => {
          initialStatuses[s.studentId] = 'PRESENT';
        });
        setSelectedStatuses(initialStatuses);
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [classId, department, semester, section]);

  const handleStatusChange = (studentId: number, status: 'PRESENT' | 'ABSENT' | 'OD') => {
    setSelectedStatuses((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    let savedCount = 0;

    try {
      for (const student of students) {
        const status = selectedStatuses[student.studentId] || 'PRESENT';
        const payload = {
          studentId: student.studentId,
          timetableSessionId: sessionId,
          date: new Date().toISOString().split('T')[0],
          status,
          subjectName,
          department,
          semester,
          section,
        };

        try {
          await apiClient.post('/attendance/session', payload);
          savedCount++;
        } catch (error) {
          console.error('Error saving attendance for student:', student.studentId);
        }
      }

      alert(`✅ Saved attendance for ${savedCount}/${students.length} students`);
      onSaved();
      onClose();
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error saving attendance');
    } finally {
      setSaving(false);
    }
  };

  const presentCount = Object.values(selectedStatuses).filter((s) => s === 'PRESENT').length;
  const absentCount = Object.values(selectedStatuses).filter((s) => s === 'ABSENT').length;
  const odCount = Object.values(selectedStatuses).filter((s) => s === 'OD').length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-br from-indigo-50 to-white p-8 border-b border-slate-100 flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-black text-slate-900 mb-2">Quick Attendance</h2>
            <p className="text-sm font-black text-slate-500 uppercase tracking-widest mb-3">{subjectName}</p>
            <div className="flex gap-4 text-xs font-bold">
              <span className="flex items-center gap-1 text-slate-600">
                <Clock className="w-4 h-4" /> {sessionTime}
              </span>
              <span className="flex items-center gap-1 text-slate-600">
                <Users className="w-4 h-4" /> {section}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        {/* Stats */}
        <div className="p-8 bg-white border-b border-slate-100">
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-4 text-center">
              <div className="text-2xl font-black text-emerald-600">{presentCount}</div>
              <div className="text-xs font-bold text-emerald-700 uppercase tracking-widest">Present</div>
            </div>
            <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-2xl p-4 text-center">
              <div className="text-2xl font-black text-rose-600">{absentCount}</div>
              <div className="text-xs font-bold text-rose-700 uppercase tracking-widest">Absent</div>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-4 text-center">
              <div className="text-2xl font-black text-amber-600">{odCount}</div>
              <div className="text-xs font-bold text-amber-700 uppercase tracking-widest">OD</div>
            </div>
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-4 text-center">
              <div className="text-2xl font-black text-slate-600">{students.length}</div>
              <div className="text-xs font-bold text-slate-700 uppercase tracking-widest">Total</div>
            </div>
          </div>
        </div>

        {/* Student List */}
        <div className="p-8 space-y-3">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Loading students...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No students found</p>
            </div>
          ) : (
            students.map((student) => (
              <div
                key={student.studentId}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-bold text-slate-900">{student.studentName}</p>
                  <p className="text-xs text-slate-500 font-black uppercase tracking-widest">{student.rollNumber}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStatusChange(student.studentId, 'PRESENT')}
                    className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                      selectedStatuses[student.studentId] === 'PRESENT'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    P
                  </button>
                  <button
                    onClick={() => handleStatusChange(student.studentId, 'ABSENT')}
                    className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                      selectedStatuses[student.studentId] === 'ABSENT'
                        ? 'bg-rose-500 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <XCircle className="w-4 h-4" />
                    A
                  </button>
                  <button
                    onClick={() => handleStatusChange(student.studentId, 'OD')}
                    className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                      selectedStatuses[student.studentId] === 'OD'
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <AlertCircle className="w-4 h-4" />
                    OD
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-slate-100 p-8 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-4 bg-slate-100 text-slate-900 font-black rounded-2xl hover:bg-slate-200 transition-colors uppercase tracking-widest text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-6 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 uppercase tracking-widest text-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Attendance'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickAttendance;
