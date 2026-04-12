# KALOKAGATHIA truth sync patch suite

- 作成日: 2026-04-06
- 目的: root 正本 docs へ missing-layers overlay program の結果を同期するための patch 雛形を固定する。
- 対象: `CURRENT_STATUS.md`, `REVIEW.md`, `DOCS_INDEX.md`

---

## 1. この wave の位置づけ

ここでやるのは runtime 実装ではない。

- overlay 側で作った事実
- verify の通過状況
- direct patch candidate の到達点
- mainline review が必要な残件

を、root 正本 docs に戻すための closeout 前 patch 雛形を作る。

---

## 2. 生成される patch 雛形

### A. `CURRENT_STATUS.truth-sync.patch.md`

用途:
- patch overlay program 完了状態の同期
- verify matrix の同期
- truth sync gate の明示

### B. `REVIEW.truth-sync.patch.md`

用途:
- 2026-04-06 時点レビューの追加
- review-ready / needs-review / specialist queue の同期
- 残件の明示

### C. `DOCS_INDEX.truth-sync.patch.md`

用途:
- 新しい handoff/ai 文書群の入口追加
- generated/handoff/missing-layers 群の入口追加
- closeout runbook 参照口の追加

---

## 3. この wave でまだやらないこと

- `CURRENT_STATUS.md` 本体の直接書換
- `REVIEW.md` 本体の直接書換
- `DOCS_INDEX.md` 本体の直接書換
- specialist-native 4件の最終判定
- `volumetric-smoke` の最終確定

---

## 4. 完了条件

以下が揃えば、この wave は完了扱い。

1. truth-sync patch index json / md が生成されている
2. 3つの truth-sync patch 雛形が生成されている
3. verify script が pass する
4. overlay verify 群と同時実行しても破綻しない

---

## 5. 次の mainline 作業

この suite を使って mainline owner AI が行うことは次の3点。

1. root docs へ patch を実適用する
2. specialist-native 4件と `volumetric-smoke` の最終判定を確定する
3. closeout 後に docs truth を一本化する
