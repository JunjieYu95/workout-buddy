import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { 
  getUserProgress,
  updateUserProgress,
  getStoneProgressByRoom,
  updateStoneProgress,
  getRoomById,
  getAllUserProgressInRoom,
  createDailyScore
} from '@/lib/db'
import { calculateSinglePush, calculatePull } from '@/lib/stone-game'

// GET - Get user's progress and all progress in room
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get('roomId')

    if (!roomId) {
      return NextResponse.json({ error: 'Room ID required' }, { status: 400 })
    }

    const userProgress = await getUserProgress(session.user.id, roomId)
    const allProgress = await getAllUserProgressInRoom(roomId)

    return NextResponse.json({ 
      userProgress, 
      allProgress 
    })
  } catch (error) {
    console.error('Error fetching user progress:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Execute a push
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { roomId } = await request.json()

    if (!roomId) {
      return NextResponse.json({ error: 'Room ID required' }, { status: 400 })
    }

    // Get user progress
    const userProgress = await getUserProgress(session.user.id, roomId)
    if (!userProgress) {
      return NextResponse.json({ error: 'User progress not found' }, { status: 404 })
    }

    if (userProgress.remaining_pushes <= 0) {
      return NextResponse.json({ error: 'No pushes remaining' }, { status: 400 })
    }

    // Get room and stone progress
    const room = await getRoomById(roomId)
    const stoneProgress = await getStoneProgressByRoom(roomId)
    
    if (!room || !stoneProgress) {
      return NextResponse.json({ error: 'Room or stone progress not found' }, { status: 404 })
    }

    // Calculate push distance using Gaussian distribution
    const pushDistance = calculateSinglePush(
      room.gaussian_mean,
      room.gaussian_std,
      stoneProgress.consecutive_days
    )

    // Update user progress
    const newUserPosition = userProgress.current_position + pushDistance
    const newRemainingPushes = userProgress.remaining_pushes - 1

    await updateUserProgress(
      session.user.id,
      roomId,
      newUserPosition,
      newRemainingPushes
    )

    // Update total stone progress
    const newStonePosition = Math.min(
      stoneProgress.current_position + pushDistance,
      stoneProgress.target_position
    )

    // Check if this is consecutive
    const lastPushDate = stoneProgress.last_push_date 
      ? new Date(stoneProgress.last_push_date) 
      : null
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    let newConsecutiveDays = stoneProgress.consecutive_days
    
    if (lastPushDate) {
      const lastPush = new Date(lastPushDate)
      lastPush.setHours(0, 0, 0, 0)
      const daysDiff = Math.floor((today.getTime() - lastPush.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysDiff === 1) {
        newConsecutiveDays++
      } else if (daysDiff > 1) {
        newConsecutiveDays = 1
      }
    } else {
      newConsecutiveDays = 1
    }

    await updateStoneProgress(
      roomId,
      newStonePosition,
      newConsecutiveDays,
      today
    )

    // Create daily score entry
    await createDailyScore(
      session.user.id,
      roomId,
      today,
      newUserPosition
    )

    // Get updated progress for all users
    const allProgress = await getAllUserProgressInRoom(roomId)

    return NextResponse.json({ 
      pushDistance,
      userProgress: {
        ...userProgress,
        current_position: newUserPosition,
        remaining_pushes: newRemainingPushes
      },
      stoneProgress: {
        ...stoneProgress,
        current_position: newStonePosition,
        consecutive_days: newConsecutiveDays
      },
      allProgress
    })
  } catch (error) {
    console.error('Error executing push:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

