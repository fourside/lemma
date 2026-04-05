# Lemma

個人用CS自習プラットフォーム。

## コード検証

編集後は以下を実行して問題がないことを確認する:

1. `npx tsc --noEmit` — 型チェック
2. `npm run lint:fix` — Biome lint + format
3. `npm run test:all` — フロントエンド + API テスト
4. `npm run knip` — 未使用 export / 依存の検出

## 設計判断

- **シングルユーザー**: 認証（JWT）はアクセス制御のため。DB にユーザーIDによるスコーピングはない。
- **Workers 環境の制約**: bcrypt/argon2 は使えない。パスワードハッシュは Web Crypto API の PBKDF2。
- **Valibot が型の源泉**: models/ の Valibot スキーマから `InferOutput` で型を導出する。interface を直接定義しない。テストのレスポンス検証にも `v.parse()` を使う。
- **Static/Dynamic 分離**: 教材（講義テキスト・音声・テスト問題プール）は事前バッチ生成して R2 に配置。採点・補講など学習者依存のものだけリアルタイム生成。詳細は PLAN.md。

## 禁止事項

- `as` type assertion、`!` non-null assertion は使わない。型ガードや `satisfies never` で対処する。
- MSW は使わない。フロントエンドテストは `vi.mock("swr")` でモック。
- npm パッケージの追加は `npm install <pkg>` コマンドで行う。package.json を直接編集しない。

## 規約

- CSS は grid 優先。flex は wrap が必要な場合のみ。
- CSS のマジックナンバーは global.css の変数（`--space-page`, `--font-size-*` 等）を使う。
- DB カラムは snake_case、TypeScript は camelCase。ルートハンドラで変換。
- switch で union 型を分岐する場合は `default: throw new Error(... satisfies never)` で exhaustive check。

## テスト

- **API テスト** (`vitest.config.workers.ts`): `@cloudflare/vitest-pool-workers` で実 D1 を使用。`setupTestEnv()` で cleanup + seed + token 取得。
- **フロントエンドテスト** (`vitest.config.ts`): jsdom 環境。SWR を `vi.mock` し、各ページコンポーネントの描画を Testing Library で検証。
- DB ロジックの単体テストには `node:sqlite` も検討可。
