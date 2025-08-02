'use client'

import { SessionProvider } from 'next-auth/react'
import { Toaster } from '@/components/ui/toaster'
import { DataProvider } from '@/contexts/DataContext'
import Navigation from './Navigation'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <DataProvider>
        <Navigation/>
        {children}
        <Toaster />
      </DataProvider>
    </SessionProvider>
  )
}