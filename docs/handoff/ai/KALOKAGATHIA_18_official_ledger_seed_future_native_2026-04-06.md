# KALOKAGATHIA official ledger seed for future-native

- 作成日: 2026-04-06
- 目的: 現 repo から **future-native family 正本台帳の初版候補** を起こす
- 位置づけ: final truth ではなく、mainline owner AI が review して official ledger へ昇格させる前段

---

## 1. seed の全体数

- future-native family count: **22**
- project-integrated family count: **22 / 22**
- render handoff verified mode count: **17**
- archive duplicate relative path count: **188**
- broad large implementation file count (>450 lines, components/lib scan): **11**

### group breakdown
- fracture: 4
- mpm: 5
- pbd: 4
- specialist-native: 4
- volumetric: 5

---

## 2. この seed で言えること

今回の seed では、22 family すべてが `currentStage = project-integrated` と読める。  
したがって official state の候補は全件 `implemented` に寄せてよい。

ただし、これは **「実装 evidence が強い」** という意味であって、  
**docs truth / product closure / mainline closure が確定した** という意味ではない。

そのため closure candidate は、

- 多くを `review-ready`
- route / snapshot / export の追加確認が必要なものを `needs-review`

として扱う。

---

## 3. 初版 family table

| familyId | group | progress | state candidate | closure | ownership | verified modes |
|---|---|---:|---|---|---|---:|
| mpm-granular | mpm | 98 | implemented | review-ready | conditional | 1 |
| mpm-viscoplastic | mpm | 98 | implemented | review-ready | conditional | 1 |
| mpm-snow | mpm | 98 | implemented | review-ready | conditional | 1 |
| mpm-mud | mpm | 98 | implemented | review-ready | conditional | 1 |
| mpm-paste | mpm | 98 | implemented | review-ready | conditional | 1 |
| pbd-cloth | pbd | 98 | implemented | review-ready | conditional | 1 |
| pbd-membrane | pbd | 98 | implemented | review-ready | conditional | 1 |
| pbd-rope | pbd | 98 | implemented | review-ready | conditional | 1 |
| pbd-softbody | pbd | 98 | implemented | review-ready | conditional | 1 |
| fracture-lattice | fracture | 98 | implemented | review-ready | conditional | 1 |
| fracture-voxel | fracture | 98 | implemented | review-ready | conditional | 1 |
| fracture-crack-propagation | fracture | 98 | implemented | review-ready | conditional | 1 |
| fracture-debris-generation | fracture | 98 | implemented | review-ready | conditional | 1 |
| volumetric-smoke | volumetric | 100 | implemented | needs-review | conditional | 1 |
| volumetric-density-transport | volumetric | 98 | implemented | review-ready | conditional | 0 |
| volumetric-advection | volumetric | 98 | implemented | review-ready | conditional | 1 |
| volumetric-pressure-coupling | volumetric | 98 | implemented | review-ready | conditional | 1 |
| volumetric-light-shadow-coupling | volumetric | 98 | implemented | review-ready | conditional | 1 |
| specialist-houdini-native | specialist-native | 98 | implemented | review-ready | mainline-only | 0 |
| specialist-niagara-native | specialist-native | 98 | implemented | review-ready | mainline-only | 0 |
| specialist-touchdesigner-native | specialist-native | 98 | implemented | review-ready | mainline-only | 0 |
| specialist-unity-vfx-native | specialist-native | 98 | implemented | review-ready | mainline-only | 0 |

---

## 4. mode binding evidence の初版

render-handoff-fast で明示確認できた mode / family binding は次の通り。

- `cloth_membrane` -> `pbd-cloth` / `native-surface`
- `elastic_sheet` -> `pbd-membrane` / `native-surface`
- `surface_shell` -> `pbd-softbody` / `native-surface`
- `signal_braid` -> `pbd-rope` / `native-structure`
- `granular_fall` -> `mpm-granular` / `native-particles`
- `viscous_flow` -> `mpm-viscoplastic` / `native-particles`
- `ashfall` -> `mpm-snow` / `native-particles`
- `sediment_stack` -> `mpm-mud` / `native-particles`

注意点:

- specialist-native 4 family はこの mode binding 表には直接出ない
- `volumetric-density-transport` もこの fast handoff 表には直接出ない
- したがってこの2帯域は **route evidence が別経路** である

---

## 5. subsystem 側の補助 facts

components: **295** files  
lib: **590** files  
scripts: **194** files  
generated: **7** files  
types: **28** files  
docs-handoff: **46** files

この数字は、worker AI に directory 単位で担当を振る時の基礎値として使う。

---

## 6. broad hotspot scan

`inspect-project-health` の既知 audio hotspot とは別に、  
broad scan として `components/` と `lib/` の 450 行超ファイルを拾うと次が上位に出る。

- `lib/future-native-families/futureNativeSceneBridgeRopePayload.js` (1849 lines)
- `components/controlPanelTabsAudioRouteEditor.tsx` (1125 lines)
- `components/controlPanelTabsAudioLegacyConflict.tsx` (1059 lines)
- `components/useAudioLegacyConflictBatchActions.ts` (855 lines)
- `lib/audioReactiveValidation.ts` (775 lines)
- `lib/future-native-families/starter-runtime/volumetric_density_transportRenderer.js` (713 lines)
- `lib/future-native-families/starter-runtime/fracture_latticeRenderer.js` (694 lines)
- `components/useAudioLegacyConflictManager.ts` (580 lines)

つまり現在の意味衝突危険帯は、

- audio 大型 UI / hook 群
- future-native 大型 renderer / payload 群

の両方にまたがっている。

---

## 7. mainline が次にやるべきこと

1. この seed JSON を official ledger の空表へ転記する
2. `implemented` 候補を family ごとに closure review する
3. specialist-native 4 family と `volumetric-density-transport` の route evidence を別表で補完する
4. family ごとに `mainline-only` か `conditional` かを最終確定する
5. その後に worker AI へ局所 patch を投げる

---

## 8. 対応する generated artifact

- `generated/handoff/missing-layers/official-ledger-seed-2026-04-06.json`
- `generated/handoff/missing-layers/official-ledger-seed-2026-04-06.md`

この2本は script 再生成前提で扱う。
