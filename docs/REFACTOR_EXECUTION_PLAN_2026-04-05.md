# Refactor Execution Plan — 2026-04-05

## 判定
- Task 5 は妥当で、現状に対してすぐ適用可能。
- Task 9 は妥当で、配布再現性問題を減らすため先行実施が有効。
- Task 2 は一部修正が必要だった。`motionCatalog` はすでに `components/motionCatalog.ts` から `lib/motionGrouping.ts` 参照へ寄っているため追加移動は不要。今回は reverse dependency が残っていた `MOTION_MAP` と control panel shared types だけを整理した。
- Task 4 / Task 1 / Task 3 / Task 6 / Task 7 / Task 8 は現物依存の追跡量が多く、今回の変更からは分離して次段で扱う。

## 今回実施
1. `CURRENT_STATUS.md` を current snapshot へ整理し、履歴を `docs/archive/status-history.md` へ退避。
2. `MOTION_MAP` を `lib/motionMap.ts` へ移し、`lib -> components` 逆参照を縮小。
3. shared control panel types を `types/controlPanel.ts` へ切り出し、`lib` 側 import を更新。
4. `npm run package:source-zip` を追加し、`node_modules` / `dist` を除外した軽量 ZIP を生成可能にした。
