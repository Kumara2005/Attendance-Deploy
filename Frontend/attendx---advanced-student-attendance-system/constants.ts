
import { Student, ClassOverview, UserRole, User, Circular } from './types';

export const MOCK_ADMIN: User = {
  id: 'u1',
  name: 'Dr. Sarah Jenkins',
  email: 'sarah.admin@attendx.edu',
  role: UserRole.ADMIN,
  department: 'Administration'
};

// Expanded Faculty Roster for B.Sc Computer Science
const generateCSFaculty = (): User[] => {
  const faculty: User[] = [];
  const names = [
    'Dr. Alan Turing', 'Dr. Grace Hopper', 'Prof. John McCarthy', 'Dr. Ada Lovelace', 'Prof. Marvin Minsky',
    'Dr. Tim Berners-Lee', 'Prof. Linus Torvalds', 'Dr. Margaret Hamilton', 'Prof. Ken Thompson', 'Dr. Barbara Liskov',
    'Prof. Donald Knuth', 'Dr. Leslie Lamport', 'Prof. Vint Cerf', 'Dr. Shafi Goldwasser', 'Prof. Judea Pearl'
  ];
  
  names.forEach((name, i) => {
    const year = `Year ${(i % 3) + 1}`;
    faculty.push({
      id: `cs_f_${i}`,
      name,
      email: `cs.prof${i}@attendx.edu`,
      role: UserRole.STAFF,
      department: 'B.Sc Computer Science',
      subject: 'Computer Science',
      year: year
    });
  });
  return faculty;
};

export const MOCK_STAFF: User[] = [
  ...generateCSFaculty(),
  {
    id: 'f1',
    name: 'Prof. Alice Thompson',
    email: 'staff1@gmail.com',
    role: UserRole.STAFF,
    department: 'English Literature',
    subject: 'English Literature',
    lastLogin: '2024-05-24 09:00 AM'
  },
  {
    id: 'f2',
    name: 'Prof. Bernard Wilson',
    email: 'staff2@gmail.com',
    role: UserRole.STAFF,
    department: 'Psychology',
    subject: 'Psychology',
    lastLogin: '2024-05-24 09:15 AM'
  },
  {
    id: 'f3',
    name: 'Prof. Catherine Chen',
    email: 'staff3@gmail.com',
    role: UserRole.STAFF,
    department: 'Sociology',
    subject: 'Sociology',
    lastLogin: '2024-05-24 09:30 AM'
  },
  {
    id: 'f4',
    name: 'Prof. David Rodriguez',
    email: 'staff4@gmail.com',
    role: UserRole.STAFF,
    department: 'Political Science',
    subject: 'Political Science',
    lastLogin: '2024-05-24 09:45 AM'
  },
  {
    id: 'f5',
    name: 'Prof. Elena Gilbert',
    email: 'staff5@gmail.com',
    role: UserRole.STAFF,
    department: 'Fine Arts',
    subject: 'Fine Arts',
    lastLogin: '2024-05-24 10:00 AM'
  }
];

// Expanded Student Ledger for B.Sc Computer Science
const generateCSStudents = (): Student[] => {
  const students: Student[] = [];
  const firstNames = ['James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
  
  for (let y = 1; y <= 3; y++) {
    for (let i = 0; i < 10; i++) {
      const idx = (y - 1) * 10 + i;
      students.push({
        id: `cs_s_${idx}`,
        rollNumber: `CS-Y${y}-${100 + i}`,
        name: `${firstNames[i]} ${lastNames[i]}`,
        class: 'B.Sc Computer Science',
        section: `Year ${y}`,
        year: `Year ${y}`,
        attendancePercentage: Math.floor(Math.random() * 40) + 60,
        lastActive: '2024-05-20',
        status: 'Active'
      });
    }
  }
  return students;
};

export const MOCK_STUDENTS: Student[] = [
  ...generateCSStudents(),
  { id: 's1', rollNumber: 'STU-001', name: 'Alex Rivera', class: 'Arts', section: 'Year 1', year: 'Year 1', attendancePercentage: 92, lastActive: '2024-05-20', status: 'Active' },
  { id: 's2', rollNumber: 'STU-002', name: 'Maria Garcia', class: 'Arts', section: 'Year 1', year: 'Year 1', attendancePercentage: 85, lastActive: '2024-05-20', status: 'Active' },
  { id: 's3', rollNumber: 'STU-003', name: 'John Chen', class: 'Science', section: 'Year 2', year: 'Year 2', attendancePercentage: 78, lastActive: '2024-05-19', status: 'Active' },
  { id: 's4', rollNumber: 'STU-004', name: 'Sarah Miller', class: 'Commerce', section: 'Year 3', year: 'Year 3', attendancePercentage: 98, lastActive: '2024-05-20', status: 'Active' },
  { id: 's5', rollNumber: 'STU-005', name: 'David Wilson', class: 'Management', section: 'Year 1', year: 'Year 1', attendancePercentage: 62, lastActive: '2024-05-18', status: 'Active' },
];

export const MOCK_CLASSES: ClassOverview[] = [
  { className: 'Bachelor of Arts (BA)', totalStudents: 420, averageAttendance: 88, trend: 'up' },
  { className: 'Bachelor of Science (B.Sc)', totalStudents: 380, averageAttendance: 74, trend: 'down' },
  { className: 'Bachelor of Commerce (B.Com)', totalStudents: 510, averageAttendance: 91, trend: 'stable' },
  { className: 'Business Management (BBA)', totalStudents: 290, averageAttendance: 82, trend: 'up' },
  { className: 'B.Sc Computer Science', totalStudents: 320, averageAttendance: 85, trend: 'up' },
];

export const ATTENDANCE_TREND_DATA = [
  { name: 'Mon', attendance: 85 },
  { name: 'Tue', attendance: 88 },
  { name: 'Wed', attendance: 92 },
  { name: 'Thu', attendance: 90 },
  { name: 'Fri', attendance: 87 },
  { name: 'Sat', attendance: 75 },
];

export const SUBJECT_WISE_SUMMARY = [
  { subject: 'Math', attendance: 82 },
  { subject: 'Physics', attendance: 91 },
  { subject: 'CS', attendance: 88 },
  { subject: 'English', attendance: 95 },
  { subject: 'History', attendance: 70 },
];

// Mock circulars for the Official Communication module
export const MOCK_CIRCULARS: Circular[] = [
  {
    id: 'c1',
    title: 'Semester Final Examinations',
    description: 'The final examinations for the Spring 2024 semester will commence from June 15th. Detailed schedule will be released shortly.',
    date: '2024-06-15',
    type: 'Academic',
    publishedAt: '2024-05-20'
  },
  {
    id: 'c2',
    title: 'Summer Vacation Announcement',
    description: 'The institution will remain closed for summer break from July 1st to July 31st. Classes will resume on August 1st.',
    date: '2024-07-01',
    type: 'Holiday',
    publishedAt: '2024-05-18'
  },
  {
    id: 'c3',
    title: 'Guest Lecture: AI in Education',
    description: 'Join us for an insightful guest lecture on the impact of AI in modern education systems by Dr. Alan Turing Jr.',
    date: '2024-05-28',
    type: 'General',
    publishedAt: '2024-05-22'
  }
];
