import { Pool } from 'pg'
import bcrypt from 'bcryptjs'

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
  username: string
  email?: string
  name?: string
  password_hash: string
  created_at: Date
  updated_at: Date
}

export interface Room {
  id: string
  name: string
  creator_id: string
  max_score: number
  gaussian_mean: number
  gaussian_std: number
  recession_multiplier: number
  pull_base_percentage: number
  pull_acceleration_multiplier: number
  status: 'waiting' | 'active' | 'completed'
  created_at: Date
  updated_at: Date
}

export interface RoomMember {
  id: string
  room_id: string
  user_id: string
  joined_at: Date
}

export interface Partnership {
  id: string
  user1_id: string
  user2_id: string
  room_id: string
  status: 'pending' | 'active' | 'rejected'
  created_at: Date
  updated_at: Date
}

export interface WorkoutRequest {
  id: string
  user_id: string
  room_id: string
  workout_date: Date
  intensity: number
  push_count: number
  notes?: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: Date
  updated_at: Date
}

export interface StoneProgress {
  id: string
  room_id: string
  current_position: number
  target_position: number
  last_push_date?: Date
  consecutive_days: number
  created_at: Date
  updated_at: Date
}

export interface UserProgress {
  id: string
  user_id: string
  room_id: string
  current_position: number
  remaining_pushes: number
  consecutive_missed_days: number
  created_at: Date
  updated_at: Date
}

export interface DailyScore {
  id: string
  user_id: string
  room_id: string
  score_date: Date
  score: number
  created_at: Date
  updated_at: Date
}

export interface ScoreTimelinePoint {
  user_id: string
  room_id: string
  score_date: Date
  daily_score: number
  cumulative_score: number
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

// Helper function for password hashing
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12)
}

// User functions
export async function createUser(username: string, passwordHash: string, name?: string, email?: string): Promise<User> {
  const result = await query(
    'INSERT INTO users (username, password_hash, name, email) VALUES ($1, $2, $3, $4) RETURNING *',
    [username, passwordHash, name, email]
  )
  return result.rows[0]
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const result = await query('SELECT * FROM users WHERE username = $1', [username])
  return result.rows[0] || null
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await query('SELECT * FROM users WHERE email = $1', [email])
  return result.rows[0] || null
}

export async function getUserById(id: string): Promise<User | null> {
  const result = await query('SELECT * FROM users WHERE id = $1', [id])
  return result.rows[0] || null
}

// Room functions
export async function createRoom(
  name: string, 
  creatorId: string, 
  maxScore: number = 100,
  gaussianMean: number = 5,
  gaussianStd: number = 2,
  recessionMultiplier: number = 1.5,
  pullBasePercentage: number = 0.5,
  pullAccelerationMultiplier: number = 2
): Promise<Room> {
  const result = await query(
    'INSERT INTO rooms (name, creator_id, max_score, gaussian_mean, gaussian_std, recession_multiplier, pull_base_percentage, pull_acceleration_multiplier, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
    [name, creatorId, maxScore, gaussianMean, gaussianStd, recessionMultiplier, pullBasePercentage, pullAccelerationMultiplier, 'waiting']
  )
  
  // Add creator as first member
  await query(
    'INSERT INTO room_members (room_id, user_id) VALUES ($1, $2)',
    [result.rows[0].id, creatorId]
  )
  
  return result.rows[0]
}

export async function getRoomByName(name: string): Promise<Room | null> {
  const result = await query('SELECT * FROM rooms WHERE name = $1', [name])
  return result.rows[0] || null
}

export async function getRoomById(id: string): Promise<Room | null> {
  const result = await query('SELECT * FROM rooms WHERE id = $1', [id])
  return result.rows[0] || null
}

export async function searchRooms(searchTerm: string): Promise<Room[]> {
  const result = await query(
    "SELECT * FROM rooms WHERE name ILIKE $1 AND status = 'waiting' ORDER BY created_at DESC LIMIT 20",
    [`%${searchTerm}%`]
  )
  return result.rows
}

export async function joinRoom(roomId: string, userId: string): Promise<void> {
  // Check if user is already in the room
  const existing = await query(
    'SELECT * FROM room_members WHERE room_id = $1 AND user_id = $2',
    [roomId, userId]
  )
  
  if (existing.rows.length > 0) {
    throw new Error('Already a member of this room')
  }
  
  // Add user to room
  await query(
    'INSERT INTO room_members (room_id, user_id) VALUES ($1, $2)',
    [roomId, userId]
  )
  
  // Check if room now has 2 members
  const members = await query(
    'SELECT COUNT(*) as count FROM room_members WHERE room_id = $1',
    [roomId]
  )
  
  if (members.rows[0].count >= 2) {
    // Activate the room and create stone progress
    await query(
      "UPDATE rooms SET status = 'active', updated_at = NOW() WHERE id = $1",
      [roomId]
    )
    
    const room = await getRoomById(roomId)
    if (room) {
      await query(
        'INSERT INTO stone_progress (room_id, current_position, target_position, consecutive_days) VALUES ($1, 0, $2, 0)',
        [roomId, room.max_score]
      )
      
      // Create user progress for all members
      const allMembers = await query(
        'SELECT user_id FROM room_members WHERE room_id = $1',
        [roomId]
      )
      
      for (const member of allMembers.rows) {
        await query(
          'INSERT INTO user_progress (user_id, room_id, current_position, remaining_pushes) VALUES ($1, $2, 0, 0) ON CONFLICT (user_id, room_id) DO NOTHING',
          [member.user_id, roomId]
        )
      }
    }
  }
}

export async function getRoomMembers(roomId: string): Promise<User[]> {
  const result = await query(
    'SELECT u.* FROM users u INNER JOIN room_members rm ON u.id = rm.user_id WHERE rm.room_id = $1',
    [roomId]
  )
  return result.rows
}

export async function getUserRoom(userId: string): Promise<Room | null> {
  const result = await query(
    'SELECT r.* FROM rooms r INNER JOIN room_members rm ON r.id = rm.room_id WHERE rm.user_id = $1 ORDER BY r.created_at DESC LIMIT 1',
    [userId]
  )
  return result.rows[0] || null
}

export async function updateRoomSettings(
  roomId: string,
  maxScore: number,
  gaussianMean: number,
  gaussianStd: number,
  recessionMultiplier: number,
  pullBasePercentage: number,
  pullAccelerationMultiplier: number
): Promise<void> {
  await query(
    'UPDATE rooms SET max_score = $1, gaussian_mean = $2, gaussian_std = $3, recession_multiplier = $4, pull_base_percentage = $5, pull_acceleration_multiplier = $6, updated_at = NOW() WHERE id = $7',
    [maxScore, gaussianMean, gaussianStd, recessionMultiplier, pullBasePercentage, pullAccelerationMultiplier, roomId]
  )
  
  // Update target position in stone progress
  await query(
    'UPDATE stone_progress SET target_position = $1, updated_at = NOW() WHERE room_id = $2',
    [maxScore, roomId]
  )
}

// Partnership functions
export async function createPartnership(user1Id: string, user2Id: string, roomId: string): Promise<Partnership> {
  const result = await query(
    'INSERT INTO partnerships (user1_id, user2_id, room_id) VALUES ($1, $2, $3) RETURNING *',
    [user1Id, user2Id, roomId]
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
  roomId: string,
  workoutDate: Date,
  intensity: number,
  pushCount: number,
  notes?: string
): Promise<WorkoutRequest> {
  const result = await query(
    'INSERT INTO workout_requests (user_id, room_id, workout_date, intensity, push_count, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [userId, roomId, workoutDate, intensity, pushCount, notes]
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
    JOIN room_members rm ON wr.room_id = rm.room_id
    WHERE rm.user_id = $1
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
export async function getStoneProgressByRoom(roomId: string): Promise<StoneProgress | null> {
  const result = await query(
    'SELECT * FROM stone_progress WHERE room_id = $1',
    [roomId]
  )
  return result.rows[0] || null
}

export async function updateStoneProgress(
  roomId: string,
  currentPosition: number,
  consecutiveDays: number,
  lastPushDate?: Date
): Promise<void> {
  await query(
    'UPDATE stone_progress SET current_position = $1, consecutive_days = $2, last_push_date = $3, updated_at = NOW() WHERE room_id = $4',
    [currentPosition, consecutiveDays, lastPushDate, roomId]
  )
}

// User progress functions
export async function getUserProgress(userId: string, roomId: string): Promise<UserProgress | null> {
  const result = await query(
    'SELECT * FROM user_progress WHERE user_id = $1 AND room_id = $2',
    [userId, roomId]
  )
  return result.rows[0] || null
}

export async function createUserProgress(userId: string, roomId: string): Promise<UserProgress> {
  const result = await query(
    'INSERT INTO user_progress (user_id, room_id, current_position, remaining_pushes, consecutive_missed_days) VALUES ($1, $2, 0, 0, 0) RETURNING *',
    [userId, roomId]
  )
  return result.rows[0]
}

export async function updateUserProgress(
  userId: string,
  roomId: string,
  currentPosition: number,
  remainingPushes: number
): Promise<void> {
  await query(
    'UPDATE user_progress SET current_position = $1, remaining_pushes = $2, updated_at = NOW() WHERE user_id = $3 AND room_id = $4',
    [currentPosition, remainingPushes, userId, roomId]
  )
}

export async function addRemainingPushes(
  userId: string,
  roomId: string,
  additionalPushes: number
): Promise<void> {
  await query(
    'UPDATE user_progress SET remaining_pushes = remaining_pushes + $1, updated_at = NOW() WHERE user_id = $2 AND room_id = $3',
    [additionalPushes, userId, roomId]
  )
}

export async function getAllUserProgressInRoom(roomId: string): Promise<UserProgress[]> {
  const result = await query(
    'SELECT * FROM user_progress WHERE room_id = $1',
    [roomId]
  )
  return result.rows
}

// Daily score functions
export async function recordDailyScore(
  userId: string,
  roomId: string,
  scoreDate: Date,
  score: number
): Promise<DailyScore> {
  const result = await query(
    `INSERT INTO daily_scores (user_id, room_id, score_date, score) 
     VALUES ($1, $2, $3, $4) 
     ON CONFLICT (user_id, room_id, score_date) 
     DO UPDATE SET score = daily_scores.score + EXCLUDED.score, updated_at = NOW()
     RETURNING *`,
    [userId, roomId, scoreDate, score]
  )
  return result.rows[0]
}

export async function getDailyScoresByRoom(roomId: string): Promise<DailyScore[]> {
  const result = await query(
    'SELECT * FROM daily_scores WHERE room_id = $1 ORDER BY score_date ASC',
    [roomId]
  )
  return result.rows
}

export async function getScoreTimelineByRoom(roomId: string): Promise<ScoreTimelinePoint[]> {
  const result = await query(
    `
      WITH members AS (
        SELECT user_id
        FROM room_members
        WHERE room_id = $1
      ),
      bounds AS (
        SELECT 
          COALESCE(MIN(score_date), CURRENT_DATE) AS min_date,
          GREATEST(COALESCE(MAX(score_date), CURRENT_DATE), CURRENT_DATE) AS max_date
        FROM daily_scores
        WHERE room_id = $1
      ),
      series AS (
        SELECT generate_series(bounds.min_date, bounds.max_date, interval '1 day')::date AS score_date
        FROM bounds
      ),
      base AS (
        SELECT s.score_date, m.user_id
        FROM series s
        CROSS JOIN members m
      ),
      scores AS (
        SELECT user_id, score_date, score
        FROM daily_scores
        WHERE room_id = $1
      )
      SELECT 
        b.user_id,
        $1::uuid AS room_id,
        b.score_date,
        COALESCE(s.score, 0) AS daily_score,
        SUM(COALESCE(s.score, 0)) OVER (
          PARTITION BY b.user_id 
          ORDER BY b.score_date
        ) AS cumulative_score
      FROM base b
      LEFT JOIN scores s 
        ON s.user_id = b.user_id 
       AND s.score_date = b.score_date
      ORDER BY b.score_date ASC, b.user_id ASC
    `,
    [roomId]
  )
  return result.rows
}

// Initialize database tables
export async function initializeDatabase(): Promise<void> {
  const createTables = `
    -- Create users table
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      username VARCHAR(255) UNIQUE NOT NULL,
      email VARCHAR(255),
      name VARCHAR(255),
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Create rooms table
    CREATE TABLE IF NOT EXISTS rooms (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) UNIQUE NOT NULL,
      creator_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
      max_score INTEGER DEFAULT 100 NOT NULL,
      gaussian_mean FLOAT DEFAULT 5.0 NOT NULL,
      gaussian_std FLOAT DEFAULT 2.0 NOT NULL,
      recession_multiplier FLOAT DEFAULT 1.5 NOT NULL,
      pull_base_percentage FLOAT DEFAULT 0.5 NOT NULL,
      pull_acceleration_multiplier FLOAT DEFAULT 2.0 NOT NULL,
      status VARCHAR(20) DEFAULT 'waiting' NOT NULL CHECK (status IN ('waiting', 'active', 'completed')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Create room_members table
    CREATE TABLE IF NOT EXISTS room_members (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      room_id UUID REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
      joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(room_id, user_id)
    );

    -- Create partnerships table (now linked to rooms)
    CREATE TABLE IF NOT EXISTS partnerships (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user1_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
      user2_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
      room_id UUID REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
      status VARCHAR(20) DEFAULT 'active' NOT NULL CHECK (status IN ('pending', 'active', 'rejected')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(user1_id, user2_id)
    );

    -- Create workout_requests table
    CREATE TABLE IF NOT EXISTS workout_requests (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
      room_id UUID REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
      workout_date DATE NOT NULL,
      intensity INTEGER NOT NULL CHECK (intensity >= 1 AND intensity <= 5),
      push_count INTEGER DEFAULT 0 NOT NULL,
      notes TEXT,
      status VARCHAR(20) DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Create stone_progress table
    CREATE TABLE IF NOT EXISTS stone_progress (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      room_id UUID REFERENCES rooms(id) ON DELETE CASCADE UNIQUE NOT NULL,
      current_position FLOAT DEFAULT 0 NOT NULL,
      target_position FLOAT DEFAULT 100 NOT NULL,
      last_push_date DATE,
      consecutive_days INTEGER DEFAULT 0 NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Create user_progress table
    CREATE TABLE IF NOT EXISTS user_progress (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
      room_id UUID REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
      current_position FLOAT DEFAULT 0 NOT NULL,
      remaining_pushes INTEGER DEFAULT 0 NOT NULL,
      consecutive_missed_days INTEGER DEFAULT 0 NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(user_id, room_id)
    );

    -- Create daily_scores table for tracking score over time
    CREATE TABLE IF NOT EXISTS daily_scores (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
      room_id UUID REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
      score_date DATE NOT NULL,
      score FLOAT DEFAULT 0 NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(user_id, room_id, score_date)
    );

    -- Create indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_rooms_name ON rooms(name);
    CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
    CREATE INDEX IF NOT EXISTS idx_room_members_room_id ON room_members(room_id);
    CREATE INDEX IF NOT EXISTS idx_room_members_user_id ON room_members(user_id);
    CREATE INDEX IF NOT EXISTS idx_partnerships_user1 ON partnerships(user1_id);
    CREATE INDEX IF NOT EXISTS idx_partnerships_user2 ON partnerships(user2_id);
    CREATE INDEX IF NOT EXISTS idx_partnerships_room_id ON partnerships(room_id);
    CREATE INDEX IF NOT EXISTS idx_workout_requests_user_id ON workout_requests(user_id);
    CREATE INDEX IF NOT EXISTS idx_workout_requests_room_id ON workout_requests(room_id);
    CREATE INDEX IF NOT EXISTS idx_workout_requests_status ON workout_requests(status);
    CREATE INDEX IF NOT EXISTS idx_stone_progress_room_id ON stone_progress(room_id);
    CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_progress_room_id ON user_progress(room_id);
    CREATE INDEX IF NOT EXISTS idx_daily_scores_user_id ON daily_scores(user_id);
    CREATE INDEX IF NOT EXISTS idx_daily_scores_room_id ON daily_scores(room_id);
    CREATE INDEX IF NOT EXISTS idx_daily_scores_date ON daily_scores(score_date);
  `

  await query(createTables)
  console.log('Database tables initialized successfully')
}
