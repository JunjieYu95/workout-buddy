'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, User } from '@/lib/supabase'
import type { User as SupabaseUser } from '@supabase/supabase-js'

type AuthContextType = {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  skipAuth: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signUp: async () => ({ error: null }),
  signIn: async () => ({ error: null }),
  signOut: async () => {},
  skipAuth: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user as User | null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user as User | null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password })
    return { error }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const skipAuth = () => {
    // Demo mode - bypass auth for testing
    const demoUser: User = {
      id: 'demo-user-123',
      email: 'demo@workoutbuddy.com',
      created_at: new Date().toISOString(),
    }
    setUser(demoUser)
    setLoading(false)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, skipAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
