import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, Clock, Users, MapPin, AlertCircle } from 'lucide-react';
import { UserRole, User } from '../types';
import { staffDashboardService, TodaySessionDTO } from '../services/staffDashboardService';
import QuickAttendance from '../components/QuickAttendance';

/**
 * Staff Attendance by Period
 * Shows today's sessions for the logged-in staff member and enables per-period attendance marking.
 */
const AttendanceMarking: React.FC = () => {
  const role = (window as any).currentUserRole || UserRole.STAFF;
  const user = (window as any).currentUser as User;

  const [sessions, setSessions] = useState<TodaySessionDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSession, setSelectedSession] = useState<TodaySessionDTO | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      try {
        const data = await staffDashboardService.getTodaySessions();
        setSessions(data || []);
      } catch (error) {
        console.error('Error fetching today sessions for staff:', error);
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const sessionsByTime = useMemo(() => {
    return [...sessions].sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [sessions]);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const handleSessionClick = (session: TodaySessionDTO) => {
    setSelectedSession(session);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <header className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col gap-3">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Attendance · Per Period</p>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">Today's Sessions</h1>
        <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
          <Calendar className="w-4 h-4 text-indigo-500" />
          <span>{today}</span>
          <span className="text-slate-300">•</span>
          <span>{user?.name}</span>
        </div>
      </header>

      <section className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Scheduled Periods</p>
            <h3 className="text-2xl font-black text-slate-900">Tap a period to mark attendance</h3>
          </div>
          <div className="text-xs font-bold text-slate-500">Auto-filtered to your timetable</div>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 text-slate-500 font-bold">
            <div className="w-6 h-6 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            Loading sessions...
          </div>
        ) : sessionsByTime.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-slate-400">
            <AlertCircle className="w-10 h-10" />
            <p className="font-bold">No sessions scheduled for today.</p>
            <p className="text-sm font-medium text-slate-400">Once the admin assigns timetable periods to you, they'll appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sessionsByTime.map((session) => (
              <button
                key={session.sessionId}
                onClick={() => handleSessionClick(session)}
                className="text-left p-5 rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-slate-50 hover:from-indigo-50 hover:border-indigo-200 transition-all shadow-sm hover:shadow-md"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600">{session.className}</span>
                  <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${session.attendanceMarked ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {session.attendanceMarked ? 'Attendance Marked' : 'Pending'}
                  </span>
                </div>
                <div className="text-2xl font-black text-slate-900 leading-tight">{session.subject}</div>
                <div className="mt-3 flex items-center gap-4 text-sm font-bold text-slate-600">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-indigo-500" /> {session.startTime} – {session.endTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-indigo-500" /> {session.section || 'Section'}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-indigo-500" /> {session.location || 'Room TBD'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {selectedSession && (
        <QuickAttendance
          sessionId={selectedSession.sessionId}
          sessionTime={`${selectedSession.startTime} - ${selectedSession.endTime}`}
          subjectName={selectedSession.subject}
          department={selectedSession.department}
          semester={selectedSession.semester}
          section={selectedSession.section}
          onClose={() => setSelectedSession(null)}
          onSaved={() => {
            setSessions((prev) =>
              prev.map((s) =>
                s.sessionId === selectedSession.sessionId ? { ...s, attendanceMarked: true } : s
              )
            );
          }}
        />
      )}
    </div>
  );
};

export default AttendanceMarking;
