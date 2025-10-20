import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { 
  createRoom,
  getUserRoom,
  searchRooms,
  joinRoom,
  getRoomById,
  getRoomMembers,
  updateRoomSettings
} from '@/lib/db'

// GET - Get user's current room
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const searchTerm = searchParams.get('search')
    const roomId = searchParams.get('roomId')

    // Search for rooms
    if (action === 'search' && searchTerm) {
      const rooms = await searchRooms(searchTerm)
      return NextResponse.json({ rooms })
    }

    // Get room details including members
    if (roomId) {
      const room = await getRoomById(roomId)
      if (!room) {
        return NextResponse.json({ error: 'Room not found' }, { status: 404 })
      }
      const members = await getRoomMembers(roomId)
      return NextResponse.json({ room, members })
    }

    // Get user's room
    const room = await getUserRoom(session.user.id)
    if (!room) {
      return NextResponse.json({ room: null, members: [] })
    }

    const members = await getRoomMembers(room.id)
    return NextResponse.json({ room, members })
  } catch (error) {
    console.error('Error fetching room:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create or join a room
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, roomName, roomId, maxScore, gaussianMean, gaussianStd, recessionMultiplier, pullBasePercentage, pullAccelerationMultiplier } = body

    // Check if user already has a room
    const existingRoom = await getUserRoom(session.user.id)
    if (existingRoom) {
      return NextResponse.json(
        { error: 'You are already in a room' },
        { status: 400 }
      )
    }

    if (action === 'create') {
      if (!roomName) {
        return NextResponse.json(
          { error: 'Room name is required' },
          { status: 400 }
        )
      }

      const room = await createRoom(
        roomName,
        session.user.id,
        maxScore || 100,
        gaussianMean || 5,
        gaussianStd || 2,
        recessionMultiplier || 1.5,
        pullBasePercentage || 0.5,
        pullAccelerationMultiplier || 2
      )
      const members = await getRoomMembers(room.id)

      return NextResponse.json({ room, members })
    }

    if (action === 'join') {
      if (!roomId) {
        return NextResponse.json(
          { error: 'Room ID is required' },
          { status: 400 }
        )
      }

      await joinRoom(roomId, session.user.id)
      const room = await getRoomById(roomId)
      const members = await getRoomMembers(roomId)

      return NextResponse.json({ room, members })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('Error managing room:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH - Update room settings (creator only)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { roomId, maxScore, gaussianMean, gaussianStd, recessionMultiplier, pullBasePercentage, pullAccelerationMultiplier } = await request.json()

    if (!roomId) {
      return NextResponse.json(
        { error: 'Room ID is required' },
        { status: 400 }
      )
    }

    // Check if user is the creator
    const room = await getRoomById(roomId)
    if (!room || room.creator_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the room creator can update settings' },
        { status: 403 }
      )
    }

    await updateRoomSettings(
      roomId,
      maxScore ?? room.max_score,
      gaussianMean ?? room.gaussian_mean,
      gaussianStd ?? room.gaussian_std,
      recessionMultiplier ?? room.recession_multiplier,
      pullBasePercentage ?? room.pull_base_percentage,
      pullAccelerationMultiplier ?? room.pull_acceleration_multiplier
    )

    const updatedRoom = await getRoomById(roomId)
    return NextResponse.json({ room: updatedRoom })
  } catch (error) {
    console.error('Error updating room settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

