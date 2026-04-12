# KALOKAGATHIA closeout patch application-ready suite

- date: 2026-04-06
- goal: truth-sync 雛形を 0 値のまま残さず、mainline owner AI が root 正本へ戻す直前までの apply-ready 状態へ引き上げる。

## 今回の前進

1. truth-sync patch index を実数で再生成する
2. `CURRENT_STATUS.md` / `REVIEW.md` / `DOCS_INDEX.md` 用 patch 本文を実数で固定する
3. base repo を汚さず、overlay 側に apply 後 preview を生成する
4. preview に対して機械 verify を通す

## この suite がやること

- future-native families 22/22 を正しく反映
- worker packet 26 を正しく反映
- low-risk bundle 9 を正しく反映
- family closure blueprint 22 を正しく反映
- direct patch candidate 18、review-ready 17、needs-review 1、specialist 4 を正しく反映
- closeout preview を `generated/handoff/missing-layers/closeout-preview-2026-04-06/` に出力

## この suite がやらないこと

- root 正本を直接編集しない
- manifest / registry / routing / runtime を変更しない
- specialist-native 4件の意味確定を代行しない
- `volumetric-smoke` を自動承認しない

## 完了条件

- truth-sync patch index の数値が 0 ではなく実数で固定される
- preview 3本が生成される
- closeout preview verify が pass する
- overlay verify 群と矛盾しない

## 次の mainline 作業

- preview 文面を root 正本へ反映
- `CURRENT_STATUS.md` / `REVIEW.md` / `DOCS_INDEX.md` を一本化
- specialist-native 4件と `volumetric-smoke` を最終 review で確定
