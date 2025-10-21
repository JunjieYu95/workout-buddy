import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { 
  createWorkoutRequest, 
  getWorkoutRequestsByUserId,
  getPendingWorkoutRequestsForPartner,
  updateWorkoutRequestStatus
} from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const roomId = searchParams.get('roomId')

    if (type === 'pending') {
      // Get pending requests for the current user's partner
      const requests = await getPendingWorkoutRequestsForPartner(session.user.id)
      return NextResponse.json({ requests })
    } else if (type === 'approved' && roomId) {
      // Get approved workouts for calendar view
      const { query } = await import('@/lib/db')
      const result = await query(`
        SELECT wr.*, u.id as user_id, u.name, u.username
        FROM workout_requests wr
        JOIN users u ON wr.user_id = u.id
        JOIN room_members rm ON wr.room_id = rm.room_id
        WHERE wr.room_id = $1
        AND wr.status = 'approved'
        AND rm.user_id = $2
        ORDER BY wr.workout_date DESC
      `, [roomId, session.user.id])
      
      // Format dates to ensure consistent date-only format (YYYY-MM-DD)
      const workouts = result.rows.map((workout: any) => ({
        ...workout,
        workout_date: workout.workout_date instanceof Date 
          ? workout.workout_date.toISOString().split('T')[0]
          : workout.workout_date
      }))
      
      // Add cache-control headers to prevent stale data
      return NextResponse.json({ workouts }, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
    } else {
      // Get user's own workout requests
      const requests = await getWorkoutRequestsByUserId(session.user.id)
      return NextResponse.json({ requests })
    }
  } catch (error) {
    console.error('Error fetching workouts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { roomId, workoutDate, intensity, pushCount, notes } = await request.json()

    if (!roomId || !workoutDate || !intensity) {
      return NextResponse.json(
        { error: 'Room ID, workout date, and intensity are required' },
        { status: 400 }
      )
    }

    if (intensity < 1 || intensity > 5) {
      return NextResponse.json(
        { error: 'Intensity must be between 1 and 5' },
        { status: 400 }
      )
    }

    const workoutRequest = await createWorkoutRequest(
      session.user.id,
      roomId,
      new Date(workoutDate),
      intensity,
      pushCount || intensity, // Default pushCount to intensity if not provided
      notes
    )

    return NextResponse.json(workoutRequest)
  } catch (error) {
    console.error('Error creating workout request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

