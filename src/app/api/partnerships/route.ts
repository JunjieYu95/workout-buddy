import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { 
  createPartnership, 
  getPartnershipByUserId,
  getUserByEmail
} from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const partnership = await getPartnershipByUserId(session.user.id)
    return NextResponse.json(partnership)
  } catch (error) {
    console.error('Error fetching partnership:', error)
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

    const { partnerEmail } = await request.json()

    if (!partnerEmail) {
      return NextResponse.json(
        { error: 'Partner email is required' },
        { status: 400 }
      )
    }

    // Check if partner exists
    const partner = await getUserByEmail(partnerEmail)
    if (!partner) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      )
    }

    // Check if partnership already exists
    const existingPartnership = await getPartnershipByUserId(session.user.id)
    if (existingPartnership) {
      return NextResponse.json(
        { error: 'You already have an active partnership' },
        { status: 400 }
      )
    }

    // Create partnership
    const partnership = await createPartnership(session.user.id, partner.id)

    return NextResponse.json(partnership)
  } catch (error) {
    console.error('Error creating partnership:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

