# KALOKAGATHIA Wave 3 bundle integration rules

- 作成日: 2026-04-06
- 目的: low-risk patch bundle を mainline に戻すときの統合ルールを先に固定する

---

## 1. 先に統合してよい bundle

- verification baseline
- docs-package evidence
- archive duplicate audit
- audio hotspot evidence

理由は、これらが docs / generated / checklist / audit に閉じやすいからである。

---

## 2. review を厚くする bundle

- PBD family closure evidence
- MPM family closure evidence
- fracture family closure evidence
- volumetric family closure evidence

理由は、family closure の材料収集であっても、scene binding / preset / route / runtime の意味境界に近づきやすいからである。

---

## 3. mainline review 必須 bundle

- specialist native family mainline review

理由は、specialist family が mainline-only 候補を含むためである。

---

## 4. bundle 返却の最低条件

各 bundle は少なくとも次を返す。

1. 対象範囲
2. 触った file
3. 触っていない幹線
4. 実行 verify
5. 残件
6. mainline 判断が必要な点

---

## 5. まだやってはいけないこと

- bundle 返却だけで official state を確定すること
- bundle 返却だけで closure を確定すること
- bundle 返却だけで docs truth を更新すること
- bundle 返却だけで package class を更新すること

Wave 3 はあくまで低リスク patch の整理段階であり、最終確定段階ではない。
