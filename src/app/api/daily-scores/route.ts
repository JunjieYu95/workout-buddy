import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDailyScoresByRoom } from '@/lib/db'

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

    const scores = await getDailyScoresByRoom(roomId)
    
    // Format dates to ensure consistent date-only format
    const formattedScores = scores.map((score) => ({
      ...score,
      score_date: score.score_date instanceof Date 
        ? score.score_date.toISOString().split('T')[0]
        : score.score_date
    }))

    return NextResponse.json({ scores: formattedScores })
  } catch (error) {
    console.error('Error fetching daily scores:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
