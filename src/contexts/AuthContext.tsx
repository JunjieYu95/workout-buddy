'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

type User = {
  id: string
  email: string
  name?: string
}

type AuthContextType = {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string, name?: string) => Promise<{ error: any }>
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
  const { data: session, status } = useSession()
  const router = useRouter()
  const [demoMode, setDemoMode] = useState(false)
  const [demoUser, setDemoUser] = useState<User | null>(null)

  const loading = status === 'loading'

  useEffect(() => {
    // Check if we're in demo mode
    const isDemoMode = localStorage.getItem('demoMode') === 'true'
    if (isDemoMode) {
      setDemoMode(true)
      setDemoUser({
        id: 'demo-user-123',
        email: 'demo@workoutbuddy.com',
        name: 'Demo User'
      })
    }
  }, [])

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { error: { message: data.error } }
      }

      // Automatically sign in after successful registration
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        return { error: { message: 'Registration successful, but login failed' } }
      }

      return { error: null }
    } catch (error) {
      return { error: { message: 'Registration failed' } }
    }
  }

  const signInWithCredentials = async (email: string, password: string) => {
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        return { error: { message: 'Invalid email or password' } }
      }

      return { error: null }
    } catch (error) {
      return { error: { message: 'Login failed' } }
    }
  }

  const signOutUser = async () => {
    // Clear demo mode if active
    if (demoMode) {
      localStorage.removeItem('demoMode')
      setDemoMode(false)
      setDemoUser(null)
    }
    
    await signOut({ redirect: false })
    router.push('/')
  }

  const skipAuth = () => {
    // Demo mode - bypass auth for testing
    const user: User = {
      id: 'demo-user-123',
      email: 'demo@workoutbuddy.com',
      name: 'Demo User'
    }
    setDemoUser(user)
    setDemoMode(true)
    localStorage.setItem('demoMode', 'true')
  }

  // Determine the current user
  const currentUser = demoMode ? demoUser : (session?.user as User) || null

  return (
    <AuthContext.Provider value={{ 
      user: currentUser, 
      loading: loading && !demoMode, 
      signUp, 
      signIn: signInWithCredentials, 
      signOut: signOutUser, 
      skipAuth 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
