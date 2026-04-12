# KALOKAGATHIA worker evidence packet suite

- 作成日: 2026-04-06
- 目的: Wave 2 で必要な **worker 実働用 packet 群** を additive patch として先に作る
- 位置づけ: official ledger の正本確定ではなく、worker AI が evidence を回収して mainline に戻すための雛形

---

## 1. 今回追加したもの

- `scripts/generate-missing-layers-worker-packets.mjs`
- `scripts/verify-missing-layers-worker-packets.mjs`
- `generated/handoff/missing-layers/worker-evidence-matrix-2026-04-06.json`
- `generated/handoff/missing-layers/worker-evidence-matrix-2026-04-06.md`
- `generated/handoff/missing-layers/worker-packets-2026-04-06/`

---

## 2. これでできること

### 2-1. family ごとの worker packet 自動生成

各 future-native family について、次を含む packet を出す。

- official state 候補
- closure candidate 候補
- ownership class 候補
- verify command
- evidence path
- runtime / implementation の重点箇所
- mainline に戻す判断点

### 2-2. role packet 自動生成

family 以外の worker 向けに、次の packet も出す。

- audio hotspot audit
- archive duplicate audit
- verification core
- docs / package evidence

---

## 3. 重要な制約

この packet suite は、**worker AI が勝手に official truth を確定しない** ためのもの。

つまり packet の役割は次に限る。

- evidence 回収
- 局所監査
- verify 実行
- patch 粒度の返却

以下は packet からでも確定しない。

- official state の最終決定
- ownership class の最終決定
- closure candidate の最終決定
- manifest / routing / registry / package class / docs truth の最終決定

---

## 4. mainline にとっての意味

これで mainline owner AI は、毎回ゼロから対象範囲を書かなくてよくなる。

- family worker には family packet を渡す
- audio worker には audio packet を渡す
- verification worker には verification core packet を渡す
- docs / package worker には docs-package packet を渡す

この構成なら、後から patch を本体へ統合しやすい。
