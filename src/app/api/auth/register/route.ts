import { NextRequest, NextResponse } from 'next/server'
import { getUserByUsername } from '@/lib/db'
import { hashPassword, createUser } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { username, password, name, email } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await getUserByUsername(username)
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this username already exists' },
        { status: 400 }
      )
    }

    // Create new user
    const passwordHash = await hashPassword(password)
    const user = await createUser(username, passwordHash, name, email)

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
