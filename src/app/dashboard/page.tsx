'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { supabase, Partnership, WorkoutRequest, StoneProgress } from '@/lib/supabase'
import { format } from 'date-fns'
import Calendar from '@/components/Calendar'

export default function Dashboard() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [partnership, setPartnership] = useState<Partnership | null>(null)
  const [requests, setRequests] = useState<WorkoutRequest[]>([])
  const [stoneProgress, setStoneProgress] = useState<StoneProgress | null>(null)
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [partnerEmail, setPartnerEmail] = useState('')
  const [workoutIntensity, setWorkoutIntensity] = useState(3)
  const [workoutNotes, setWorkoutNotes] = useState('')
  const [demoMode, setDemoMode] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    } else if (user?.id === 'demo-user-123') {
      setDemoMode(true)
      // Set up demo data
      setPartnership({
        id: 'demo-partnership',
        user1_id: 'demo-user-123',
        user2_id: 'demo-partner-456',
        status: 'active',
        created_at: new Date().toISOString(),
      })
      setStoneProgress({
        id: 'demo-stone',
        partnership_id: 'demo-partnership',
        current_position: 45,
        target_position: 100,
        last_push_date: new Date().toISOString().split('T')[0],
        consecutive_days: 7,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      setRequests([
        {
          id: 'demo-req-1',
          user_id: 'demo-user-123',
          partnership_id: 'demo-partnership',
          workout_date: new Date().toISOString().split('T')[0],
          intensity: 4,
          notes: 'Great leg day! 💪',
          status: 'approved',
          created_at: new Date().toISOString(),
        },
        {
          id: 'demo-req-2',
          user_id: 'demo-user-123',
          partnership_id: 'demo-partnership',
          workout_date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
          intensity: 3,
          notes: 'Morning run',
          status: 'approved',
          created_at: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 'demo-req-3',
          user_id: 'demo-user-123',
          partnership_id: 'demo-partnership',
          workout_date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
          intensity: 5,
          notes: 'Intense HIIT session',
          status: 'pending',
          created_at: new Date(Date.now() - 172800000).toISOString(),
        },
      ])
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      loadPartnership()
      loadRequests()
    }
  }, [user])

  const loadPartnership = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('partnerships')
      .select('*')
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .eq('status', 'active')
      .single()

    if (data) {
      setPartnership(data)
      loadStoneProgress(data.id)
    }
  }

  const loadRequests = async () => {
    if (!user) return

    const { data } = await supabase
      .from('workout_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (data) setRequests(data)
  }

  const loadStoneProgress = async (partnershipId: string) => {
    const { data } = await supabase
      .from('stone_progress')
      .select('*')
      .eq('partnership_id', partnershipId)
      .single()

    if (data) setStoneProgress(data)
  }

  const createPartnership = async () => {
    if (!user || !partnerEmail) return

    // Find partner by email
    const { data: partnerData } = await supabase
      .from('users')
      .select('id')
      .eq('email', partnerEmail)
      .single()

    if (!partnerData) {
      alert('Partner not found')
      return
    }

    const { error } = await supabase.from('partnerships').insert({
      user1_id: user.id,
      user2_id: partnerData.id,
      status: 'active',
    })

    if (!error) {
      loadPartnership()
      setPartnerEmail('')
    }
  }

  const submitWorkoutRequest = async () => {
    if (!user || !partnership) return

    if (demoMode) {
      // Demo mode - just add to local state
      const newRequest: WorkoutRequest = {
        id: `demo-req-${Date.now()}`,
        user_id: user.id,
        partnership_id: partnership.id,
        workout_date: new Date().toISOString().split('T')[0],
        intensity: workoutIntensity,
        notes: workoutNotes,
        status: 'pending',
        created_at: new Date().toISOString(),
      }
      setRequests([newRequest, ...requests])
      setShowRequestForm(false)
      setWorkoutNotes('')
      alert('🎮 Demo: Workout request created! (This would be sent to your partner in real mode)')
      return
    }

    const { error } = await supabase.from('workout_requests').insert({
      user_id: user.id,
      partnership_id: partnership.id,
      workout_date: new Date().toISOString().split('T')[0],
      intensity: workoutIntensity,
      notes: workoutNotes,
      status: 'pending',
    })

    if (!error) {
      setShowRequestForm(false)
      setWorkoutNotes('')
      loadRequests()
      alert('Workout request sent to your partner!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">🏋️‍♂️ Workout Buddy</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/approvals')}
              className="text-gray-300 hover:text-white flex items-center gap-2"
            >
              ✅ Approvals
              {requests.filter(r => r.status === 'pending').length > 0 && (
                <span className="bg-yellow-500 text-gray-900 text-xs px-2 py-1 rounded-full font-semibold">
                  {requests.filter(r => r.status === 'pending').length}
                </span>
              )}
            </button>
            <span className="text-gray-300">{user.email}</span>
            <button
              onClick={signOut}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Demo Mode Banner */}
        {demoMode && (
          <div className="bg-purple-900/50 border border-purple-500 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-purple-200">
              <span className="text-2xl">🎮</span>
              <div>
                <div className="font-semibold">Demo Mode Active</div>
                <div className="text-sm">
                  You're viewing sample data. Set up Supabase to enable real functionality.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Partnership Setup */}
        {!partnership && (
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              🤝 Connect with Your Workout Buddy
            </h2>
            <p className="text-gray-300 mb-4">
              Enter your partner's email to create a partnership:
            </p>
            <div className="flex gap-4">
              <input
                type="email"
                value={partnerEmail}
                onChange={(e) => setPartnerEmail(e.target.value)}
                placeholder="partner@email.com"
                className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
              <button
                onClick={createPartnership}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
              >
                Connect
              </button>
            </div>
          </div>
        )}

        {/* Stone Game Progress - Dual Progress Bars */}
        {partnership && stoneProgress && (
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              🪨 Stone Game Progress - Partner Comparison
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Your Progress */}
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-blue-400 font-semibold">You</span>
                  <span className="text-white text-lg font-bold">
                    {Math.round((stoneProgress.current_position / stoneProgress.target_position) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-4 mb-2">
                  <div
                    className="bg-blue-500 h-4 rounded-full transition-all"
                    style={{
                      width: `${(stoneProgress.current_position / stoneProgress.target_position) * 100}%`,
                    }}
                  ></div>
                </div>
                <div className="text-gray-400 text-sm">
                  {stoneProgress.current_position}/{stoneProgress.target_position} units
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-orange-500">🔥</span>
                  <span className="text-gray-300 text-sm">
                    {stoneProgress.consecutive_days} day streak!
                  </span>
                </div>
              </div>

              {/* Partner's Progress */}
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-green-400 font-semibold">Partner</span>
                  <span className="text-white text-lg font-bold">
                    {demoMode ? '52%' : '0%'}
                  </span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-4 mb-2">
                  <div
                    className="bg-green-500 h-4 rounded-full transition-all"
                    style={{
                      width: demoMode ? '52%' : '0%',
                    }}
                  ></div>
                </div>
                <div className="text-gray-400 text-sm">
                  {demoMode ? '52/100' : '0/100'} units
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-orange-500">🔥</span>
                  <span className="text-gray-300 text-sm">
                    {demoMode ? '9 day streak!' : '0 day streak'}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-gray-400 text-sm">
                {demoMode && stoneProgress.current_position < 52 
                  ? "Your partner is ahead! Time to catch up! 💪" 
                  : "You're in the lead! Keep pushing! 🚀"}
              </p>
            </div>
          </div>
        )}

        {/* Workout Request Button */}
        {partnership && (
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              📝 Log Today's Workout
            </h2>
            {!showRequestForm ? (
              <button
                onClick={() => setShowRequestForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold"
              >
                ➕ Request Workout Approval
              </button>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2">
                    Workout Intensity (1-5)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={workoutIntensity}
                    onChange={(e) => setWorkoutIntensity(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-400 mt-1">
                    <span>Light</span>
                    <span className="text-white font-semibold">{workoutIntensity}</span>
                    <span>Intense</span>
                  </div>
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Notes (optional)</label>
                  <textarea
                    value={workoutNotes}
                    onChange={(e) => setWorkoutNotes(e.target.value)}
                    placeholder="What did you do today?"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    rows={3}
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={submitWorkoutRequest}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
                  >
                    Send Request
                  </button>
                  <button
                    onClick={() => setShowRequestForm(false)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Calendar View */}
        {partnership && (
          <Calendar 
            userWorkouts={requests}
            partnerWorkouts={demoMode ? [
              {
                id: 'demo-partner-1',
                user_id: 'demo-partner-456',
                partnership_id: 'demo-partnership',
                workout_date: new Date(Date.now() - 86400000 * 0).toISOString().split('T')[0],
                intensity: 2,
                notes: 'Light jog',
                status: 'approved',
                created_at: new Date().toISOString(),
              },
              {
                id: 'demo-partner-2',
                user_id: 'demo-partner-456',
                partnership_id: 'demo-partnership',
                workout_date: new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0],
                intensity: 3,
                notes: 'Yoga session',
                status: 'approved',
                created_at: new Date().toISOString(),
              },
              {
                id: 'demo-partner-3',
                user_id: 'demo-partner-456',
                partnership_id: 'demo-partnership',
                workout_date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
                intensity: 5,
                notes: 'Crossfit WOD',
                status: 'approved',
                created_at: new Date().toISOString(),
              },
              {
                id: 'demo-partner-4',
                user_id: 'demo-partner-456',
                partnership_id: 'demo-partnership',
                workout_date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
                intensity: 4,
                notes: 'Strength training',
                status: 'approved',
                created_at: new Date().toISOString(),
              },
            ] : []}
            demoMode={demoMode}
          />
        )}

        {/* Recent Requests */}
        {requests.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              📋 Your Recent Requests
            </h2>
            <div className="space-y-3">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="bg-gray-700 rounded-lg p-4 flex justify-between items-center"
                >
                  <div>
                    <div className="text-white font-semibold">
                      {format(new Date(request.workout_date), 'MMM dd, yyyy')}
                    </div>
                    <div className="text-gray-400 text-sm">
                      Intensity: {request.intensity}/5
                      {request.notes && ` • ${request.notes}`}
                    </div>
                  </div>
                  <div>
                    {request.status === 'pending' && (
                      <span className="bg-yellow-600 text-white px-3 py-1 rounded-full text-sm">
                        Pending
                      </span>
                    )}
                    {request.status === 'approved' && (
                      <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">
                        ✓ Approved
                      </span>
                    )}
                    {request.status === 'rejected' && (
                      <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm">
                        ✗ Rejected
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
