-- INVESTIGATE RLS RECURSION ON CLASSES TABLE
-- Run this in your Supabase SQL Editor to diagnose the issue

-- =============================================
-- STEP 1: CHECK CURRENT RLS STATUS
-- =============================================
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'classes';

-- =============================================
-- STEP 2: LIST ALL EXISTING POLICIES
-- =============================================
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

-- =============================================
-- STEP 3: CHECK FOR HIDDEN OR SYSTEM POLICIES
-- =============================================
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
WHERE tablename LIKE '%class%'
ORDER BY tablename, policyname;

-- =============================================
-- STEP 4: CHECK TABLE DEPENDENCIES
-- =============================================
-- Check what tables the classes table references
SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'classes';

-- =============================================
-- STEP 5: CHECK FOR RECURSIVE POLICY PATTERNS
-- =============================================
-- Look for policies that might reference the classes table
SELECT 
    schemaname,
    tablename,
    policyname,
    qual,
    with_check
FROM pg_policies 
WHERE (qual LIKE '%classes%' OR with_check LIKE '%classes%')
    AND tablename != 'classes'
ORDER BY tablename, policyname;

-- =============================================
-- STEP 6: CHECK CLASS_ENROLLMENTS TABLE POLICIES
-- =============================================
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
WHERE tablename = 'class_enrollments'
ORDER BY policyname;

-- =============================================
-- STEP 7: TEST SIMPLE QUERY
-- =============================================
-- Try a simple query to see if it works
SELECT 
    'Testing basic classes table access' as test,
    COUNT(*) as total_classes
FROM classes;

-- =============================================
-- STEP 8: CHECK FOR TRIGGERS
-- =============================================
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'classes';
