# MongoDB Backend Integration for Next.js Assignment Portal

## 🎯 Overview
Transform your current localStorage-based Assignment Portal into a full-stack application with MongoDB backend, maintaining all existing functionality while adding proper data persistence.

## 📋 What We're Adding
- ✅ MongoDB database integration
- ✅ User authentication with database storage
- ✅ API routes for CRUD operations
- ✅ Mongoose ODM for data modeling
- ✅ Replace DataContext with API calls
- ✅ Proper error handling and validation

---

## 🚀 Step-by-Step Implementation

### Step 1: Install Required Dependencies

```bash
# Core MongoDB and API dependencies
npm install mongoose bcryptjs jsonwebtoken

# Validation and utilities
npm install validator multer

# Development dependencies
npm install -D @types/bcryptjs @types/jsonwebtoken @types/validator
```

### Step 2: Setup MongoDB Database

**Option A: MongoDB Atlas (Cloud - Recommended)**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account and cluster
3. Get connection string
4. Whitelist your IP address

**Option B: Local MongoDB**
```bash
# Install MongoDB locally
# macOS with Homebrew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community

# Connection string will be: mongodb://localhost:27017/assignment-portal
```

### Step 3: Environment Variables

Add to `.env.local`:
```env
# Existing variables
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# New MongoDB variables
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/assignment-portal?retryWrites=true&w=majority
JWT_SECRET=your-jwt-secret-here
BCRYPT_ROUNDS=12
```

### Step 4: Database Connection Setup

Create `src/lib/mongodb.ts`:
```typescript
import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local')
}

interface MongooseConnection {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

// Global variable to maintain connection across hot reloads in development
let cached: MongooseConnection = (global as any).mongoose

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null }
}

async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

export default connectDB
```

### Step 5: Create Database Models

Create `src/models/User.ts`:
```typescript
import mongoose, { Document, Schema } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser extends Document {
  name: string
  email: string
  password: string
  role: 'instructor' | 'student'
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: ['instructor', 'student'],
    required: [true, 'Role is required']
  }
}, {
  timestamps: true
})

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12')
  this.password = await bcrypt.hash(this.password, saltRounds)
  next()
})

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
```

Create `src/models/Assignment.ts`:
```typescript
import mongoose, { Document, Schema } from 'mongoose'

export interface IAssignment extends Document {
  title: string
  description: string
  deadline: Date
  instructor: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const AssignmentSchema = new Schema<IAssignment>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  deadline: {
    type: Date,
    required: [true, 'Deadline is required'],
    validate: {
      validator: function(value: Date) {
        return value > new Date()
      },
      message: 'Deadline must be in the future'
    }
  },
  instructor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Instructor is required']
  }
}, {
  timestamps: true
})

export default mongoose.models.Assignment || mongoose.model<IAssignment>('Assignment', AssignmentSchema)
```

Create `src/models/Submission.ts`:
```typescript
import mongoose, { Document, Schema } from 'mongoose'

export interface ISubmission extends Document {
  assignment: mongoose.Types.ObjectId
  student: mongoose.Types.ObjectId
  submissionUrl: string
  note?: string
  feedback?: string
  status: 'pending' | 'accepted' | 'rejected'
  submittedAt: Date
  updatedAt: Date
}

const SubmissionSchema = new Schema<ISubmission>({
  assignment: {
    type: Schema.Types.ObjectId,
    ref: 'Assignment',
    required: [true, 'Assignment is required']
  },
  student: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student is required']
  },
  submissionUrl: {
    type: String,
    required: [true, 'Submission URL is required'],
    validate: {
      validator: function(value: string) {
        try {
          new URL(value)
          return true
        } catch {
          return false
        }
      },
      message: 'Please enter a valid URL'
    }
  },
  note: {
    type: String,
    trim: true,
    maxlength: [1000, 'Note cannot exceed 1000 characters']
  },
  feedback: {
    type: String,
    trim: true,
    maxlength: [1000, 'Feedback cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Prevent duplicate submissions
SubmissionSchema.index({ assignment: 1, student: 1 }, { unique: true })

export default mongoose.models.Submission || mongoose.model<ISubmission>('Submission', SubmissionSchema)
```

### Step 6: Create API Utility Functions

Create `src/lib/auth.ts`:
```typescript
import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'
import User, { IUser } from '@/models/User'
import connectDB from './mongodb'

const JWT_SECRET = process.env.JWT_SECRET!

export async function generateToken(userId: string): Promise<string> {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}

export async function verifyToken(token: string): Promise<string | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    return decoded.userId
  } catch {
    return null
  }
}

export async function getCurrentUser(request: NextRequest): Promise<IUser | null> {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return null

    const userId = await verifyToken(token)
    if (!userId) return null

    await connectDB()
    const user = await User.findById(userId).select('-password')
    return user
  } catch {
    return null
  }
}

export function createErrorResponse(message: string, status: number = 400) {
  return Response.json({ error: message }, { status })
}

export function createSuccessResponse(data: any, status: number = 200) {
  return Response.json(data, { status })
}
```

### Step 7: Update NextAuth Configuration

Update `src/app/api/auth/[...nextauth]/route.ts`:
```typescript
import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        role: { label: 'Role', type: 'text' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password || !credentials?.role) {
          return null
        }

        try {
          await connectDB()
          
          const user = await User.findOne({ 
            email: credentials.email,
            role: credentials.role
          })

          if (!user) {
            return null
          }

          const isValidPassword = await user.comparePassword(credentials.password)
          if (!isValidPassword) {
            return null
          }

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

### Step 8: Create API Routes

Create `src/app/api/assignments/route.ts`:
```typescript
import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import Assignment from '@/models/Assignment'
import { getCurrentUser, createErrorResponse, createSuccessResponse } from '@/lib/auth'

// GET /api/assignments - Get all assignments
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const assignments = await Assignment.find()
      .populate('instructor', 'name email')
      .sort({ createdAt: -1 })

    return createSuccessResponse(assignments)
  } catch (error) {
    console.error('Get assignments error:', error)
    return createErrorResponse('Failed to fetch assignments', 500)
  }
}

// POST /api/assignments - Create new assignment
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user || user.role !== 'instructor') {
      return createErrorResponse('Unauthorized', 401)
    }

    const body = await request.json()
    const { title, description, deadline } = body

    if (!title || !description || !deadline) {
      return createErrorResponse('Missing required fields')
    }

    await connectDB()

    const assignment = await Assignment.create({
      title,
      description,
      deadline: new Date(deadline),
      instructor: user._id
    })

    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate('instructor', 'name email')

    return createSuccessResponse(populatedAssignment, 201)
  } catch (error) {
    console.error('Create assignment error:', error)
    return createErrorResponse('Failed to create assignment', 500)
  }
}
```

Create `src/app/api/submissions/route.ts`:
```typescript
import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import Submission from '@/models/Submission'
import Assignment from '@/models/Assignment'
import { getCurrentUser, createErrorResponse, createSuccessResponse } from '@/lib/auth'

// GET /api/submissions - Get submissions (filtered by user role)
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return createErrorResponse('Unauthorized', 401)
    }

    await connectDB()

    let submissions
    if (user.role === 'instructor') {
      // Get submissions for instructor's assignments
      const assignments = await Assignment.find({ instructor: user._id })
      const assignmentIds = assignments.map(a => a._id)
      
      submissions = await Submission.find({ assignment: { $in: assignmentIds } })
        .populate('student', 'name email')
        .populate('assignment', 'title')
        .sort({ submittedAt: -1 })
    } else {
      // Get student's submissions
      submissions = await Submission.find({ student: user._id })
        .populate('assignment', 'title')
        .sort({ submittedAt: -1 })
    }

    return createSuccessResponse(submissions)
  } catch (error) {
    console.error('Get submissions error:', error)
    return createErrorResponse('Failed to fetch submissions', 500)
  }
}

// POST /api/submissions - Create new submission
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user || user.role !== 'student') {
      return createErrorResponse('Unauthorized', 401)
    }

    const body = await request.json()
    const { assignmentId, submissionUrl, note } = body

    if (!assignmentId || !submissionUrl) {
      return createErrorResponse('Missing required fields')
    }

    await connectDB()

    // Check if assignment exists and is not expired
    const assignment = await Assignment.findById(assignmentId)
    if (!assignment) {
      return createErrorResponse('Assignment not found', 404)
    }

    if (new Date() > assignment.deadline) {
      return createErrorResponse('Assignment deadline has passed')
    }

    // Check for existing submission
    const existingSubmission = await Submission.findOne({
      assignment: assignmentId,
      student: user._id
    })

    if (existingSubmission) {
      return createErrorResponse('Submission already exists for this assignment')
    }

    const submission = await Submission.create({
      assignment: assignmentId,
      student: user._id,
      submissionUrl,
      note
    })

    const populatedSubmission = await Submission.findById(submission._id)
      .populate('assignment', 'title')

    return createSuccessResponse(populatedSubmission, 201)
  } catch (error) {
    console.error('Create submission error:', error)
    return createErrorResponse('Failed to create submission', 500)
  }
}
```

Create `src/app/api/submissions/[id]/route.ts`:
```typescript
import { NextRequest } from 'next/server'
import connectDB from '@/lib/mongodb'
import Submission from '@/models/Submission'
import Assignment from '@/models/Assignment'
import { getCurrentUser, createErrorResponse, createSuccessResponse } from '@/lib/auth'

// PUT /api/submissions/[id] - Update submission (feedback/status)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user || user.role !== 'instructor') {
      return createErrorResponse('Unauthorized', 401)
    }

    const body = await request.json()
    const { feedback, status } = body

    await connectDB()

    const submission = await Submission.findById(params.id)
      .populate('assignment')

    if (!submission) {
      return createErrorResponse('Submission not found', 404)
    }

    // Verify instructor owns the assignment
    const assignment = await Assignment.findById(submission.assignment)
    if (!assignment || assignment.instructor.toString() !== user._id.toString()) {
      return createErrorResponse('Unauthorized', 403)
    }

    // Update submission
    submission.feedback = feedback
    submission.status = status
    await submission.save()

    const updatedSubmission = await Submission.findById(submission._id)
      .populate('student', 'name email')
      .populate('assignment', 'title')

    return createSuccessResponse(updatedSubmission)
  } catch (error) {
    console.error('Update submission error:', error)
    return createErrorResponse('Failed to update submission', 500)
  }
}
```

### Step 9: Create API Service Layer

Create `src/lib/api.ts`:
```typescript
import { getSession } from 'next-auth/react'

class ApiClient {
  private async getAuthHeaders() {
    const session = await getSession()
    return {
      'Content-Type': 'application/json',
      ...(session?.accessToken && { Authorization: `Bearer ${session.accessToken}` })
    }
  }

  async get(url: string) {
    const headers = await this.getAuthHeaders()
    const response = await fetch(url, { headers })
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }
    
    return response.json()
  }

  async post(url: string, data: any) {
    const headers = await this.getAuthHeaders()
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }
    
    return response.json()
  }

  async put(url: string, data: any) {
    const headers = await this.getAuthHeaders()
    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }
    
    return response.json()
  }

  async delete(url: string) {
    const headers = await this.getAuthHeaders()
    const response = await fetch(url, {
      method: 'DELETE',
      headers
    })
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }
    
    return response.json()
  }
}

export const api = new ApiClient()

// Assignment API calls
export const assignmentApi = {
  getAll: () => api.get('/api/assignments'),
  create: (data: any) => api.post('/api/assignments', data),
  update: (id: string, data: any) => api.put(`/api/assignments/${id}`, data),
  delete: (id: string) => api.delete(`/api/assignments/${id}`)
}

// Submission API calls
export const submissionApi = {
  getAll: () => api.get('/api/submissions'),
  create: (data: any) => api.post('/api/submissions', data),
  update: (id: string, data: any) => api.put(`/api/submissions/${id}`, data),
  delete: (id: string) => api.delete(`/api/submissions/${id}`)
}
```

### Step 10: Update DataContext to Use API

Replace `src/contexts/DataContext.tsx`:
```typescript
'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { assignmentApi, submissionApi } from '@/lib/api'
import { useSession } from 'next-auth/react'

interface Assignment {
  _id: string
  title: string
  description: string
  deadline: string
  instructor: {
    _id: string
    name: string
    email: string
  }
}

interface Submission {
  _id: string
  assignment: {
    _id: string
    title: string
  }
  student: {
    _id: string
    name: string
    email: string
  }
  submissionUrl: string
  note?: string
  feedback?: string
  status: 'pending' | 'accepted' | 'rejected'
  submittedAt: string
}

interface DataContextType {
  assignments: Assignment[]
  submissions: Submission[]
  loading: boolean
  error: string | null
  addAssignment: (assignment: Omit<Assignment, '_id' | 'instructor'>) => Promise<void>
  addSubmission: (submission: any) => Promise<void>
  updateSubmission: (id: string, updates: any) => Promise<void>
  refetchData: () => Promise<void>
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    if (!session) return

    setLoading(true)
    setError(null)

    try {
      const [assignmentsData, submissionsData] = await Promise.all([
        assignmentApi.getAll(),
        submissionApi.getAll()
      ])

      setAssignments(assignmentsData)
      setSubmissions(submissionsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [session])

  const addAssignment = async (assignmentData: any) => {
    try {
      const newAssignment = await assignmentApi.create(assignmentData)
      setAssignments(prev => [newAssignment, ...prev])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create assignment')
      throw err
    }
  }

  const addSubmission = async (submissionData: any) => {
    try {
      const newSubmission = await submissionApi.create(submissionData)
      setSubmissions(prev => [newSubmission, ...prev])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create submission')
      throw err
    }
  }

  const updateSubmission = async (id: string, updates: any) => {
    try {
      const updatedSubmission = await submissionApi.update(id, updates)
      setSubmissions(prev => 
        prev.map(sub => sub._id === id ? updatedSubmission : sub)
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update submission')
      throw err
    }
  }

  const value: DataContextType = {
    assignments,
    submissions,
    loading,
    error,
    addAssignment,
    addSubmission,
    updateSubmission,
    refetchData: fetchData
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}
```

### Step 11: Create Database Seeder

Create `src/scripts/seed.ts`:
```typescript
import connectDB from '../lib/mongodb'
import User from '../models/User'
import Assignment from '../models/Assignment'
import Submission from '../models/Submission'

async function seedDatabase() {
  await connectDB()

  // Clear existing data
  await User.deleteMany({})
  await Assignment.deleteMany({})
  await Submission.deleteMany({})

  // Create users
  const instructor = await User.create({
    name: 'Dr. Smith',
    email: 'instructor@example.com',
    password: 'password',
    role: 'instructor'
  })

  const student = await User.create({
    name: 'John Student',
    email: 'student@example.com',
    password: 'password',
    role: 'student'
  })

  // Create assignments
  const assignment1 = await Assignment.create({
    title: 'React Components Project',
    description: 'Create a comprehensive React application showcasing different component patterns.',
    deadline: new Date('2024-02-15T23:59:59'),
    instructor: instructor._id
  })

  const assignment2 = await Assignment.create({
    title: 'Database Design Assignment',
    description: 'Design and implement a relational database schema for a library management system.',
    deadline: new Date('2024-02-20T23:59:59'),
    instructor: instructor._id
  })

  // Create submissions
  await Submission.create({
    assignment: assignment1._id,
    student: student._id,
    submissionUrl: 'https://github.com/student/react-components-project',
    note: 'Implemented all required features including search and filtering.',
    feedback: 'Excellent work! Clean component structure and good state management.',
    status: 'accepted'
  })

  console.log('Database seeded successfully!')
}

// Run seeder
seedDatabase().catch(console.error)
```

### Step 12: Update Package.json Scripts

Add to `package.json`:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "seed": "tsx src/scripts/seed.ts"
  }
}
```

### Step 13: Test the Implementation

```bash
# Install tsx for running TypeScript scripts
npm install -D tsx

# Seed the database
npm run seed

# Start the development server
npm run dev
```

## ✅ Verification Checklist

Test each functionality:

- [ ] **User Registration/Login** works with database
- [ ] **Create Assignment** saves to MongoDB
- [ ] **Submit Assignment** creates database record
- [ ] **View Submissions** loads from database
- [ ] **Update Submission Status** saves to database
- [ ] **Data persists** after browser refresh
- [ ] **Role-based access** enforced by API
- [ ] **Error handling** works properly

## 🚨 Common Issues & Solutions

### MongoDB Connection Issues
```typescript
// Check connection string format
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name
```

### API Authentication Errors
```typescript
// Ensure proper token handling in API calls
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

### Model Import Errors
```typescript
// Use dynamic imports to avoid caching issues
export default mongoose.models.User || mongoose.model('User', UserSchema)
```

## 🎯 Migration from localStorage

Your existing app will now:
- ✅ Store all data in MongoDB instead of localStorage
- ✅ Have proper user authentication with password hashing
- ✅ Support real multi-user functionality
- ✅ Provide data persistence across sessions
- ✅ Enable production deployment

All your existing UI components and functionality remain exactly the same!
