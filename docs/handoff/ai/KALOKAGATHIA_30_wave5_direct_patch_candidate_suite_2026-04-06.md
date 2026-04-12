# KALOKAGATHIA Wave 5 direct patch candidate suite

- 作成日: 2026-04-06
- 目的: Wave 4 で作成した family closure blueprint から、**mainline review を前提にしない direct patch candidate** を個別 packet として固定する。
- 対象: PBD / MPM / fracture / volumetric のうち、recommendedReturnUnit が `patch` の family

## 1. 概要

今回の suite では、family closure blueprint 22本のうち specialist-native 4本を除外し、direct patch candidate **18本** を個別 packet 化する。

- review-ready: **17**
- needs-review: **1**
- 平均 progressPercent: **98.11**

## 2. 含まれる group

- pbd: **4**
- mpm: **5**
- fracture: **4**
- volumetric: **5**

## 3. この段階で固定すること

- 各 family を patch 単位で mainline に戻すための packet を持つ
- packet ごとに verify command / touchable zone / untouched trunk / mainline decision point を固定する
- `needs-review` の family は direct candidate ではあるが、単独統合せず mainline の確認を必須にする

## 4. この段階でまだやらないこと

- manifest / registry / routing 正本の意味変更
- `CURRENT_STATUS.md` / `REVIEW.md` / `DOCS_INDEX.md` の final truth 同期
- specialist-native family の direct patch 化

## 5. 出力先

- `generated/handoff/missing-layers/direct-patch-candidate-index-2026-04-06.json`
- `generated/handoff/missing-layers/direct-patch-candidate-index-2026-04-06.md`
- `generated/handoff/missing-layers/direct-patch-candidates-2026-04-06/`

## 6. 運用上の意味

この suite があることで、worker AI は family closure blueprint からさらに一段具体化された **返却直前 packet** を使える。
mainline owner AI は 18 family を優先順位順に統合し、最後に truth 文書を同期するだけでよい。
