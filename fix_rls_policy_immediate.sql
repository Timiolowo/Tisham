-- IMMEDIATE FIX: Drop the problematic RLS policy
-- Run this in your Supabase SQL Editor

-- Drop the policy causing infinite recursion
DROP POLICY IF EXISTS "School admins can view school profiles" ON profiles;

-- Create a simple policy that doesn't cause recursion
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Verify the policies are working
SELECT * FROM pg_policies WHERE tablename = 'profiles';
