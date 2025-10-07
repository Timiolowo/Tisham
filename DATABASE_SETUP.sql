-- ============================================================================
-- TEACHMATE DATABASE SETUP
-- ============================================================================
-- This file contains all the necessary SQL commands to set up the TeachMate database
-- Run these commands in your Supabase SQL Editor

-- ============================================================================
-- 1. MAIN SCHEMA SETUP
-- ============================================================================

-- Create schools table
CREATE TABLE IF NOT EXISTS schools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  school_type TEXT NOT NULL,
  state TEXT NOT NULL,
  address TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  admin_name TEXT,
  school_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('school_admin', 'teacher', 'student')),
  school_id UUID REFERENCES schools(id),
  school_code TEXT,
  subjects TEXT[],
  years_experience INTEGER DEFAULT 0,
  teacher_id TEXT,
  student_id TEXT,
  class_level TEXT,
  parent_email TEXT,
  total_xp INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  badges_earned INTEGER DEFAULT 0,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create classes table
CREATE TABLE IF NOT EXISTS classes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  class_level TEXT NOT NULL,
  school_year TEXT NOT NULL,
  max_students INTEGER DEFAULT 30,
  description TEXT,
  teacher_id UUID REFERENCES profiles(id),
  school_id UUID REFERENCES schools(id),
  class_code TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create class_enrollments table
CREATE TABLE IF NOT EXISTS class_enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(class_id, student_id)
);

-- ============================================================================
-- 2. RLS POLICIES SETUP
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_enrollments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "School admins can view school profiles" ON profiles;
DROP POLICY IF EXISTS "Everyone can view school info" ON schools;
DROP POLICY IF EXISTS "Teachers can view their school" ON schools;
DROP POLICY IF EXISTS "Teachers full access to own classes" ON classes;
DROP POLICY IF EXISTS "Students can view enrolled classes" ON classes;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Schools policies
CREATE POLICY "Everyone can view school info" ON schools
  FOR SELECT USING (true);

-- Classes policies
CREATE POLICY "Teachers full access to own classes" ON classes
  FOR ALL USING (auth.uid() = teacher_id);

CREATE POLICY "Students can view enrolled classes" ON classes
  FOR SELECT USING (
    id IN (
      SELECT class_id FROM class_enrollments 
      WHERE student_id = auth.uid()
    )
  );

-- Class enrollments policies
CREATE POLICY "Teachers can manage enrollments for their classes" ON class_enrollments
  FOR ALL USING (
    class_id IN (
      SELECT id FROM classes WHERE teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can view their enrollments" ON class_enrollments
  FOR SELECT USING (student_id = auth.uid());

-- ============================================================================
-- 3. INDEXES FOR PERFORMANCE
-- ============================================================================

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_school_id ON profiles(school_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_classes_teacher_id ON classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_classes_school_id ON classes(school_id);
CREATE INDEX IF NOT EXISTS idx_class_enrollments_class_id ON class_enrollments(class_id);
CREATE INDEX IF NOT EXISTS idx_class_enrollments_student_id ON class_enrollments(student_id);

-- ============================================================================
-- 4. FUNCTIONS FOR AUTOMATIC UPDATES
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_schools_updated_at BEFORE UPDATE ON schools
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 5. SAMPLE DATA (OPTIONAL - FOR TESTING)
-- ============================================================================

-- Uncomment the following lines to insert sample data for testing
/*
-- Insert sample school
INSERT INTO schools (name, school_type, state, address, contact_email, contact_phone, admin_name, school_code)
VALUES ('Sample High School', 'public', 'Lagos', '123 Education Street', 'admin@sample.edu', '+234-123-456-7890', 'John Admin', 'SCH001');

-- Insert sample profile (replace with actual user ID)
INSERT INTO profiles (id, email, full_name, role, school_id, school_code)
VALUES ('00000000-0000-0000-0000-000000000000', 'teacher@sample.edu', 'Jane Teacher', 'teacher', 
        (SELECT id FROM schools WHERE school_code = 'SCH001'), 'SCH001');
*/

-- ============================================================================
-- 6. VERIFICATION QUERIES
-- ============================================================================

-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('schools', 'profiles', 'classes', 'class_enrollments');

-- Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('schools', 'profiles', 'classes', 'class_enrollments');

-- Check policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('schools', 'profiles', 'classes', 'class_enrollments');
