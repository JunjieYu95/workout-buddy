import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type User = {
  id: string
  email: string
  created_at: string
}

export type Partnership = {
  id: string
  user1_id: string
  user2_id: string
  status: 'pending' | 'active'
  created_at: string
  accepted_at?: string
}

export type WorkoutRequest = {
  id: string
  user_id: string
  partnership_id: string
  workout_date: string
  intensity: number
  notes?: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  reviewed_at?: string
  reviewed_by?: string
}

export type StoneProgress = {
  id: string
  partnership_id: string
  current_position: number
  target_position: number
  last_push_date: string
  consecutive_days: number
  created_at: string
  updated_at: string
}