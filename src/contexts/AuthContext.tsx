'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'

type User = {
  id: string
  username: string
  email?: string
  name?: string
}

type AuthContextType = {
  user: User | null
  loading: boolean
  signUp: (username: string, password: string, name?: string, email?: string) => Promise<{ error: any }>
  signIn: (username: string, password: string) => Promise<{ error: any }>
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
  const [demoMode, setDemoMode] = useState(false)
  const [demoUser, setDemoUser] = useState<User | null>(null)

  const loading = status === 'loading'

  useEffect(() => {
    // Demo mode is only enabled when explicitly requested via skipAuth()
    // No automatic demo mode activation
  }, [])

  const signUp = async (username: string, password: string, name?: string, email?: string) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, name, email }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { error: { message: data.error } }
      }

      // Automatically sign in after successful registration
      const result = await signIn('credentials', {
        username,
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

  const signInWithCredentials = async (username: string, password: string) => {
    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      })

      if (result?.error) {
        return { error: { message: 'Invalid username or password' } }
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
    
    await signOut({ callbackUrl: '/' })
  }

  const skipAuth = () => {
    // Demo mode - bypass auth for testing
    const user: User = {
      id: 'demo-user-123',
      username: 'demo',
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
