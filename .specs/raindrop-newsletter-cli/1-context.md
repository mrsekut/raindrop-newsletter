# Context Analysis

## Tech Stack

- **Runtime**: Bun (v1.3.9+)
- **Language**: TypeScript (strict mode, ESNext)
- **Interface**: CLI (stdout に出力)
- **External APIs**:
  - [Raindrop.io REST API](https://developer.raindrop.io) — ブックマーク取得
  - [OpenAI Codex SDK](https://github.com/openai/codex/tree/main/sdk/typescript) (`@openai/codex-sdk`) — コンテンツ要約生成

## Raindrop.io API

- **認証**: Test Token (Bearer token, 期限なし, 自分のアカウントのみ)
- **エンドポイント**: `GET /rest/v1/raindrops/{collectionId}`
  - `collectionId=0` で全コレクション取得
  - `perpage`: 最大 50 件/リクエスト
  - `page`: 0-indexed ページネーション
  - `sort`: `-created` (新しい順) など
- **Raindrop オブジェクト主要フィールド**:
  - `link`: URL
  - `title`: タイトル
  - `excerpt`: テキスト要約
  - `note`: ユーザーメモ
  - `tags`: タグ配列
  - `created`: 作成日時
  - `domain`: ドメイン
  - `type`: コンテンツタイプ

## OpenAI Codex SDK

- `@openai/codex-sdk` (Node.js 18+, Bun でも動作想定)
- `Codex` → `startThread()` → `thread.run(prompt, { outputSchema })` で構造化出力が可能
- Zod + `zod-to-json-schema` で型安全な出力スキーマ定義が可能
- スレッドは `~/.codex/sessions` に永続化される

## 既存コードベース

- `bun init` 直後の状態。実質的にコードなし (`index.ts` は `console.log` のみ)
- `tsconfig.json`: `include: ["src/**/*"]` → `src/` ディレクトリにコードを置く想定
- strict モード全開 (exactOptionalPropertyTypes, noUncheckedIndexedAccess 等)

## プロジェクト規約

- Bun ファースト (CLAUDE.md に明記)
  - `Bun.file` for file I/O
  - `.env` は Bun が自動読み込み (dotenv 不要)
- `bun test` でテスト

## 制約・注意点

- Raindrop API は 50 件/リクエストが上限 → ページネーション必須
- ~4000 アイテムが既に存在 → 全件取得は非現実的、差分取得が必須
- Codex SDK は Node.js 18+ 前提だが Bun との互換性は要確認
- `RAINDROP_TOKEN` と `OPENAI_API_KEY` を `.env` で管理
