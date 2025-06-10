-- プロフィールのRLSポリシーを修正するSQLファイル
-- Supabaseのダッシュボード > Database > SQL Editorで実行してください

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON profiles;
DROP POLICY IF EXISTS "Profiles are viewable by self and group members" ON profiles;

-- 新しいポリシーを作成：同じグループのメンバーのプロフィールを見ることができる
CREATE POLICY "Profiles are viewable by group members" ON profiles
    FOR SELECT USING (
        -- 自分のプロフィール
        auth.uid() = id OR
        -- 同じグループのメンバーのプロフィール
        EXISTS (
            SELECT 1 FROM family_members fm1, family_members fm2 
            WHERE fm1.user_id = auth.uid() 
            AND fm2.user_id = profiles.id 
            AND fm1.group_id = fm2.group_id
        ) OR
        -- 自分がオーナーのグループのメンバーのプロフィール
        EXISTS (
            SELECT 1 FROM family_groups fg, family_members fm 
            WHERE fg.owner_id = auth.uid() 
            AND fm.group_id = fg.id 
            AND fm.user_id = profiles.id
        ) OR
        -- 投稿作成者のプロフィール（同じグループ内の投稿の場合）
        EXISTS (
            SELECT 1 FROM posts p, family_members fm1, family_members fm2
            WHERE p.user_id = profiles.id
            AND fm1.user_id = auth.uid()
            AND fm2.user_id = profiles.id
            AND fm1.group_id = p.group_id
            AND fm2.group_id = p.group_id
        )
    );

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);