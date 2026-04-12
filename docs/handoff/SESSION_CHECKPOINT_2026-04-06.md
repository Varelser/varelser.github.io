# SESSION CHECKPOINT 2026-04-06

## 概要
- 対象: manifest / project state 経路の止血と future-native suite 再現性の回復
- 方針: 「止血 → 再現性回復 → product 化 → 拡張」の順で mainline 幹線を優先する
- 参照: `docs/handoff/ai/` 配下の 3 本の AI handoff md

## 今回の mainline 修正
1. `lib/projectStateManifest.ts`
   - export surface を旧系ではなく新系 builder / normalizer へ揃えた
2. `lib/projectSerializationSnapshot.ts`
   - future-native specialist route controls と futureNative snapshot の roundtrip を保持するよう調整した
3. `lib/projectStateStorage.ts`
   - project state 保存/読込時に future-native specialist route / packet 情報が落ちないよう経路を補強した
4. `scripts/verify-future-native-safe-pipeline-suite.mjs`
5. `scripts/verify-future-native-artifact-suite.mjs`
   - suite 実行時の出力経路を安全側へ寄せた
6. `scripts/run-step-suite.mjs`
   - summary 起点で先頭 pass step を skip して再開できる resume support を追加した
7. `package.json`
   - `verify:future-native-safe-pipeline:resume` / `verify:future-native-artifact-suite:resume` を追加した

## この修正で確認できたこと
- `npm run verify:future-native-project-state-fast` pass
- `node scripts/run-ts-entry.mjs scripts/verify-future-native-specialist-routes-entry.ts` pass
- `node scripts/run-ts-entry.mjs scripts/verify-future-native-specialist-runtime-export-regression-entry.ts` pass
- `node scripts/verify-future-native-artifact-tail.mjs` pass
- `generated/future-native-suite-status/` の safe-pipeline / artifact suite summary を現結果ベースへ更新
- `STEP_SUITE_RESUME=1` 付き再実行で safe-pipeline / artifact suite の完走を確認

## 現時点の判断
- manifest 旧新二重化で起きていた project state fast roundtrip の崩れは止血済み
- specialist route / runtime export regression は manifest roundtrip / serialization roundtrip / control roundtrip とも安定
- 残る mainline 優先課題は future-native mainline product 化と live browser proof fixture 化

## 次の着手順
1. package class の canonical は `source-only` / `full-local-dev` / `platform-specific-runtime-bundled` に決定済み。旧 `source` / `full` / `partial-full` は alias 読み取りのみ維持する
2. `CURRENT_STATUS.md` / `REVIEW.md` / handoff docs を現物検証結果へ同期する
3. future-native を mainline workflow と preset / export / import / manifest / routing まで閉じる
4. その後に audio bulk edit / live browser proof / plugin contract へ進む
