'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { supabase, WorkoutRequest, Partnership } from '@/lib/supabase'
import { format } from 'date-fns'
import { calculateStoneReward } from '@/lib/stone-game'

export default function ApprovalsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [partnership, setPartnership] = useState<Partnership | null>(null)
  const [pendingRequests, setPendingRequests] = useState<WorkoutRequest[]>([])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      loadPartnership()
    }
  }, [user])

  const loadPartnership = async () => {
    if (!user) return

    const { data } = await supabase
      .from('partnerships')
      .select('*')
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .eq('status', 'active')
      .single()

    if (data) {
      setPartnership(data)
      loadPendingRequests(data)
    }
  }

  const loadPendingRequests = async (partnership: Partnership) => {
    const partnerId = partnership.user1_id === user?.id ? partnership.user2_id : partnership.user1_id

    const { data } = await supabase
      .from('workout_requests')
      .select('*')
      .eq('partnership_id', partnership.id)
      .eq('user_id', partnerId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (data) setPendingRequests(data)
  }

  const handleApproval = async (requestId: string, approved: boolean) => {
    if (!user || !partnership) return

    // Update request status
    const { error } = await supabase
      .from('workout_requests')
      .update({
        status: approved ? 'approved' : 'rejected',
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
      })
      .eq('id', requestId)

    if (!error && approved) {
      // Update stone progress
      const { data: stoneData } = await supabase
        .from('stone_progress')
        .select('*')
        .eq('partnership_id', partnership.id)
        .single()

      if (stoneData) {
        const reward = calculateStoneReward(stoneData.current_position, stoneData.consecutive_days)
        const newPosition = Math.min(
          stoneData.current_position + reward,
          stoneData.target_position
        )

        const today = new Date().toISOString().split('T')[0]
        const lastPushDate = stoneData.last_push_date
        const isConsecutive =
          lastPushDate &&
          new Date(today).getTime() - new Date(lastPushDate).getTime() === 86400000

        await supabase
          .from('stone_progress')
          .update({
            current_position: newPosition,
            last_push_date: today,
            consecutive_days: isConsecutive ? stoneData.consecutive_days + 1 : 1,
            updated_at: new Date().toISOString(),
          })
          .eq('partnership_id', partnership.id)
      }
    }

    // Reload pending requests
    if (partnership) {
      loadPendingRequests(partnership)
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
              onClick={() => router.push('/dashboard')}
              className="text-gray-300 hover:text-white"
            >
              Dashboard
            </button>
            <span className="text-gray-300">{user.email}</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-white mb-6">
          ✅ Pending Approvals
        </h2>

        {!partnership && (
          <div className="bg-gray-800 rounded-lg p-6">
            <p className="text-gray-300">
              You need to connect with a partner first.{' '}
              <button
                onClick={() => router.push('/dashboard')}
                className="text-blue-500 hover:text-blue-400"
              >
                Go to Dashboard
              </button>
            </p>
          </div>
        )}

        {partnership && pendingRequests.length === 0 && (
          <div className="bg-gray-800 rounded-lg p-6">
            <p className="text-gray-300">
              No pending approvals. Your partner hasn't submitted any workout requests yet!
            </p>
          </div>
        )}

        {pendingRequests.length > 0 && (
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <div
                key={request.id}
                className="bg-gray-800 rounded-lg p-6 border-l-4 border-yellow-500"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Workout on {format(new Date(request.workout_date), 'MMMM dd, yyyy')}
                    </h3>
                    <div className="text-gray-400">
                      Submitted {format(new Date(request.created_at), 'MMM dd, yyyy h:mm a')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400 mb-1">Intensity</div>
                    <div className="text-2xl font-bold text-white">{request.intensity}/5</div>
                  </div>
                </div>

                {/* Intensity visualization */}
                <div className="mb-4">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-2 flex-1 rounded ${
                          level <= request.intensity
                            ? level <= 2
                              ? 'bg-yellow-500'
                              : level <= 3
                              ? 'bg-green-500'
                              : 'bg-blue-500'
                            : 'bg-gray-600'
                        }`}
                      ></div>
                    ))}
                  </div>
                </div>

                {request.notes && (
                  <div className="mb-4 p-4 bg-gray-700 rounded-lg">
                    <div className="text-sm text-gray-400 mb-1">Notes:</div>
                    <div className="text-white">{request.notes}</div>
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    onClick={() => handleApproval(request.id, true)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold"
                  >
                    ✓ Approve
                  </button>
                  <button
                    onClick={() => handleApproval(request.id, false)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold"
                  >
                    ✗ Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
