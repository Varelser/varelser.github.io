# KALOKAGATHIA missing-layers patch overlay 適用計画

- 作成日: 2026-04-06
- 目的: この overlay を **本体へ後から patch として加える**ための最小手順を固定する。
- 方針: 本体 root の正本文書は先に触らず、`docs/handoff/ai/` への **追加のみ** で導入する。

---

## 1. この overlay に含めるもの

1. `docs/handoff/ai/KALOKAGATHIA_00_missing_layers_split_guide_2026-04-06.md`
2. `docs/handoff/ai/KALOKAGATHIA_10_mainline_with_repo_only_missing_layers_2026-04-06.md`
3. `docs/handoff/ai/KALOKAGATHIA_11_delegatable_missing_layers_for_other_ai_2026-04-06.md`
4. `docs/handoff/ai/KALOKAGATHIA_12_patch_overlay_application_plan_2026-04-06.md`
5. `PATCH_MANIFEST_2026-04-06.json`

---

## 2. この overlay の位置づけ

これは **本体コードを直接変更する patch ではない**。

先に以下を固定するための patch である。

- multi-AI 運用の境界
- mainline owner AI が握るべき正本層
- worker AI に返させる材料作成の範囲
- 実コード patch を当てる前の交通整理

---

## 3. 適用順

### Step 1. docs 追加

本体 root を基準に、overlay 内の `kalokagathia/` 以下をそのまま重ねる。

### Step 2. 読む順番を固定

1. `docs/handoff/SESSION_CHECKPOINT_2026-04-06.md`
2. `docs/handoff/ai/KALOKAGATHIA_00_missing_layers_split_guide_2026-04-06.md`
3. `docs/handoff/ai/KALOKAGATHIA_10_mainline_with_repo_only_missing_layers_2026-04-06.md`
4. `docs/handoff/ai/KALOKAGATHIA_11_delegatable_missing_layers_for_other_ai_2026-04-06.md`
5. 既存の `docs/handoff/ai/KALOKAGATHIA_03_mainline_only_tasks_for_multi_ai_2026-04-06.md`
6. 既存の `docs/handoff/ai/KALOKAGATHIA_AI_HANDOFF_PRIORITY_PLAN_2026-04-06.md`

### Step 3. 先に mainline ledger を作る

この overlay 導入直後にやるべきこと。

- family / mode / subsystem の official ledger 化
- official state 列の固定
- patch / branch / verify unit の固定
- mainline-only hot spine の固定

### Step 4. その後に worker へ配る

worker へは 11 の返却テンプレートを使って配る。

---

## 4. 今回あえてやっていないこと

安全性のため、今回の overlay では次を**まだ変更しない**。

- `CURRENT_STATUS.md`
- `REVIEW.md`
- `DOCS_INDEX.md`
- `package.json`
- `lib/`
- `components/`
- `scripts/`
- `generated/`

理由は、まず docs だけを additive に入れて運用境界を固める方が安全だからである。

---

## 5. overlay 導入後の次アクション

### mainline owner AI

- official ledger を作る
- official state を確定する
- worker に触らせない hot spine を確定する
- future-native / audio / package / browser proof の完了条件を確定する

### worker AI

- inventory
- evidence table
- conflict audit
- checklist
- 局所 split / 局所 docs / 局所 proof

---

## 6. 成功条件

この overlay は、次を満たせば成功。

1. 本体 root 正本を壊さずに入る
2. mainline と worker の境界が明文化される
3. 実コード patch を当てる前に台帳作成へ移れる
4. 返却物の粒度と verify scope が先に揃う

---

## 7. まとめ

今回の patch overlay は、実装 patch の前に入れる **運用基盤 patch** である。

これを先に入れると、後続 patch を

- mainline owner AI が本体で握るもの
- worker AI が branch / patch で返すもの

に安全に分けられる。
