-- FIX CLASSES TABLE RLS POLICIES
-- Run this in your Supabase SQL Editor

-- =============================================
-- DROP PROBLEMATIC POLICIES
-- =============================================

-- Drop all existing policies on classes table
DROP POLICY IF EXISTS "Teachers can view their classes" ON classes;
DROP POLICY IF EXISTS "Teachers can create classes" ON classes;
DROP POLICY IF EXISTS "Teachers can update their classes" ON classes;
DROP POLICY IF EXISTS "Teachers can delete their classes" ON classes;
DROP POLICY IF EXISTS "Students can view their classes" ON classes;
DROP POLICY IF EXISTS "School admins can view school classes" ON classes;
DROP POLICY IF EXISTS "Users can view classes" ON classes;

-- =============================================
-- CREATE SIMPLE POLICIES
-- =============================================

-- 1. Teachers can view their own classes
CREATE POLICY "Teachers can view own classes" ON classes
    FOR SELECT USING (
        teacher_id = auth.uid()
    );

-- 2. Teachers can create classes for their school
CREATE POLICY "Teachers can create classes" ON classes
    FOR INSERT WITH CHECK (
        teacher_id = auth.uid() AND
        school_id IN (
            SELECT school_id 
            FROM profiles 
            WHERE id = auth.uid()
        )
    );

-- 3. Teachers can update their own classes
CREATE POLICY "Teachers can update own classes" ON classes
    FOR UPDATE USING (
        teacher_id = auth.uid()
    );

-- 4. Teachers can delete their own classes
CREATE POLICY "Teachers can delete own classes" ON classes
    FOR DELETE USING (
        teacher_id = auth.uid()
    );

-- 5. Students can view classes they are enrolled in
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

-- Test the policy logic
SELECT 
    'Classes table policies created successfully' as status;
