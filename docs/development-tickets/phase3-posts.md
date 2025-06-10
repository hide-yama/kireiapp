# チケット: 家事投稿機能の実装

## 概要
家事の投稿作成、表示、管理機能を実装する

## 詳細タスク

### 1. 投稿作成機能
- [x] `/app/(dashboard)/posts/create/page.tsx` の作成
- [x] 投稿フォームの実装
  - テキスト入力（必須）
  - カテゴリ選択（料理、掃除、洗濯、買い物、その他）
  - 場所入力（オプション）
  - 所要時間入力（オプション）
- [x] 複数画像アップロード機能（最大4枚）
- [x] 画像のプレビュー・削除機能

### 2. 投稿一覧表示
- [x] `/app/(dashboard)/posts/page.tsx` の作成
- [x] グループ内の投稿一覧表示
- [ ] 無限スクロール実装
- [x] フィルター機能（カテゴリ、期間）

### 3. 投稿詳細ページ
- [x] `/app/(dashboard)/posts/[id]/page.tsx` の作成
- [x] 投稿内容の表示
- [x] 画像のスライドショー
- [x] 投稿者情報の表示

### 4. 投稿編集・削除
- [x] `/app/(dashboard)/posts/[id]/edit/page.tsx` の作成
- [x] 投稿編集フォーム
- [x] 投稿削除確認ダイアログ
- [x] 関連画像の削除処理

### 5. コンポーネント
- [x] `components/posts/PostCard.tsx` の作成
- [x] `components/posts/PostForm.tsx` の作成
- [x] `components/posts/ImageUploader.tsx` の作成
- [x] `components/posts/CategoryBadge.tsx` の作成

### 6. API エンドポイント
- [x] `/app/api/posts/create/route.ts`
- [x] `/app/api/posts/[id]/route.ts` (GET/PUT/DELETE)
- [x] `/app/api/posts/route.ts` (一覧取得)
- [x] `/app/api/posts/images/route.ts` (画像アップロード・削除)

## 受け入れ条件
- [x] ユーザーが家事投稿を作成できる
- [x] 投稿に複数の画像を添付できる
- [x] グループ内の投稿が一覧表示される
- [x] 投稿をカテゴリでフィルタリングできる
- [x] 自分の投稿を編集・削除できる

## 技術的考慮事項
- [x] 画像は投稿ごとにフォルダ分けして Storage に保存
- [ ] 画像の最適化（WebP変換、リサイズ）
- [x] 投稿削除時の画像も同時削除
- [x] パフォーマンスを考慮した一覧表示

## 実装状況
**完了日**: 2025/6/9

**実装済み機能**:
- 家事投稿の作成・編集・削除
- 複数画像アップロード（最大4枚）
- カテゴリ別フィルター機能
- 画像スライドショー表示
- 権限管理（投稿者のみ編集可能）
- レスポンシブUI

**残作業**:
- 無限スクロール実装
- 画像最適化処理