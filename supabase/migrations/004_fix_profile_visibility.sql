-- Fix profile visibility to allow viewing profiles of users in the same groups

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

-- Create new policy that allows viewing profiles of users in the same groups
CREATE POLICY "Users can view profiles in same groups" ON profiles
  FOR SELECT USING (
    -- Users can always view their own profile
    auth.uid() = id
    OR
    -- Users can view profiles of members in their groups
    id IN (
      SELECT fm2.user_id 
      FROM family_members fm1
      JOIN family_members fm2 ON fm1.group_id = fm2.group_id
      WHERE fm1.user_id = auth.uid()
    )
  );

-- Also update the policy from migration 003 if it exists
DROP POLICY IF EXISTS "Users can view profiles of group members" ON profiles;