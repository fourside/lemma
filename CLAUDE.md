# Lemma

個人用CS自習プラットフォーム。

## 設計判断

- **シングルユーザー**: 認証（JWT）はアクセス制御のため。DB にユーザーIDによるスコーピングはない。
- **Workers 環境の制約**: bcrypt/argon2 は使えない。パスワードハッシュは Web Crypto API の PBKDF2。
- **Static/Dynamic 分離**: 教材（講義テキスト・音声・テスト問題プール）は事前バッチ生成して R2 に配置。採点・補講など学習者依存のものだけリアルタイム生成。詳細は PLAN.md。

## テスト

- **API テスト** (`vitest.config.workers.ts`): `@cloudflare/vitest-pool-workers` で実 D1 を使用。`setupTestEnv()` で cleanup + seed + token 取得。
- **フロントエンドテスト** (`vitest.config.ts`): jsdom 環境。SWR を `vi.mock` し、各ページコンポーネントの描画を Testing Library で検証。
- DB ロジックの単体テストには `node:sqlite` も検討可。
