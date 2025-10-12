'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import type { WorkoutRequest, StoneProgress } from '@/lib/db'

export default function Approvals() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [pendingRequests, setPendingRequests] = useState<WorkoutRequest[]>([])
  const [stoneProgress, setStoneProgress] = useState<StoneProgress | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      loadPendingRequests()
      loadStoneProgress()
    }
  }, [user])

  const loadPendingRequests = async () => {
    try {
      const response = await fetch('/api/workouts?status=pending')
      if (response.ok) {
        const data = await response.json()
        setPendingRequests(data.requests || [])
      }
    } catch (error) {
      console.error('Error loading pending requests:', error)
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

  const handleApproval = async (requestId: string, approved: boolean) => {
    try {
      // Update workout status
      const workoutResponse = await fetch(`/api/workouts/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: approved ? 'approved' : 'rejected' }),
      })

      if (!workoutResponse.ok) {
        throw new Error('Failed to update workout')
      }

      // If approved, update stone progress
      if (approved && stoneProgress) {
        const pushDistance = Math.floor(Math.random() * 50) + 10 // Random push: 10-60 units
        
        await fetch('/api/stone-progress', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            partnershipId: stoneProgress.partnership_id,
            pushDistance,
          }),
        })
      }

      // Reload pending requests
      await loadPendingRequests()
      await loadStoneProgress()
    } catch (error) {
      console.error('Error handling approval:', error)
      alert('Failed to process approval. Please try again.')
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">✓ Approve Workouts</h1>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Dashboard
            </button>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Demo Mode Banner */}
        {user.id === 'demo-user-123' && (
          <div className="mb-6 p-4 bg-purple-700 text-white rounded-lg">
            <p className="font-semibold">Demo Mode Active</p>
            <p className="text-sm">You're viewing sample data. Set up database to enable real functionality.</p>
          </div>
        )}

        {/* Request-Approval System Info */}
        <div className="bg-slate-800 rounded-xl p-6 mb-6 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
            🤝 Request-Approval System
          </h2>
          <p className="text-slate-300 mb-2">
            Partners verify each other's workouts - no self-reporting possible!
          </p>
          <div className="space-y-2 text-sm text-slate-400">
            <p>📝 <strong>1.</strong> Complete workout</p>
            <p>📤 <strong>2.</strong> Send request to partner</p>
            <p>✓ <strong>3.</strong> Partner approves & updates progress</p>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-slate-800 rounded-xl p-6 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-4">Pending Partner Requests</h2>
          
          {pendingRequests.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400 text-lg mb-2">No pending requests</p>
              <p className="text-slate-500 text-sm">Your partner hasn't submitted any workouts for approval yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div key={request.id} className="bg-slate-700 p-6 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-white font-bold text-lg">
                        {new Date(request.workout_date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-slate-400 text-sm mt-1">
                        Submitted: {new Date(request.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl mb-1">
                        {request.intensity === 1 && '😴'}
                        {request.intensity === 2 && '🚶'}
                        {request.intensity === 3 && '💪'}
                        {request.intensity === 4 && '🔥'}
                        {request.intensity === 5 && '⚡'}
                      </p>
                      <p className="text-white font-semibold">Intensity: {request.intensity}/5</p>
                    </div>
                  </div>

                  {request.notes && (
                    <div className="mb-4 p-3 bg-slate-600 rounded">
                      <p className="text-slate-300 text-sm font-semibold mb-1">Notes:</p>
                      <p className="text-white">{request.notes}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApproval(request.id, true)}
                      className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => handleApproval(request.id, false)}
                      className="flex-1 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
                    >
                      ✗ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stone Progress Info */}
        {stoneProgress && (
          <div className="mt-6 bg-slate-800 rounded-xl p-6 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-3">🪨 Current Stone Progress</h3>
            <div className="bg-slate-700 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-300">Position:</span>
                <span className="text-white font-bold">
                  {stoneProgress.current_position} / {stoneProgress.target_position} units
                </span>
              </div>
              <div className="w-full bg-slate-600 rounded-full h-4 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-500"
                  style={{ 
                    width: `${(stoneProgress.current_position / stoneProgress.target_position) * 100}%` 
                  }}
                />
              </div>
              <div className="mt-3 flex justify-between text-sm">
                <span className="text-slate-400">
                  Consecutive days: {stoneProgress.consecutive_days}
                </span>
                <span className="text-slate-400">
                  Last push: {stoneProgress.last_push_date ? new Date(stoneProgress.last_push_date).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
            <p className="text-slate-400 text-sm mt-3 text-center">
              Each approved workout pushes the stone forward randomly! 💪
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
