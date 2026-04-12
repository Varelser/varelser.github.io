# Package Class Policy — 2026-04-05

## 結論

今後は、配布物を一律に `full zip` と呼ばない。  
critical node_modules の有無と host 依存性に応じて、package class を明示する。

canonical 名は次の 3 種に固定する。

- `full-local-dev`
- `platform-specific-runtime-bundled`
- `source-only`

旧 `full` / `partial-full` / `source` は **読み取り互換 alias** としてのみ扱う。

## class 定義

### `full-local-dev`
- root files 完備
- critical node_modules 完備
- zip structure 正常
- 同一 host 系の local development をそのまま継続しやすい complete handoff

### `platform-specific-runtime-bundled`
- root files は揃う
- zip structure は正常
- critical node_modules の一部が欠ける、または host 依存 runtime を含みうる
- `--allow-partial` 指定時のみ生成可

### `source-only`
- node_modules 非同梱
- bootstrap 前提
- manifest で source-only であることを固定

## 運用ルール

1. `node scripts/package-full-zip.mjs` を通常経路とする
2. integrity failed 時は complete 扱いで package しない
3. やむを得ず出す場合のみ `node scripts/package-full-zip.mjs --allow-partial` を使う
4. handoff では zip 名と manifest の `packageClass` を必ず併記する
5. manifest には recovery plan を必ず含める
6. 新規出力は canonical 名を使い、旧 alias は docs の本文で正として再導入しない

## 現在の判定

2026-04-06 時点の受領環境は `platform-specific-runtime-bundled` 判定である。  
`skia-canvas` は optional-native dependency として再分類したため、package class 判定は root files / critical modules / zip structure を基準に行う。受領 zip ごとの差分は package integrity report を正とする。
