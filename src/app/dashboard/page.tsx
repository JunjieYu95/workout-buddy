'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Calendar from '@/components/Calendar'
import type { Partnership, WorkoutRequest, StoneProgress } from '@/lib/db'

export default function Dashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [partnership, setPartnership] = useState<Partnership | null>(null)
  const [stoneProgress, setStoneProgress] = useState<StoneProgress | null>(null)
  const [requests, setRequests] = useState<WorkoutRequest[]>([])
  const [partnerEmail, setPartnerEmail] = useState('')
  const [workoutIntensity, setWorkoutIntensity] = useState(3)
  const [workoutNotes, setWorkoutNotes] = useState('')
  const [showPartnerForm, setShowPartnerForm] = useState(false)
  const [showWorkoutForm, setShowWorkoutForm] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      loadPartnership()
      loadStoneProgress()
      loadRequests()
    }
  }, [user])

  const loadPartnership = async () => {
    try {
      const response = await fetch('/api/partnerships')
      if (response.ok) {
        const data = await response.json()
        setPartnership(data.partnership)
      }
    } catch (error) {
      console.error('Error loading partnership:', error)
    }
  }

  const loadStoneProgress = async () => {
    try {
      const response = await fetch('/api/stone-progress')
      if (response.ok) {
        const data = await response.json()
        setStoneProgress(data.progress)
      }
    } catch (error) {
      console.error('Error loading stone progress:', error)
    }
  }

  const loadRequests = async () => {
    try {
      const response = await fetch('/api/workouts')
      if (response.ok) {
        const data = await response.json()
        setRequests(data.requests || [])
      }
    } catch (error) {
      console.error('Error loading requests:', error)
    }
  }

  const handleCreatePartnership = async () => {
    try {
      const response = await fetch('/api/partnerships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partnerEmail }),
      })
      
      if (response.ok) {
        await loadPartnership()
        setShowPartnerForm(false)
        setPartnerEmail('')
      }
    } catch (error) {
      console.error('Error creating partnership:', error)
    }
  }

  const handleLogWorkout = async () => {
    try {
      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intensity: workoutIntensity,
          notes: workoutNotes,
          partnershipId: partnership?.id,
        }),
      })
      
      if (response.ok) {
        await loadRequests()
        setShowWorkoutForm(false)
        setWorkoutIntensity(3)
        setWorkoutNotes('')
      }
    } catch (error) {
      console.error('Error logging workout:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <p className="text-white text-xl">Loading...</p>
      </div>
    )
  }

  if (!user) return null

  // Demo data for display
  const userProgress = stoneProgress ? (stoneProgress.current_position / stoneProgress.target_position) * 100 : 45
  const partnerProgress = 52
  const userStreak = 7
  const partnerStreak = 9

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">💪 Workout Buddy</h1>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Sign Out
          </button>
        </div>

        {/* Demo Mode Banner */}
        {user.id === 'demo-user-123' && (
          <div className="mb-6 p-4 bg-purple-700 text-white rounded-lg">
            <p className="font-semibold">Demo Mode Active</p>
            <p className="text-sm">You're viewing sample data. Set up Supabase to enable real functionality.</p>
          </div>
        )}

        {/* Stone Game Progress - Dual Progress Bars */}
        <div className="bg-slate-800 rounded-xl p-6 mb-6 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            🪨 Stone Game Progress - Partner Comparison
          </h2>
          
          {/* You Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white font-semibold">You</span>
              <span className="text-white font-bold">{Math.round(userProgress)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-8 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 flex items-center justify-end pr-2"
                style={{ width: `${userProgress}%` }}
              >
                <span className="text-white text-sm font-semibold">{Math.round(userProgress * 10)}/1000 units</span>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2 text-orange-400">
              <span>🔥 {userStreak} day streak!</span>
            </div>
          </div>

          {/* Partner Progress Bar */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-white font-semibold">Partner</span>
              <span className="text-white font-bold">{Math.round(partnerProgress)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-8 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500 flex items-center justify-end pr-2"
                style={{ width: `${partnerProgress}%` }}
              >
                <span className="text-white text-sm font-semibold">{Math.round(partnerProgress * 10)}/1000 units</span>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2 text-orange-400">
              <span>🔥 {partnerStreak} day streak!</span>
            </div>
          </div>

          <p className="text-slate-400 mt-4 text-center">
            Your partner is ahead! Time to catch up! 💪
          </p>
        </div>

        {/* Log Today's Workout */}
        <div className="bg-slate-800 rounded-xl p-6 mb-6 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            📝 Log Today's Workout
          </h2>
          
          {!showWorkoutForm ? (
            <button
              onClick={() => setShowWorkoutForm(true)}
              className="w-full py-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
            >
              Request Workout Approval
            </button>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-white mb-2">Intensity (1-5)</label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={workoutIntensity}
                  onChange={(e) => setWorkoutIntensity(Number(e.target.value))}
                  className="w-full"
                />
                <div className="text-center text-white mt-2 text-2xl">
                  {workoutIntensity === 1 && '😴 Light workout'}
                  {workoutIntensity === 2 && '🚶 Easy pace'}
                  {workoutIntensity === 3 && '💪 Moderate'}
                  {workoutIntensity === 4 && '🔥 Intense'}
                  {workoutIntensity === 5 && '⚡ Beast mode!'}
                </div>
              </div>
              
              <div>
                <label className="block text-white mb-2">Notes (optional)</label>
                <textarea
                  value={workoutNotes}
                  onChange={(e) => setWorkoutNotes(e.target.value)}
                  className="w-full p-3 rounded-lg bg-slate-700 text-white"
                  rows={3}
                  placeholder="What did you do today?"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleLogWorkout}
                  className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
                >
                  Submit for Approval
                </button>
                <button
                  onClick={() => setShowWorkoutForm(false)}
                  className="flex-1 py-3 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Calendar View */}
        <div className="bg-slate-800 rounded-xl p-6 mb-6 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            📅 Calendar View
          </h2>
          <p className="text-slate-400 mb-4">
            Visual progress tracking with dual-sided daily view. Color-coded intensity levels.
          </p>
          <Calendar userWorkouts={requests} partnerWorkouts={[]} />
        </div>

        {/* Your Recent Requests */}
        <div className="bg-slate-800 rounded-xl p-6 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            📋 Your Recent Requests
          </h2>
          {requests.length === 0 ? (
            <p className="text-slate-400">No workout requests yet. Log your first workout above!</p>
          ) : (
            <div className="space-y-3">
              {requests.slice(0, 5).map((req) => (
                <div key={req.id} className="bg-slate-700 p-4 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="text-white font-semibold">
                      {new Date(req.workout_date).toLocaleDateString()}
                    </p>
                    <p className="text-slate-400 text-sm">
                      Intensity: {req.intensity}/5 - {req.notes || 'No notes'}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    req.status === 'approved' ? 'bg-green-600 text-white' :
                    req.status === 'rejected' ? 'bg-red-600 text-white' :
                    'bg-yellow-600 text-white'
                  }`}>
                    {req.status === 'approved' ? '✓ Approved' :
                     req.status === 'rejected' ? '✗ Rejected' :
                     '⏳ Pending'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
