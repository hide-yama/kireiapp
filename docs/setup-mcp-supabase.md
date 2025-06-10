# Supabase MCP サーバーセットアップガイド

## MCP (Model Context Protocol) とは

MCPは、AIアシスタントが外部ツールやサービスと連携するためのプロトコルです。Supabase MCPサーバーを使用すると、Claude Codeから直接Supabaseのデータベース操作やクエリ実行が可能になります。

## セットアップ手順

### 1. Claude Code の設定ファイルを確認

Claude Code の MCP 設定は以下の場所にあります：

**macOS/Linux:**
```bash
~/.config/claude/claude_desktop_config.json
```

**Windows:**
```
%APPDATA%\Claude\claude_desktop_config.json
```

### 2. Supabase MCP サーバーの設定を追加

設定ファイルを開いて、以下のような構造で Supabase MCP サーバーを追加します：

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-supabase",
        "--supabase-url",
        "https://uhokimvcyycddvcqdxml.supabase.co",
        "--supabase-key",
        "YOUR_SUPABASE_SERVICE_ROLE_KEY"
      ]
    }
  }
}
```

### 3. Service Role Key の取得

1. [Supabase Dashboard](https://supabase.com/dashboard) にログイン
2. プロジェクトを選択
3. 左メニューの「Settings」→「API」を選択
4. 「Service Role Key」をコピー（これは秘密鍵なので取り扱い注意）

### 4. 設定ファイルの更新

上記の設定で `YOUR_SUPABASE_SERVICE_ROLE_KEY` を実際の Service Role Key に置き換えます。

### 5. Claude Code を再起動

設定を反映させるために Claude Code を完全に終了して再起動します。

## 利用可能な機能

Supabase MCP サーバーを設定すると、以下のような操作が可能になります：

### データベース操作
- テーブルの作成・更新・削除
- データの挿入・更新・削除
- クエリの実行

### 利用例
```sql
-- テーブルの作成
CREATE TABLE example (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- データの挿入
INSERT INTO example (name) VALUES ('Test');

-- データの取得
SELECT * FROM example;
```

## セキュリティに関する注意事項

⚠️ **重要**: Service Role Key は管理者権限を持つため、以下の点に注意してください：

1. **ローカル開発環境でのみ使用** - 本番環境では使用しない
2. **設定ファイルを Git にコミットしない** - `.gitignore` に追加
3. **他人と共有しない** - Service Role Key は秘密情報

## トラブルシューティング

### MCP サーバーが認識されない場合

1. 設定ファイルの JSON 構文が正しいか確認
2. Claude Code を完全に再起動（プロセスを終了してから起動）
3. コマンドラインで以下を実行して、パッケージが利用可能か確認：
   ```bash
   npx -y @modelcontextprotocol/server-supabase --help
   ```

### 接続エラーが発生する場合

1. Supabase URL が正しいか確認
2. Service Role Key が正しいか確認
3. インターネット接続を確認

## 代替方法

MCP サーバーを使用しない場合でも、以下の方法で Supabase を操作できます：

1. **Supabase Dashboard** - Web UI から直接操作
2. **SQL Editor** - Dashboard 内の SQL エディタを使用
3. **Supabase CLI** - コマンドラインツールを使用
4. **アプリケーションコード** - 作成したアプリから API 経由で操作