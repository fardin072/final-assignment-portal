'use client'

import React from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Clock, BookOpen, ExternalLink, Send } from 'lucide-react';
import { format, isAfter, differenceInDays, differenceInHours } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function Assignments() {
  const { data: session, status } = useSession();
  const { assignments, getSubmissionsByStudent } = useData();
  const router = useRouter()
  // Redirect if not student
  React.useEffect(() => {
    if (session?.user && session?.user.role !== 'student') {
      router.push('/dashboard');
    }
  }, [session?.user, router]);

  if (session?.user?.role !== 'student') {
    return null;
  }

  const studentSubmissions = getSubmissionsByStudent(session?.user.id);
  const submittedAssignmentIds = new Set(studentSubmissions.map(sub => sub.assignmentId));

  const getDeadlineStatus = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    
    if (isAfter(now, deadlineDate)) {
      return { status: 'overdue', text: 'Overdue', color: 'bg-red-100 text-red-700' };
    }
    
    const daysLeft = differenceInDays(deadlineDate, now);
    const hoursLeft = differenceInHours(deadlineDate, now);
    
    if (daysLeft < 1) {
      return { 
        status: 'urgent', 
        text: `${hoursLeft}h left`, 
        color: 'bg-orange-100 text-orange-700' 
      };
    } else if (daysLeft <= 3) {
      return { 
        status: 'soon', 
        text: `${daysLeft} days left`, 
        color: 'bg-yellow-100 text-yellow-700' 
      };
    } else {
      return { 
        status: 'plenty', 
        text: `${daysLeft} days left`, 
        color: 'bg-green-100 text-green-700' 
      };
    }
  };

  const sortedAssignments = [...assignments].sort((a, b) => {
    const aOverdue = isAfter(new Date(), new Date(a.deadline));
    const bOverdue = isAfter(new Date(), new Date(b.deadline));
    
    // Show non-overdue assignments first
    if (aOverdue !== bOverdue) {
      return aOverdue ? 1 : -1;
    }
    
    // Then sort by deadline
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-8">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Available Assignments</h1>
          <p className="text-gray-600 mt-2">Browse and complete your assignments before the deadline.</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assignments.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Submitted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{submittedAssignmentIds.size}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {assignments.length - submittedAssignmentIds.size}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assignments List */}
        <div className="space-y-6">
          {sortedAssignments.map((assignment) => {
            const deadlineStatus = getDeadlineStatus(assignment.deadline);
            const isSubmitted = submittedAssignmentIds.has(assignment.id);
            const submission = studentSubmissions.find(sub => sub.assignmentId === assignment.id);
            
            return (
              <Card key={assignment.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <BookOpen className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{assignment.title}</CardTitle>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                            <span className="flex items-center space-x-1">
                              <CalendarIcon className="h-4 w-4" />
                              <span>Due {format(new Date(assignment.deadline), 'MMM d, yyyy')}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{format(new Date(assignment.deadline), 'h:mm a')}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={deadlineStatus.color}>
                        {deadlineStatus.text}
                      </Badge>
                      {isSubmitted && (
                        <Badge className={
                          submission?.status === 'accepted' ? 'bg-green-100 text-green-700' :
                          submission?.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }>
                          {submission?.status === 'accepted' ? 'Accepted' :
                           submission?.status === 'rejected' ? 'Rejected' :
                           'Submitted'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed mb-4">
                    {assignment.description}
                  </CardDescription>
                  
                  {submission?.feedback && (
                    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Instructor Feedback:</h4>
                      <p className="text-blue-800">{submission.feedback}</p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {isSubmitted ? (
                        <span>Submitted on {format(new Date(submission!.submittedAt), 'MMM d, yyyy')}</span>
                      ) : (
                        <span>Not submitted yet</span>
                      )}
                    </div>
                    <div className="flex space-x-3">
                      {submission?.submissionUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={submission.submissionUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Submission
                          </a>
                        </Button>
                      )}
                      {!isSubmitted && deadlineStatus.status !== 'overdue' && (
                        <Button size="sm" asChild className="bg-blue-600 hover:bg-blue-700">
                          <Link href={`/submit?assignmentId=${assignment.id}`}>
                            <Send className="h-4 w-4 mr-2" />
                            Submit
                          </Link>
                        </Button>
                      )}
                      {isSubmitted && submission?.status === 'rejected' && deadlineStatus.status !== 'overdue' && (
                        <Button size="sm" asChild className="bg-orange-600 hover:bg-orange-700">
                          <Link href={`/submit?assignmentId=${assignment.id}&isResubmission=true`}>
                            <Send className="h-4 w-4 mr-2" />
                            Resubmit
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {assignments.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Assignments Yet</h3>
              <p className="text-gray-600">Your instructor hasn't created any assignments yet. Check back later!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
