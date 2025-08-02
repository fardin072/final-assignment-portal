// app/api/auth/[...nextauth]/route.ts (if using App Router)
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import type { NextAuthOptions } from 'next-auth'

const users = [
  { id: '1', name: 'Dr. Smith', email: 'instructor@example.com', password: 'password', role: 'instructor' },
  { id: '2', name: 'John Student', email: 'student@example.com', password: 'password', role: 'student' },
]

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        role: { label: 'Role', type: 'text' }
      },
      async authorize(credentials) {
        const { email, password, role } = credentials ?? {}

        const user = users.find(
          u => u.email === email && u.password === password && u.role === role
        )

        if (user) {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          }
        }

        return null
      }
    })
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.sub = user.id // Make sure sub is assigned
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub
        session.user.role = token.role
      }
      return session
    },
  },
  pages: {
    signIn: '/login', // make sure this route exists
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
