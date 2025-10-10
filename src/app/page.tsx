'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function Home() {
  const { user, loading, signUp, signIn, skipAuth } = useAuth()
  const router = useRouter()
  const [showAuth, setShowAuth] = useState(false)
  const [showLearnMore, setShowLearnMore] = useState(false)
  const [isLogin, setIsLogin] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    const { error } = isLogin 
      ? await signIn(email, password)
      : await signUp(email, password)

    if (error) {
      setError(error.message)
    } else {
      if (!isLogin) {
        alert('Check your email to verify your account!')
      }
      router.push('/dashboard')
    }
  }

  if (showAuth) {
    return (
      <main className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-gray-800 rounded-lg p-8">
            <button 
              onClick={() => setShowAuth(false)}
              className="text-gray-400 hover:text-white mb-4"
            >
              ← Back
            </button>
            <h2 className="text-3xl font-bold text-white mb-6">
              {isLogin ? 'Welcome Back' : 'Get Started'}
            </h2>
            <form onSubmit={handleAuth} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded-lg">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-gray-300 mb-2">Email</label>
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="your@email.com"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Password</label>
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
              >
                {isLogin ? 'Log In' : 'Sign Up'}
              </button>
              <div className="text-center text-gray-400">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button 
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-blue-500 hover:text-blue-400 ml-1"
                >
                  {isLogin ? 'Sign Up' : 'Log In'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            🏋️‍♂️ Workout Buddy
          </h1>
          <p className="text-gray-300 text-lg">
            Partner accountability for fitness consistency
          </p>
        </header>

        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Welcome to Workout Buddy!
            </h2>
            <p className="text-gray-300 mb-4">
              A partner accountability app that gamifies fitness through mutual verification and visual progress tracking.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowAuth(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Get Started
              </button>
              <button 
                onClick={() => {
                  skipAuth()
                  router.push('/dashboard')
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                🎮 Demo Mode
              </button>
              <button 
                onClick={() => setShowLearnMore(!showLearnMore)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {showLearnMore ? 'Show Less' : 'Learn More'}
              </button>
            </div>
            
            {showLearnMore && (
              <div className="mt-6 pt-6 border-t border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-3">How It Works</h3>
                <div className="space-y-3 text-gray-300">
                  <p>
                    <strong className="text-white">1. Partner Up:</strong> Connect with a workout buddy who will hold you accountable.
                  </p>
                  <p>
                    <strong className="text-white">2. Log Workouts:</strong> After completing a workout, send a request to your partner for verification.
                  </p>
                  <p>
                    <strong className="text-white">3. Verify & Earn:</strong> Your partner approves your workout, and you both earn progress in the Stone Game!
                  </p>
                  <p>
                    <strong className="text-white">4. Track Progress:</strong> Visual calendar shows both partners' consistency with color-coded intensity levels.
                  </p>
                  <p>
                    <strong className="text-white">5. Stay Motivated:</strong> Stochastic rewards and escalating penalties for missed days keep you engaged!
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                📅 Calendar View
              </h3>
              <p className="text-gray-300 mb-4">
                Visual progress tracking with dual-sided daily view. Color-coded intensity levels.
              </p>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-gray-300 text-sm">No workout</span>
                </div>
                <div className="flex gap-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span className="text-gray-300 text-sm">Light workout</span>
                </div>
                <div className="flex gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-gray-300 text-sm">Full workout</span>
                </div>
                <div className="flex gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="text-gray-300 text-sm">Intense workout</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                🪨 Stone Game
              </h3>
              <p className="text-gray-300 mb-4">
                Gamified progress with stochastic rewards and escalating penalties.
              </p>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex justify-between text-sm text-gray-300 mb-2">
                  <span>Progress</span>
                  <span>0%</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full w-0"></div>
                </div>
              </div>
              <p className="text-gray-400 text-sm mt-2">
                Each approved workout pushes the stone forward randomly!
              </p>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 mt-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              🤝 Request-Approval System
            </h3>
            <p className="text-gray-300 mb-4">
              Partners verify each other's workouts - no self-reporting possible!
            </p>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl mb-2">1️⃣</div>
                <div className="text-gray-300">Complete workout</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">2️⃣</div>
                <div className="text-gray-300">Send request to partner</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">3️⃣</div>
                <div className="text-gray-300">Partner approves & updates progress</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}