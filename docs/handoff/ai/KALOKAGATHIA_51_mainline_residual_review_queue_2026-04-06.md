# KALOKAGATHIA mainline residual review queue

- 作成日: 2026-04-06
- revision: rev13
- 目的: patch 基盤完了後に、mainline 側へ残る review 対象だけを短く固定する。

## 1. 数字

- future-native families: 22
- direct patch candidates: 18
- direct review-ready: 17
- direct needs-review: 1
- specialist mainline-only: 4
- total residual review queue: 5
- review-ready families: 21 / 22 (95.45%)

## 2. needs-review

- volumetric-smoke: closureCandidate が review-ready ではないため mainline 判定前に単独統合しない

## 3. specialist-native mainline-only

- specialist-houdini-native: review-ready だが mainline-only のため最終 review は mainline owner AI が握る
- specialist-niagara-native: review-ready だが mainline-only のため最終 review は mainline owner AI が握る
- specialist-touchdesigner-native: review-ready だが mainline-only のため最終 review は mainline owner AI が握る
- specialist-unity-vfx-native: review-ready だが mainline-only のため最終 review は mainline owner AI が握る
