-- Fix Profile System Issues
-- This migration addresses the profile creation and RLS policy issues

-- Step 1: Create a function to automatically create profiles when users sign up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, nickname)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nickname', 'User'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Create a trigger to automatically create profiles on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Step 3: Fix RLS policies for profiles to allow group members to see each other's profiles
-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

-- Create new policies that allow profile visibility within groups
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view profiles of group members" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM family_members fm1
      JOIN family_members fm2 ON fm1.group_id = fm2.group_id
      WHERE fm1.user_id = auth.uid()
      AND fm2.user_id = profiles.id
    )
  );

-- Step 4: Create profiles for any existing users who don't have them
-- (This handles the case where users were created before the trigger)
INSERT INTO profiles (id, nickname)
SELECT 
  id, 
  COALESCE(raw_user_meta_data->>'nickname', 'User')
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;

-- Step 5: Add a policy to allow users to see profiles of post authors in their groups
-- This is specifically for the PostService use case
CREATE POLICY "Users can view profiles of post authors in their groups" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM posts p
      JOIN family_members fm ON p.group_id = fm.group_id
      WHERE p.user_id = profiles.id
      AND fm.user_id = auth.uid()
    )
  );