export type UserRole = 'instructor' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  deadline: string;
  instructorId: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  submissionUrl: string;
  note?: string;
  feedback?: string;
  status: 'pending' | 'accepted' | 'rejected';
  submittedAt: string;
  student?: { name: string; email: string; };
  assignment?: { title: string; };
}