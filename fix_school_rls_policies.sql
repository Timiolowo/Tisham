-- FIX SCHOOL RLS POLICIES
-- Run this in your Supabase SQL Editor

-- =============================================
-- FIX SCHOOLS TABLE RLS POLICIES
-- =============================================

-- Drop existing policies on schools table
DROP POLICY IF EXISTS "Users can view schools" ON schools;
DROP POLICY IF EXISTS "School admins can view all schools" ON schools;
DROP POLICY IF EXISTS "Teachers can view their school" ON schools;

-- Create policies for schools table
-- 1. Users can view schools they are associated with
CREATE POLICY "Users can view their school" ON schools
    FOR SELECT USING (
        id IN (
            SELECT school_id 
            FROM profiles 
            WHERE id = auth.uid()
        )
    );

-- 2. School admins can view their school
CREATE POLICY "School admins can view their school" ON schools
    FOR SELECT USING (
        id IN (
            SELECT school_id 
            FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'school_admin'
        )
    );

-- 3. Teachers can view their school
CREATE POLICY "Teachers can view their school" ON schools
    FOR SELECT USING (
        id IN (
            SELECT school_id 
            FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'teacher'
        )
    );

-- =============================================
-- VERIFY POLICIES
-- =============================================

-- Check schools table policies
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
WHERE tablename = 'schools'
ORDER BY policyname;

-- Check profiles table policies  
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
WHERE tablename = 'profiles'
ORDER BY policyname;
