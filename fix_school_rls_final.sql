-- FINAL RLS POLICIES FOR SCHOOLS TABLE
-- Run this in your Supabase SQL Editor

-- =============================================
-- ENABLE RLS ON SCHOOLS TABLE
-- =============================================
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;

-- =============================================
-- DROP EXISTING POLICIES
-- =============================================
DROP POLICY IF EXISTS "Users can view schools" ON schools;
DROP POLICY IF EXISTS "School admins can view all schools" ON schools;
DROP POLICY IF EXISTS "Teachers can view their school" ON schools;
DROP POLICY IF EXISTS "Users can view their school" ON schools;
DROP POLICY IF EXISTS "School admins can view their school" ON schools;
DROP POLICY IF EXISTS "Teachers can view their school" ON schools;

-- =============================================
-- CREATE NEW POLICIES
-- =============================================

-- 1. Everyone can view school information (but not school_code)
CREATE POLICY "Everyone can view school info" ON schools
    FOR SELECT USING (true);

-- 2. Only school admins can view school_code
-- This will be handled in the frontend by checking user role
-- The RLS policy allows everyone to see school data, but the frontend
-- will conditionally show/hide the school_code based on user role

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

-- Test the policy
SELECT 
    id,
    name,
    school_type,
    state,
    address,
    contact_email,
    contact_phone,
    school_code,  -- This will be visible to everyone, but frontend will hide it
    admin_name,
    created_at
FROM schools 
WHERE id = '6c6a5efc-d840-46d8-a2eb-8c54b215ebef';
