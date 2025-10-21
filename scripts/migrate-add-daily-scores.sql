-- Migration script to add daily_scores table
-- Run this if you have an existing database

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
CREATE INDEX IF NOT EXISTS idx_daily_scores_user_id ON daily_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_scores_room_id ON daily_scores(room_id);
CREATE INDEX IF NOT EXISTS idx_daily_scores_date ON daily_scores(score_date);
