'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function Home() {
  const router = useRouter()
  const { user, loading, signUp, signIn, skipAuth } = useAuth()
  const [showAuth, setShowAuth] = useState(false)
  const [isSignUp, setIsSignUp] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [showLearnMore, setShowLearnMore] = useState(false)

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (isSignUp) {
      const { error } = await signUp(username, password, name, email)
      if (error) {
        setError(error.message || 'Failed to sign up')
      } else {
        router.push('/dashboard')
      }
    } else {
      const { error } = await signIn(username, password)
      if (error) {
        setError(error.message || 'Failed to sign in')
      } else {
        router.push('/dashboard')
      }
    }
  }

  const handleDemoMode = () => {
    skipAuth()
    router.push('/dashboard')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <p className="text-white text-xl">Loading...</p>
      </div>
    )
  }

  if (showAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-slate-300 mb-2 text-sm">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>
            )}
            
            <div>
              <label className="block text-slate-300 mb-2 text-sm">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-purple-500 focus:outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-slate-300 mb-2 text-sm">Email (Optional)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-purple-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-slate-300 mb-2 text-sm">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-purple-500 focus:outline-none"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition"
            >
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-purple-400 hover:text-purple-300 text-sm"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-700">
            <button
              onClick={handleDemoMode}
              className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
            >
              🎮 Try Demo Mode
            </button>
            <p className="text-slate-400 text-xs text-center mt-2">
              No sign-up required • Explore with sample data
            </p>
          </div>

          <button
            onClick={() => setShowAuth(false)}
            className="mt-4 w-full text-slate-400 hover:text-white text-sm"
          >
            ← Back to home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-6">
            💪 Workout Buddy
          </h1>
          <p className="text-2xl text-slate-300 mb-8">
            Partner accountability for fitness consistency
          </p>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-12">
            A partner accountability app that gamifies fitness through mutual verification and visual progress tracking.
          </p>
          
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setShowAuth(true)}
              className="px-8 py-4 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition text-lg"
            >
              Get Started
            </button>
            <button
              onClick={() => setShowLearnMore(!showLearnMore)}
              className="px-8 py-4 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-600 transition text-lg"
            >
              Learn More
            </button>
          </div>
        </div>

        {/* Features Grid */}
        {showLearnMore && (
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-16">
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="text-2xl font-bold text-white mb-3">🤝 Demo Model</h3>
              <p className="text-slate-300 mb-2">
                Learn more... coming soon
              </p>
              <p className="text-slate-400 text-sm">
                A demo model is available to explore the app without signing up.
              </p>
            </div>

            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="text-2xl font-bold text-white mb-3">📅 Calendar View</h3>
              <p className="text-slate-300 mb-2">
                Visual progress tracking with dual-sided daily view. Color-coded intensity levels.
              </p>
              <ul className="text-slate-400 space-y-1 text-sm">
                <li>• No workout</li>
                <li>• Light workout</li>
                <li>• Full workout</li>
                <li>• Intense workout</li>
              </ul>
            </div>

            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="text-2xl font-bold text-white mb-3">🪨 Stone Game</h3>
              <p className="text-slate-300 mb-2">
                Gamified progress with stochastic rewards and escalating penalties.
              </p>
              <p className="text-slate-400 text-sm">
                <strong>Progress:</strong> 0%<br />
                Each approved workout pushes the stone forward randomly!
              </p>
            </div>

            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="text-2xl font-bold text-white mb-3">🤝 Request-Approval System</h3>
              <p className="text-slate-300 mb-2">
                Partners verify each other's workouts - no self-reporting possible!
              </p>
              <div className="space-y-1 text-sm text-slate-400">
                <p>📝 <strong>1.</strong> Complete workout</p>
                <p>📤 <strong>2.</strong> Send request to partner</p>
                <p>✓ <strong>3.</strong> Partner approves & updates progress</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

