import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { 
  createDailyScore,
  getDailyScoresByRoom,
  getDailyScoresByUser
} from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get('roomId')
    const userId = searchParams.get('userId')

    if (!roomId) {
      return NextResponse.json({ error: 'Room ID is required' }, { status: 400 })
    }

    let scores
    if (userId) {
      // Get scores for specific user
      scores = await getDailyScoresByUser(userId, roomId)
    } else {
      // Get all scores for the room
      scores = await getDailyScoresByRoom(roomId)
    }

    // Format dates to ensure consistent date-only format (YYYY-MM-DD)
    const formattedScores = scores.map((score: any) => ({
      ...score,
      score_date: score.score_date instanceof Date 
        ? score.score_date.toISOString().split('T')[0]
        : score.score_date
    }))

    return NextResponse.json({ scores: formattedScores })
  } catch (error) {
    console.error('Error fetching scores:', error)
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

    const { roomId, scoreDate, score } = await request.json()

    if (!roomId || !scoreDate || score === undefined) {
      return NextResponse.json(
        { error: 'Room ID, score date, and score are required' },
        { status: 400 }
      )
    }

    const dailyScore = await createDailyScore(
      session.user.id,
      roomId,
      new Date(scoreDate),
      score
    )

    return NextResponse.json(dailyScore)
  } catch (error) {
    console.error('Error creating daily score:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
