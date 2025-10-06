-- Teacher Copilot Simplified Schema
-- Focus on core functionality + AI content storage

-- =============================================
-- CLEANUP EXISTING TABLES
-- =============================================
DROP TABLE IF EXISTS student_badges CASCADE;
DROP TABLE IF EXISTS badges CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS quiz_results CASCADE;
DROP TABLE IF EXISTS student_progress CASCADE;
DROP TABLE IF EXISTS lessons CASCADE;
DROP TABLE IF EXISTS class_enrollments CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS registration_codes CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS schools CASCADE;
DROP TABLE IF EXISTS ai_lessons CASCADE;
DROP TABLE IF EXISTS ai_knowledge_questions CASCADE;
DROP TABLE IF EXISTS ai_lesson_attempts CASCADE;
DROP TABLE IF EXISTS assessments CASCADE;

-- Drop existing functions
DROP FUNCTION IF EXISTS generate_school_code() CASCADE;
DROP FUNCTION IF EXISTS generate_class_code() CASCADE;
DROP FUNCTION IF EXISTS generate_teacher_id() CASCADE;
DROP FUNCTION IF EXISTS generate_student_id() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- CORE TABLES
-- =============================================

-- Schools table
CREATE TABLE schools (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  school_type TEXT CHECK (school_type IN ('public', 'private', 'mission')),
  state TEXT NOT NULL,
  address TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  school_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unified profiles table (handles all user types)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('school_admin', 'teacher', 'student')),
  
  -- School association
  school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
  
  -- Generated IDs
  teacher_id TEXT, -- TCH12345
  student_id TEXT, -- STU12345
  
  -- Student specific fields
  class_level TEXT,
  parent_email TEXT,
  total_xp INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  badges_earned INTEGER DEFAULT 0,
  
  -- Teacher specific fields
  subjects TEXT[],
  years_experience INTEGER,
  
  -- Common fields
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Classes table
CREATE TABLE classes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  class_level TEXT NOT NULL,
  teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  class_code TEXT UNIQUE NOT NULL,
  school_year TEXT NOT NULL,
  max_students INTEGER DEFAULT 50,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Class enrollments
CREATE TABLE class_enrollments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, student_id)
);

-- =============================================
-- AI CONTENT STORAGE
-- =============================================

-- AI-generated lessons
CREATE TABLE ai_lessons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  
  -- User input
  user_prompt TEXT NOT NULL,
  topic TEXT,
  subject TEXT,
  class_level TEXT,
  
  -- AI generation parameters
  ai_model TEXT DEFAULT 'groq',
  temperature DECIMAL(3,2) DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 2000,
  
  -- AI output
  ai_generated_content TEXT NOT NULL,
  ai_generated_steps JSONB, -- Structured lesson steps
  ai_generated_activities JSONB, -- Activities and timing
  ai_generated_homework TEXT,
  ai_generated_examples TEXT,
  
  -- Metadata
  generation_time_ms INTEGER,
  token_count INTEGER,
  user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
  user_feedback TEXT,
  is_favorite BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI-generated quiz questions
CREATE TABLE ai_knowledge_questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES ai_lessons(id) ON DELETE CASCADE,
  
  -- User input
  topic TEXT NOT NULL,
  subject TEXT,
  class_level TEXT,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  number_of_questions INTEGER DEFAULT 5,
  
  -- AI generation parameters
  ai_model TEXT DEFAULT 'groq',
  temperature DECIMAL(3,2) DEFAULT 0.7,
  
  -- AI output
  ai_generated_questions JSONB NOT NULL, -- Array of question objects
  ai_raw_output TEXT, -- Full AI response for debugging
  
  -- Metadata
  generation_time_ms INTEGER,
  token_count INTEGER,
  user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student attempts at AI lessons
CREATE TABLE ai_lesson_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  ai_lesson_id UUID REFERENCES ai_lessons(id) ON DELETE CASCADE,
  
  -- Attempt data
  score INTEGER,
  total_questions INTEGER,
  answers JSONB, -- Student's answers
  time_spent_seconds INTEGER,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ASSESSMENT SYSTEM
-- =============================================

-- Assessments (quizzes/tests)
CREATE TABLE assessments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  
  title TEXT NOT NULL,
  subject TEXT,
  class_level TEXT,
  questions JSONB NOT NULL, -- Array of question objects
  total_marks INTEGER DEFAULT 100,
  duration_minutes INTEGER,
  
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quiz results
CREATE TABLE quiz_results (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  answers JSONB, -- Student's answers
  time_taken_seconds INTEGER,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student progress tracking
CREATE TABLE student_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  ai_lesson_id UUID REFERENCES ai_lessons(id) ON DELETE CASCADE,
  
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  progress_percentage INTEGER DEFAULT 0,
  score INTEGER,
  xp_earned INTEGER DEFAULT 0,
  time_spent_minutes INTEGER DEFAULT 0,
  
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(student_id, ai_lesson_id)
);

-- =============================================
-- COMMUNICATION
-- =============================================

-- Chat messages
CREATE TABLE chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('teacher', 'student')),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- GAMIFICATION (Simplified)
-- =============================================

-- Badges
CREATE TABLE badges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  rarity TEXT NOT NULL CHECK (rarity IN ('bronze', 'silver', 'gold')),
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student badges
CREATE TABLE student_badges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, badge_id)
);

-- =============================================
-- REGISTRATION SYSTEM
-- =============================================

-- Registration codes
CREATE TABLE registration_codes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  code_type TEXT NOT NULL CHECK (code_type IN ('school', 'class')),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  expires_at TIMESTAMPTZ,
  is_used BOOLEAN DEFAULT false,
  used_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  used_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_knowledge_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_lesson_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE registration_codes ENABLE ROW LEVEL SECURITY;

-- =============================================
-- SAMPLE DATA
-- =============================================

-- Insert sample badges
INSERT INTO badges (name, description, icon, rarity, requirement_type, requirement_value) VALUES
('First Lesson', 'Complete your first AI lesson', '🎯', 'bronze', 'lessons_completed', 1),
('Quick Learner', 'Complete 5 AI lessons', '⚡', 'bronze', 'lessons_completed', 5),
('AI Explorer', 'Complete 10 AI lessons', '🤖', 'silver', 'lessons_completed', 10),
('Quiz Master', 'Score 100% on 5 quizzes', '🏆', 'gold', 'perfect_quizzes', 5),
('Streak Starter', 'Maintain a 3 day streak', '🔥', 'bronze', 'streak_days', 3),
('Dedicated', 'Maintain a 7 day streak', '🌟', 'silver', 'streak_days', 7),
('Unstoppable', 'Maintain a 30 day streak', '💫', 'gold', 'streak_days', 30)
ON CONFLICT DO NOTHING;

-- =============================================
-- DONE!
-- =============================================
-- This simplified schema focuses on:
-- 1. Core user management (schools, profiles, classes)
-- 2. AI content generation and storage
-- 3. Basic assessment system
-- 4. Simple gamification
-- 5. Registration system
