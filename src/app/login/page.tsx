'use client'

import { useState, useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GraduationCap, UserCheck, Mail, Lock, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserRole } from '@/types'

export default function AuthPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (session) {
      router.push('/dashboard')
    }
  }, [session, router])

  const handlesignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const role = formData.get('role') as UserRole

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
      role,
    })

    if (res?.ok) {
      router.push('/dashboard')
    } else {
      setError('Invalid credentials. Try instructor@example.com or student@example.com with password: password')
    }

    setIsLoading(false)
  }

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const role = formData.get('role') as UserRole

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      })

      const data = await res.json()
      if (res.ok) {
        await signIn('credentials', {
          redirect: false,
          email,
          password,
        })
        router.push('/dashboard')
      } else {
        setError(data.message || 'Registration failed. Please try again.')
      }
    } catch (err) {
      setError('Something went wrong.')
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Assignment Portal</h1>
          <p className="text-gray-600 mt-2">Streamlined submission management for educators and students</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl text-center">Welcome</CardTitle>
            <CardDescription className="text-center">
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signIn" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="signIn">signIn</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signIn">
                <form onSubmit={handlesignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signIn-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signIn-email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        required
                        className="pl-10"
                        defaultValue="instructor@example.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signIn-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signIn-password"
                        name="password"
                        type="password"
                        placeholder="Enter your password"
                        required
                        className="pl-10"
                        defaultValue="password"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          name="role"
                          value="instructor"
                          defaultChecked
                          className="text-blue-600"
                        />
                        <UserCheck className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">Instructor</span>
                      </label>
                      <label className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          name="role"
                          value="student"
                          className="text-green-600"
                        />
                        <GraduationCap className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">Student</span>
                      </label>
                    </div>
                  </div>
                  {error && (
                    <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                      {error}
                    </div>
                  )}
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-name"
                        name="name"
                        type="text"
                        placeholder="Enter your full name"
                        required
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        required
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-password"
                        name="password"
                        type="password"
                        placeholder="Create a password"
                        required
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          name="role"
                          value="instructor"
                          defaultChecked
                          className="text-blue-600"
                        />
                        <UserCheck className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">Instructor</span>
                      </label>
                      <label className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          name="role"
                          value="student"
                          className="text-green-600"
                        />
                        <GraduationCap className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">Student</span>
                      </label>
                    </div>
                  </div>
                  {error && (
                    <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                      {error}
                    </div>
                  )}
                  <Button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-gray-600">
          Demo credentials: instructor@example.com / student@example.com (password: password)
        </div>
      </div>
    </div>
  );
}
