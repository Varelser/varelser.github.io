# FUTURE_NATIVE_RELEASE_CHECKLIST

## 目的
- future-native family の統合前に、最低限の確認順を固定する。
- specialist route 系の regression と handoff 生成を safe pipeline の外へ置き忘れないようにする。
- 毎回、specialist だけでなく future-native 全体の進捗文書も同時に更新する。

## 実行順
1. `npm run emit:future-native-artifact-suite`
2. `npm run verify:future-native-artifact-suite`

### 内訳
- `emit:future-native-artifact-suite`
  - `npm run emit:future-native-report`
  - `npm run emit:future-native-specialist-handoff`
  - `npm run emit:future-native-specialist-family-previews`
  - `npm run emit:future-native-family-previews`
  - `npm run package:future-native-source-only`
  - `npm run emit:future-native-generated-artifact-inventory`
- `verify:future-native-artifact-suite`
  - `npm run typecheck`
  - `npm run inspect:project-health`
  - `npm run verify:future-native-safe-pipeline:full`
  - `npm run verify:future-native-project-snapshots`
  - `npm run verify:future-native-family-preview-surfaces`
  - `npm run verify:future-native-specialist-family-previews`
  - `npm run verify:future-native-source-only-artifacts`

## safe pipeline に含まれるもの

### fast
- `npm run verify:future-native-guardrails`
- `npm run verify:future-native-scene-bindings`
- `npm run verify:future-native-volumetric-routes`
- `npm run verify:future-native-nonvolumetric-routes`

### full
- `npm run verify:future-native-safe-pipeline:fast`
- `npm run verify:future-native-render-handoff`
- `npm run verify:project-state`
- `npm run verify:future-native-specialist-routes`
- `npm run verify:future-native-specialist-runtime-export-regression`

### breakdown
- `npm run verify:future-native-safe-pipeline-breakdown`
- 環境変数: `FUTURE_NATIVE_VERIFY_TIMEOUT_MS`, `FUTURE_NATIVE_VERIFY_BREAK_ON_FAILURE=1`

## 生成・確認する文書
- `docs/handoff/FUTURE_NATIVE_RELEASE_REPORT.md`
- `docs/handoff/SESSION_CHECKPOINT_2026-04-05.md`
- `docs/handoff/archive/FUTURE_NATIVE_SPECIALIST_ROUTE_WARNING_SUMMARY_2026-04-05.md`
- `docs/handoff/archive/FUTURE_NATIVE_RELEASE_TREND_2026-04-05.md`
- `docs/handoff/archive/FUTURE_NATIVE_SPECIALIST_ROUTE_WARNING_TREND_2026-04-05.md`
- `docs/handoff/archive/INDEX.md`
- `docs/handoff/archive/generated/future-native-release-report/future-native-release-report.json`
- `docs/handoff/archive/generated/future-native-release-report/future-native-release-report.md`
- `docs/handoff/archive/generated/future-native-release-report/future-native-release-trend-history.json`
- `docs/handoff/archive/generated/future-native-release-report/future-native-release-trend-comparison.json`
- `docs/handoff/archive/generated/future-native-release-report/future-native-release-trend-comparison.md`
- `docs/handoff/archive/generated/future-native-specialist-handoff/future-native-specialist-handoff.json`
- `docs/handoff/archive/generated/future-native-specialist-handoff/future-native-specialist-warning-trend-history.json`
- `docs/handoff/archive/generated/future-native-specialist-handoff/future-native-specialist-warning-trend-comparison.json`
- `docs/handoff/archive/generated/future-native-release-report/future-native-generated-artifact-inventory.json`
- `docs/handoff/archive/generated/future-native-release-report/future-native-generated-artifact-inventory.md`
- `docs/handoff/archive/generated/future-native-source-only-package/future-native-source-only.zip`
- `docs/handoff/archive/generated/future-native-source-only-package/future-native-source-only-manifest.json`
- `docs/handoff/archive/generated/future-native-source-only-package/future-native-source-only-manifest.md`
- `docs/handoff/archive/generated/future-native-source-only-package/future-native-source-only-rehydration-report.json`
- `docs/handoff/archive/generated/future-native-source-only-package/future-native-source-only-rehydration-report.md`

## 運用ルール
- `typecheck` / `inspect:project-health` が通っていない状態では handoff を更新しない。
- 全体再生成は `npm run emit:future-native-artifact-suite` を正本とする。
- 全体検証は `npm run verify:future-native-artifact-suite` を正本とする。
- 重い検証の内訳確認は `npm run verify:future-native-safe-pipeline-breakdown` を使う。
- specialist route の数値を見直したら、artifact suite を再実行して archive 側を同期する。
- `docs/handoff/archive/generated/**` は手編集しない。
- package 同梱の `node_modules` を使い回す場合は OS 差異に注意し、配布前は `npm ci` 再構成可能な状態を優先する。

- source-only 配布時の除外物と復旧手順は `docs/handoff/FUTURE_NATIVE_SOURCE_ONLY_DISTRIBUTION.md` を正本とする。

## source-only 復旧の最短順
- 同梱しない: `node_modules/`, `dist/`, `tmp/`, `.tmp-*`
- 復旧順: `npm run bootstrap` → `npm run doctor:tooling` → `npm run emit:future-native-artifact-suite` → `npm run verify:future-native-artifact-suite`
- 詳細ルールの正本は `docs/handoff/FUTURE_NATIVE_SOURCE_ONLY_DISTRIBUTION.md`

## source-only clean-host 検証
- source-only zip を isolated directory へ新規展開し、`npm ci --no-audit --no-fund` による bootstrap 成功を確認済み。
- 同じ isolated tree で `typecheck` → `inspect:project-health` → `verify:future-native-project-state-fast` → `verify:future-native-specialist-routes` → `verify:future-native-specialist-runtime-export-regression` → `package:future-native-source-only` → `emit:future-native-generated-artifact-inventory` → `verify:future-native-source-only-artifacts` を通過確認済み。
- 前提として `package-lock.json` の `resolved` URL は public npm registry (`registry.npmjs.org`) へ正規化している。
- 記録は `docs/handoff/archive/generated/future-native-source-only-package/future-native-source-only-rehydration-report.md` を正本とする。

- suite 実行の途中経過と最終結果は `generated/future-native-suite-status/` の JSON summary（emit core / emit tail / emit suite を含む） を参照する。

- suite 実行後は `docs/handoff/archive/FUTURE_NATIVE_SUITE_STATUS_2026-04-05.md` と `docs/handoff/archive/generated/future-native-suite-status/future-native-suite-status-summary.{json,md}` を確認し、step duration / failedStep / runningStep が期待どおりであることを残す。

- `emit:future-native-artifact-suite` は `emit:future-native-artifact-core` と `emit:future-native-artifact-tail` を段階 child-process で束ねる。

- `emit:future-native-family-previews` は `docs/handoff/archive/generated/future-native-specialist-handoff/future-native-specialist-family-previews.json` があればそれを再利用し、specialist preview の重複再計算を避ける。

- `emit:future-native-specialist-family-previews` は `docs/handoff/archive/generated/future-native-specialist-handoff/future-native-specialist-handoff.json` があれば route stability / warning 情報を再利用し、specialist preview の重複比較計算を避ける。

- `emit:future-native-artifact-suite` は `emit:future-native-suite-status-report` の後に `package:future-native-source-only` と `emit:future-native-generated-artifact-inventory` を再実行し、suite status summary を含んだ最新 source-only package / inventory を一発で揃える。
