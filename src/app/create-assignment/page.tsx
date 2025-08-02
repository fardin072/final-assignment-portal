'use client'

import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, PlusCircle, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function CreateAssignment() {
  const { data: session, status } = useSession();
  const { addAssignment } = useData();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: undefined as Date | undefined
  });

  // Redirect if not instructor
  React.useEffect(() => {
    if (session?.user && session?.user.role !== 'instructor') {
      router.push('/dashboard');
    }
  }, [session?.user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.deadline || !session?.user) {
      return;
    }

    setIsLoading(true);

    try {
      addAssignment({
        title: formData.title,
        description: formData.description,
        deadline: formData.deadline.toISOString(),
        instructorId: session?.user.id
      });

      setShowSuccess(true);
      setFormData({ title: '', description: '', deadline: undefined });
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error creating assignment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (session?.user?.role !== 'instructor') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-8">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Create New Assignment</h1>
            <p className="text-gray-600 mt-2">Set up a new assignment for your students to complete.</p>
          </div>

          {showSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <h3 className="font-medium text-green-800">Assignment Created Successfully!</h3>
                <p className="text-green-700">Your new assignment has been added and is now available to students.</p>
              </div>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PlusCircle className="h-5 w-5" />
                <span>Assignment Details</span>
              </CardTitle>
              <CardDescription>
                Provide clear instructions and set an appropriate deadline for your assignment.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Assignment Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., React Components Project"
                    required
                    className="text-base"
                  />
                  <p className="text-sm text-gray-500">Choose a clear, descriptive title for your assignment.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Provide detailed instructions for the assignment, including requirements, expectations, and any resources students might need..."
                    required
                    rows={8}
                    className="text-base resize-none"
                  />
                  <p className="text-sm text-gray-500">Include all necessary details, requirements, and expectations.</p>
                </div>

                <div className="space-y-2">
                  <Label>Deadline *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.deadline && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.deadline ? format(formData.deadline, "PPP 'at' p") : "Select deadline date and time"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.deadline}
                        onSelect={(date) => {
                          if (date) {
                            // Set time to 11:59 PM on selected date
                            const deadline = new Date(date);
                            deadline.setHours(23, 59, 59, 999);
                            setFormData(prev => ({ ...prev, deadline }));
                          }
                        }}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <p className="text-sm text-gray-500">Students will be able to submit until 11:59 PM on the selected date.</p>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push('/dashboard')}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading || !formData.title || !formData.description || !formData.deadline}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creating...
                        </>
                      ) : (
                        <>
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Create Assignment
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Tips Card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Tips for Creating Effective Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start space-x-2">
                  <span className="font-medium text-blue-600">•</span>
                  <span>Be specific about deliverables and submission format (GitHub repo, live demo, etc.)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="font-medium text-blue-600">•</span>
                  <span>Include evaluation criteria and grading rubric</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="font-medium text-blue-600">•</span>
                  <span>Provide relevant resources and reference materials</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="font-medium text-blue-600">•</span>
                  <span>Set realistic deadlines considering assignment complexity</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
