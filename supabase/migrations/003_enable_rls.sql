-- Re-enable RLS for tables that were previously disabled
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_groups ENABLE ROW LEVEL SECURITY;

-- Recreate family_groups policies without infinite recursion
DROP POLICY IF EXISTS "Users can view groups they belong to" ON family_groups;
CREATE POLICY "Users can view groups they belong to" ON family_groups
  FOR SELECT USING (
    auth.uid() = owner_id OR
    id IN (
      SELECT group_id FROM family_members
      WHERE user_id = auth.uid()
    )
  );

-- Recreate family_members policies without infinite recursion
DROP POLICY IF EXISTS "Users can view members of their groups" ON family_members;
CREATE POLICY "Users can view members of their groups" ON family_members
  FOR SELECT USING (
    user_id = auth.uid() OR
    group_id IN (
      SELECT id FROM family_groups
      WHERE owner_id = auth.uid()
    )
  );

-- Allow users to join groups
DROP POLICY IF EXISTS "Users can join groups" ON family_members;
CREATE POLICY "Users can join groups" ON family_members
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Allow group owners to manage members
DROP POLICY IF EXISTS "Group owners can manage members" ON family_members;
CREATE POLICY "Group owners can manage members" ON family_members
  FOR ALL USING (
    group_id IN (
      SELECT id FROM family_groups
      WHERE owner_id = auth.uid()
    )
  );

-- Ensure profiles are accessible to group members
DROP POLICY IF EXISTS "Users can view profiles of group members" ON profiles;
CREATE POLICY "Users can view profiles of group members" ON profiles
  FOR SELECT USING (
    auth.uid() = id OR
    id IN (
      SELECT user_id FROM family_members
      WHERE group_id IN (
        SELECT group_id FROM family_members
        WHERE user_id = auth.uid()
      )
    )
  );