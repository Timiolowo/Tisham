-- Teacher Copilot Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- PROFILES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
  school TEXT,
  avatar_url TEXT,
  
  -- Student specific fields
  class_level TEXT,
  total_xp INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  badges_earned INTEGER DEFAULT 0,
  class_rank INTEGER,
  parent_email TEXT,
  
  -- Teacher specific fields
  subjects TEXT[],
  classes_taught TEXT[],
  years_experience INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- =============================================
-- CLASSES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS classes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  class_level TEXT NOT NULL,
  teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  school_year TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view own classes"
  ON classes FOR SELECT
  USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can create classes"
  ON classes FOR INSERT
  WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update own classes"
  ON classes FOR UPDATE
  USING (auth.uid() = teacher_id);

-- =============================================
-- CLASS ENROLLMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS class_enrollments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, student_id)
);

ALTER TABLE class_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own enrollments"
  ON class_enrollments FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Teachers can manage enrollments"
  ON class_enrollments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM classes
      WHERE classes.id = class_enrollments.class_id
      AND classes.teacher_id = auth.uid()
    )
  );

-- =============================================
-- LESSONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS lessons (
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

ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage own lessons"
  ON lessons FOR ALL
  USING (auth.uid() = teacher_id);

CREATE POLICY "Students can view class lessons"
  ON lessons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM class_enrollments
      WHERE class_enrollments.class_id = lessons.class_id
      AND class_enrollments.student_id = auth.uid()
    )
  );

-- =============================================
-- STUDENT PROGRESS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS student_progress (
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

ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can manage own progress"
  ON student_progress FOR ALL
  USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view student progress"
  ON student_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM lessons
      WHERE lessons.id = student_progress.lesson_id
      AND lessons.teacher_id = auth.uid()
    )
  );

-- =============================================
-- QUIZ RESULTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS quiz_results (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  quiz_type TEXT NOT NULL CHECK (quiz_type IN ('mini', 'final')),
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  xp_earned INTEGER NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own quiz results"
  ON quiz_results FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Students can create quiz results"
  ON quiz_results FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Teachers can view student quiz results"
  ON quiz_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM lessons
      WHERE lessons.id = quiz_results.lesson_id
      AND lessons.teacher_id = auth.uid()
    )
  );

-- =============================================
-- CHAT MESSAGES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('teacher', 'student')),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Class members can view messages"
  ON chat_messages FOR SELECT
  USING (
    -- Teachers can see messages in their classes
    EXISTS (
      SELECT 1 FROM classes
      WHERE classes.id = chat_messages.class_id
      AND classes.teacher_id = auth.uid()
    )
    OR
    -- Students can see messages in enrolled classes
    EXISTS (
      SELECT 1 FROM class_enrollments
      WHERE class_enrollments.class_id = chat_messages.class_id
      AND class_enrollments.student_id = auth.uid()
    )
  );

CREATE POLICY "Class members can send messages"
  ON chat_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND (
      -- Teachers can send in their classes
      EXISTS (
        SELECT 1 FROM classes
        WHERE classes.id = chat_messages.class_id
        AND classes.teacher_id = auth.uid()
      )
      OR
      -- Students can send in enrolled classes
      EXISTS (
        SELECT 1 FROM class_enrollments
        WHERE class_enrollments.class_id = chat_messages.class_id
        AND class_enrollments.student_id = auth.uid()
      )
    )
  );

-- =============================================
-- BADGES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS badges (
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
CREATE TABLE IF NOT EXISTS student_badges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, badge_id)
);

ALTER TABLE student_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own badges"
  ON student_badges FOR SELECT
  USING (auth.uid() = student_id);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_classes_updated_at
  BEFORE UPDATE ON classes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at
  BEFORE UPDATE ON lessons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- INDEXES for Performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_classes_teacher ON classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_lessons_teacher ON lessons(teacher_id);
CREATE INDEX IF NOT EXISTS idx_lessons_class ON lessons(class_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_student ON student_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_lesson ON student_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_student ON quiz_results(student_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_class ON chat_messages(class_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at);

-- =============================================
-- SAMPLE DATA (Optional - for testing)
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
-- VIEWS for Analytics
-- =============================================

-- Class performance view
CREATE OR REPLACE VIEW class_performance AS
SELECT 
  c.id as class_id,
  c.name as class_name,
  COUNT(DISTINCT ce.student_id) as total_students,
  COUNT(DISTINCT l.id) as total_lessons,
  AVG(sp.score) as average_score,
  SUM(sp.xp_earned) as total_xp_earned
FROM classes c
LEFT JOIN class_enrollments ce ON c.id = ce.class_id
LEFT JOIN lessons l ON c.id = l.class_id
LEFT JOIN student_progress sp ON l.id = sp.lesson_id
GROUP BY c.id, c.name;

-- Student performance view
CREATE OR REPLACE VIEW student_performance AS
SELECT 
  p.id as student_id,
  p.full_name,
  p.total_xp,
  p.streak_days,
  COUNT(DISTINCT sp.lesson_id) as lessons_completed,
  AVG(sp.score) as average_score,
  COUNT(DISTINCT sb.badge_id) as badges_earned
FROM profiles p
LEFT JOIN student_progress sp ON p.id = sp.student_id AND sp.status = 'completed'
LEFT JOIN student_badges sb ON p.id = sb.student_id
WHERE p.role = 'student'
GROUP BY p.id, p.full_name, p.total_xp, p.streak_days;

-- =============================================
-- DONE!
-- =============================================
-- Run this script in your Supabase SQL Editor
-- Then your database will be ready for the Teacher Copilot app



-- ============================================================================
-- Teacher Copilot Nigeria - Supabase SQL Schema (Separate teacher/student profiles; school admins)
-- Single-file; run as project owner in Supabase SQL editor
-- ============================================================================
-- Extensions
-- 1. Confirm extensions (pgcrypto and uuid-ossp / gen_random_uuid)
SELECT extname, extversion FROM pg_extension WHERE extname IN ('pgcrypto','uuid-ossp');

-- 2. Confirm the key tables exist
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- 3. Confirm materialized view exists
SELECT matviewname FROM pg_matviews WHERE schemaname = 'public';

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CORE: SCHOOLS & AUTH LINKING
-- ============================================================================

-- Schools table
CREATE TABLE IF NOT EXISTS public.schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'Nigeria',
  school_type TEXT CHECK (school_type IN ('primary','secondary','both')),
  principal_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- School admins mapping (links an auth user to a school as admin)
CREATE TABLE IF NOT EXISTS public.school_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'school_admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_school_admin_user_school ON public.school_admins (user_id, school_id);

-- ============================================================================
-- AUTH PROFILE TABLES (separate teacher and student profiles)
-- ============================================================================

-- Teacher profiles (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.teacher_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
  full_name TEXT,
  email TEXT,
  phone_number TEXT,
  subjects TEXT[],
  years_experience INTEGER,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_teacher_profiles_user_id ON public.teacher_profiles(user_id);

-- Student profiles (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.student_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
  full_name TEXT,
  email TEXT,
  phone_number TEXT,
  class_level TEXT,
  parent_email TEXT,
  total_xp INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_login_date DATE,
  badges_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_student_profiles_user_id ON public.student_profiles(user_id);

-- ============================================================================
-- CLASSES & ENROLLMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  class_level TEXT NOT NULL,
  teacher_profile_id UUID REFERENCES public.teacher_profiles(id) ON DELETE SET NULL,
  school_year TEXT,
  term TEXT,
  description TEXT,
  class_code TEXT UNIQUE,
  max_students INTEGER DEFAULT 50,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enrollment join table: class <-> student
CREATE TABLE IF NOT EXISTS public.class_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_profile_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (class_id, student_profile_id)
);

-- ============================================================================
-- LESSONS, CURRICULUM ASSIGNMENTS & RESOURCES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_profile_id UUID REFERENCES public.teacher_profiles(id) ON DELETE SET NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  class_level TEXT,
  resource_type TEXT DEFAULT 'lesson' CHECK (resource_type IN ('lesson','assessment','material')),
  description TEXT,
  content TEXT,
  objectives TEXT[],
  materials TEXT[],
  duration_minutes INTEGER,
  tags TEXT[],
  difficulty TEXT CHECK (difficulty IN ('beginner','intermediate','advanced')),
  assigned_to_class_id UUID, -- optional single class reference
  assigned_to_classes UUID[], -- optional array (for convenience)
  due_date TIMESTAMPTZ,
  view_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  is_template BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Curriculum assignments (teacher assigns a lesson to a class)
CREATE TABLE IF NOT EXISTS public.curriculum_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  teacher_profile_id UUID REFERENCES public.teacher_profiles(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  subject TEXT,
  topics TEXT[],
  assigned_date TIMESTAMPTZ DEFAULT NOW(),
  due_date TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','completed','archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ASSESSMENTS & QUIZZES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_profile_id UUID REFERENCES public.teacher_profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  subject TEXT,
  assessment_type TEXT CHECK (assessment_type IN ('quiz','test','exam','assignment')),
  description TEXT,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_marks INTEGER DEFAULT 100,
  passing_marks INTEGER DEFAULT 50,
  duration_minutes INTEGER,
  is_timed BOOLEAN DEFAULT false,
  allow_retakes BOOLEAN DEFAULT true,
  max_attempts INTEGER DEFAULT 3,
  show_answers BOOLEAN DEFAULT true,
  shuffle_questions BOOLEAN DEFAULT false,
  assigned_to_classes UUID[],
  due_date TIMESTAMPTZ,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_profile_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE,
  quiz_type TEXT DEFAULT 'mini' CHECK (quiz_type IN ('mini','final','practice')),
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  percentage DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE WHEN total_questions > 0 THEN (score::DECIMAL / total_questions * 100) ELSE 0 END
  ) STORED,
  answers JSONB DEFAULT '{}'::jsonb,
  time_taken_seconds INTEGER,
  xp_earned INTEGER DEFAULT 0,
  attempt_number INTEGER DEFAULT 1,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STUDENT PROGRESS & GAMIFICATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.student_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_profile_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  curriculum_assignment_id UUID REFERENCES public.curriculum_assignments(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started','in_progress','completed')),
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  score INTEGER,
  xp_earned INTEGER DEFAULT 0,
  time_spent_minutes INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_profile_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  badge_type TEXT CHECK (badge_type IN ('bronze','silver','gold','platinum')),
  category TEXT CHECK (category IN ('streak','quiz','lesson','achievement','special')),
  xp_required INTEGER DEFAULT 0,
  criteria JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.student_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_profile_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_profile_id, badge_id)
);

CREATE TABLE IF NOT EXISTS public.daily_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_profile_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  challenge_type TEXT NOT NULL,
  challenge_title TEXT NOT NULL,
  challenge_description TEXT,
  target_value INTEGER,
  current_value INTEGER DEFAULT 0,
  xp_reward INTEGER DEFAULT 10,
  badge_id UUID REFERENCES public.badges(id) ON DELETE SET NULL,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  challenge_date DATE DEFAULT CURRENT_DATE,
  expires_at TIMESTAMPTZ DEFAULT (CURRENT_DATE + INTERVAL '1 day'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_profile_id, challenge_type, challenge_date)
);

CREATE TABLE IF NOT EXISTS public.xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_profile_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('quiz','lesson','challenge','streak','badge','bonus')),
  description TEXT,
  related_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TEACHER PROFESSIONAL DEVELOPMENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.teacher_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  difficulty TEXT CHECK (difficulty IN ('beginner','intermediate','advanced')),
  topics TEXT[],
  duration_hours DECIMAL(4,1),
  xp_reward INTEGER DEFAULT 100,
  prerequisites UUID[],
  is_published BOOLEAN DEFAULT true,
  order_index INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.teacher_module_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_profile_id UUID REFERENCES public.teacher_profiles(id) ON DELETE CASCADE,
  module_id UUID REFERENCES public.teacher_modules(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started','in_progress','completed')),
  progress_percentage INTEGER DEFAULT 0,
  quiz_score INTEGER,
  quiz_passed BOOLEAN DEFAULT false,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(teacher_profile_id, module_id)
);

CREATE TABLE IF NOT EXISTS public.teacher_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_profile_id UUID REFERENCES public.teacher_profiles(id) ON DELETE CASCADE,
  certificate_type TEXT DEFAULT 'course_completion',
  title TEXT NOT NULL,
  description TEXT,
  modules_completed UUID[],
  total_xp_earned INTEGER DEFAULT 0,
  certificate_number TEXT UNIQUE,
  issued_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ai_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_profile_id UUID REFERENCES public.teacher_profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  topic TEXT,
  subject TEXT,
  level TEXT,
  ai_prompt TEXT,
  ai_generated_content TEXT,
  difficulty TEXT CHECK (difficulty IN ('beginner','intermediate','advanced')),
  estimated_minutes INTEGER DEFAULT 10,
  xp_reward INTEGER DEFAULT 20,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Knowledge questions (linked to lessons)
CREATE TABLE IF NOT EXISTS public.ai_knowledge_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ai_lesson_id UUID REFERENCES public.ai_lessons(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options TEXT[] NOT NULL,
  correct_option TEXT NOT NULL,
  explanation TEXT,
  order_index INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student AI quiz progress
CREATE TABLE IF NOT EXISTS public.ai_lesson_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_profile_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  ai_lesson_id UUID REFERENCES public.ai_lessons(id) ON DELETE CASCADE,
  score INTEGER,
  total_questions INTEGER,
  passed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_profile_id, ai_lesson_id)
);

-- Concept explorer (for concept & career insights)
CREATE TABLE IF NOT EXISTS public.concept_explorer (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  concept_name TEXT NOT NULL,
  description TEXT,
  related_topics TEXT[],
  related_subjects TEXT[],
  potential_careers TEXT[],
  ai_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Materialized view: Class leaderboard by XP (if lessons table exists)
CREATE MATERIALIZED VIEW IF NOT EXISTS public.class_leaderboard AS
SELECT
  c.id AS class_id,
  c.name AS class_name,
  s.full_name AS student_name,
  SUM(sp.xp_earned) AS total_xp,
  COUNT(sp.lesson_id) AS lessons_completed
FROM public.student_progress sp
JOIN public.student_profiles s ON s.id = sp.student_id
JOIN public.lessons l ON l.id = sp.lesson_id
JOIN public.classes c ON c.id = l.class_id
GROUP BY c.id, c.name, s.full_name;

CREATE OR REPLACE FUNCTION public.award_xp_on_quiz()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.score IS NOT NULL THEN
    INSERT INTO public.xp_transactions (
      student_id, amount, source, description, related_id
    )
    VALUES (
      NEW.student_id, NEW.xp_earned, 'quiz', 'XP from quiz result', NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_award_xp ON public.quiz_results;
CREATE TRIGGER trg_award_xp
AFTER INSERT ON public.quiz_results
FOR EACH ROW EXECUTE FUNCTION public.award_xp_on_quiz();


DROP TRIGGER IF EXISTS trg_award_xp ON public.quiz_results;
CREATE TRIGGER trg_award_xp
AFTER INSERT ON public.quiz_results
FOR EACH ROW EXECUTE FUNCTION public.award_xp_on_quiz();

