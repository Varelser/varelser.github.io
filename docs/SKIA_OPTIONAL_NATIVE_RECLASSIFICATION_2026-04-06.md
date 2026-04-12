# skia-canvas optional-native reclassification (2026-04-06)

## 実施内容
- `skia-canvas` を `devDependencies` から `optionalDependencies` へ移動
- `package-lock.json` root package も optional-native 宣言へ同期
- `scripts/packageIntegrityShared.mjs` の critical package allowlist から `skia-canvas` を除外
- `scripts/generate-phase5-execution-readiness-report-entry.ts` を実態に合わせて更新

## 理由
- `verify:export` は `skia-canvas` が無くても `pngjs-harness` fallback で pass できる
- そのため `skia-canvas` を strict package integrity の必須集合に入れ続けると、宣言と runtime 実態がずれる

## 現在の扱い
- strict package integrity: root files / critical modules / zip structure を検証
- native export acceleration: host で `skia-canvas` が入っていれば利用
- native package 不在時: `verify:export` は `pngjs-harness` fallback を継続

## 期待効果
- `verify:package-integrity:strict` を repository truth に合わせられる
- handoff doctor / manifest / CURRENT_STATUS の説明と現物が一致する
