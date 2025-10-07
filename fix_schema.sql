-- Fix missing columns in existing database
-- Run this in your Supabase SQL editor

-- Add admin_name column to schools table
ALTER TABLE schools ADD COLUMN IF NOT EXISTS admin_name TEXT;

-- Verify the profiles table structure
-- The profiles table should have:
-- id UUID REFERENCES auth.users(id) PRIMARY KEY
-- email TEXT UNIQUE NOT NULL
-- full_name TEXT NOT NULL
-- role TEXT NOT NULL
-- school_id UUID REFERENCES schools(id)
-- teacher_id TEXT
-- student_id TEXT
-- class_level TEXT
-- parent_email TEXT
-- subjects TEXT
-- years_experience INTEGER
-- created_at TIMESTAMPTZ DEFAULT NOW()
-- updated_at TIMESTAMPTZ DEFAULT NOW()

-- If profiles table is missing any columns, add them:
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subjects TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS years_experience INTEGER;
