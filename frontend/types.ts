
export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  STUDENT = 'STUDENT'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  subject?: string;
  lastLogin?: string;
  year?: string; // Academic year assignment
}

export interface Student {
  id: string;
  rollNumber: string;
  name: string;
  class: string;
  section: string;
  attendancePercentage: number;
  lastActive: string;
  status: 'Active' | 'Inactive';
  year?: string; // Academic year assignment
}

export interface AttendanceRecord {
  studentId: string;
  date: string;
  status: 'Present' | 'Absent' | 'Late'; // 'Late' is now treated as 'On-Duty (OD)' in UI
  subject: string;
  markedBy: string;
}

export interface ClassOverview {
  className: string;
  totalStudents: number;
  averageAttendance: number;
  trend: 'up' | 'down' | 'stable';
}

export interface AuditLog {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  details: string;
}

// Added Circular interface for communication module
export interface Circular {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'General' | 'Holiday' | 'Academic';
  publishedAt: string;
}
