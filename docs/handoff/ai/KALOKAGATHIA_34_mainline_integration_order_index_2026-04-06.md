# KALOKAGATHIA mainline integration order index

- 作成日: 2026-04-06
- 目的: direct patch candidate 18 本と specialist review 4 本を、mainline owner AI が **どの順で戻すか** を固定する。
- 前提: 本文書は **本体の truth をまだ更新しない**。先に additive overlay と verify を通し、最後に truth sync を行う。

---

## 1. 結論

mainline へ戻す順番は次で固定する。

1. preflight
2. PBD direct
3. MPM direct
4. fracture direct
5. volumetric core direct
6. volumetric smoke review
7. specialist-native review
8. truth sync / closeout

理由は、**低リスクで review-ready な nonvolumetric 群から先に戻し、routing / preview / package truth へ影響しやすいものを後ろへ送る** ためである。

---

## 2. stage ごとの意味

### stage-0-preflight

- overlay 自体の整合を通す
- ここでは CURRENT_STATUS / REVIEW / DOCS_INDEX をまだ変えない

### stage-1-pbd-direct

- review-ready 4 family をまとめて扱う
- shared bridge / preset patch / preview surface を確認する

### stage-2-mpm-direct

- PBD の後に MPM 5 family を戻す
- nonvolumetric routes 前提の確認を維持する

### stage-3-fracture-direct

- fracture 4 family を束ねる
- crack propagation / debris generation の meaning conflict を確認する

### stage-4-volumetric-core

- smoke 以外の volumetric 4 family を先に戻す
- volumetric routes と safe pipeline core を同時に見る

### stage-5-volumetric-smoke-review

- `volumetric-smoke` は needs-review のため単独 gate を置く
- direct merge ではなく mainline review を通す

### stage-6-specialist-review

- specialist-native 4 family は patch-with-mainline-review のまま扱う
- specialist routes / runtime export regression を確認する

### stage-7-truth-sync-closeout

- ここで初めて CURRENT_STATUS / REVIEW / DOCS_INDEX を同期する
- overlay generated index と docs truth の数値を合わせる

---

## 3. 実務上のルール

- review-ready でも、stage を飛ばして戻さない
- `volumetric-smoke` は stage-5 より前に戻さない
- specialist-native は direct patch 扱いにしない
- truth sync は最後だけ行う

---

## 4. 参照先

- generated/handoff/missing-layers/mainline-integration-order-2026-04-06.json
- generated/handoff/missing-layers/mainline-integration-order-2026-04-06.md
- generated/handoff/missing-layers/direct-patch-candidate-index-2026-04-06.json
- generated/handoff/missing-layers/family-closure-patch-index-2026-04-06.json
