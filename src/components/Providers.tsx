'use client'

import { SessionProvider } from 'next-auth/react'
import { AuthProvider } from '@/contexts/AuthContext'
import React from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>{children}</AuthProvider>
    </SessionProvider>
  )
}
