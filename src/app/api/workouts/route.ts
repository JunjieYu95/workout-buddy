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

    if (type === 'pending') {
      // Get pending requests for the current user's partner
      const requests = await getPendingWorkoutRequestsForPartner(session.user.id)
      return NextResponse.json(requests)
    } else {
      // Get user's own workout requests
      const requests = await getWorkoutRequestsByUserId(session.user.id)
      return NextResponse.json(requests)
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

    const { partnershipId, workoutDate, intensity, notes } = await request.json()

    if (!partnershipId || !workoutDate || !intensity) {
      return NextResponse.json(
        { error: 'Partnership ID, workout date, and intensity are required' },
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
      partnershipId,
      new Date(workoutDate),
      intensity,
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
