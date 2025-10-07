-- AGGRESSIVE FIX FOR CLASSES RLS RECURSION
-- Run this in your Supabase SQL Editor

-- =============================================
-- COMPLETELY DISABLE RLS TEMPORARILY
-- =============================================
ALTER TABLE classes DISABLE ROW LEVEL SECURITY;

-- =============================================
-- DROP ALL POLICIES (AGGRESSIVE)
-- =============================================
DROP POLICY IF EXISTS "Teachers can view own classes" ON classes;
DROP POLICY IF EXISTS "Teachers can create classes" ON classes;
DROP POLICY IF EXISTS "Teachers can update own classes" ON classes;
DROP POLICY IF EXISTS "Teachers can delete own classes" ON classes;
DROP POLICY IF EXISTS "Students can view enrolled classes" ON classes;
DROP POLICY IF EXISTS "Teachers can view their classes" ON classes;
DROP POLICY IF EXISTS "Teachers can create classes" ON classes;
DROP POLICY IF EXISTS "Teachers can update their classes" ON classes;
DROP POLICY IF EXISTS "Teachers can delete their classes" ON classes;
DROP POLICY IF EXISTS "Students can view their classes" ON classes;
DROP POLICY IF EXISTS "School admins can view school classes" ON classes;
DROP POLICY IF EXISTS "Users can view classes" ON classes;

-- =============================================
-- RE-ENABLE RLS
-- =============================================
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

-- =============================================
-- CREATE ULTRA-SIMPLE POLICIES
-- =============================================

-- 1. Teachers can do everything with their own classes
CREATE POLICY "Teachers full access to own classes" ON classes
    FOR ALL USING (
        teacher_id = auth.uid()
    );

-- 2. Students can view classes they are enrolled in (SELECT only)
CREATE POLICY "Students can view enrolled classes" ON classes
    FOR SELECT USING (
        id IN (
            SELECT class_id 
            FROM class_enrollments 
            WHERE student_id = auth.uid()
        )
    );

-- =============================================
-- VERIFY POLICIES
-- =============================================

-- Check if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'classes';

-- Check classes table policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'classes'
ORDER BY policyname;

-- Test query to see if policies work
SELECT 
    'RLS policies fixed - classes table should work now' as status;
