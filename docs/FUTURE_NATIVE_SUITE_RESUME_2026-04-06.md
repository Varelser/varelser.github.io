# Future-native suite resume support (2026-04-06)

## 目的
長い suite が途中停止した場合でも、すでに pass 済みの step を再実行せず、summary を起点に残りだけ再開できるようにする。

## 対象
- `scripts/run-step-suite.mjs`
- `scripts/verify-future-native-safe-pipeline-suite.mjs`
- `scripts/verify-future-native-artifact-suite.mjs`
- `package.json`

## 仕様
- `STEP_SUITE_RESUME=1` を付けて suite を再実行すると、
  `generated/future-native-suite-status/<title>.json` を読む。
- 先頭から連続して `pass` になっている step は skip し、
  最初の未完 step から再開する。
- summary には以下を残す。
  - `resumed`
  - `resumedStepCount`
  - `resumedFromStartedAt`

## 追加した実行コマンド
- `npm run verify:future-native-safe-pipeline:resume`
- `npm run verify:future-native-artifact-suite:resume`

## 2026-04-06 時点の確認
1. `verify-future-native-safe-pipeline-suite` の途中 summary から再開して pass を確認
2. `verify-future-native-artifact-suite` を `STEP_SUITE_RESUME=1` 付きで再実行し、summary ベースで pass を確認
3. `generated/future-native-suite-status/verify-future-native-safe-pipeline-suite.json`
   と `verify-future-native-artifact-suite.json` は、resume 情報付きの現結果へ更新済み

## 運用ルール
- 長い suite が途中停止した場合、まず summary を確認する
- 先頭 pass 群が残っている場合は resume コマンドを使う
- summary が壊れている場合だけ削除して最初からやり直す
