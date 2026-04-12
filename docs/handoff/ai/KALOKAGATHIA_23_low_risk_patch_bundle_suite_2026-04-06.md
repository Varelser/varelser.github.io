# KALOKAGATHIA Wave 3 low-risk patch bundle suite

- 作成日: 2026-04-06
- 目的: Wave 2 で作った worker packet 群を、**そのまま mainline に混ぜず、low-risk の patch 単位へ束ね直す**
- 前提: この段階では manifest / registry / routing / docs truth を変えない

---

## 1. 何を作るか

Wave 3 では、次の 2 系統だけを束ねる。

1. role packet 由来の low-risk bundle
   - audio hotspot audit
   - verification baseline
   - docs-package evidence
   - archive duplicate audit
2. family packet 由来の low-risk bundle
   - PBD
   - MPM
   - fracture
   - volumetric
   - specialist native

---

## 2. ここで許すもの

- additive md
- additive generated json / md
- verify checklist
- evidence note
- split proposal
- contradiction memo
- archive audit

---

## 3. ここでまだ許さないもの

- manifest 正本変更
- render registry の意味変更
- routing の意味変更
- package class の確定
- `CURRENT_STATUS.md` / `REVIEW.md` / `DOCS_INDEX.md` の最終同期

---

## 4. この suite の意味

worker packet は「観測と返却の単位」だが、mainline にとっては粒度が細かい。

そこで Wave 3 では、

- role packet を role bundle にまとめる
- family packet を group bundle にまとめる
- bundle ごとに verify と untouched trunk を固定する

という中間層を入れる。

これにより、後で patch を当てるときに

- どの patch を先に重ねてよいか
- どの patch を specialist review 付きにするか
- どれが docs/generated だけで閉じるか

が即判定できる。

---

## 5. 実務上の効果

この suite によって、mainline owner AI は次を得る。

1. Wave 3 で統合してよい low-risk patch 候補一覧
2. bundle ごとの verify command
3. bundle ごとの禁止幹線
4. mainline へ戻す判断点
5. worker 返却物の受け皿

これで Wave 4 の family closure patch に入る前に、材料 patch を安全に整理できる。
