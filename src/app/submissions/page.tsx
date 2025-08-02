'use client'
import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  FileText, 
  ExternalLink, 
  Calendar, 
  Clock, 
  User, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Search
} from 'lucide-react';
import { format } from 'date-fns';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function ReviewSubmissions() {
  const { data: session } = useSession();
  const { submissions, updateSubmission, getAssignmentsByInstructor } = useData();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [assignmentFilter, setAssignmentFilter] = useState<string>('all');
  const [reviewingSubmission, setReviewingSubmission] = useState<any>(null);
  const [feedback, setFeedback] = useState('');
  const [newStatus, setNewStatus] = useState<'pending' | 'accepted' | 'rejected'>('pending');

  // Redirect if not instructor
  React.useEffect(() => {
    if (session?.user && session?.user.role !== 'instructor') {
      router.push('/dashboard');
    }
  }, [session?.user, router]);

  if (session?.user?.role !== 'instructor') {
    return null;
  }

  const instructorAssignments = getAssignmentsByInstructor(session?.user.id);
  const instructorAssignmentIds = new Set(instructorAssignments.map(a => a.id));
  
  // Filter submissions for this instructor's assignments
  const instructorSubmissions = submissions.filter(sub => 
    instructorAssignmentIds.has(sub.assignmentId)
  );

  // Apply filters
  const filteredSubmissions = instructorSubmissions.filter(submission => {
    const matchesSearch = !searchQuery || 
      submission.student?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.assignment?.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
    const matchesAssignment = assignmentFilter === 'all' || submission.assignmentId === assignmentFilter;
    
    return matchesSearch && matchesStatus && matchesAssignment;
  });

  // Sort by submission date (newest first)
  const sortedSubmissions = [...filteredSubmissions].sort((a, b) => 
    new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
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

  const handleReview = (submission: any) => {
    setReviewingSubmission(submission);
    setFeedback(submission.feedback || '');
    setNewStatus(submission.status);
  };

  const handleSubmitReview = () => {
    if (!reviewingSubmission) return;

    updateSubmission(reviewingSubmission.id, {
      status: newStatus,
      feedback: feedback.trim() || undefined
    });

    setReviewingSubmission(null);
    setFeedback('');
    setNewStatus('pending');
  };

  // Stats
  const stats = {
    total: instructorSubmissions.length,
    pending: instructorSubmissions.filter(s => s.status === 'pending').length,
    accepted: instructorSubmissions.filter(s => s.status === 'accepted').length,
    rejected: instructorSubmissions.filter(s => s.status === 'rejected').length
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-8">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Review Submissions</h1>
          <p className="text-gray-600 mt-2">Review student submissions and provide feedback.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
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
              <CardTitle className="text-sm font-medium text-gray-600">Accepted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
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

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filter Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by student name or assignment..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Assignment</Label>
                <Select value={assignmentFilter} onValueChange={setAssignmentFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Assignments</SelectItem>
                    {instructorAssignments.map(assignment => (
                      <SelectItem key={assignment.id} value={assignment.id}>
                        {assignment.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submissions List */}
        <div className="space-y-6">
          {sortedSubmissions.map((submission) => (
            <Card key={submission.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl mb-2">{submission.assignment?.title}</CardTitle>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{submission.student?.name}</span>
                        </span>
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

                {/* Student Note */}
                {submission.note && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Student's Note:</h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{submission.note}</p>
                  </div>
                )}

                {/* Current Feedback */}
                {submission.feedback && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                      <MessageSquare className="h-4 w-4" />
                      <span>Your Feedback:</span>
                    </h4>
                    <p className="text-gray-700 bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                      {submission.feedback}
                    </p>
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
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" onClick={() => handleReview(submission)}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Review
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Review Submission</DialogTitle>
                        <DialogDescription>
                          Provide feedback and update the status for {submission.student?.name}'s submission.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="status">Status</Label>
                          <Select value={newStatus} onValueChange={(value: any) => setNewStatus(value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="accepted">Accepted</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="feedback">Feedback</Label>
                          <Textarea
                            id="feedback"
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Provide constructive feedback for the student..."
                            rows={4}
                          />
                        </div>
                        <div className="flex justify-end space-x-3">
                          <DialogTrigger asChild>
                            <Button variant="outline">Cancel</Button>
                          </DialogTrigger>
                          <DialogTrigger asChild>
                            <Button onClick={handleSubmitReview}>Save Review</Button>
                          </DialogTrigger>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {sortedSubmissions.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Submissions Found</h3>
              <p className="text-gray-600">
                {instructorSubmissions.length === 0 
                  ? "No submissions have been made to your assignments yet."
                  : "No submissions match your current filters."
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
