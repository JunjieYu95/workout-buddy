import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { 
  updateWorkoutRequestStatus,
  getStoneProgressByRoom,
  updateStoneProgress,
  getRoomById,
  getUserProgress,
  createUserProgress,
  addRemainingPushes
} from '@/lib/db'
import { calculateStoneReward } from '@/lib/stone-game'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { status, roomId } = await request.json()

    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Update workout status
    await updateWorkoutRequestStatus(params.id, status)

    // If approved, add remaining pushes to the user
    if (status === 'approved' && roomId) {
      const room = await getRoomById(roomId)
      
      if (room) {
        // Get the workout request to get intensity and user
        const { query } = await import('@/lib/db')
        const workoutResult = await query(
          'SELECT * FROM workout_requests WHERE id = $1',
          [params.id]
        )
        const workout = workoutResult.rows[0]

        if (workout) {
          // Ensure user progress exists
          let userProgress = await getUserProgress(workout.user_id, roomId)
          if (!userProgress) {
            userProgress = await createUserProgress(workout.user_id, roomId)
          }

          // Add remaining pushes based on intensity (intensity = number of pushes)
          await addRemainingPushes(workout.user_id, roomId, workout.intensity)
        }
      }
    }

    return NextResponse.json({ message: 'Workout status updated successfully' })
  } catch (error) {
    console.error('Error updating workout status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
