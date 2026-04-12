# Future Native Scene Bindings

現時点では preview binding 段階から一歩進み、`pbd-cloth / pbd-membrane / pbd-softbody / pbd-rope` については **starter runtime を scene 側で直接 step する actual renderer handoff** を入れている。cloth / membrane / softbody は `native-surface`、rope は `native-structure` として points / lines を native starter 由来で描画する。さらに PBD 以外の first-wave についても scene handoff を拡張し、`mpm-granular / fracture-lattice / volumetric-density-transport` を actual scene renderer 経由で可視化できるようにした。

## Binding map

- `cloth_membrane` → `pbd-cloth` (`native-surface`)
  - primary preset: `future-native-pbd-cloth-drape`
- `elastic_sheet` → `pbd-membrane` (`native-surface`)
  - primary preset: `future-native-pbd-membrane-elastic`
- `viscoelastic_membrane` → `pbd-membrane` (`native-surface`)
  - primary preset: `future-native-pbd-membrane-memory`
- `surface_shell` → `pbd-softbody` (`native-surface`)
  - primary preset: `future-native-pbd-softbody-shell`
- `elastic_lattice` → `pbd-softbody` (`native-surface`)
  - primary preset: `future-native-pbd-softbody-lattice`
- `plasma_thread` → `pbd-rope` (`native-structure`)
  - primary preset: `future-native-pbd-rope-plasma-thread`
- `signal_braid` → `pbd-rope` (`native-structure`)
  - primary preset: `future-native-pbd-rope-signal-braid`
- `aurora_threads` → `pbd-rope` (`native-structure`)
  - primary preset: `future-native-pbd-rope-aurora-threads`
- `granular_fall` → `mpm-granular` (`native-particles`)
  - primary preset: `future-native-mpm-granular-sand-fall`
- `jammed_pack` → `mpm-granular` (`native-particles`)
  - primary preset: `future-native-mpm-granular-jammed-pack`
- `fracture_grammar` → `fracture-lattice` (`native-structure`)
  - primary preset: `future-native-fracture-lattice-grammar`
- `collapse_fracture` → `fracture-lattice` (`native-structure`)
  - primary preset: `future-native-fracture-lattice-collapse`
- `condense_field` → `volumetric-density-transport` (`native-volume`)
  - primary preset: `future-native-volumetric-condense-field`
- `sublimate_cloud` → `volumetric-density-transport` (`native-volume`)
  - primary preset: `future-native-volumetric-sublimate-cloud`

## What changed

- procedural mode overview に future-native binding card を追加
- binding 専用 quick preset を追加
- `pbd-rope` を scene handoff へ追加し、`plasma_thread / signal_braid / aurora_threads` を rope starter に接続
- project execution routing / manifest / serialization snapshot に
  - `futureNativeFamilyId`
  - `futureNativeBindingMode`
  - `futureNativePrimaryPresetId`
  を保持
- `sceneBranches` に `future-native:*` を追加
- `futureNativeSceneRendererBridge.ts` で、layer config から native starter runtime へ橋渡し
- `SceneFutureNativeSystem.tsx` で、native starter 由来の points / lines / surface mesh を actual scene へ描画
- `pbd-cloth / pbd-membrane / pbd-softbody` は surface mesh + hull line を native-surface 表示で handoff
- `pbd-rope` は anchored chain / braid / canopy bundle を native-structure 表示で handoff
- `mpm-granular` は particle + occupied grid point に加え、stress/contact overlay line と material-specific constitutive overlay（hardening / viscosity / yield centroid/line）、packed region remesh、constitutive shells を含む native-particles 表示で handoff
- `fracture-lattice` は intact bond line だけでなく crack-front line / collapse ring / debris / detached fragment point に加え、debris trail / remesh chord / voxel sibling shell と detached fragment voxel remesh / debris material branches に加え、multi-material break grammar（brittle / shear / ductile）と sibling fracture density band（core / halo / wake）を native-structure 表示で handoff
- `volumetric-density-transport` は density/light sample point に加え、slice line / billow contour と mesh-like lattice row / bridge / core-spine に加え、obstacle boundary / secondary obstacle boundary / obstacle bridge と primary/secondary light marching shaft / rim-light-enhanced 3D volume layer stack に加え、anisotropic plume branch line / plume bridge / obstacle wake contour / wake bridge に加え、multi-injector coupling line / injector bridge / layered wake near-mid-far line を native-volume 表示で handoff
- `LayerSceneRenderPlan` は future-native binding 時に legacy procedural / hybrid / particle core を suppress
- render payload に finite guardrail を追加し、非有限値や過大 payload を scene へ流さないようにした
- verifier `npm run verify:future-native-scene-bindings` / `npm run verify:future-native-render-handoff` を 14 case へ拡張
- `npm run verify:future-native-guardrails` と `npm run verify:future-native-safe-pipeline` を追加
- `signal_braid` は 2-strand / cross-link braid descriptor、`aurora_threads` は 4-strand canopy descriptor へ進めた
- `mpm-granular` は occupied cell point だけでなく `overlayCellCount / stressedCellCount / stressLineCount / maxOverlayStress` を持つ stress/contact overlay descriptor に加え、prewarm 付き scene handoff と `constitutiveOverlayCellCount / constitutiveLineCount / hardeningOverlayCellCount / viscosityOverlayCellCount / yieldOverlayCellCount` を持つ constitutive descriptor へ進めた。さらに `yieldDominantOverlayCellCount / yieldDominantLineCount` の yield-memory ridge と、`jammedPasteCoreCellCount / jammedMudShearCellCount / jammedSnowCrustCellCount` を持つ jammed-pack material split を追加した。今回 `packedRegionCellCount / packedRegionRemeshLineCount / packedRegionShellSegmentCount / packedRegionBandCount` と `constitutiveShellCellCount / constitutiveShellSegmentCount / hardeningShellSegmentCount / viscosityShellSegmentCount / yieldShellSegmentCount` も追加した
- `fracture-lattice` は prewarm 付き runtime 生成に切り替え、scene 初期 frame でも break progression を可視化
- `volumetric-density-transport` も prewarm 付き runtime 生成へ切り替え、scene 初期 frame でも slice / billow contour / mesh lattice を可視化し、thin-field fallback により `condense_field` でも最低限の slice / volume stack を維持する

## Verified now

- `npm run typecheck`
- `npm run verify:future-native-guardrails`
- `npm run verify:future-native-scene-bindings`
- `npm run verify:future-native-render-handoff`
- `npm run verify:project-state`
- `npm run verify:fracture-lattice`
- `npm run verify:volumetric-density-transport`
- `npm run verify:mpm-granular`

`npm run build` はこの環境で Vite build が typecheck 後に停止し、`dist/` 完走を確認できなかった。今回差分の確定値は **typecheck + future-native safe pipeline + family dedicated verify 実通過** とする。

## Next

- `fracture-lattice` は detached fragment voxel remesh density・debris material branch・multi-material break grammar・sibling fracture density bands まで到達したため、次は fracture 側の material-coupled evolution か、volumetric / granular の次帯域へ進める
- `mpm-granular` は packed region remesh / constitutive shells まで入ったため、次は constitutive shell の branch coupling と jammed region layering を上げる
- `volumetric-density-transport` は multi-obstacle / multi-light split に加え anisotropic plume branching / richer obstacle wake に加え multi-injector coupling / layered wake turbulence まで到達したため、次は wake shadow braid / triad layering refinement を進める

- volumetric-density-transport: obstacle/light/plume/injector/wake に加えて、vorticity confinement / wake recirculation shell・shear-layer rollup / recirculation pocket split・triple-light interference / vortex packet split・light triad layering / vortex packet layering を scene binding stats へ反映。

- `signal_braid`: rope braid augmentation + knot/tangle grammar
- `aurora_threads`: rope canopy augmentation + hierarchy/rib scaffold

- `signal_braid / aurora_threads`: tension / sag / snap augmentation

- `signal_braid / aurora_threads`: snap phase / break state / loose-end split・knot hierarchy refinement / entanglement layering・tension field layering / snap-state clustering / break cluster layering / loose-end field split を追加し、`snapPhaseCount / breakStateCount / looseEndSplitCount / knotHierarchyCount / entanglementLayerCount / entanglementBridgeCount / tensionFieldLayerCount / snapStateClusterCount` を descriptor stats に反映。

- `signal_braid / aurora_threads`: break cluster layering / loose-end field split を追加し、`breakClusterLayerCount / looseEndFieldSplitCount` を descriptor stats に反映。

- rope追加 stats: `entanglementShellLayerCount`, `snapPhaseFieldRefinementCount`

- rope追加 stats: `knotShellClusterCount`, `looseEndTurbulenceLayerCount`
- `signal_braid / aurora_threads`: snap-phase shell split / tension-field braid refinement を追加し、`snapPhaseShellSplitCount / tensionFieldBraidRefinementCount` を descriptor stats に反映。

- rope追加 stats: `breakShellRefinementCount`, `entanglementTurbulenceSplitCount`


- rope 追補: knot turbulence refinement / break-field braid split を追加。signal_braid / aurora_threads の handoff verify は通過。

- rope: shell-field coupling / loose-end wake split を追加

- rope 追加: knotWakeClusterCount / breakShellFieldSplitCount
- Rope additions: shellWakeBraidRefinementCount and breakFieldTurbulenceClusterCount are now emitted for signal_braid and aurora_threads.

- rope 追加: knot-shell wake refinement / break-field shell clustering


- rope 追加: `knotWakeShellRefinementCount`, `breakFieldWakeTurbulenceSplitCount`
- rope handoff では `shellWakeFieldRefinementCount` と `breakFieldWakeShellClusterCount` も summary / stats に保持し、signal / aurora 両系で確認する。

- rope update: swfbraid / bfwsfield

- rope update: `kswfbraid / bfwsfturb`
- pbd-rope: `signal_braid` / `aurora_threads` now emit `shellWakeFieldBraidTurbulenceRefinementCount` and `breakFieldWakeShellFieldTurbulenceSplitCount` in descriptor stats and summary.
