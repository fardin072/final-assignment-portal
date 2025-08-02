'use client'
import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Send, CheckCircle, CalendarIcon, Clock, BookOpen, AlertCircle } from 'lucide-react';
import { format, isAfter } from 'date-fns';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SubmitAssignment() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { assignments, addSubmission, getSubmissionsByStudent } = useData();

    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>('');
    const [formData, setFormData] = useState({
        submissionUrl: '',
        note: ''
    });

    // Redirect if not student
    React.useEffect(() => {
        if (session?.user && session?.user.role !== 'student') {
            router.push('/dashboard');
        }
    }, [session?.user, router]);

    // Pre-select assignment if passed from assignments page
    const searchParams = useSearchParams()
    useEffect(() => {
        const assignmentId = searchParams.get('assignmentId')
        if (assignmentId) {
            setSelectedAssignmentId(assignmentId)
        }
    }, [searchParams])

    if (session?.user?.role !== 'student') {
        return null;
    }

    const studentSubmissions = getSubmissionsByStudent(session?.user.id);
    const submittedAssignmentIds = new Set(studentSubmissions.map(sub => sub.assignmentId));

    // Filter assignments that can be submitted
    const availableAssignments = assignments.filter(assignment => {
        const isOverdue = isAfter(new Date(), new Date(assignment.deadline));
        const submission = studentSubmissions.find(sub => sub.assignmentId === assignment.id);

        // Can submit if not overdue and (not submitted or rejected)
        return !isOverdue && (!submission || submission.status === 'rejected');
    });

    const selectedAssignment = assignments.find(a => a.id === selectedAssignmentId);
    const existingSubmission = studentSubmissions.find(sub => sub.assignmentId === selectedAssignmentId);
    const isResubmission = existingSubmission?.status === 'rejected';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAssignmentId || !formData.submissionUrl || !session?.user) {
            return;
        }

        setIsLoading(true);

        try {
            addSubmission({
                assignmentId: selectedAssignmentId,
                studentId: session?.user.id,
                submissionUrl: formData.submissionUrl,
                note: formData.note || undefined,
                student: { name: session?.user.name, email: session?.user.email },
                assignment: { title: selectedAssignment?.title || '' }
            });

            setShowSuccess(true);
            setFormData({ submissionUrl: '', note: '' });
            setSelectedAssignmentId('');

            // Redirect to assignments page after 3 seconds
            setTimeout(() => {
                router.push('/assignments');
            }, 3000);
        } catch (error) {
            console.error('Error submitting assignment:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (showSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Card className="max-w-md mx-auto text-center">
                    <CardContent className="pt-6">
                        <div className="flex justify-center mb-4">
                            <div className="bg-green-100 p-4 rounded-full">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            {isResubmission ? 'Resubmitted Successfully!' : 'Submitted Successfully!'}
                        </h2>
                        <p className="text-gray-600 mb-4">
                            Your assignment has been submitted and is now under review by your instructor.
                        </p>
                        <Button onClick={() => router.push('/assignments')} className="w-full">
                            Back to Assignments
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20 lg:pb-8">
            <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
                <div className="max-w-3xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Submit Assignment</h1>
                        <p className="text-gray-600 mt-2">Submit your completed work for instructor review.</p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Send className="h-5 w-5" />
                                <span>Submission Details</span>
                            </CardTitle>
                            <CardDescription>
                                Choose an assignment and provide your submission URL along with any additional notes.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="assignment">Select Assignment *</Label>
                                    <Select
                                        value={selectedAssignmentId}
                                        onValueChange={setSelectedAssignmentId}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose an assignment to submit" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableAssignments.map((assignment) => {
                                                const submission = studentSubmissions.find(sub => sub.assignmentId === assignment.id);
                                                const isRejected = submission?.status === 'rejected';

                                                return (
                                                    <SelectItem key={assignment.id} value={assignment.id}>
                                                        <div className="flex items-center justify-between w-full">
                                                            <span>{assignment.title}</span>
                                                            {isRejected && (
                                                                <Badge className="ml-2 bg-orange-100 text-orange-700">Resubmission</Badge>
                                                            )}
                                                        </div>
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                    {availableAssignments.length === 0 && (
                                        <p className="text-sm text-gray-500">No assignments available for submission.</p>
                                    )}
                                </div>

                                {selectedAssignment && (
                                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                        <div className="flex items-start space-x-3">
                                            <div className="bg-blue-100 p-2 rounded-lg">
                                                <BookOpen className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-medium text-blue-900 mb-1">{selectedAssignment.title}</h3>
                                                <div className="flex items-center space-x-4 text-sm text-blue-700 mb-2">
                                                    <span className="flex items-center space-x-1">
                                                        <CalendarIcon className="h-4 w-4" />
                                                        <span>Due {format(new Date(selectedAssignment.deadline), 'MMM d, yyyy')}</span>
                                                    </span>
                                                    <span className="flex items-center space-x-1">
                                                        <Clock className="h-4 w-4" />
                                                        <span>{format(new Date(selectedAssignment.deadline), 'h:mm a')}</span>
                                                    </span>
                                                </div>
                                                <p className="text-blue-800 text-sm">{selectedAssignment.description}</p>

                                                {isResubmission && existingSubmission?.feedback && (
                                                    <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded">
                                                        <div className="flex items-start space-x-2">
                                                            <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
                                                            <div>
                                                                <h4 className="font-medium text-orange-900 text-sm">Previous Feedback:</h4>
                                                                <p className="text-orange-800 text-sm">{existingSubmission.feedback}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="submissionUrl">Submission URL *</Label>
                                    <Input
                                        id="submissionUrl"
                                        type="url"
                                        value={formData.submissionUrl}
                                        onChange={(e) => setFormData(prev => ({ ...prev, submissionUrl: e.target.value }))}
                                        placeholder="https://github.com/yourusername/project or https://your-demo.netlify.app"
                                        required
                                        className="text-base"
                                    />
                                    <p className="text-sm text-gray-500">
                                        Provide a link to your GitHub repository, live demo, or hosted project.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="note">Additional Notes (Optional)</Label>
                                    <Textarea
                                        id="note"
                                        value={formData.note}
                                        onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                                        placeholder="Add any additional information, challenges faced, extra features implemented, or specific areas you'd like feedback on..."
                                        rows={4}
                                        className="text-base resize-none"
                                    />
                                    <p className="text-sm text-gray-500">
                                        Share any context that might help your instructor understand your submission.
                                    </p>
                                </div>

                                <div className="pt-4 border-t">
                                    <div className="flex justify-end space-x-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => router.push('/assignments')}
                                            disabled={isLoading}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={isLoading || !selectedAssignmentId || !formData.submissionUrl}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                    Submitting...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="h-4 w-4 mr-2" />
                                                    {isResubmission ? 'Resubmit Assignment' : 'Submit Assignment'}
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Submission Guidelines */}
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle className="text-lg">Submission Guidelines</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-start space-x-2">
                                    <span className="font-medium text-blue-600">•</span>
                                    <span>Ensure your submission URL is publicly accessible</span>
                                </li>
                                <li className="flex items-start space-x-2">
                                    <span className="font-medium text-blue-600">•</span>
                                    <span>For GitHub repos, include a clear README with setup instructions</span>
                                </li>
                                <li className="flex items-start space-x-2">
                                    <span className="font-medium text-blue-600">•</span>
                                    <span>Test your live demo links before submitting</span>
                                </li>
                                <li className="flex items-start space-x-2">
                                    <span className="font-medium text-blue-600">•</span>
                                    <span>Submit before the deadline to avoid late penalties</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
