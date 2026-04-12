# KALOKAGATHIA truth sync closeout application plan

- 作成日: 2026-04-06
- 目的: truth-sync patch 雛形を root 正本へ戻す順番を固定する。

## 適用順

1. `DOCS_INDEX.truth-sync.patch.md`
2. `CURRENT_STATUS.truth-sync.patch.md`
3. `REVIEW.truth-sync.patch.md`
4. specialist-native 4件の最終判定
5. `volumetric-smoke` の最終判定
6. closeout 後の docs truth 一本化

## 理由

- 先に index を更新すると入口が増える
- 次に current status を同期すると現況が揃う
- review は最後でも意味が崩れにくい
- specialist / smoke は docs だけでは確定できないため最後に mainline review

## closeout 完了条件

- root 3文書へ同期済み
- overlay verify 群 pass
- future-native verify 群 pass
- final docs truth の参照順が一本化済み
- overlay 側の progress snapshot と root 正本の数値差分がない
