# キレイにできるもん - 家事承認欲求アプリ 要件定義

## 1. プロジェクト概要

「キレイにできるもん」は、家族間での家事の共有と感謝を促進するアプリケーションです。家事を写真付きで投稿し、家族からいいねやコメントをもらうことで承認欲求を満たし、家族間のコミュニケーションを活性化させます。

## 2. 目的

- 家事の可視化と家族全員での家事の共有
- 家事に対する感謝の気持ちを表現できる場の提供
- 家族間のコミュニケーション促進
- 家事の負担感を軽減し、モチベーションを向上

## 3. ターゲットユーザー

- 家族で暮らしている人々
- 家事の負担や不平等感を感じている家族
- 家族間のコミュニケーションを増やしたい人々

## 4. 機能要件

### 4.1 ユーザー管理機能

- ユーザー登録・ログイン（メールアドレス認証）
- プロフィール作成・編集（ニックネーム、アバター画像）

### 4.2 家族グループ機能

- 家族グループの作成
- 招待コードによる家族メンバーの招待
- グループ情報の管理（名前、アバター画像）

### 4.3 家事投稿機能

- 家事内容のテキスト投稿
- 写真付き投稿（複数画像対応）
- 家事カテゴリの選択（料理、掃除、洗濯、買い物、その他）
- 場所や所要時間の記録

### 4.4 インタラクション機能

- 投稿へのいいね
- 投稿へのコメント
- 通知機能（いいね、コメント、新規投稿）

### 4.5 ダッシュボード機能

- 最近の投稿表示
- 参加中の家族グループ表示
- クイックアクション（投稿作成、グループ管理）

## 5. 非機能要件

### 5.1 セキュリティ

- プライバシー保護（家族グループは招待制で完全非公開）
- ユーザー認証の安全性確保
- データの暗号化

### 5.2 パフォーマンス

- 画像の最適化
- 高速なページ読み込み
- モバイルデバイスでの操作性

### 5.3 ユーザビリティ

- シンプルで直感的なUI/UX
- レスポンシブデザイン
- アクセシビリティへの配慮

## 6. 技術スタック

- フロントエンド: Next.js, React, TypeScript
- UIライブラリ: TailwindCSS, shadcn/ui
- バックエンド: Supabase (認証, データベース, ストレージ)
- データベース: PostgreSQL (Supabase経由)
- ストレージ: Supabase Storage
- フォーム管理: React Hook Form, Zod
- 日付管理: date-fns

## 7. データモデル

### プロフィール (profiles)
- id: ユーザーID (UUID)
- nickname: ニックネーム
- avatar_url: アバター画像URL
- created_at: 作成日時

### 家族グループ (family_groups)
- id: グループID (UUID)
- name: グループ名
- avatar_url: アバター画像URL
- invitation_code: 招待コード
- owner_id: オーナーID
- created_at: 作成日時

### 家族メンバー (family_members)
- group_id: グループID
- user_id: ユーザーID
- role: 役割 ('owner' | 'member')
- joined_at: 参加日時

### 投稿 (posts)
- id: 投稿ID (UUID)
- group_id: グループID
- user_id: ユーザーID
- body: 投稿内容
- category: カテゴリ
- place: 場所 (オプション)
- time_spent: 所要時間 (オプション)
- created_at: 作成日時

### 投稿画像 (post_images)
- id: 画像ID (UUID)
- post_id: 投稿ID
- storage_path: ストレージパス
- position: 表示順
- created_at: 作成日時

### いいね (likes)
- post_id: 投稿ID
- user_id: ユーザーID
- created_at: 作成日時

### コメント (comments)
- id: コメントID (UUID)
- post_id: 投稿ID
- user_id: ユーザーID
- body: コメント内容
- created_at: 作成日時
- is_deleted: 削除フラグ

### 通知 (notifications)
- id: 通知ID (UUID)
- user_id: ユーザーID
- type: 通知タイプ ('like' | 'comment' | 'post')
- post_id: 投稿ID (オプション)
- from_user_id: 送信ユーザーID (オプション)
- read: 既読フラグ
- created_at: 作成日時

## 8. デプロイメント

- ホスティング: Vercel
- データベース・ストレージ: Supabase