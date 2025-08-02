'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  Legend
} from 'recharts';
import { 
  FileText, 
  Users, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Plus,
  Calendar,
  BookOpen,
  Send
} from 'lucide-react';
import Link from 'next/link';

// Mock data for demo
const submissionData = [
  { name: 'Pending', value: 12, color: '#f59e0b' },
  { name: 'Accepted', value: 35, color: '#10b981' },
  { name: 'Rejected', value: 5, color: '#ef4444' },
];

const weeklyData = [
  { name: 'Mon', submissions: 4 },
  { name: 'Tue', submissions: 7 },
  { name: 'Wed', submissions: 3 },
  { name: 'Thu', submissions: 8 },
  { name: 'Fri', submissions: 12 },
  { name: 'Sat', submissions: 2 },
  { name: 'Sun', submissions: 1 },
];

const recentAssignments = [
  { id: 1, title: 'React Components Project', deadline: '2024-02-15', submissions: 23 },
  { id: 2, title: 'Database Design Assignment', deadline: '2024-02-20', submissions: 18 },
  { id: 3, title: 'API Integration Task', deadline: '2024-02-25', submissions: 15 },
];

const recentSubmissions = [
  { id: 1, assignment: 'React Components Project', submittedAt: '2024-02-10', status: 'pending' as const },
  { id: 2, assignment: 'CSS Grid Layout', submittedAt: '2024-02-08', status: 'accepted' as const },
  { id: 3, assignment: 'JavaScript Algorithms', submittedAt: '2024-02-05', status: 'rejected' as const },
];


export default function DashboardPage() {
  const { data: session, status } = useSession()

  if (status === 'loading') return <div>Loading...</div>
  if (!session) redirect('/login')
  if (session?.user?.role === 'instructor') {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 lg:pb-8">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Welcome back, {session?.user.name}!</h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">Here's an overview of your assignment portal activity.</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">52</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">12</div>
                <p className="text-xs text-muted-foreground">Awaiting your feedback</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Accepted</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">35</div>
                <p className="text-xs text-muted-foreground">+8% this week</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">28</div>
                <p className="text-xs text-muted-foreground">Across all assignments</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 lg:mb-8">
            {/* Submission Status Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Submission Status Distribution</CardTitle>
                <CardDescription>Overview of all submission statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={submissionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {submissionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Weekly Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Weekly Submission Activity</CardTitle>
                <CardDescription>Submissions received this week</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      axisLine={true}
                      tickLine={true}
                      tick={true}
                    />
                    <YAxis
                      axisLine={true}
                      tickLine={true}
                      tick={true}
                    />
                    <Tooltip />
                    <Bar dataKey="submissions" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Assignments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Assignments</CardTitle>
                <CardDescription>Your latest assignment activity</CardDescription>
              </div>
              <Button asChild>
                <Link href="/create-assignment" className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Create Assignment</span>
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAssignments.map((assignment) => (
                  <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{assignment.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>Due {assignment.deadline}</span>
                          </span>
                          <span>{assignment.submissions} submissions</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/submissions">Review</Link>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Student Dashboard
  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-8">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Welcome back, {session?.user?.name}!</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">Track your assignments and submissions here.</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 lg:mb-8">
          <Link href="/assignments" className="cursor-pointer hover:shadow-lg transition-shadow">
            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="bg-blue-100 p-4 rounded-full">
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <CardTitle>View Assignments</CardTitle>
                <CardDescription>Browse available assignments and their deadlines</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/submit" className="cursor-pointer hover:shadow-lg transition-shadow">
            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="bg-green-100 p-4 rounded-full">
                    <Send className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <CardTitle>Submit Assignment</CardTitle>
                <CardDescription>Submit your completed work with a URL and note</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/my-submissions" className="cursor-pointer hover:shadow-lg transition-shadow">
            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="bg-purple-100 p-4 rounded-full">
                    <CheckCircle className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
                <CardTitle>My Submissions</CardTitle>
                <CardDescription>Track status and feedback on your submissions</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>

        {/* Recent Submissions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Submissions</CardTitle>
            <CardDescription>Your latest submission activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSubmissions.map((submission) => (
                <div key={submission.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <FileText className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{submission.assignment}</h3>
                      <p className="text-sm text-gray-500">Submitted on {submission.submittedAt}</p>
                    </div>
                  </div>
                  <Badge 
                    variant={submission.status === 'accepted' ? 'default' : submission.status === 'pending' ? 'secondary' : 'destructive'}
                    className={submission.status === 'accepted' ? 'bg-green-100 text-green-700 hover:bg-green-100' : submission.status === 'pending' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' : ''}
                  >
                    {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
