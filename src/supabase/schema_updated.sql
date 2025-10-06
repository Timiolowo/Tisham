-- Teacher Copilot Database Schema for Supabase (Updated)
-- Run this in your Supabase SQL Editor

-- =============================================
-- CLEANUP EXISTING TABLES
-- =============================================

-- Drop existing tables in correct order (respecting foreign keys)
DROP TABLE IF EXISTS student_badges CASCADE;
DROP TABLE IF EXISTS badges CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS quiz_results CASCADE;
DROP TABLE IF EXISTS student_progress CASCADE;
DROP TABLE IF EXISTS lessons CASCADE;
DROP TABLE IF EXISTS class_enrollments CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS registration_codes CASCADE;
DROP TABLE IF EXISTS pending_registrations CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS schools CASCADE;

-- Drop existing functions
DROP FUNCTION IF EXISTS generate_school_code() CASCADE;
DROP FUNCTION IF EXISTS generate_class_code() CASCADE;
DROP FUNCTION IF EXISTS generate_teacher_id() CASCADE;
DROP FUNCTION IF EXISTS generate_student_id() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- SCHOOLS TABLE
-- =============================================
CREATE TABLE schools (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  school_type TEXT CHECK (school_type IN ('public', 'private', 'mission')),
  state TEXT NOT NULL,
  address TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  school_code TEXT UNIQUE NOT NULL, -- Generated code like TCN123456
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PENDING REGISTRATIONS TABLE (Temporary storage)
-- =============================================
CREATE TABLE pending_registrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('school_admin', 'teacher', 'student')),
  school_name TEXT,
  school_type TEXT,
  school_state TEXT,
  school_address TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  admin_name TEXT,
  subjects TEXT[],
  years_experience INTEGER,
  school_code TEXT,
  class_code TEXT,
  student_id TEXT,
  class_level TEXT,
  parent_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PROFILES TABLE (Updated for 3-tier system)
-- =============================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('school_admin', 'teacher', 'student')),
  
  -- School association
  school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
  
  -- School admin specific fields
  school_code TEXT, -- For school admins to manage their school
  
  -- Teacher specific fields
  subjects TEXT[],
  years_experience INTEGER,
  teacher_id TEXT, -- Generated ID like TCH12345
  
  -- Student specific fields
  student_id TEXT, -- Generated ID like STU12345
  class_level TEXT,
  parent_email TEXT,
  total_xp INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  badges_earned INTEGER DEFAULT 0,
  
  -- Common fields
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CLASSES TABLE (Updated)
-- =============================================
CREATE TABLE classes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  class_level TEXT NOT NULL,
  teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  class_code TEXT UNIQUE NOT NULL, -- Generated code like CLS1234
  school_year TEXT NOT NULL,
  max_students INTEGER DEFAULT 50,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CLASS ENROLLMENTS TABLE
-- =============================================
CREATE TABLE class_enrollments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, student_id)
);

-- =============================================
-- LESSONS TABLE
-- =============================================
CREATE TABLE lessons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  class_level TEXT NOT NULL,
  content TEXT NOT NULL,
  objectives TEXT[],
  materials TEXT[],
  duration_minutes INTEGER,
  teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- STUDENT PROGRESS TABLE
-- =============================================
CREATE TABLE student_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('not_started', 'in_progress', 'completed')),
  score INTEGER,
  xp_earned INTEGER DEFAULT 0,
  time_spent_minutes INTEGER,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  UNIQUE(student_id, lesson_id)
);

-- =============================================
-- QUIZ RESULTS TABLE
-- =============================================
CREATE TABLE quiz_results (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  quiz_type TEXT NOT NULL CHECK (quiz_type IN ('mini', 'final')),
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  xp_earned INTEGER NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CHAT MESSAGES TABLE
-- =============================================
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
-- BADGES TABLE
-- =============================================
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

-- =============================================
-- STUDENT BADGES TABLE
-- =============================================
CREATE TABLE student_badges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, badge_id)
);

-- =============================================
-- REGISTRATION CODES TABLE (New)
-- =============================================
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

-- Enable RLS on all tables
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE registration_codes ENABLE ROW LEVEL SECURITY;

-- =============================================
-- POLICIES
-- =============================================

-- Schools policies
DROP POLICY IF EXISTS "School admins can manage their school" ON schools;
CREATE POLICY "School admins can manage their school"
  ON schools FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'school_admin'
      AND profiles.school_id = schools.id
    )
  );

-- Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "School admins can view school profiles" ON profiles;
CREATE POLICY "School admins can view school profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles admin
      WHERE admin.id = auth.uid()
      AND admin.role = 'school_admin'
      AND admin.school_id = profiles.school_id
    )
  );

-- Classes policies
DROP POLICY IF EXISTS "Teachers can manage their classes" ON classes;
CREATE POLICY "Teachers can manage their classes"
  ON classes FOR ALL
  USING (auth.uid() = teacher_id);

DROP POLICY IF EXISTS "Students can view their classes" ON classes;
CREATE POLICY "Students can view their classes"
  ON classes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM class_enrollments
      WHERE class_enrollments.class_id = classes.id
      AND class_enrollments.student_id = auth.uid()
    )
  );

-- Class enrollments policies
DROP POLICY IF EXISTS "Students can view own enrollments" ON class_enrollments;
CREATE POLICY "Students can view own enrollments"
  ON class_enrollments FOR SELECT
  USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Teachers can manage class enrollments" ON class_enrollments;
CREATE POLICY "Teachers can manage class enrollments"
  ON class_enrollments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM classes
      WHERE classes.id = class_enrollments.class_id
      AND classes.teacher_id = auth.uid()
    )
  );

-- Lessons policies
DROP POLICY IF EXISTS "Teachers can manage their lessons" ON lessons;
CREATE POLICY "Teachers can manage their lessons"
  ON lessons FOR ALL
  USING (auth.uid() = teacher_id);

DROP POLICY IF EXISTS "Students can view class lessons" ON lessons;
CREATE POLICY "Students can view class lessons"
  ON lessons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM class_enrollments
      WHERE class_enrollments.class_id = lessons.class_id
      AND class_enrollments.student_id = auth.uid()
    )
  );

-- Student progress policies
DROP POLICY IF EXISTS "Students can manage own progress" ON student_progress;
CREATE POLICY "Students can manage own progress"
  ON student_progress FOR ALL
  USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Teachers can view student progress" ON student_progress;
CREATE POLICY "Teachers can view student progress"
  ON student_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM lessons
      WHERE lessons.id = student_progress.lesson_id
      AND lessons.teacher_id = auth.uid()
    )
  );

-- Quiz results policies
DROP POLICY IF EXISTS "Students can view own quiz results" ON quiz_results;
CREATE POLICY "Students can view own quiz results"
  ON quiz_results FOR SELECT
  USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students can create quiz results" ON quiz_results;
CREATE POLICY "Students can create quiz results"
  ON quiz_results FOR INSERT
  WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Teachers can view student quiz results" ON quiz_results;
CREATE POLICY "Teachers can view student quiz results"
  ON quiz_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM lessons
      WHERE lessons.id = quiz_results.lesson_id
      AND lessons.teacher_id = auth.uid()
    )
  );

-- Chat messages policies
DROP POLICY IF EXISTS "Class members can view messages" ON chat_messages;
CREATE POLICY "Class members can view messages"
  ON chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM classes
      WHERE classes.id = chat_messages.class_id
      AND classes.teacher_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM class_enrollments
      WHERE class_enrollments.class_id = chat_messages.class_id
      AND class_enrollments.student_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Class members can send messages" ON chat_messages;
CREATE POLICY "Class members can send messages"
  ON chat_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND (
      EXISTS (
        SELECT 1 FROM classes
        WHERE classes.id = chat_messages.class_id
        AND classes.teacher_id = auth.uid()
      )
      OR
      EXISTS (
        SELECT 1 FROM class_enrollments
        WHERE class_enrollments.class_id = chat_messages.class_id
        AND class_enrollments.student_id = auth.uid()
      )
    )
  );

-- Student badges policies
DROP POLICY IF EXISTS "Students can view own badges" ON student_badges;
CREATE POLICY "Students can view own badges"
  ON student_badges FOR SELECT
  USING (auth.uid() = student_id);

-- Registration codes policies
DROP POLICY IF EXISTS "School admins can manage school codes" ON registration_codes;
CREATE POLICY "School admins can manage school codes"
  ON registration_codes FOR ALL
  USING (
    code_type = 'school'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'school_admin'
      AND profiles.school_id = registration_codes.school_id
    )
  );

DROP POLICY IF EXISTS "Teachers can manage class codes" ON registration_codes;
CREATE POLICY "Teachers can manage class codes"
  ON registration_codes FOR ALL
  USING (
    code_type = 'class'
    AND EXISTS (
      SELECT 1 FROM classes
      WHERE classes.id = registration_codes.class_id
      AND classes.teacher_id = auth.uid()
    )
  );

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to generate school code
CREATE OR REPLACE FUNCTION generate_school_code()
RETURNS TEXT AS $$
BEGIN
  RETURN 'TCN' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to generate class code
CREATE OR REPLACE FUNCTION generate_class_code()
RETURNS TEXT AS $$
BEGIN
  RETURN 'CLS' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to generate teacher ID
CREATE OR REPLACE FUNCTION generate_teacher_id()
RETURNS TEXT AS $$
BEGIN
  RETURN 'TCH' || LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to generate student ID
CREATE OR REPLACE FUNCTION generate_student_id()
RETURNS TEXT AS $$
BEGIN
  RETURN 'STU' || LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- TRIGGERS
-- =============================================

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_schools_updated_at ON schools;
CREATE TRIGGER update_schools_updated_at
  BEFORE UPDATE ON schools
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_classes_updated_at ON classes;
CREATE TRIGGER update_classes_updated_at
  BEFORE UPDATE ON classes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_lessons_updated_at ON lessons;
CREATE TRIGGER update_lessons_updated_at
  BEFORE UPDATE ON lessons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- INDEXES for Performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_schools_code ON schools(school_code);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_school ON profiles(school_id);
CREATE INDEX IF NOT EXISTS idx_classes_teacher ON classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_classes_school ON classes(school_id);
CREATE INDEX IF NOT EXISTS idx_classes_code ON classes(class_code);
CREATE INDEX IF NOT EXISTS idx_lessons_teacher ON lessons(teacher_id);
CREATE INDEX IF NOT EXISTS idx_lessons_class ON lessons(class_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_student ON student_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_lesson ON student_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_student ON quiz_results(student_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_class ON chat_messages(class_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_registration_codes_code ON registration_codes(code);
CREATE INDEX IF NOT EXISTS idx_registration_codes_type ON registration_codes(code_type);

-- =============================================
-- SAMPLE DATA
-- =============================================

-- Insert sample badges
INSERT INTO badges (name, description, icon, rarity, requirement_type, requirement_value) VALUES
('First Steps', 'Complete your first lesson', '🎯', 'bronze', 'lessons_completed', 1),
('Quick Learner', 'Complete 5 lessons', '⚡', 'bronze', 'lessons_completed', 5),
('Scholar', 'Complete 10 lessons', '📚', 'silver', 'lessons_completed', 10),
('Master Student', 'Complete 25 lessons', '🏆', 'gold', 'lessons_completed', 25),
('XP Hunter', 'Earn 100 XP', '💎', 'bronze', 'total_xp', 100),
('XP Champion', 'Earn 500 XP', '👑', 'silver', 'total_xp', 500),
('XP Legend', 'Earn 1000 XP', '⭐', 'gold', 'total_xp', 1000),
('Streak Starter', 'Maintain a 3 day streak', '🔥', 'bronze', 'streak_days', 3),
('Dedicated', 'Maintain a 7 day streak', '🌟', 'silver', 'streak_days', 7),
('Unstoppable', 'Maintain a 30 day streak', '💫', 'gold', 'streak_days', 30)
ON CONFLICT DO NOTHING;

-- =============================================
-- DONE!
-- =============================================
-- This schema supports:
-- 1. School registration with unique school codes
-- 2. Teacher registration with school codes
-- 3. Student registration with class codes
-- 4. Proper role-based access control
-- 5. Code-based invitation system
