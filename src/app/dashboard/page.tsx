'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Calendar from '@/components/Calendar'
import ScoreGraph from '@/components/ScoreGraph'
import type { Room, WorkoutRequest, StoneProgress, UserProgress, User, DailyScore } from '@/lib/db'

interface UserProgressWithUser extends UserProgress {
  user?: User
}

export default function Dashboard() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  
  // Room state
  const [room, setRoom] = useState<Room | null>(null)
  const [members, setMembers] = useState<User[]>([])
  const [stoneProgress, setStoneProgress] = useState<StoneProgress | null>(null)
  const [requests, setRequests] = useState<WorkoutRequest[]>([])
  const [pendingApprovals, setPendingApprovals] = useState<WorkoutRequest[]>([])
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null)
  const [allProgress, setAllProgress] = useState<UserProgressWithUser[]>([])
  const [pushAnimation, setPushAnimation] = useState(false)
  const [pullAnimation, setPullAnimation] = useState(false)
  const [lastPushScore, setLastPushScore] = useState<number>(0)
  const [lastPullScore, setLastPullScore] = useState<number>(0)
  
  // UI state
  const [showCreateRoom, setShowCreateRoom] = useState(false)
  const [showJoinRoom, setShowJoinRoom] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showWorkoutForm, setShowWorkoutForm] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [showGraph, setShowGraph] = useState(false)
  const [error, setError] = useState('')
  
  // Graph data
  const [dailyScores, setDailyScores] = useState<DailyScore[]>([])
  
  // Calendar data
  const [calendarWorkouts, setCalendarWorkouts] = useState<WorkoutRequest[]>([])
  const [userCalendarWorkouts, setUserCalendarWorkouts] = useState<WorkoutRequest[]>([])
  const [partnerCalendarWorkouts, setPartnerCalendarWorkouts] = useState<WorkoutRequest[]>([])
  
  // Form state
  const [roomName, setRoomName] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<Room[]>([])
  const [workoutIntensity, setWorkoutIntensity] = useState(3)
  const [workoutNotes, setWorkoutNotes] = useState('')
  
  // Room settings
  const [maxScore, setMaxScore] = useState(100)
  const [gaussianMean, setGaussianMean] = useState(5)
  const [gaussianStd, setGaussianStd] = useState(2)
  const [recessionMultiplier, setRecessionMultiplier] = useState(1.5)
  const [pullBasePercentage, setPullBasePercentage] = useState(0.5)
  const [pullAccelerationMultiplier, setPullAccelerationMultiplier] = useState(2)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      loadRoom()
    }
  }, [user])

  useEffect(() => {
    if (room) {
      loadStoneProgress()
      loadRequests()
      loadPendingApprovals()
      loadUserProgress()
    }
  }, [room])

  // Auto-refresh pending approvals every 5 seconds
  useEffect(() => {
    if (room && room.status === 'active') {
      const interval = setInterval(() => {
        loadPendingApprovals()
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [room])

  const loadRoom = async () => {
    try {
      const response = await fetch('/api/rooms')
      if (response.ok) {
        const data = await response.json()
        setRoom(data.room)
        setMembers(data.members)
        
        if (data.room) {
          setMaxScore(data.room.max_score)
          setGaussianMean(data.room.gaussian_mean)
          setGaussianStd(data.room.gaussian_std)
          setRecessionMultiplier(data.room.recession_multiplier)
          setPullBasePercentage(data.room.pull_base_percentage)
          setPullAccelerationMultiplier(data.room.pull_acceleration_multiplier)
        }
      }
    } catch (error) {
      console.error('Error loading room:', error)
    }
  }

  const loadStoneProgress = async () => {
    if (!room?.id) return
    try {
      const response = await fetch(`/api/stone-progress?roomId=${room.id}`)
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

  const loadPendingApprovals = async () => {
    try {
      const response = await fetch('/api/workouts?type=pending')
      if (response.ok) {
        const data = await response.json()
        setPendingApprovals(data.requests || [])
      }
    } catch (error) {
      console.error('Error loading pending approvals:', error)
    }
  }

  const loadUserProgress = async () => {
    if (!room?.id) return
    try {
      const response = await fetch(`/api/user-progress?roomId=${room.id}`)
      if (response.ok) {
        const data = await response.json()
        setUserProgress(data.userProgress)
        
        // Match progress with members
        const progressWithUsers = data.allProgress.map((progress: UserProgress) => ({
          ...progress,
          user: members.find(m => m.id === progress.user_id)
        }))
        setAllProgress(progressWithUsers)
      }
    } catch (error) {
      console.error('Error loading user progress:', error)
    }
  }

  const loadCalendarWorkouts = async () => {
    if (!room?.id || !user?.id) return
    try {
      const response = await fetch(`/api/workouts?type=approved&roomId=${room.id}`)
      if (response.ok) {
        const data = await response.json()
        setCalendarWorkouts(data.workouts || [])
        
        // Separate user and partner workouts
        const userWorkouts = (data.workouts || []).filter((w: WorkoutRequest) => w.user_id === user.id)
        const partnerWorkouts = (data.workouts || []).filter((w: WorkoutRequest) => w.user_id !== user.id)
        
        setUserCalendarWorkouts(userWorkouts)
        setPartnerCalendarWorkouts(partnerWorkouts)
      }
    } catch (error) {
      console.error('Error loading calendar workouts:', error)
    }
  }

  const loadDailyScores = async () => {
    if (!room?.id) return
    try {
      const response = await fetch(`/api/daily-scores?roomId=${room.id}`)
      if (response.ok) {
        const data = await response.json()
        setDailyScores(data.scores || [])
      }
    } catch (error) {
      console.error('Error loading daily scores:', error)
    }
  }

  const handleCreateRoom = async () => {
    setError('')
    if (!roomName.trim()) {
      setError('Please enter a room name')
      return
    }

    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          roomName,
          maxScore,
          gaussianMean,
          gaussianStd,
          recessionMultiplier,
          pullBasePercentage,
          pullAccelerationMultiplier
        }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setRoom(data.room)
        setMembers(data.members)
        setShowCreateRoom(false)
        setRoomName('')
      } else {
        setError(data.error || 'Failed to create room')
      }
    } catch (error) {
      console.error('Error creating room:', error)
      setError('Failed to create room')
    }
  }

  const handleSearchRooms = async () => {
    if (!searchTerm.trim()) return
    
    try {
      const response = await fetch(`/api/rooms?action=search&search=${encodeURIComponent(searchTerm)}`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.rooms || [])
      }
    } catch (error) {
      console.error('Error searching rooms:', error)
    }
  }

  const handleJoinRoom = async (roomId: string) => {
    setError('')
    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'join', roomId }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setRoom(data.room)
        setMembers(data.members)
        setShowJoinRoom(false)
        setSearchTerm('')
        setSearchResults([])
      } else {
        setError(data.error || 'Failed to join room')
      }
    } catch (error) {
      console.error('Error joining room:', error)
      setError('Failed to join room')
    }
  }

  const handleUpdateSettings = async () => {
    setError('')
    try {
      const response = await fetch('/api/rooms', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: room?.id,
          maxScore,
          gaussianMean,
          gaussianStd,
          recessionMultiplier,
          pullBasePercentage,
          pullAccelerationMultiplier
        }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setRoom(data.room)
        setShowSettings(false)
        alert('Settings updated successfully!')
      } else {
        setError(data.error || 'Failed to update settings')
      }
    } catch (error) {
      console.error('Error updating settings:', error)
      setError('Failed to update settings')
    }
  }

  const handleLogWorkout = async () => {
    if (!room) {
      setError('You need to be in a room to log workouts')
      return
    }
    setError('')
    
    try {
      // Use date-only format (YYYY-MM-DD) to avoid timezone issues
      const today = new Date()
      const workoutDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
      
      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intensity: workoutIntensity,
          notes: workoutNotes,
          roomId: room.id,
          workoutDate: workoutDate,
          pushCount: workoutIntensity // Number of pushes equals intensity
        }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        await loadRequests()
        setShowWorkoutForm(false)
        setWorkoutIntensity(3)
        setWorkoutNotes('')
      } else {
        setError(data.error || 'Failed to log workout')
      }
    } catch (error) {
      console.error('Error logging workout:', error)
      setError('Failed to log workout')
    }
  }

  const handleApproveWorkout = async (requestId: string, approved: boolean) => {
    setError('')
    try {
      const response = await fetch(`/api/workouts/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: approved ? 'approved' : 'rejected',
          roomId: room?.id
        }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        await loadPendingApprovals()
        await loadStoneProgress()
        await loadUserProgress()
        // Reload calendar data if calendar is currently visible
        if (showCalendar) {
          await loadCalendarWorkouts()
        }
      } else {
        setError(data.error || 'Failed to process approval')
      }
    } catch (error) {
      console.error('Error approving workout:', error)
      setError('Failed to process approval')
    }
  }

  const handlePush = async () => {
    if (!room?.id) return
    setError('')
    
    try {
      setPushAnimation(true)
      const response = await fetch('/api/user-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: room.id }),
      })
      
      // Check if response is ok before parsing JSON
      if (!response.ok) {
        let errorMessage = 'Failed to push'
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch {
          // If JSON parsing fails, use default error message
        }
        setError(errorMessage)
        setPushAnimation(false)
        return
      }
      
      // Parse JSON only if response is ok
      const data = await response.json()
      
      // Verify we have the expected data
      if (!data.userProgress || !data.stoneProgress) {
        console.error('Invalid response data:', data)
        setError('Received invalid response from server')
        setPushAnimation(false)
        return
      }
      
      // Update state with successful response
      setUserProgress(data.userProgress)
      setStoneProgress(data.stoneProgress)
      setLastPushScore(data.pushDistance || 0)
      
      // Update all progress
      const progressWithUsers = (data.allProgress || []).map((progress: UserProgress) => ({
        ...progress,
        user: members.find((m: User) => m.id === progress.user_id)
      }))
      setAllProgress(progressWithUsers)
      
      // Show push distance notification
      setTimeout(() => {
        setPushAnimation(false)
      }, 1500)
    } catch (error) {
      console.error('Error pushing:', error)
      setError('Failed to push: Network error or server unavailable')
      setPushAnimation(false)
    }
  }

  const handlePull = async () => {
    if (!room?.id) {
      setError('No room found')
      return
    }
    setError('')
    
    // Find partner (user who is not the current user)
    // Members are User objects with 'id', not User objects with 'user_id'
    const partner = members.find(m => m.id !== user?.id)
    if (!partner) {
      setError('No partner to pull')
      return
    }
    
    console.log('Pull request:', { roomId: room.id, targetUserId: partner.id })
    
    try {
      setPullAnimation(true)
      const response = await fetch('/api/pull', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          roomId: room.id,
          targetUserId: partner.id
        }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setStoneProgress(data.stoneProgress)
        setLastPullScore(data.pullDistance)
        
        // Update all progress
        const progressWithUsers = data.allProgress.map((progress: UserProgress) => ({
          ...progress,
          user: members.find((m: User) => m.id === progress.user_id)
        }))
        setAllProgress(progressWithUsers)
        
        // Show pull distance notification
        setTimeout(() => {
          setPullAnimation(false)
        }, 1500)
      } else {
        setError(data.error || 'Failed to pull')
        setPullAnimation(false)
      }
    } catch (error) {
      console.error('Error pulling:', error)
      setError('Failed to pull')
      setPullAnimation(false)
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

  const progress = stoneProgress ? (stoneProgress.current_position / stoneProgress.target_position) * 100 : 0
  const streak = stoneProgress?.consecutive_days || 0
  const isCreator = room?.creator_id === user.id
  const hasRoom = !!room
  const roomActive = room?.status === 'active'
  const roomWaiting = room?.status === 'waiting'

  // Fix for the roomActive dependency in useEffect
  const roomActiveState = roomActive

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
          <h1 className="text-4xl font-bold text-white">?? Workout Buddy</h1>
            <p className="text-slate-400 mt-1">Welcome, {user.name || user.username}!</p>
          </div>
          <button
            onClick={() => signOut()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Sign Out
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-600 text-white rounded-lg flex justify-between items-center">
            <p className="font-semibold">{error}</p>
            <button onClick={() => setError('')} className="text-white hover:text-gray-200">?</button>
          </div>
        )}

        {/* No Room State */}
        {!hasRoom && (
          <div className="mb-6 p-6 bg-yellow-900/50 border-2 border-yellow-600 text-yellow-100 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">??</span>
              <h3 className="text-xl font-bold">No Room Yet</h3>
            </div>
            <p className="mb-4">Create a new room or join an existing one to start your fitness journey!</p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateRoom(true)}
                className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
              >
                Create Room
              </button>
              <button
                onClick={() => setShowJoinRoom(true)}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
              >
                Join Room
              </button>
            </div>
          </div>
        )}

        {/* Create Room Modal */}
        {showCreateRoom && (
          <div className="mb-6 bg-slate-800 rounded-xl p-6 shadow-xl">
            <h3 className="text-2xl font-bold text-white mb-4">Create New Room</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white mb-2">Room Name</label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="Enter a unique room name"
                  className="w-full p-3 rounded-lg bg-slate-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white mb-2">Max Score (Target)</label>
                  <input
                    type="number"
                    value={maxScore}
                    onChange={(e) => setMaxScore(Number(e.target.value))}
                    className="w-full p-3 rounded-lg bg-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Gaussian Mean (Push Distance)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={gaussianMean}
                    onChange={(e) => setGaussianMean(Number(e.target.value))}
                    className="w-full p-3 rounded-lg bg-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Gaussian Std Dev (Variability)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={gaussianStd}
                    onChange={(e) => setGaussianStd(Number(e.target.value))}
                    className="w-full p-3 rounded-lg bg-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">Recession Multiplier (Penalty)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={recessionMultiplier}
                    onChange={(e) => setRecessionMultiplier(Number(e.target.value))}
                    className="w-full p-3 rounded-lg bg-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCreateRoom}
                  className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
                >
                  Create Room
                </button>
                <button
                  onClick={() => {
                    setShowCreateRoom(false)
                    setRoomName('')
                    setError('')
                  }}
                  className="flex-1 py-3 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Join Room Modal */}
        {showJoinRoom && (
          <div className="mb-6 bg-slate-800 rounded-xl p-6 shadow-xl">
            <h3 className="text-2xl font-bold text-white mb-4">Join Room</h3>
            
            <div className="space-y-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search for a room..."
                  className="flex-1 p-3 rounded-lg bg-slate-700 text-white"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchRooms()}
                />
                <button
                  onClick={handleSearchRooms}
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
                >
                  Search
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-2">
                  <p className="text-slate-400 text-sm">Found {searchResults.length} room(s):</p>
                  {searchResults.map((r) => (
                    <div key={r.id} className="bg-slate-700 p-4 rounded-lg flex justify-between items-center">
                      <div>
                        <p className="text-white font-semibold">{r.name}</p>
                        <p className="text-slate-400 text-sm">Max Score: {r.max_score} | Status: {r.status}</p>
                      </div>
                      <button
                        onClick={() => handleJoinRoom(r.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Join
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => {
                  setShowJoinRoom(false)
                  setSearchTerm('')
                  setSearchResults([])
                  setError('')
                }}
                className="w-full py-3 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-700"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Room Info */}
        {hasRoom && (
          <div className="mb-6 bg-slate-800 rounded-xl p-6 shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  ?? Room: {room.name}
                </h2>
                <p className="text-slate-400 mt-1">
                  Status: <span className={`font-semibold ${roomActive ? 'text-green-400' : 'text-yellow-400'}`}>
                    {roomActive ? '?? Active' : '?? Waiting for partner'}
                  </span>
                </p>
              </div>
              {isCreator && (
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  ?? Settings
                </button>
              )}
            </div>

            {/* Room Members */}
            <div className="mb-4">
              <p className="text-slate-400 text-sm mb-2">Members ({members.length}/2):</p>
              <div className="flex gap-2">
                {members.map((member) => (
                  <div key={member.id} className="bg-slate-700 px-4 py-2 rounded-lg">
                    <p className="text-white">{member.name || member.username}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Room Settings Modal */}
            {showSettings && isCreator && (
              <div className="mt-4 p-4 bg-slate-700 rounded-lg">
                <h4 className="text-white font-bold mb-3">Room Settings (Creator Only)</h4>
                
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-slate-300 text-sm mb-1">Max Score</label>
                    <input
                      type="number"
                      value={maxScore}
                      onChange={(e) => setMaxScore(Number(e.target.value))}
                      className="w-full p-2 rounded bg-slate-600 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 text-sm mb-1">Gaussian Mean</label>
                    <input
                      type="number"
                      step="0.1"
                      value={gaussianMean}
                      onChange={(e) => setGaussianMean(Number(e.target.value))}
                      className="w-full p-2 rounded bg-slate-600 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 text-sm mb-1">Gaussian Std Dev</label>
                    <input
                      type="number"
                      step="0.1"
                      value={gaussianStd}
                      onChange={(e) => setGaussianStd(Number(e.target.value))}
                      className="w-full p-2 rounded bg-slate-600 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 text-sm mb-1">Recession Multiplier</label>
                    <input
                      type="number"
                      step="0.1"
                      value={recessionMultiplier}
                      onChange={(e) => setRecessionMultiplier(Number(e.target.value))}
                      className="w-full p-2 rounded bg-slate-600 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 text-sm mb-1">Pull Base % (of Push Mean)</label>
                    <input
                      type="number"
                      step="0.05"
                      min="0"
                      max="1"
                      value={pullBasePercentage}
                      onChange={(e) => setPullBasePercentage(Number(e.target.value))}
                      className="w-full p-2 rounded bg-slate-600 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 text-sm mb-1">Pull Acceleration Multiplier</label>
                    <input
                      type="number"
                      step="0.1"
                      value={pullAccelerationMultiplier}
                      onChange={(e) => setPullAccelerationMultiplier(Number(e.target.value))}
                      className="w-full p-2 rounded bg-slate-600 text-white text-sm"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleUpdateSettings}
                    className="flex-1 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="flex-1 py-2 bg-slate-600 text-white rounded hover:bg-slate-700 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Waiting Message */}
            {roomWaiting && (
              <div className="mt-4 p-4 bg-yellow-900/50 border border-yellow-600 rounded-lg">
                <p className="text-yellow-100">
                  ? Waiting for a partner to join... Share the room name: <strong>{room.name}</strong>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Dual Progress Bars - Only show if room is active */}
        {roomActive && stoneProgress && (
          <div className="bg-slate-800 rounded-xl p-6 mb-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                ?? Stone Game Progress - Competition
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    loadCalendarWorkouts()
                    setShowCalendar(true)
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  ?? Calendar
                </button>
                <button
                  onClick={() => {
                    loadDailyScores()
                    setShowGraph(true)
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                  ?? Graph
                </button>
              </div>
            </div>
            
            {/* Individual Progress Bars */}
            <div className="space-y-6 mb-6">
              {allProgress.map((progress) => {
                const progressPercent = stoneProgress.target_position > 0 
                  ? (progress.current_position / stoneProgress.target_position) * 100 
                  : 0
                const isCurrentUser = progress.user_id === user.id
                
                return (
                  <div key={progress.id}>
            <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-semibold">
                        {isCurrentUser ? '?? You' : '?? Partner'} 
                        {progress.user && ` (${progress.user.name || progress.user.username})`}
                      </span>
                      <span className="text-white font-bold">{progress.current_position.toFixed(2)}/{stoneProgress.target_position} ({Math.round(progressPercent)}%)</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-8 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 flex items-center justify-end pr-2 ${
                          isCurrentUser 
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
                            : 'bg-gradient-to-r from-green-500 to-green-600'
                        }`}
                        style={{ width: `${Math.max(progressPercent, 2)}%` }}
                      >
                        {progressPercent > 5 && (
                          <span className="text-white text-sm font-semibold">
                            {progress.current_position.toFixed(2)}/{stoneProgress.target_position}
                          </span>
                        )}
                      </div>
                    </div>
                    {isCurrentUser && progress.remaining_pushes > 0 && (
                      <p className="text-yellow-400 text-sm mt-1">
                        ?? {progress.remaining_pushes} pushes available!
                      </p>
                    )}
                  </div>
                )
              })}
              <div className="mt-2 flex items-center gap-2 text-orange-400">
                <span>?? {streak} day streak!</span>
              </div>
            </div>

            <p className="text-slate-400 mt-4 text-sm text-center">
              Each push samples from Gaussian(?={room.gaussian_mean}, ?={room.gaussian_std}) with consistency bonus
            </p>
          </div>
        )}

        {/* Dual Action Buttons - Push & Pull */}
        {roomActive && userProgress && (
          <div className="bg-slate-800 rounded-xl p-6 mb-6 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              ?? Push & Pull Actions
            </h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Push Button */}
              <div className="space-y-2">
                <button
                  onClick={handlePush}
                  disabled={pushAnimation || userProgress.remaining_pushes <= 0}
                  className={`w-full py-6 text-white font-bold text-xl rounded-lg transition-all ${
                    pushAnimation 
                      ? 'bg-purple-700 scale-95' 
                      : userProgress.remaining_pushes > 0
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover:scale-105 shadow-lg hover:shadow-purple-500/50'
                        : 'bg-gray-600 cursor-not-allowed opacity-50'
                  }`}
                >
                  {pushAnimation ? '? PUSHING... ?' : '?? Push Yourself'}
                </button>
                <p className="text-slate-400 text-sm text-center">
                  {userProgress.remaining_pushes > 0 
                    ? `${userProgress.remaining_pushes} pushes available` 
                    : 'No pushes available'}
                </p>
                {pushAnimation && lastPushScore > 0 && (
                  <div className="text-center">
                    <span className="inline-block text-green-400 font-bold text-xl animate-bounce">
                      +{lastPushScore.toFixed(2)} ??
                    </span>
                  </div>
                )}
              </div>

              {/* Pull Button */}
              <div className="space-y-2">
                <button
                  onClick={handlePull}
                  disabled={pullAnimation}
                  className={`w-full py-6 text-white font-bold text-xl rounded-lg transition-all ${
                    pullAnimation 
                      ? 'bg-red-700 scale-95' 
                      : 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 hover:scale-105 shadow-lg hover:shadow-red-500/50'
                  }`}
                >
                  {pullAnimation ? '?? PULLING... ??' : '?? Pull Partner'}
                </button>
                <p className="text-slate-400 text-sm text-center">
                  Always available
                </p>
                {pullAnimation && lastPullScore > 0 && (
                  <div className="text-center">
                    <span className="inline-block text-orange-400 font-bold text-xl animate-bounce">
                      -{lastPullScore.toFixed(2)} ??
                    </span>
                  </div>
                )}
              </div>
            </div>

            <p className="text-slate-500 text-xs text-center border-t border-slate-700 pt-3">
              Push: Gaussian(?={room.gaussian_mean}, ?={room.gaussian_std}) | Pull: {(room.pull_base_percentage * 100)}% of push mean with {room.pull_acceleration_multiplier}x acceleration
            </p>
          </div>
        )}

        {/* Log Workout - Only show if room is active */}
        {roomActive && (
        <div className="bg-slate-800 rounded-xl p-6 mb-6 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            ?? Log Today's Workout
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
                  <label className="block text-white mb-2">
                    Intensity (1-5) - Determines number of pushes
                  </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={workoutIntensity}
                  onChange={(e) => setWorkoutIntensity(Number(e.target.value))}
                  className="w-full"
                />
                <div className="text-center text-white mt-2 text-2xl">
                    {workoutIntensity === 1 && '?? 1 push'}
                    {workoutIntensity === 2 && '?? 2 pushes'}
                    {workoutIntensity === 3 && '?? 3 pushes'}
                    {workoutIntensity === 4 && '?? 4 pushes'}
                    {workoutIntensity === 5 && '? 5 pushes (Beast mode!)'}
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
        )}

        {/* Pending Approvals - Only show if room is active */}
        {roomActive && pendingApprovals.length > 0 && (
        <div className="bg-slate-800 rounded-xl p-6 mb-6 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              ? Partner Requests to Approve
          </h2>
            <div className="space-y-3">
              {pendingApprovals.map((req) => (
                <div key={req.id} className="bg-slate-700 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-white font-semibold">
                        {new Date(req.workout_date).toLocaleDateString()}
                      </p>
                      <p className="text-slate-400 text-sm">
                        Intensity: {req.intensity}/5 ({req.push_count} pushes)
                      </p>
                      {req.notes && (
                        <p className="text-slate-300 text-sm mt-1">"{req.notes}"</p>
                      )}
                    </div>
                    <span className="text-2xl">
                      {req.intensity === 1 && '??'}
                      {req.intensity === 2 && '??'}
                      {req.intensity === 3 && '??'}
                      {req.intensity === 4 && '??'}
                      {req.intensity === 5 && '?'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproveWorkout(req.id, true)}
                      className="flex-1 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 text-sm"
                    >
                      ? Approve
                    </button>
                    <button
                      onClick={() => handleApproveWorkout(req.id, false)}
                      className="flex-1 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 text-sm"
                    >
                      ? Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
        </div>
        )}

        {/* Recent Requests - Only show if room is active */}
        {roomActive && (
        <div className="bg-slate-800 rounded-xl p-6 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            ?? Your Recent Requests
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
                        Intensity: {req.intensity}/5 ({req.push_count} pushes) - {req.notes || 'No notes'}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    req.status === 'approved' ? 'bg-green-600 text-white' :
                    req.status === 'rejected' ? 'bg-red-600 text-white' :
                    'bg-yellow-600 text-white'
                  }`}>
                    {req.status === 'approved' ? '? Approved' :
                     req.status === 'rejected' ? '? Rejected' :
                     '? Pending'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        )}

        {/* Calendar Modal */}
        {showCalendar && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
            <div className="bg-slate-900 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">?? Workout Calendar</h2>
                <button
                  onClick={() => setShowCalendar(false)}
                  className="text-gray-400 hover:text-white text-3xl leading-none"
                >
                  &times;
                </button>
              </div>
              <div className="p-6">
                <Calendar
                  userWorkouts={userCalendarWorkouts}
                  partnerWorkouts={partnerCalendarWorkouts}
                  userName={user?.name || user?.username}
                  partnerName={members.find(m => m.id !== user?.id)?.name || members.find(m => m.id !== user?.id)?.username}
                  onRefresh={loadCalendarWorkouts}
                />
              </div>
            </div>
          </div>
        )}

        {/* Graph Modal */}
        {showGraph && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
            <div className="bg-slate-900 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">?? Progress Graph</h2>
                <button
                  onClick={() => setShowGraph(false)}
                  className="text-gray-400 hover:text-white text-3xl leading-none"
                >
                  &times;
                </button>
              </div>
              <div className="p-6">
                <ScoreGraph
                  scores={dailyScores}
                  userId={user?.id || ''}
                  partnerId={members.find(m => m.id !== user?.id)?.id}
                  userName={user?.name || user?.username}
                  partnerName={members.find(m => m.id !== user?.id)?.name || members.find(m => m.id !== user?.id)?.username}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
