# Lemma

個人用CS自習プラットフォーム。

## 設計判断

- **シングルユーザー**: 認証（JWT）はアクセス制御のため。DB にユーザーIDによるスコーピングはない。
- **Workers 環境の制約**: bcrypt/argon2 は使えない。パスワードハッシュは Web Crypto API の PBKDF2。
- **Static/Dynamic 分離**: 教材（講義テキスト・音声・テスト問題プール）は事前バッチ生成して R2 に配置。採点・補講など学習者依存のものだけリアルタイム生成。詳細は PLAN.md。

## コンテンツ生成の運用

Workers に Claude API キーは持たせていない。すべてローカルで生成する。

### テキスト・テスト問題の生成

```bash
./scripts/generate-lecture.sh <course_id> <week_number> [audio|text|test|all]
./scripts/batch-generate.sh <phase_number>   # Phase 単位で一括
./scripts/content-status.sh                  # 生成状況の確認
```

`claude -p`（OAuth2）で生成し `out/` に出力される。

### R2・D1 への反映

```bash
./scripts/upload-to-r2.sh --remote           # out/ の全ファイルを R2 にアップロード
```

講義テキストを D1 に登録する（Week 詳細画面で表示するため）:
```bash
CONTENT=$(cat out/lectures/course1-week1-text.md | sed "s/'/''/g")
npx wrangler d1 execute lemma --remote --command="INSERT INTO lecture_texts ..."
```

## テスト

- **API テスト** (`vitest.config.workers.ts`): `@cloudflare/vitest-pool-workers` で実 D1 を使用。`setupTestEnv()` で cleanup + seed + token 取得。
- **フロントエンドテスト** (`vitest.config.ts`): jsdom 環境。SWR を `vi.mock` し、各ページコンポーネントの描画を Testing Library で検証。
- DB ロジックの単体テストには `node:sqlite` も検討可。
