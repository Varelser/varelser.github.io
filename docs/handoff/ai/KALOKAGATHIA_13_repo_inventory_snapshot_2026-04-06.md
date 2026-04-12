# KALOKAGATHIA 現本体 inventory snapshot for patch planning

- 作成日: 2026-04-06
- 対象本体: `kalokagathia_complete_p0_resume_suite_fix_2026-04-06.zip`
- 目的: patch を後から安全に加えるため、**現本体の実在 inventory** を先に固定する
- 注意: これは official state の確定ではない。**現物観測台帳** である

---

## 1. 今回の位置づけ

今回の追加文書は、既存の `00 / 10 / 11 / 12` を **実 repo inventory で支える補助台帳** である。

- `10`: mainline owner AI が握るべき幹線
- `11`: worker AI に委譲してよい材料作成
- `13`(この文書): 現本体で何が存在するかの snapshot
- `14`: worker AI への実担当表
- `15`: 依存ゲートと conflict hot spot
- `16`: 実 patch 波状投入の順序

---

## 2. top-level 実在ファイル数

| directory | file count | 備考 |
|---|---:|---|
| `components/` | 295 | UI / scene / audio / control panel |
| `lib/` | 590 | state / routing / future-native / preset / validation |
| `scripts/` | 194 | verify / emit / doctor / package / phase scripts |
| `types/` | 28 | config / project 型 |
| `workers/` | 1 | worker 実体は少ない |
| `generated/` | 7 | generated status / report JSON |
| `docs/` | 384 | handoff / archive / split reports 多数 |

### 補足

- `components + lib + scripts` だけで **1079 files**
- `docs/` には archive 内の旧本体コピーが多く、**現行本体と archive の取り違えリスク** がある

---

## 3. render mode registry 実数

render registry は以下の 3 系統から構成される。

- `lib/renderModeRegistryLayerModes.ts`
- `lib/renderModeRegistryGpgpuModes.ts`
- `lib/renderModeRegistryPostFxModes.ts`

### 実数

- total render mode definitions: **41**

#### category 別

- `instanced solids`: 6
- `lines`: 8
- `metaballs`: 1
- `particles`: 5
- `post fx`: 6
- `ribbons`: 2
- `sdf shading`: 1
- `surfaces`: 8
- `tubes`: 2
- `volumetric`: 2

#### support 別

- `experimental`: 23
- `heavy`: 6
- `stable`: 12

### 意味

render mode registry は mainline 幹線であり、worker AI がここを直接確定変更すると **meaning conflict** が起きやすい。

---

## 4. future-native 系 verify / emit command 実在数

### verify 群
- future-native verify commands: **24**
- PBD verify commands: **5**
- MPM verify commands: **5**
- fracture verify commands: **4**
- volumetric verify commands: **5**

### emit 群
- future-native emit commands: **12**

### package / handoff 群
- package / handoff / doctor commands: **10**

### 代表 verify

- `verify:future-native-artifact-suite`
- `verify:future-native-artifact-suite:resume`
- `verify:future-native-artifact-tail`
- `verify:future-native-family-preview-surfaces`
- `verify:future-native-guardrails`
- `verify:future-native-integration`
- `verify:future-native-nonvolumetric-routes`
- `verify:future-native-project-snapshots`
- `verify:future-native-project-state-fast`
- `verify:future-native-render-handoff`
- `...`

### family verify 実在確認

#### PBD
- `verify:pbd-cloth`
- `verify:pbd-membrane`
- `verify:pbd-rope`
- `verify:pbd-softbody`
- `verify:pbd-surface-integration`

#### MPM
- `verify:mpm-granular`
- `verify:mpm-mud`
- `verify:mpm-paste`
- `verify:mpm-snow`
- `verify:mpm-viscoplastic`

#### fracture
- `verify:fracture-crack-propagation`
- `verify:fracture-debris-generation`
- `verify:fracture-lattice`
- `verify:fracture-voxel`

#### volumetric
- `verify:volumetric-advection`
- `verify:volumetric-density-transport`
- `verify:volumetric-light-shadow`
- `verify:volumetric-pressure`
- `verify:volumetric-smoke`

---

## 5. future-native starter runtime の実在 family 断面

`lib/future-native-families/starter-runtime/` には、少なくとも以下の family 断面が実在する。

### PBD
- 実在ファイル数: **46**
- 例:
  - `pbd_clothAdapter.js`
  - `pbd_clothAdapter.ts`
  - `pbd_clothRenderer.js`
  - `pbd_clothRenderer.ts`
  - `pbd_clothSchema.js`
  - `pbd_clothSchema.ts`
  - `pbd_clothSolver.js`
  - `pbd_clothSolver.ts`
  - `pbd_clothUi.ts`
  - `pbd_membraneAdapter.js`
  - `pbd_membraneAdapter.ts`
  - `pbd_membraneRenderer.js`
  - `pbd_membraneRenderer.ts`
  - `pbd_membraneSchema.js`
  - `pbd_membraneSchema.ts`
  - `pbd_membraneSolver.js`

### MPM
- 実在ファイル数: **22**
- 例:
  - `mpm_granularAdapter.js`
  - `mpm_granularAdapter.ts`
  - `mpm_granularConstraints.js`
  - `mpm_granularConstraints.ts`
  - `mpm_granularGrid.js`
  - `mpm_granularGrid.ts`
  - `mpm_granularRenderer.js`
  - `mpm_granularRenderer.ts`
  - `mpm_granularRendererHelpers.js`
  - `mpm_granularRendererHelpers.ts`
  - `mpm_granularRendererShells.ts`
  - `mpm_granularSchema.js`
  - `mpm_granularSchema.ts`
  - `mpm_granularShared.js`
  - `mpm_granularShared.ts`
  - `mpm_granularSolver.js`

### fracture
- 実在ファイル数: **13**
- 例:
  - `fracture_latticeAdapter.js`
  - `fracture_latticeAdapter.ts`
  - `fracture_latticeRenderer.js`
  - `fracture_latticeRenderer.ts`
  - `fracture_latticeRendererDebris.ts`
  - `fracture_latticeRendererPatterns.ts`
  - `fracture_latticeRendererShared.ts`
  - `fracture_latticeRendererShells.ts`
  - `fracture_latticeSchema.js`
  - `fracture_latticeSchema.ts`
  - `fracture_latticeSolver.js`
  - `fracture_latticeSolver.ts`
  - `fracture_latticeUi.ts`

### volumetric
- 実在ファイル数: **25**
- 例:
  - `volumetric_density_transportAdapter.js`
  - `volumetric_density_transportAdapter.ts`
  - `volumetric_density_transportDerived.js`
  - `volumetric_density_transportDerived.ts`
  - `volumetric_density_transportInjector.js`
  - `volumetric_density_transportInjector.ts`
  - `volumetric_density_transportLighting.js`
  - `volumetric_density_transportLighting.ts`
  - `volumetric_density_transportObstacle.js`
  - `volumetric_density_transportObstacle.ts`
  - `volumetric_density_transportRenderer.js`
  - `volumetric_density_transportRenderer.ts`
  - `volumetric_density_transportRendererAdvanced.ts`
  - `volumetric_density_transportRendererShared.js`
  - `volumetric_density_transportRendererShared.ts`
  - `volumetric_density_transportRendererVortexVolume.ts`
  - `volumetric_density_transportSchema.js`
  - `volumetric_density_transportSchema.ts`

### 注意

ここで観測できるのは **存在 evidence** だけである。  
`implemented / partial / product-closed` の公式 state は mainline 側で確定する。

---

## 6. 現本体の大ファイル hot zone

450 行以上の実装ファイルは少なくとも **13** 本ある。  
うち、特に patch 衝突を起こしやすいものは以下。

- `lib/future-native-families/futureNativeSceneBridgeRopePayload.js`: 1848 lines
- `components/controlPanelTabsAudioRouteEditor.tsx`: 1124 lines
- `components/controlPanelTabsAudioLegacyConflict.tsx`: 1058 lines
- `components/useAudioLegacyConflictBatchActions.ts`: 854 lines
- `scripts/verify-future-native-family-entry.ts`: 818 lines
- `lib/audioReactiveValidation.ts`: 774 lines
- `lib/future-native-families/starter-runtime/volumetric_density_transportRenderer.js`: 712 lines

### 450 以上の代表

- `lib/future-native-families/futureNativeSceneBridgeRopePayload.js`: 1848 lines
- `components/controlPanelTabsAudioRouteEditor.tsx`: 1124 lines
- `components/controlPanelTabsAudioLegacyConflict.tsx`: 1058 lines
- `components/useAudioLegacyConflictBatchActions.ts`: 854 lines
- `scripts/verify-future-native-family-entry.ts`: 818 lines
- `lib/audioReactiveValidation.ts`: 774 lines
- `lib/future-native-families/starter-runtime/volumetric_density_transportRenderer.js`: 712 lines
- `lib/future-native-families/starter-runtime/fracture_latticeRenderer.js`: 693 lines
- `components/useAudioLegacyConflictManager.ts`: 579 lines
- `lib/audioReactiveRetirementMigration.ts`: 566 lines
- `scripts/verify-future-native-render-handoff-entry.ts`: 542 lines
- `components/useAudioLegacyConflictFocusedActions.ts`: 469 lines
- `lib/future-native-families/starter-runtime/mpm_granularRendererHelpers.js`: 461 lines

### 意味

- audio 再整理は進んでいるが、まだ **意味衝突を起こしやすい大ファイル** が残る
- worker AI へは「この hot zone を直接編集する作業」と「周辺材料作成」を明確に分ける必要がある

---

## 7. archive 取り違え危険

`docs/archive/merge_final_conflicts_2026-04-05/` 配下には、**現 root と同 relative path で重複するファイルが 188 件** ある。

### 例

- `.gitignore`
- `.npmrc`
- `App.tsx`
- `CURRENT_STATUS.md`
- `DOCS_INDEX.md`
- `PHASE0_COMPLETION_STATUS.md`
- `README.md`
- `REFACTOR_PLAN_LARGE_FILES.md`
- `REVIEW.md`
- `START_MONOSPHERE.command`
- `SYSTEM_DESIGN_BLUEPRINT.md`
- `UPGRADE_ROADMAP.md`
- `components/AppComparePreview.tsx`
- `components/AppExecutionDiagnosticsOverlay.tsx`
- `components/AppSceneCameraRig.tsx`
- `components/AppSceneLayerContent.tsx`
- `components/ControlPanel.tsx`
- `components/StandaloneSynthWindow.tsx`
- `components/canvasStreamWidget.tsx`
- `components/controlPanelChrome.tsx`
- `components/controlPanelGlobalDisplay.tsx`
- `components/controlPanelGlobalDisplayGpgpu.tsx`
- `components/controlPanelGlobalDisplayGpgpuAdvancedRender.tsx`
- `components/controlPanelGlobalDisplayGpgpuForces.tsx`
- `components/controlPanelGlobalDisplayGpgpuTrails.tsx`
- `components/controlPanelGlobalDisplayPostFx.tsx`
- `components/controlPanelGlobalDisplayProductPacks.tsx`
- `components/controlPanelGlobalDisplayScreenFx.tsx`
- `components/controlPanelGlobalExport.tsx`
- `components/controlPanelGlobalPresets.tsx`

### 意味

これは worker AI のミスを起こしやすい帯域である。  
**archive から現行本体へ逆流させない** 運用ルールが必要。

---

## 8. 現物で確認した package / handoff 系の事実

### `verify-package-integrity --strict`

```text
[verify-package-integrity] repo 29/30 ok; zip not checked
[verify-package-integrity] missing in repo:
- node-module: node_modules/skia-canvas
```

### `doctor-package-handoff`

```text
[doctor-package-handoff] class=full-local-dev
[doctor-package-handoff] legacy aliases=full
[doctor-package-handoff] root files・critical node_modules・zip structure が揃った local-dev complete handoff。
[doctor-package-handoff] next: npm run verify:package-integrity:strict
```

### `inspect-project-health`

```text
{
  "ok": true,
  "thresholds": { "largeImplementationFileLines": 450 },
  "rootTempDirCount": 0,
  "largeImplementationFileCount": 7,
  "warnings": [],
  "issues": []
}
```

### 読み方

- 本体は `full-local-dev` と判定される
- ただし strict integrity では `node_modules/skia-canvas` が欠損扱い
- project health は `ok: true` だが、large implementation file はまだ残っている

---

## 9. この inventory から言えること

1. 現本体は「空の計画」ではなく、**かなり大きい verify / emit / package 基盤を持つ**
2. 未網羅層の問題は、ゼロ実装ではなく **official ledger / product closure / integration truth の不足** に寄っている
3. patch を後から足すなら、まず本体に docs overlay と台帳を入れ、次に worker AI を局所帯域へ割り当てるのが安全

---

## 10. 次に接続する文書

- `KALOKAGATHIA_14_worker_assignment_matrix_2026-04-06.md`
- `KALOKAGATHIA_15_dependency_gates_and_conflict_hotspots_2026-04-06.md`
- `KALOKAGATHIA_16_patch_rollout_wave_plan_2026-04-06.md`
