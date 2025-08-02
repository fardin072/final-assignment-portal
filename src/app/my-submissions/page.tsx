'use client'
import React from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, ExternalLink, Calendar, Clock, MessageSquare, CheckCircle, XCircle, AlertCircle, Send } from 'lucide-react';
import { format } from 'date-fns';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function MySubmissions() {
  const { data: session } = useSession();
  const { getSubmissionsByStudent, assignments } = useData();
  const router = useRouter();

  // Redirect if not student
  React.useEffect(() => {
    if (session?.user && session?.user.role !== 'student') {
      router.push('/dashboard');
    }
  }, [session?.user, router]);

  if (session?.user?.role !== 'student') {
    return null;
  }

  const submissions = getSubmissionsByStudent(session?.user.id);

  // Sort submissions by submission date (newest first)
  const sortedSubmissions = [...submissions].sort((a, b) =>
    new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-700 hover:bg-green-100';
      case 'rejected':
        return 'bg-red-100 text-red-700 hover:bg-red-100';
      default:
        return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100';
    }
  };

  const getAssignmentById = (id: string) => {
    return assignments.find(a => a.id === id);
  };

  // Stats
  const stats = {
    total: submissions.length,
    accepted: submissions.filter(s => s.status === 'accepted').length,
    rejected: submissions.filter(s => s.status === 'rejected').length,
    pending: submissions.filter(s => s.status === 'pending').length
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-8">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Submissions</h1>
          <p className="text-gray-600 mt-2">Track the status and feedback of all your assignment submissions.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Submitted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Accepted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            </CardContent>
          </Card>
        </div>

        {/* Submissions List */}
        <div className="space-y-6">
          {sortedSubmissions.map((submission) => {
            const assignment = getAssignmentById(submission.assignmentId);
            if (!assignment) return null;

            return (
              <Card key={submission.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-xl mb-2">{assignment.title}</CardTitle>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>Submitted {format(new Date(submission.submittedAt), 'MMM d, yyyy')}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{format(new Date(submission.submittedAt), 'h:mm a')}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(submission.status)}
                      <Badge className={getStatusColor(submission.status)}>
                        {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Submission URL */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Submission Link:</h4>
                    <div className="flex items-center space-x-2">
                      <a
                        href={submission.submissionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline flex items-center space-x-1"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span className="truncate">{submission.submissionUrl}</span>
                      </a>
                    </div>
                  </div>

                  {/* Student Note */}
                  {submission.note && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">My Notes:</h4>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{submission.note}</p>
                    </div>
                  )}

                  {/* Instructor Feedback */}
                  {submission.feedback ? (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                        <MessageSquare className="h-4 w-4" />
                        <span>Instructor Feedback:</span>
                      </h4>
                      <div className={`p-4 rounded-lg border-l-4 ${submission.status === 'accepted' ? 'bg-green-50 border-green-400' :
                          submission.status === 'rejected' ? 'bg-red-50 border-red-400' :
                            'bg-blue-50 border-blue-400'
                        }`}>
                        <p className={`${submission.status === 'accepted' ? 'text-green-800' :
                            submission.status === 'rejected' ? 'text-red-800' :
                              'text-blue-800'
                          }`}>{submission.feedback}</p>
                      </div>
                    </div>
                  ) : submission.status === 'pending' && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                        <MessageSquare className="h-4 w-4" />
                        <span>Instructor Feedback:</span>
                      </h4>
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-yellow-800">Your submission is currently under review. Feedback will appear here once available.</p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end space-x-3 pt-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href={submission.submissionUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Submission
                      </a>
                    </Button>

                    {submission.status === 'rejected' && (
                      <Button size="sm" asChild className="bg-orange-600 hover:bg-orange-700">
                        <Link
                          href={{
                            pathname: '/submit',
                            query: {
                              assignmentId: assignment.id,
                              isResubmission: 'true',
                            },
                          }}
                          className="flex items-center"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Resubmit
                        </Link>

                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {submissions.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Submissions Yet</h3>
              <p className="text-gray-600 mb-4">You haven't submitted any assignments yet.</p>
              <Button asChild>
                <Link href="/assignments">
                  Browse Assignments
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
