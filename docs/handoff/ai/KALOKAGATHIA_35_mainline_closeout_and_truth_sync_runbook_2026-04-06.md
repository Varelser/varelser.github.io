# KALOKAGATHIA mainline closeout and truth sync runbook

- 作成日: 2026-04-06
- 目的: additive overlay を本体へ戻した後、**最後に何を同期すれば closeout になるか** を固定する。

---

## 1. closeout で更新する正本

最後に同期する対象は次で固定する。

- `CURRENT_STATUS.md`
- `REVIEW.md`
- `DOCS_INDEX.md`

この 3 本は **途中段階では更新しない**。

---

## 2. closeout 前に満たす条件

次を満たすまで truth sync に入らない。

1. overlay verify 群が全部 pass
2. direct patch candidate index が更新済み
3. mainline integration order index が更新済み
4. needs-review 項目が列挙済み
5. specialist-native 4 family の扱いが明記済み

---

## 3. truth sync の書き方

### CURRENT_STATUS.md

- 進捗数値は generated index の数値に合わせる
- directPatchCandidateCount / reviewReady / needsReview を明記する
- unresolved item に `volumetric-smoke` と specialist review を残す

### REVIEW.md

- overlay で追加した verify 群を記載する
- 実行済み verify と未実施 verify を分ける
- needs-review の理由を省略しない

### DOCS_INDEX.md

- 34〜37 の handoff 文書を追加する
- generated/handoff/missing-layers の mainline integration order 一式を追加する

---

## 4. closeout で省略してはいけないもの

- `volumetric-smoke` が needs-review である事実
- specialist-native 4 family が mainline review 前提である事実
- additive overlay が runtime 本体未変更である事実
- どの verify を通したか

---

## 5. closeout 実行順

1. `node scripts/verify-missing-layers-overlay.mjs --repo .`
2. `node scripts/verify-missing-layers-worker-packets.mjs --repo .`
3. `node scripts/verify-missing-layers-low-risk-patches.mjs --repo .`
4. `node scripts/verify-missing-layers-family-closure-patches.mjs --repo .`
5. `node scripts/verify-missing-layers-direct-patch-candidates.mjs --repo .`
6. `node scripts/verify-missing-layers-mainline-integration-order.mjs --repo .`
7. `npm run verify:future-native-project-state-fast`
8. `npm run verify:future-native-safe-pipeline:core`
9. docs truth sync

---

## 6. 終了条件

- generated index と docs truth の数値が一致
- overlay verify 追加分がすべて pass
- unresolved review item が明記済み
- closeout 後に archive 混入で説明が逆転していない
