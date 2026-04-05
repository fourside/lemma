---
paths:
  - "src/front/**/*.tsx"
  - "src/front/**/*.css"
---

CSS は grid 優先。flex は wrap が必要な場合のみ。

CSS のマジックナンバーは global.css の変数（`--space-page`, `--font-size-*` 等）を使う。

フロントエンドテストは MSW を使わない。`vi.mock("swr")` でモックし Testing Library で検証する。
