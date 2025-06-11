# Playwright MCP セットアップガイド

## 1. 自動インストール方法

ターミナルで以下のコマンドを実行：

```bash
npx @smithery/cli install @executeautomation/playwright-mcp-server --client claude
```

質問が表示されたら：
- 使用データ送信の質問: `n` を入力（任意）
- その他の質問は基本的にデフォルトでOK

## 2. 手動設定方法（推奨）

### ステップ1: 設定ファイルの作成

1. Finderを開く
2. `Cmd + Shift + G` を押して、以下のパスを入力：
   ```
   ~/Library/Application Support/
   ```
3. `Claude` フォルダを作成（存在しない場合）

### ステップ2: 設定ファイルの編集

`claude_desktop_config.json` ファイルを作成し、以下の内容を追加：

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@executeautomation/playwright-mcp-server"],
      "env": {
        "PLAYWRIGHT_HEADLESS": "false"
      }
    }
  }
}
```

### ステップ3: 依存関係のインストール

プロジェクトディレクトリで実行：

```bash
npm install -D @playwright/test
npx playwright install chromium
```

## 3. 動作確認

Claude Codeを再起動後、以下のようなコマンドが使えるようになります：

- 「localhost:3000を開いてスクリーンショットを撮って」
- 「サインアップページでテストユーザーを登録して」
- 「投稿作成から表示までの流れをテストして」

## 4. トラブルシューティング

### 設定ファイルが見つからない場合

macOSの場合：
```bash
mkdir -p ~/Library/Application\ Support/Claude
touch ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

### Playwrightがインストールされない場合

グローバルインストール：
```bash
npm install -g @executeautomation/playwright-mcp-server
```

## 5. プロジェクト固有の設定

kireiappプロジェクトで使用する場合：

1. プロジェクトルートで実行：
   ```bash
   npm install -D @playwright/test
   npx playwright install
   ```

2. テスト例：
   ```bash
   # 開発サーバーを起動
   npm run dev
   
   # Claude Codeで指示
   # 「localhost:3000でユーザー登録のE2Eテストを実行して」
   ```

## 参考リンク

- [Playwright MCP Server Documentation](https://executeautomation.github.io/mcp-playwright/docs/intro)
- [Claude MCP Servers](https://www.claudemcp.com/servers/playwright)