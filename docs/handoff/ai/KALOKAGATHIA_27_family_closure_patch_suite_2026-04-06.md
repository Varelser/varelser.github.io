# KALOKAGATHIA Wave 4 family closure patch suite

- 作成日: 2026-04-06
- 目的: Wave 3 までで束ねた bundle を、family 単位でそのまま patch 実作業へ落とすための blueprint 群を固定する。

---

## 1. この wave で固定したもの

- family closure patch index JSON / md
- family closure patch blueprint 22 本
- family closure patch verify script

---

## 2. 数値

- familyPatchCount: 22
- directPatchCandidates: 18
- mainlineReviewCandidates: 4
- implementedCandidates: 22
- reviewReadyCandidates: 21
- needsReviewCandidates: 1

---

## 3. group 別内訳

- pbd: 4
- mpm: 5
- fracture: 4
- volumetric: 5
- specialist-native: 4

---

## 4. 解釈

### direct patch candidate 18

次は worker 返却 patch として進めやすい。

- PBD 4
- MPM 5
- fracture 4
- volumetric 5 のうち specialist 以外

### patch-with-mainline-review 4

- specialist-native 4

これは docs-only で閉じず、route / export / runtime 差分を mainline 側で受ける前提にする。

### needs-review 1

- `volumetric-smoke`

これは family blueprint は作成済みだが、closureCandidate は `needs-review` のまま扱う。

---

## 5. 何が便利になったか

各 family ごとに以下が固定された。

- verify command
- key evidence path
- key runtime file
- touchable zone
- untouched trunk
- mainline decision point
- candidate output
- exit criteria

これで、次の AI は「何を見ればよいか」を毎回 repo 全走査で再発見しなくてよい。

