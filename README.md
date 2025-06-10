# キレイにできるもん

家族みんなで家事を共有・管理できるWebアプリケーションです。グループ機能で家族の家事活動を見える化し、お互いの頑張りを応援し合えます。

## 主な機能

- 🏠 **グループ機能**: 家族やグループ単位で家事を管理
- 📝 **投稿機能**: 家事の記録を写真付きで投稿
- 🔍 **フィルタリング**: グループ・カテゴリ別に投稿を絞り込み
- 📸 **画像アップロード**: 家事の様子を写真で記録（自動圧縮機能付き）
- 🔔 **通知機能**: グループ内の活動をリアルタイムで通知
- 📊 **ダッシュボード**: 今週の投稿数など活動状況を可視化
- 👤 **プロフィール管理**: アバター設定とニックネーム管理

## 技術スタック

- **フロントエンド**: Next.js 15.3.3 (App Router)
- **バックエンド**: Supabase (認証・データベース・ストレージ)
- **スタイリング**: Tailwind CSS v4
- **言語**: TypeScript
- **データベース**: PostgreSQL (Supabase)
- **認証**: Supabase Auth

## セットアップ

### 前提条件

- Node.js 18以上
- npm, yarn, pnpm, bun のいずれか

### インストール

1. リポジトリをクローン
```bash
git clone https://github.com/hide-yama/kireiapp.git
cd kireiapp
```

2. 依存関係をインストール
```bash
npm install
# または
yarn install
# または
pnpm install
# または
bun install
```

3. 環境変数を設定
`.env.local` ファイルを作成し、以下の変数を設定してください：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Supabaseプロジェクトの設定
- [Supabase](https://supabase.com)でプロジェクトを作成
- `supabase/migrations/001_initial_schema.sql` を実行してデータベーススキーマを構築
- ストレージバケット（`avatars`, `group-images`, `post-images`）を作成

5. 開発サーバーを起動
```bash
npm run dev
# または
yarn dev
# または
pnpm dev
# または
bun dev
```

[http://localhost:3000](http://localhost:3000) をブラウザで開いて確認してください。

## 使い方

1. **アカウント登録・ログイン**: メールアドレスで簡単登録
2. **グループ作成・参加**: 家族やチームのグループを作成、または招待コードで参加
3. **家事を投稿**: 料理、掃除、洗濯などの家事を写真付きで記録
4. **活動を共有**: グループメンバーの投稿にいいねやコメントで応援
5. **進捗を確認**: ダッシュボードで家族全体の家事活動を把握

## プロジェクト構成

```
kireiapp/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 認証関連ページ
│   ├── (dashboard)/       # メインアプリケーション
│   └── api/               # API Routes
├── components/            # Reactコンポーネント
├── lib/                   # ユーティリティ・設定
├── hooks/                 # カスタムReact Hooks
├── types/                 # TypeScript型定義
├── supabase/             # データベースマイグレーション
└── docs/                 # プロジェクトドキュメント
```

## 開発

アプリケーションの開発を継続する場合：

1. `app/page.tsx` を編集してページを変更
2. ファイルを保存すると自動でページが更新されます
3. 新しい機能は `docs/development-tickets/` の開発チケットを参考に

## フォント

このプロジェクトでは [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) を使用して [Geist](https://vercel.com/font) フォントを自動最適化・読み込みしています。

## デプロイ

### Vercelでのデプロイ（推奨）

1. [Vercel Platform](https://vercel.com/new) でプロジェクトをインポート
2. 環境変数を設定
3. デプロイ実行

詳細は [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) を参照してください。

## ライセンス

MIT License

## 貢献

プルリクエストやイシューは歓迎です。大きな変更を行う場合は、まずイシューを開いて相談してください。