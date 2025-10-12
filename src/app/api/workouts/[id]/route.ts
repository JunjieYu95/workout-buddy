import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { updateWorkoutRequestStatus } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { status } = await request.json()

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Status must be either "approved" or "rejected"' },
        { status: 400 }
      )
    }

    await updateWorkoutRequestStatus(params.id, status)

    return NextResponse.json({ message: 'Workout request updated successfully' })
  } catch (error) {
    console.error('Error updating workout request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

