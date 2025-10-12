import { Pool } from 'pg'

// Database connection pool
let pool: Pool | null = null

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    })
  }
  return pool
}

// Database types
export interface User {
  id: string
  email: string
  name?: string
  password_hash: string
  created_at: Date
  updated_at: Date
}

export interface Partnership {
  id: string
  user1_id: string
  user2_id: string
  status: 'pending' | 'active' | 'rejected'
  created_at: Date
  updated_at: Date
}

export interface WorkoutRequest {
  id: string
  user_id: string
  partnership_id: string
  workout_date: Date
  intensity: number
  notes?: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: Date
  updated_at: Date
}

export interface StoneProgress {
  id: string
  partnership_id: string
  current_position: number
  target_position: number
  last_push_date?: Date
  consecutive_days: number
  created_at: Date
  updated_at: Date
}

// Database utility functions
export async function query(text: string, params?: any[]): Promise<any> {
  const pool = getPool()
  const start = Date.now()
  try {
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    console.log('Executed query', { text, duration, rows: res.rowCount })
    return res
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

// User functions
export async function createUser(email: string, passwordHash: string, name?: string): Promise<User> {
  const result = await query(
    'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING *',
    [email, passwordHash, name]
  )
  return result.rows[0]
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await query('SELECT * FROM users WHERE email = $1', [email])
  return result.rows[0] || null
}

export async function getUserById(id: string): Promise<User | null> {
  const result = await query('SELECT * FROM users WHERE id = $1', [id])
  return result.rows[0] || null
}

// Partnership functions
export async function createPartnership(user1Id: string, user2Id: string): Promise<Partnership> {
  const result = await query(
    'INSERT INTO partnerships (user1_id, user2_id) VALUES ($1, $2) RETURNING *',
    [user1Id, user2Id]
  )
  
  // Create stone progress for the partnership
  await query(
    'INSERT INTO stone_progress (partnership_id, current_position, target_position, consecutive_days) VALUES ($1, 0, 100, 0)',
    [result.rows[0].id]
  )
  
  return result.rows[0]
}

export async function getPartnershipByUserId(userId: string): Promise<Partnership | null> {
  const result = await query(
    'SELECT * FROM partnerships WHERE user1_id = $1 OR user2_id = $1 LIMIT 1',
    [userId]
  )
  return result.rows[0] || null
}

export async function updatePartnershipStatus(id: string, status: 'pending' | 'active' | 'rejected'): Promise<void> {
  await query(
    'UPDATE partnerships SET status = $1, updated_at = NOW() WHERE id = $2',
    [status, id]
  )
}

// Workout request functions
export async function createWorkoutRequest(
  userId: string,
  partnershipId: string,
  workoutDate: Date,
  intensity: number,
  notes?: string
): Promise<WorkoutRequest> {
  const result = await query(
    'INSERT INTO workout_requests (user_id, partnership_id, workout_date, intensity, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [userId, partnershipId, workoutDate, intensity, notes]
  )
  return result.rows[0]
}

export async function getWorkoutRequestsByUserId(userId: string): Promise<WorkoutRequest[]> {
  const result = await query(
    'SELECT * FROM workout_requests WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  )
  return result.rows
}

export async function getPendingWorkoutRequestsForPartner(userId: string): Promise<WorkoutRequest[]> {
  const result = await query(`
    SELECT wr.* FROM workout_requests wr
    JOIN partnerships p ON wr.partnership_id = p.id
    WHERE (p.user1_id = $1 OR p.user2_id = $1) 
    AND wr.status = 'pending'
    AND wr.user_id != $1
    ORDER BY wr.created_at DESC
  `, [userId])
  return result.rows
}

export async function updateWorkoutRequestStatus(id: string, status: 'pending' | 'approved' | 'rejected'): Promise<void> {
  await query(
    'UPDATE workout_requests SET status = $1, updated_at = NOW() WHERE id = $2',
    [status, id]
  )
}

// Stone progress functions
export async function getStoneProgressByPartnership(partnershipId: string): Promise<StoneProgress | null> {
  const result = await query(
    'SELECT * FROM stone_progress WHERE partnership_id = $1',
    [partnershipId]
  )
  return result.rows[0] || null
}

export async function updateStoneProgress(
  partnershipId: string,
  currentPosition: number,
  consecutiveDays: number,
  lastPushDate?: Date
): Promise<void> {
  await query(
    'UPDATE stone_progress SET current_position = $1, consecutive_days = $2, last_push_date = $3, updated_at = NOW() WHERE partnership_id = $4',
    [currentPosition, consecutiveDays, lastPushDate, partnershipId]
  )
}

// Initialize database tables
export async function initializeDatabase(): Promise<void> {
  const createTables = `
    -- Create users table
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255),
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Create partnerships table
    CREATE TABLE IF NOT EXISTS partnerships (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user1_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
      user2_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
      status VARCHAR(20) DEFAULT 'active' NOT NULL CHECK (status IN ('pending', 'active', 'rejected')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(user1_id, user2_id)
    );

    -- Create workout_requests table
    CREATE TABLE IF NOT EXISTS workout_requests (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
      partnership_id UUID REFERENCES partnerships(id) ON DELETE CASCADE NOT NULL,
      workout_date DATE NOT NULL,
      intensity INTEGER NOT NULL CHECK (intensity >= 1 AND intensity <= 5),
      notes TEXT,
      status VARCHAR(20) DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Create stone_progress table
    CREATE TABLE IF NOT EXISTS stone_progress (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      partnership_id UUID REFERENCES partnerships(id) ON DELETE CASCADE UNIQUE NOT NULL,
      current_position INTEGER DEFAULT 0 NOT NULL,
      target_position INTEGER DEFAULT 100 NOT NULL,
      last_push_date DATE,
      consecutive_days INTEGER DEFAULT 0 NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Create indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_partnerships_user1 ON partnerships(user1_id);
    CREATE INDEX IF NOT EXISTS idx_partnerships_user2 ON partnerships(user2_id);
    CREATE INDEX IF NOT EXISTS idx_workout_requests_user_id ON workout_requests(user_id);
    CREATE INDEX IF NOT EXISTS idx_workout_requests_partnership_id ON workout_requests(partnership_id);
    CREATE INDEX IF NOT EXISTS idx_workout_requests_status ON workout_requests(status);
    CREATE INDEX IF NOT EXISTS idx_stone_progress_partnership_id ON stone_progress(partnership_id);
  `

  await query(createTables)
  console.log('Database tables initialized successfully')
}
