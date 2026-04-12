# KALOKAGATHIA Wave 4 family closure integration rules

- 作成日: 2026-04-06
- 目的: family closure blueprint から、実 patch 統合へ進む際の扱いを固定する。

---

## 1. patch 化の優先順

1. PBD
2. MPM
3. fracture
4. volumetric
5. specialist-native

理由は、specialist-native が最も mainline review 依存が強いため。

---

## 2. 先に patch 化してよいもの

以下は direct patch candidate として優先できる。

- pbd-cloth
- pbd-membrane
- pbd-rope
- pbd-softbody
- mpm-granular
- mpm-viscoplastic
- mpm-snow
- mpm-mud
- mpm-paste
- fracture-lattice
- fracture-voxel
- fracture-crack-propagation
- fracture-debris-generation
- volumetric-advection
- volumetric-density-transport
- volumetric-pressure-coupling
- volumetric-light-shadow-coupling
- volumetric-smoke

ただし `volumetric-smoke` は closureCandidate が `needs-review` のため、同じ direct patch candidate でも最後寄りに回す。

---

## 3. mainline review 前提のもの

- specialist-houdini-native
- specialist-niagara-native
- specialist-touchdesigner-native
- specialist-unity-vfx-native

これらは patch-with-mainline-review とし、worker 単独完結にしない。

---

## 4. 禁止

以下を family closure patch に混ぜない。

- manifest 正本意味変更
- registry 正本意味変更
- routing 正本意味変更
- package class の最終決定
- CURRENT_STATUS / REVIEW / DOCS_INDEX の final truth 化

---

## 5. 返却時に必須のもの

- familyId
- 実行 verify
- 触った file
- 触っていない幹線
- 残件
- mainline 判断点

これがない patch は統合対象にしない。

