import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getStoneProgressByRoom, updateStoneProgress } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get('roomId')

    if (!roomId) {
      return NextResponse.json({ progress: null })
    }

    const stoneProgress = await getStoneProgressByRoom(roomId)
    return NextResponse.json({ progress: stoneProgress })
  } catch (error) {
    console.error('Error fetching stone progress:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { roomId, currentPosition, consecutiveDays, lastPushDate } = await request.json()

    if (!roomId || currentPosition === undefined || consecutiveDays === undefined) {
      return NextResponse.json(
        { error: 'Room ID, current position, and consecutive days are required' },
        { status: 400 }
      )
    }

    await updateStoneProgress(
      roomId,
      currentPosition,
      consecutiveDays,
      lastPushDate ? new Date(lastPushDate) : undefined
    )

    return NextResponse.json({ message: 'Stone progress updated successfully' })
  } catch (error) {
    console.error('Error updating stone progress:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

