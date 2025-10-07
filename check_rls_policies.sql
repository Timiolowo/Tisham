-- CHECK CURRENT RLS POLICIES
-- Run this in your Supabase SQL Editor to see what policies exist

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

-- Check if RLS is enabled on schools table
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'schools';

-- Test the policy logic manually
SELECT 
    p.id as profile_id,
    p.role,
    p.school_id,
    s.id as school_id_from_schools,
    s.name as school_name
FROM profiles p
LEFT JOIN schools s ON p.school_id = s.id
WHERE p.id = '8a7e94b5-4d64-46b2-82ac-f02f76938c75';
