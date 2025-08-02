'use client'

import { SessionProvider } from 'next-auth/react'
import { Toaster } from '@/components/ui/toaster'
import { DataProvider } from '@/contexts/DataContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <DataProvider>
        {children}
        <Toaster />
      </DataProvider>
    </SessionProvider>
  )
}