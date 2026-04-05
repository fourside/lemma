`as` type assertion と `!` non-null assertion は使わない。型ガード、optional chaining、`satisfies never` で対処する。

models/ の Valibot スキーマから `InferOutput` で型を導出する。interface を直接定義しない。テストのレスポンス検証にも `v.parse()` を使う。

switch で union 型を分岐する場合は `default: throw new Error(... satisfies never)` で exhaustive check。
