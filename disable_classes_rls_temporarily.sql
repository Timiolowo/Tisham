-- TEMPORARILY DISABLE RLS ON CLASSES TABLE
-- Run this in your Supabase SQL Editor

-- =============================================
-- COMPLETELY DISABLE RLS ON CLASSES TABLE
-- =============================================
ALTER TABLE classes DISABLE ROW LEVEL SECURITY;

-- =============================================
-- DROP ALL POLICIES (COMPLETE CLEANUP)
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
DROP POLICY IF EXISTS "Teachers full access to own classes" ON classes;
DROP POLICY IF EXISTS "Students can view enrolled classes" ON classes;

-- =============================================
-- VERIFY RLS IS DISABLED
-- =============================================

-- Check if RLS is disabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'classes';

-- Check that no policies exist
SELECT 
    schemaname,
    tablename,
    policyname
FROM pg_policies 
WHERE tablename = 'classes';

-- Test message
SELECT 
    'RLS disabled on classes table - class creation should work now' as status;
