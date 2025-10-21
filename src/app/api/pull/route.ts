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
  getRoomMembers,
  createDailyScore
} from '@/lib/db'
import { calculatePull } from '@/lib/stone-game'

// POST - Execute a pull (sabotage partner)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { roomId, targetUserId } = await request.json()

    if (!roomId || !targetUserId) {
      return NextResponse.json({ error: 'Room ID and target user ID required' }, { status: 400 })
    }

    // Get target user progress
    const targetProgress = await getUserProgress(targetUserId, roomId)
    if (!targetProgress) {
      return NextResponse.json({ error: 'Target user progress not found' }, { status: 404 })
    }

    // Get room and stone progress
    const room = await getRoomById(roomId)
    const stoneProgress = await getStoneProgressByRoom(roomId)
    
    if (!room || !stoneProgress) {
      return NextResponse.json({ error: 'Room or stone progress not found' }, { status: 404 })
    }

    // Calculate pull distance
    const pullDistance = calculatePull(
      room.gaussian_mean,
      room.gaussian_std,
      room.pull_base_percentage,
      room.pull_acceleration_multiplier,
      targetProgress.consecutive_missed_days
    )

    // Update target user progress (pull them back)
    const newTargetPosition = Math.max(0, targetProgress.current_position - pullDistance)

    await updateUserProgress(
      targetUserId,
      roomId,
      newTargetPosition,
      targetProgress.remaining_pushes
    )

    // Update total stone progress (subtract from total)
    const newStonePosition = Math.max(0, stoneProgress.current_position - pullDistance)

    await updateStoneProgress(
      roomId,
      newStonePosition,
      stoneProgress.consecutive_days,
      stoneProgress.last_push_date
    )

    // Create daily score entry for the target user (after pull)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    await createDailyScore(
      targetUserId,
      roomId,
      today,
      newTargetPosition
    )

    // Get updated progress for all users
    const allProgress = await getAllUserProgressInRoom(roomId)

    return NextResponse.json({ 
      pullDistance,
      targetProgress: {
        ...targetProgress,
        current_position: newTargetPosition
      },
      stoneProgress: {
        ...stoneProgress,
        current_position: newStonePosition
      },
      allProgress
    })
  } catch (error) {
    console.error('Error executing pull:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

