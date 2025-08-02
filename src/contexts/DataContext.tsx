'use client'
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Assignment, Submission } from '@shared/auth';

interface DataContextType {
  assignments: Assignment[];
  submissions: Submission[];
  addAssignment: (assignment: Omit<Assignment, 'id'>) => void;
  addSubmission: (submission: Omit<Submission, 'id'>) => void;
  updateSubmission: (id: string, updates: Partial<Submission>) => void;
  getAssignmentsByInstructor: (instructorId: string) => Assignment[];
  getSubmissionsByStudent: (studentId: string) => Submission[];
  getSubmissionsByAssignment: (assignmentId: string) => Submission[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Mock data
const initialAssignments: Assignment[] = [
  {
    id: '1',
    title: 'React Components Project',
    description: 'Create a comprehensive React application showcasing different component patterns including functional components, hooks, and state management. Build a small e-commerce product catalog with filtering and search functionality.',
    deadline: '2024-02-15T23:59:59',
    instructorId: '1'
  },
  {
    id: '2',
    title: 'Database Design Assignment',
    description: 'Design and implement a relational database schema for a library management system. Include proper normalization, foreign key relationships, and create sample queries for common operations.',
    deadline: '2024-02-20T23:59:59',
    instructorId: '1'
  },
  {
    id: '3',
    title: 'API Integration Task',
    description: 'Build a web application that integrates with a public REST API (such as OpenWeatherMap or JSONPlaceholder). Implement proper error handling, loading states, and responsive design.',
    deadline: '2024-02-25T23:59:59',
    instructorId: '1'
  },
  {
    id: '4',
    title: 'CSS Grid Layout Challenge',
    description: 'Create a responsive webpage layout using CSS Grid and Flexbox. The layout should adapt to different screen sizes and include a header, sidebar, main content area, and footer.',
    deadline: '2024-02-18T23:59:59',
    instructorId: '1'
  },
  {
    id: '5',
    title: 'JavaScript Algorithms Practice',
    description: 'Solve a series of algorithm problems including array manipulation, string processing, and data structure operations. Focus on time complexity optimization.',
    deadline: '2024-02-12T23:59:59',
    instructorId: '1'
  }
];

const initialSubmissions: Submission[] = [
  {
    id: '1',
    assignmentId: '1',
    studentId: '2',
    submissionUrl: 'https://github.com/student/react-components-project',
    note: 'Implemented all required features including search, filtering, and responsive design. Added some extra animations for better UX.',
    feedback: 'Excellent work! Your component structure is clean and the state management is well implemented. Great attention to detail with the animations.',
    status: 'accepted',
    submittedAt: '2024-02-10T14:30:00',
    student: { name: 'John Student', email: 'student@example.com' },
    assignment: { title: 'React Components Project' }
  },
  {
    id: '2',
    assignmentId: '4',
    studentId: '2',
    submissionUrl: 'https://codepen.io/student/css-grid-layout',
    note: 'Created a responsive layout that works on mobile, tablet, and desktop. Used CSS Grid for the main layout and Flexbox for components.',
    feedback: 'Good responsive implementation. Consider using CSS custom properties for better maintainability.',
    status: 'accepted',
    submittedAt: '2024-02-08T16:45:00',
    student: { name: 'John Student', email: 'student@example.com' },
    assignment: { title: 'CSS Grid Layout Challenge' }
  },
  {
    id: '3',
    assignmentId: '5',
    studentId: '2',
    submissionUrl: 'https://github.com/student/js-algorithms',
    note: 'Solved all problems with optimal time complexity. Included detailed comments explaining the approach.',
    feedback: 'The solutions are correct but some could be optimized further. Review the sorting algorithms section.',
    status: 'rejected',
    submittedAt: '2024-02-05T09:15:00',
    student: { name: 'John Student', email: 'student@example.com' },
    assignment: { title: 'JavaScript Algorithms Practice' }
  },
  {
    id: '4',
    assignmentId: '2',
    studentId: '3',
    submissionUrl: 'https://github.com/alice/library-db-design',
    note: 'Complete database schema with normalization up to 3NF. Included sample data and queries.',
    status: 'pending',
    submittedAt: '2024-02-11T11:20:00',
    student: { name: 'Alice Johnson', email: 'alice@example.com' },
    assignment: { title: 'Database Design Assignment' }
  },
  {
    id: '5',
    assignmentId: '1',
    studentId: '4',
    submissionUrl: 'https://github.com/bob/react-ecommerce',
    note: 'Built the e-commerce catalog with Redux for state management. Added unit tests for components.',
    status: 'pending',
    submittedAt: '2024-02-12T08:30:00',
    student: { name: 'Bob Wilson', email: 'bob@example.com' },
    assignment: { title: 'React Components Project' }
  },
  {
    id: '6',
    assignmentId: '3',
    studentId: '5',
    submissionUrl: 'https://weather-app-demo.netlify.app',
    note: 'Weather app using OpenWeatherMap API. Includes location detection and 5-day forecast.',
    feedback: 'Great API integration! The error handling is robust and the UI is intuitive.',
    status: 'accepted',
    submittedAt: '2024-02-09T13:45:00',
    student: { name: 'Emma Davis', email: 'emma@example.com' },
    assignment: { title: 'API Integration Task' }
  }
];

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  useEffect(() => {
    // Load data from localStorage or use initial data
    const savedAssignments = localStorage.getItem('assignments');
    const savedSubmissions = localStorage.getItem('submissions');
    
    setAssignments(savedAssignments ? JSON.parse(savedAssignments) : initialAssignments);
    setSubmissions(savedSubmissions ? JSON.parse(savedSubmissions) : initialSubmissions);
  }, []);

  useEffect(() => {
    // Save to localStorage whenever data changes
    localStorage.setItem('assignments', JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    localStorage.setItem('submissions', JSON.stringify(submissions));
  }, [submissions]);

  const addAssignment = (assignment: Omit<Assignment, 'id'>) => {
    const newAssignment: Assignment = {
      ...assignment,
      id: Date.now().toString()
    };
    setAssignments(prev => [...prev, newAssignment]);
  };

  const addSubmission = (submission: Omit<Submission, 'id'>) => {
    const newSubmission: Submission = {
      ...submission,
      id: Date.now().toString(),
      submittedAt: new Date().toISOString(),
      status: 'pending'
    };
    setSubmissions(prev => [...prev, newSubmission]);
  };

  const updateSubmission = (id: string, updates: Partial<Submission>) => {
    setSubmissions(prev => 
      prev.map(submission => 
        submission.id === id ? { ...submission, ...updates } : submission
      )
    );
  };

  const getAssignmentsByInstructor = (instructorId: string) => {
    return assignments.filter(assignment => assignment.instructorId === instructorId);
  };

  const getSubmissionsByStudent = (studentId: string) => {
    return submissions.filter(submission => submission.studentId === studentId);
  };

  const getSubmissionsByAssignment = (assignmentId: string) => {
    return submissions.filter(submission => submission.assignmentId === assignmentId);
  };

  const value: DataContextType = {
    assignments,
    submissions,
    addAssignment,
    addSubmission,
    updateSubmission,
    getAssignmentsByInstructor,
    getSubmissionsByStudent,
    getSubmissionsByAssignment
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
