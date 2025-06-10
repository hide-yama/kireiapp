# チケット: 家族グループ機能の実装

## 概要
家族グループの作成、参加、管理機能を実装する

## 詳細タスク

### 1. グループ作成機能
- [x] `/app/(dashboard)/groups/create/page.tsx` の作成
- [x] グループ作成フォーム（名前、アバター画像URL）
- [x] 招待コードの自動生成（nanoid使用、8文字）
- [x] グループアバター画像のアップロード（URL入力形式）

### 2. グループ参加機能
- [x] `/app/(dashboard)/groups/join/page.tsx` の作成
- [x] 招待コード入力フォーム
- [x] グループ参加確認画面
- [x] 既存メンバーチェック（重複参加防止）

### 3. グループ一覧・詳細ページ
- [x] `/app/(dashboard)/groups/page.tsx` の作成（一覧）
- [x] `/app/(dashboard)/groups/[id]/page.tsx` の作成（詳細）
- [x] メンバー一覧表示
- [x] グループ統計情報（メンバー数）

### 4. グループ管理機能（オーナーのみ）
- [x] `/app/(dashboard)/groups/[id]/settings/page.tsx` の作成
- [x] グループ情報の編集
- [x] メンバーの削除
- [x] 招待コードの再生成

### 5. コンポーネント
- [x] `components/groups/GroupCard.tsx` の作成
- [x] `components/groups/MemberList.tsx` の作成
- [x] `components/groups/InvitationCode.tsx` の作成

### 6. API エンドポイント
- [x] `/app/api/groups/create/route.ts`
- [x] `/app/api/groups/join/route.ts`
- [x] `/app/api/groups/[id]/members/route.ts`
- [x] `/app/api/groups/[id]/settings/route.ts`

## 受け入れ条件
- [x] ユーザーがグループを作成できる
- [x] 招待コードでグループに参加できる
- [x] グループメンバーが一覧表示される
- [x] オーナーがグループを管理できる
- [x] 1ユーザーが複数グループに参加できる

## 実装完了日
2025年6月9日

## 追加実装内容
- nanoidパッケージを使用した8文字の招待コード生成
- メンバー数上限（20人）のチェック
- 招待コードのコピー機能
- レスポンシブ対応のUI
- エラーハンドリングの実装
- Row Level Security (RLS) によるデータ保護

## 技術的考慮事項
- 招待コードは一意で推測困難なものを生成
- グループアバターも Storage に保存
- グループ削除時の関連データの処理
- メンバー数の上限設定（例: 20人）