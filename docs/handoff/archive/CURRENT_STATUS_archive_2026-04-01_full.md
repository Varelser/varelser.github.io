## 2026-04-01 追加 45

- `lib/starterLibraryPresetBaseChunk04.ts` を `lib/starterLibraryPresetBaseChunk04HybridReliquaries.ts` / `lib/starterLibraryPresetBaseChunk04SignalVariations.ts` / `lib/starterLibraryPresetBaseChunk04AtmosphericSystems.ts` / `lib/starterLibraryPresetBaseChunk04HaloMembranes.ts` に分割し、本体は barrel 化した。
- preset 群を hybrid reliquaries / signal variations / atmospheric systems / halo membranes の4帯域へ整理し、既存の配列順は維持したまま拡張しやすい構造へ変更した。
- `typecheck` / `verify:future-native-project-snapshots` / `build` の再通過を確認。
- これで code 側の 450行以上ファイルは解消し、残る大型ファイルは文書帯域と補助スクリプトが中心になった。

## 2026-04-01 追加 44

- `lib/starterLibraryPresetBaseChunk03.ts` を `lib/starterLibraryPresetBaseChunk03HybridReliquaries.ts` / `lib/starterLibraryPresetBaseChunk03MaterialStudies.ts` / `lib/starterLibraryPresetBaseChunk03FieldMatrices.ts` / `lib/starterLibraryPresetBaseChunk03SignalAtmospheres.ts` に分割し、本体は barrel 化した。
- preset 群を hybrid reliquaries / material studies / field matrices / signal atmospheres の4帯域へ整理し、既存の配列順は維持したまま拡張しやすい構造へ変更した。
- `typecheck` / `verify:future-native-project-snapshots` / `build` の再通過を確認。
- これで code 側の残る大塊は base04 と文書帯域が中心になった。

## 2026-04-01 追加 43

- `starterLibraryPresetExtensionChunk05.ts` を `starterLibraryPresetExtensionChunk05StateChange.ts` / `starterLibraryPresetExtensionChunk05Gpgpu.ts` / `starterLibraryPresetExtensionChunk05Media.ts` / `starterLibraryPresetExtensionChunk05Phase42.ts` / `starterLibraryPresetExtensionChunk05PostFx.ts` に分割し、本体は barrel 化した。
- preset 群を state-change / gpgpu / media / phase42 / postfx の5帯域へ整理し、既存の配列順は維持したまま拡張しやすい構造へ変更した。
- `typecheck` / `verify:future-native-project-snapshots` / `build` の再通過を確認。
- これで preset extension 側の最大塊は chunk05 から 5 group の分割単位へ縮小した。残る最大塊は extension03 / base01 などの preset chunk と文書帯域が中心。

## 2026-04-01 追加 27（Expression atlas base bundle group 分割）

- `lib/expressionAtlasBundlesBase.ts` を再公開だけの薄い入口へ整理した。
- 追加:
  - `lib/expressionAtlasBundlesBaseShared.ts`
  - `lib/expressionAtlasBundlesBaseAtmospheric.ts`
  - `lib/expressionAtlasBundlesBaseMaterial.ts`
  - `lib/expressionAtlasBundlesBaseSourceAware.ts`
- expression atlas base bundle を atmospheric / material / source-aware の group に分離し、後から bundle や source 比較アンカーを局所追加しやすい形へ整理した。
- 維持確認: `npm run typecheck` / `npm run verify:future-native-project-snapshots` / `npm run build` ✅

## 2026-04-01 追加 26（Hybrid temporal variant base の group 分割）

- `lib/hybridTemporalVariantBase.ts` を再公開だけの薄い入口へ整理した。
- 追加:
  - `lib/hybridTemporalVariantBaseShared.ts`
  - `lib/hybridTemporalVariantBaseAtmospheric.ts`
  - `lib/hybridTemporalVariantBaseMaterial.ts`
  - `lib/hybridTemporalVariantBaseSourceAware.ts`
- hybrid temporal base を atmospheric / material / source-aware の group に分離し、後から temporal pair や source 依存 variant を局所追加しやすい形へ整理した。
- 維持確認: `npm run typecheck` / `npm run verify:future-native-project-snapshots` / `npm run build` ✅

## 2026-04-01 追加 25（Scene particle frame uniforms / runtime 分割）

- `components/sceneParticleSystemFrame.ts` を orchestration のみへ薄くした。
- 追加:
  - `components/sceneParticleSystemFrameShared.ts`
  - `components/sceneParticleSystemFrameUniforms.ts`
- particle frame update の共通 runtime 値解決 / layer key 構築 / audio・display・inter-layer・SDF uniform 更新を分離し、後から reactive rule や collision 追加を局所修正で進めやすい形へ整理した。
- 維持確認: `npm run typecheck` / `npm run verify:future-native-project-snapshots` / `npm run build` ✅

## 2026-04-01 追加 24（Scene motion estimator 分割）

- `components/sceneMotionEstimator.ts` を orchestration のみへ薄くした。
- 追加:
  - `components/sceneMotionEstimatorShared.ts`
  - `components/sceneMotionEstimatorSpecific.ts`
  - `components/sceneMotionEstimatorGroups.ts`
- particle / membrane / growth / shell / fiber など複数 scene system が共有する position estimate を、入力構築 / specific motion / fallback motion group に分離した。
- 維持確認: `npm run typecheck` / `npm run verify:future-native-project-snapshots` / `npm run build` ✅

## 2026-04-01 追加 23（Scene membrane system 分割）

- `components/sceneMembraneSystem.tsx` を orchestration のみへ薄くした。
- 追加:
  - `components/sceneMembraneProfiles.ts`
  - `components/sceneMembraneLayout.ts`
  - `components/sceneMembraneFrame.ts`
- membrane profile / source-aware 補正 / layout sampling / frame 更新を分離し、後から sheet / cloth / viscoelastic 系の追加を局所修正で進めやすい形へ整理した。
- 維持確認: `npm run typecheck` / `npm run verify:future-native-project-snapshots` / `npm run build` ✅

## 2026-04-01 追加 22（Future-native scene binding data / preset patch 分割）

- `lib/future-native-families/futureNativeSceneBindings.ts` を data / patch 責務へ分割した。
- 追加:
  - `lib/future-native-families/futureNativeSceneBindingData.ts`
  - `lib/future-native-families/futureNativeScenePresetPatches.ts`
- `futureNativeSceneBindings.ts` は public API の再公開と summary helper に限定した。
- 維持確認: `npm run typecheck` / `npm run verify:future-native-project-snapshots` / `npm run build` ✅

## 2026-04-01 追加 21（MPM granular solver の orchestration 分割）

- `lib/future-native-families/starter-runtime/mpm_granularSolver.ts` を solver orchestration だけに薄くした。
- 追加:
  - `lib/future-native-families/starter-runtime/mpm_granularShared.ts`
  - `lib/future-native-families/starter-runtime/mpm_granularGrid.ts`
  - `lib/future-native-families/starter-runtime/mpm_granularTransfer.ts`
  - `lib/future-native-families/starter-runtime/mpm_granularConstraints.ts`
  - `lib/future-native-families/starter-runtime/mpm_granularStats.ts`
- これにより、今後の `mud / snow / paste` 派生追加時に grid / transfer / constraint / stats を個別に触れる形へ整理した。
- 維持確認: `npm run typecheck` / `npm run verify:future-native-project-snapshots` / `npm run build` ✅

## 2026-04-01 追加 20（Future-native membrane native-surface + tooling path hardening）

- `elastic_sheet / viscoelastic_membrane` の binding mode を `direct-preview` から **`native-surface`** に更新した。
- `pbd-membrane` に grid surface mesh / hull line を追加し、scene 側で points / lines に加えて **filled membrane surface** を描画できるようにした。
- `SceneFutureNativeSystem` に surface vertex color を追加し、softbody / membrane の z-depth に応じた shaded shell 表示へ寄せた。
- execution diagnostics overlay に `surfaceTriangleCount / hullSegmentCount / surfaceDepthRange` を追加した。
- `typecheck` / `build` が `.bin/tsc` の壊れ方に引っ張られないよう、package scripts を `node node_modules/typescript/bin/tsc` / `node node_modules/vite/bin/vite.js` 直呼びへ変更した。
- `doctor:tooling` は `.bin` の有無ではなく `node_modules/typescript/lib/tsc.js` と `node_modules/vite/bin/vite.js` を見るよう修正した。
- 検証: `npm run doctor:tooling` / `npm run typecheck` / `npm run verify:future-native-scene-bindings` / `npm run verify:future-native-render-handoff` / `npm run verify:project-state` / `npm run build` ✅

## 2026-04-01 追加 19（Future-native softbody native-surface handoff）

- `pbd-softbody` の scene handoff を points / lines 中心の proxy から **surface mesh + hull line を持つ native-surface** へ進めた。
- `futureNativeSceneRendererBridge.ts` に softbody 用 surface mesh builder を追加し、cell quad を triangle 化して dome-like z profile を付与した。
- `SceneFutureNativeSystem.tsx` は softbody binding 時に mesh / hull / faint support lines / points を併用描画する。
- `surface_shell / elastic_lattice` の binding mode を `proxy-preview` から `native-surface` へ更新。
- `verify:future-native-scene-bindings` と `verify:future-native-render-handoff` は softbody の surface triangle / hull segment を検証対象に含める。

## 2026-04-01 追加 18（Future-native scene routing / preset binding）

- `cloth_membrane / elastic_sheet / viscoelastic_membrane / surface_shell / elastic_lattice` に future-native binding を追加した。
- procedural mode overview に binding card と recommended preset button を追加した。
- project execution routing / manifest / serialization snapshot に `futureNativeFamilyId / futureNativeBindingMode / futureNativePrimaryPresetId` を保持するよう更新した。
- `sceneBranches` に `future-native:*` と route tag を追加し、`npm run verify:future-native-scene-bindings` を追加して通過した。

## 2026-04-01 追加 17（Future-native actual renderer handoff の初段）

- `pbd-cloth / pbd-membrane / pbd-softbody` 用に、starter runtime を scene 側で直接 step して points / lines payload を描画する bridge を追加した。
- 追加:
  - `lib/future-native-families/futureNativeSceneRendererBridge.ts`
  - `components/sceneFutureNativeSystem.tsx`
  - `scripts/verify-future-native-render-handoff-entry.ts`
  - `scripts/verify-future-native-render-handoff.mjs`
- `LayerSceneRenderPlan` に
  - `futureNativeFamilyId`
  - `futureNativeBindingMode`
  - `futureNativeRenderer`
  を追加した。
- future-native binding がある mode では、scene plan が **particleCore / legacy procedural / hybrid** を抑止し、`future-native-renderer:*` branch を返すよう更新した。
- `AppSceneLayerContent.tsx` は bound layer に対して `SceneFutureNativeSystem` を差し込み、既存 preview binding を actual renderer handoff の初段へ進めた。
- 今回確認できたこと:
  - global `tsc` + local stub tsconfig で **renderer handoff ロジックのコンパイル** を確認した。
  - CJS 出力した verifier を実行し、5 case（`cloth_membrane / elastic_sheet / viscoelastic_membrane / surface_shell / elastic_lattice`）で family / pointCount / lineCount / sceneScale / plan suppression を確認した。
- この環境の制約:
  - zip 同梱 `node_modules` は依然として欠損があり、今回差分に対する **`npm run build` の再実行は未確認**。
  - ただし handoff ロジック自体は Node 実行 verifier で通している。
- 上記の build 未確認点は、追加 20 の tooling path hardening 後に `npm run build` 通過で解消した。

## 2026-04-01 追加 16（Future Native project/export integration を 7 family へ拡張）

- `project serialization / snapshot report / runtime-state verification` に future native の **統合済み family 7件** を載せた。
- 追加接続した family:
  - `pbd-cloth`
  - `pbd-membrane`
  - `pbd-softbody`
- 継続保持した既存 family:
  - `pbd-rope`
  - `mpm-granular`
  - `fracture-lattice`
  - `volumetric-density-transport`
- 更新:
  - `lib/future-native-families/futureNativeFamiliesIntegration.ts`
  - `lib/future-native-families/futureNativeFamiliesProjectReport.ts`
  - `lib/future-native-families/futureNativeFamiliesProgress.ts`
  - `scripts/verify-future-native-project-snapshots-entry.ts`
  - `docs/future-native-families/FUTURE_NATIVE_FAMILIES_PROJECT_SNAPSHOTS.md`
- 今回の意味:
  - project export/import 側で、7 family 分の `runtimeConfig / runtimeState / statsKeys / serializerBlockKey` を保持できるようになった。
  - `pbd-softbody` の次ターゲットから `runtime snapshot/export bridge` を消し、次を `scene routing / preset binding` に更新した。
- 今回の結果:
  - `npm run typecheck` ✅
  - `npm run build` ✅
  - `npm run verify:future-native-integration` ✅
  - `npm run verify:future-native-runtime-state` ✅
  - `npm run verify:future-native-project-snapshots` ✅
  - `npm run verify:pbd-cloth` ✅
  - `npm run verify:pbd-membrane` ✅
  - `npm run verify:pbd-softbody` ✅
- 現時点の目安:
  - future native families 全22件のうち、starter 実装済み **7件**
  - verifier 実装済み **7件**
  - project/export integration 済み **7件**

## 2026-04-01 追加 15（PBD Softbody starter-runtime 追加）

- `pbd-softbody` を **research-scaffold → verification-ready** へ引き上げた。
- 追加:
  - `lib/future-native-families/starter-runtime/pbd_softbodySchema.ts`
  - `lib/future-native-families/starter-runtime/pbd_softbodyAdapter.ts`
  - `lib/future-native-families/starter-runtime/pbd_softbodySolver.ts`
  - `lib/future-native-families/starter-runtime/pbd_softbodyRenderer.ts`
  - `lib/future-native-families/starter-runtime/pbd_softbodyUi.ts`
  - `scripts/verify-pbd-softbody-entry.ts`
  - `scripts/verify-pbd-softbody.mjs`
  - `docs/future-native-families/FUTURE_NATIVE_FAMILIES_PBD_SOFTBODY_NATIVE_STARTER.md`
- starter の中身:
  - structural / shear / bend link
  - per-cell area based volume preservation
  - cluster shape matching
  - shared wind / pressure surface forces
  - multi-pin choreography
  - obstacle field / floor / circle / capsule collider
- `npm run verify:pbd-softbody` を追加し、以下を検証対象にした。
  - particle / link 数の安定
  - floor / collider 接触
  - volume ratio の帯域維持
  - max cell area error の上限
  - wind / pressure / obstacle impulse
  - choreography / layered obstacle 有効化
- 今回の結果:
  - `npm run typecheck` ✅
  - `npm run build` ✅
  - `npm run verify:pbd-softbody` ✅
- 現時点の目安:
  - `pbd-softbody` 単体: **約54%**
  - future native families 全体: **PBD 系の未着手穴が1つ減少**

## 2026-03-31 追加 14（Phase 4 完了: build / project-state / export 検証通し）

- Phase 4 の出口確認として、依存を再構成した上で **`npm run build` / `npm run verify:project-state` / `npm run verify:export`** を通した。
- `npm run build` はこの環境で完走を確認した。最新 build 出力は以下。
  - `dist/assets/index-BwOn5n6a.js` 436.50kB
  - `dist/assets/depiction-catalog-CdyD-dSc.js` 360.25kB
  - `dist/assets/three-core-BbVy3ccf.js` 675.03kB
  - `dist/assets/particleDataWorker-BxYiCCNG.js` 377.93kB
- `verify:project-state` は 3 シナリオ通過。
  - baseline
  - hybrid + video + post FX
  - text/fiber + WebGPU-preferred GPGPU
- `verify:export` はこの sandbox で `page.goto(http://127.0.0.1:*)` と `file://.../dist/index.html` がともに `ERR_BLOCKED_BY_ADMINISTRATOR` になるため、**node-canvas harness** へ自動退避する形にした。
- `verify:export` の現在仕様:
  - まず app UI を Playwright + Chromium で開こうとする
  - sandbox policy で navigation が阻害された場合は node-canvas harness で PNG alpha 振る舞いを検証する
  - opaque PNG は transparent pixel 0、transparent PNG は transparent pixel > 0 を確認する
- 追加:
  - `npm run verify:phase4`
  - `scripts/verify-phase4.mjs`
- `verify:phase4` は以下を順に実行する。
  - `npm run build`
  - `npm run verify:project-state`
  - `npm run verify:export`
- 現時点の判定:
  - 正式ロードマップ全体: **約92%**
  - **Phase 4 単体: 完了**
- 次の主対象は **Phase 5 の import/export 検証拡張と round-trip 強化**。

## 2026-03-31 追加 13（Phase 4 詰め: project-state 検証経路の追加と循環参照修正）

- Phase 4 の締めとして、Playwright browser 依存なしで `manifest / execution routing / serialization / parse migration` を検証できる **Node 単体の project-state verifier** を追加した。
- 追加:
  - `npm run verify:project-state`
  - `scripts/verify-project-state.mjs`
  - `scripts/verify-project-state-entry.ts`
- 検証対象は3シナリオ。
  - baseline
  - hybrid + video + post FX
  - text/fiber + WebGPU-preferred GPGPU
- 各シナリオで以下を通した。
  - manifest.execution 4件
  - serialization.layers 4件
  - routing map と manifest execution の requested/resolved/path/render/simulation/capability/sceneBranches 一致
  - serialization execution block に routing token 群が全て入ること
  - `parseProjectData()` round-trip 後も execution / sceneBranches が保持されること
  - schema / serialization を外した legacy payload から migration-aware に復元できること
- 併せて、`projectStateShared.ts` / `projectStateStorage.ts` の不要な `appState -> appStateLibrary -> starterLibrary` 依存を外し、project export/import 系が starter preset 初期化に巻き込まれないよう整理した。
- さらに、`projectExecutionRouting.ts` が `sceneBranches` を作る際の自己参照再帰を修正した。未完成 route を `sceneRenderRouting` 側へ明示渡しする形に変え、Node 検証でも stack overflow しないようにした。
- `verify:export` は依然として Playwright browser 未導入環境では止まるが、失敗時に `verify:project-state` を案内する形へメッセージを改善した。
- 現時点の目安:
  - 正式ロードマップ全体: **約90%**
  - Phase 4 単体: **約99%**
- 残りの中心課題:
  - `vite build` 完走確認
  - Playwright browser 実体あり環境での `verify:export` / round-trip 実 UI 検証
  - Phase 5 側の import/export 検証帯域の拡張

## 2026-03-31 追加 12（Phase 4 継続: manifest / export / routing builder 最終同期）

- Phase 4 の実質仕上げとして、`manifest / export / routing builder` の語彙をさらに揃えた。
- `lib/projectExecutionRouting.ts` は layer / gpgpu の routing input helper を持つ形へ整理し、Layer 2 / 3 / GPGPU の execution snapshot を build する箇所の raw branching を少し圧縮した。
- execution snapshot は `sceneBranches` を builder 自身が持つようにし、`projectStateManifest` 側で後付けしていた branch 注入をやめた。これにより manifest / diagnostics / runtime / export が同じ execution entry を見やすくなった。
- `lib/projectSerializationSnapshot.ts` は layer ごとに `buildProjectExecutionRoutingMap()` を参照し、`execution` block に以下を含めるようにした。
  - resolved engine / path
  - requested / resolved / path token
  - render / simulation token
  - override / procedural / hybrid token
  - capability flags
  - scene branch token
  - note token
- そのため export 側でも、従来の「engine と path だけ」より一段詳しく routing 状態を追えるようになった。
- `PROJECT_SERIALIZATION_SCHEMA_VERSION` は **2** に更新した。旧 export は migration-aware に fallback しつつ読める。

進捗目安:
- 正式ロードマップ全体: **約89%**
- Phase 4 単体: **約99%**
- 今回の差分上積み: **+1pt 前後**

残り主課題:
- build 完走確認
- export の実ファイル round-trip 検証
- Phase 5 の import/export 検証拡張

## 2026-03-31 追加 11（Phase 4 継続: routing helper 分割と shell / glyph / fiber / line 寄せ）

- Phase 4 の仕上げとして、肥大化していた `lib/sceneRenderRouting.ts` を **役割別に分割** した。現在は以下の4ファイル構成。
  - `lib/sceneRenderRouting.ts`（aggregate export）
  - `lib/sceneRenderRoutingTypes.ts`
  - `lib/sceneRenderRoutingRuntime.ts`
  - `lib/sceneRenderRoutingPlans.ts`
- これにより、前回 653 行だった hotspot は、**types 200行 / runtime 408行 / plans 142行** に分散された。
- さらに Phase 4 の残りとして、以下の subsystem が routing-owned runtime snapshot を使うようになった。
  - `sceneSurfaceShellSystemShared.ts`
  - `sceneSurfaceShellSystemRuntime.ts`
  - `sceneGlyphOutlineSystem.tsx`
  - `sceneFiberFieldSystem.tsx`
  - `sceneLineSystemShared.ts`
  - `sceneVoxelLatticeSystem.tsx`
- 新規 snapshot helper:
  - `getLayerRuntimeHullSnapshot()`
  - `getLayerRuntimeGlyphOutlineSnapshot()`
  - `getLayerRuntimeFiberSnapshot()`
  - `getLayerRuntimeLineSnapshot()`
- これで shell / glyph / fiber / line family でも、`mode / source / color / radiusScale / material / opacity / width / pointBudget` などの読取が routing helper 側へさらに寄った。
- 確認結果:
  - `npm ci` ✅
  - `npm run typecheck` ✅
  - `npm run build` ⚠️ sandbox では今回も `vite build` が `transforming...` 以降で完走確認を取り切れていない
- 進捗目安:
  - 正式ロードマップ全体: **約87%**
  - Phase 4 単体: **約96%**
- Phase 4 の残り主課題:
  - `sceneParticleSystem*` / `sceneParticleSystemRender` / `sceneParticleSystemShared` の raw `config.layer2* / layer3*` 読取寄せ
  - `executionDiagnostics` / 一部 registry 周辺の残差整理
  - build 完走確認

## 2026-03-31 追加 10（Phase 4 継続: subsystem runtime snapshot 共有の拡張）

- Phase 4 の残りとして、scene subsystem 内部でまだ `config.layer2* / layer3*` を個別に読んでいた箇所を、`sceneRenderRouting` 側の **layer runtime snapshot** へ寄せた。
- `lib/sceneRenderRouting.ts` に `LayerRuntimeConfigSnapshot` と以下の helper を追加した。
  - `getLayerRuntimeConfigSnapshot()`
  - `getLayerRuntimeSource()`
  - `getLayerRuntimeColor()`
  - `getLayerRuntimeRadiusScale()`
  - `getLayerRuntimeMaterialStyle()`
  - `getLayerRuntimeGeomMode3D()`
- これにより、routing / scene branch plan だけでなく、subsystem が使う **mode / source / color / radiusScale / materialStyle / geometry** の語彙も共通 helper へ寄り始めた。
- 今回の適用先は以下。
  - `sceneHybridMembraneSystem.tsx`
  - `sceneHybridSurfacePatchSystem.tsx`
  - `sceneSdfSurfaceShellSystem.tsx`
  - `sceneVolumetricFieldSystem.tsx`
  - `sceneHybridGranularFieldSystem.tsx`
  - `sceneHybridFiberFieldSystem.tsx`
- 特に hybrid / shell / volumetric 系では、`mode / source / material / color / radiusScale` の大半を runtime snapshot 由来へ切り替えた。
- 検証結果
  - `npm ci` ✅
  - `npm run typecheck` ✅
  - `npm run build` ⚠️ `vite build` は `transforming...` まで到達するが、この環境では完走ログを最後まで安定取得できない
- 進捗目安
  - 正式ロードマップ全体: **約 82%**
  - Phase 4 単体: **約 87%**
  - 今回上積み: **+5pt 前後**

# CURRENT_STATUS

最終更新: 2026-03-31

このファイルが、このソース一式の**現在の正本**です。  
現状把握は、まずこのファイルと `REVIEW.md` を見てください。

## 2026-03-31 追加 9（Phase 4 継続: scene routing plan の正本化）

- Phase 4 の残りとして、scene 側の描写分岐と render mode summary が **同じ routing 語彙** を使うように整理した。
  - 追加: `lib/sceneRenderRouting.ts`
  - 反映先: `components/AppSceneLayerContent.tsx` / `lib/renderModeRegistry.ts` / `lib/executionDiagnostics.ts` / `components/AppExecutionDiagnosticsOverlay.tsx`
- `sceneRenderRouting` では、Layer 2 / 3 / GPGPU の routing snapshot から以下を一段で判定できるようにした。
  - particle core
  - procedural / hybrid system
  - glyph outline
  - aux / spark
  - connection line style
  - ghost trail
  - GPGPU smooth tube / metaball / volumetric
- `AppSceneLayerContent` は scene family の分岐条件をこの helper へ寄せ、Layer 2 / 3 / GPGPU の描画判定が runtime 内で重複しないようにした。
- `renderModeRegistry` も、mode 名や toggle の直読みだけでなく **実際の routing plan** を見て active 判定する箇所を増やした。
  - これにより image / video / text particle layout、connection lines、instanced solids、ghost trail、GPGPU metaball などが、実 scene とより近い集計になる。
- diagnostics overlay には `scene branches` を追加した。
  - 例: `particle-core` / `procedural:surface-shell` / `hybrid:volume-fog` / `connections:brush` / `metaballs`
- 今回確認できた実行結果:
  - `npm ci` ✅
  - `npm run typecheck` ✅
  - `npm run build` ⚠️ sandbox では今回も `vite build` の完走ログを確認し切れず、`dist` 再生成の断定は保留
- 進捗目安:
  - 正式ロードマップ全体: **3.7 / 5 = 74%**
  - Phase 4 単体: **約 69%**（runtime / diagnostics / registry / scene branch plan まで snapshot-first 化、残りは scene subsystem 個別実装と manifest への更なる反映）

## 2026-03-31 追加 8（Phase 4 継続: snapshot-first の接続拡張）

- Phase 4 の残りとして、routing snapshot をまだ間接参照していた補助層をさらに整理した。
  - 反映先: `lib/simulationAdapterBridge.ts` / `lib/projectExecutionRouting.ts` / `lib/executionDiagnostics.ts` / `components/AppSceneLayerContent.tsx`
- `simulation adapter bridge` は、layer config を再解釈して毎回 engine を引き直すのではなく、**execution routing snapshot を受け取って bridge plan を組める**ようにした。
  - これにより manifest / runtime / diagnostics の adapter 表示が同じ routing entry を正本として共有する。
- `projectExecutionRouting` は bridge 情報を routing snapshot から再構成する形へ寄せ、Layer 2 / 3 の execution → simulation class 連結を一本化した。
- diagnostics も routing entry から bridge 補助情報を組み立てるように変更し、Layer 2 / 3 の engine/path/procedural 解釈が runtime と揃うようにした。
- `AppSceneLayerContent` の GPGPU 補助描写は、`config.gpgpuWebGPUEnabled` 直結ではなく **GPGPU routing entry + feature flag** を基準に判定するようにした。
  - 特に metaball は WebGPU toggle 固定ではなく、resolved backend が `webgl-gpgpu` / `webgpu-compute` のどちらでも描写可能な routing へ修正した。
- 今回確認できた実行結果:
  - `npm ci` ✅
  - `npm run typecheck` ✅
  - `npm run build` ⚠️ sandbox では今回も `transforming...` 以降で停止
- 進捗目安:
  - 正式ロードマップ全体: **3.5 / 5 = 70%**
  - Phase 4 単体: **約 62%**（manifest / diagnostics / Layer2/3 runtime / GPGPU 条件分岐 / adapter bridge の snapshot-first 化まで接続済み、残りは scene subsystem 全域への展開）

## 2026-03-31 追加 6（Phase 4 / 5 前段の正式化）

## 2026-03-31 追加 7（Phase 4 優先の runtime 正本化）

- Phase 4 を優先して、runtime 側が capability-aware routing snapshot を直接参照する範囲を拡大した。
  - 反映先: `components/AppSceneLayerContent.tsx` / `components/gpgpuExecutionRouting.ts` / `lib/executionDiagnostics.ts`
  - 追加/強化: `lib/projectExecutionRouting.ts`
- `ProjectExecutionRoutingSnapshot` に `overrideId` / `proceduralSystemId` / `hybridKind` を追加した。
  - これにより manifest / diagnostics / runtime が同じ routing 語彙を共有するようになった。
- `AppSceneLayerContent` は `resolveExecutionEngineForLayer()` を都度呼ぶ分岐から、`getLayerExecutionRoutingSnapshot()` を正本として使う形へ変更した。
  - Layer 2 / 3 の particle / procedural / hybrid 切替が manifest と同じ解釈で動く。
- `GPGPU` も frame routing 時に `getProjectExecutionRoutingEntry(..., { gpgpuWebgpuAvailable })` を参照するようにした。
  - 静的 manifest と live availability の差分を同じ routing builder 上で吸収する。
- diagnostics overlay と `Project I/O` の routing 表示にも `overrideId` / `proceduralSystemId` / `hybridKind` / flags / notes を反映した。
- 今回確認できた実行結果:
  - `npm run typecheck` ✅

- Phase 4 の前段として散在していた execution foundation を、**project manifest 上の capability-aware routing** として正式化した。
  - 追加: `lib/projectExecutionRouting.ts`
  - 反映先: `lib/projectStateManifest.ts` / `components/controlPanelProjectIOManifestSection.tsx`
  - 内容: render class / simulation class / requested engine / resolved engine / path / capability flags（`webgl-stable` / `webgpu-preferred` / `export-only` / `mobile-risky`）
- Phase 5 の前段として存在していた manifest / storage を、**serialization block + migration-aware schema** へ拡張した。
  - 追加: `lib/projectSerializationSnapshot.ts`
  - 反映先: `lib/projectStateStorage.ts` / `types/project.ts`
  - 内容: `source / simulation / primitive / shading / postfx / execution` block、`schema`、`serialization`、旧 version からの migration 状態保持
- `Project I/O` パネルに capability-aware routing を表示するようにした。
- 今回確認できた実行結果:
  - `npm ci` ✅
  - `npm run typecheck` ✅
  - `npm run build` ⚠️ sandbox では今回も `transforming...` 以降で停止
- 正式ロードマップ進捗率は **3.5 / 5 = 70%** を目安とする。Phase 1〜3 は完了、Phase 4 は runtime / diagnostics / GPGPU 条件分岐 / adapter bridge へ接続拡大中、Phase 5 は serialization schema / migration metadata まで前進。

## 現在の位置づけ

- パッケージ種別: **source only**
- 基準状態: **Phase 87 / Phase 0 complete baseline**
- 正式ロードマップ確認: **UPGRADE_ROADMAP の正式 phase 数は 5（Phase 1〜5） / Phase 2 は現物コードで実装確認済み / Phase 3 は今回完了扱い / 次の主対象は Phase 4**
- 今回完了:
  - `CURRENT_STATUS.md` / `REVIEW.md` を現物ベースへ再同期
  - root の `*.out` を `docs/archive/build-logs/2026-03-31/` へ退避
  - `npm audit` を **0 vulnerabilities** で維持
  - `starterLibrarySequenceExtensions.ts` を aggregate + 4 chunk へ再分割
  - `appStateConfig.ts` を aggregate 化し、default family を 8分割
  - `depictionCoverage.ts` を aggregate 化し、`targets / layer-resolvers / gpgpu-resolvers / family-resolvers / summary` へ再分割
- 今回の確認範囲:
  - `npm run typecheck` ✅
  - `npm run build` ✅
  - `npm run verify:public-library` ✅
  - `npm audit --json` ✅
  - `npm run verify:library` ⚠️ Playwright browser 未配置のため未完
  - `npm run build`（今回 Phase 2 差分の再確認）⚠️ sandbox 環境では `transforming...` 以降で停止。`typecheck` と `verify:public-library` は通過
- 正式ロードマップ進捗率: **3 / 5 完了 = 60%**
- Phase 3 進捗: image / video / text source の luminance を particle layout だけでなく size / alpha にも反映し、さらに text source + 3D solids では instanced solid の scale / rotation / depth layering にも反映
- 今回 pass の検証: `npm run typecheck` / `npm run build` / `npm run verify:public-library` / `npm audit --json` は通過

## 今回の要点

### 1. root を静かに維持した

以下のログを root 直下から退避済みです。

- `build.out`
- `typecheck.out`
- `typecheck2.out`
- `typecheck3.out`
- `typecheck4.out`
- 今回追加の `build_phase1b.out`
- 今回追加の `build_split_only.out`

退避先:

- `docs/archive/build-logs/2026-03-31/`

### 2. source-level split を本体側へ進めた

`lib/appStateConfig.ts` は aggregate export 層へ縮小し、以下へ分割しました。

- `lib/appStateConfigDefaults.ts`
- `lib/appStateConfigNormalization.ts`
- `lib/appStateDefaultViewDisplay.ts`
- `lib/appStateDefaultEnvironment.ts`
- `lib/appStateDefaultAudioSynth.ts`
- `lib/appStateDefaultLayer1.ts`
- `lib/appStateDefaultLayer2.ts`
- `lib/appStateDefaultLayer3.ts`
- `lib/appStateDefaultGpgpu.ts`
- `lib/appStateDefaultPostAmbient.ts`

`lib/depictionCoverage.ts` も aggregate export 層へ縮小し、以下へ分割しました。

- `lib/depictionCoverageTargets.ts`
- `lib/depictionCoverageLayerResolvers.ts`
- `lib/depictionCoverageGpgpuResolvers.ts`
- `lib/depictionCoverageFamilyResolvers.ts`
- `lib/depictionCoverageSummary.ts`

### 3. build は維持した

`appStateConfig` / `depictionCoverage` の source-level split 後も、build は通過しています。  
追加の `manualChunks` も試しましたが、その差分は build 安定性確認のため採用せず、**現時点では source split のみを採用**しています。

### 4. Phase 2 を開始した

scene 系の責務分割に入り、`components/sceneBrushSurfaceSystemShared.ts` を aggregate export 層へ縮小しました。

新規分割先:

- `components/sceneBrushSurfaceSystemTypes.ts`
- `components/sceneBrushSurfaceSystemProfiles.ts`
- `components/sceneBrushSurfaceSystemShaders.ts`
- `components/sceneBrushSurfaceSystemConfig.ts`

これにより、次の Phase 2 本体を **scene / control-panel の責務分離** として進める足場ができています。

### 5. Phase 2 の完了はコード実体でも確認できる

`UPGRADE_ROADMAP.md` の Phase 2 要件である render mode registry / support level / UI summary は現物コードで成立しています。

- `lib/renderModeRegistry.ts`
- `components/controlPanelGlobalDisplay.tsx`

したがって、正式ロードマップ上の **Phase 2 は完了確認済み** と扱えます。

### 6. Phase 3d を前進させた

`components/sceneReactionDiffusion*` 系を強化し、以下を mode ごとに分離しました。

- diffusion coefficients (`dA / dB`)
- reaction gain
- surface height / ridge / pit
- wetness / scar

これにより `reaction_diffusion` / `cellular_front` / `corrosion_front` / `biofilm_skin` が単なる同一 plate shader ではなく、より独立した表情を持つようになっています。

### 7. Phase 3d の topology routing も dedicated 化した

`components/sceneReactionDiffusionSystemRender.tsx` に mode / source 別の geometry routing を追加しました。

- `biofilm_skin` → sphere shell
- `cellular_front` → open cylinder front
- `corrosion_front` → torus etch ring
- その他の reaction source → plane / disc / ring / torus / cylinder / cone / cube / sphere

これにより、Phase 3d は shader parameter 差だけでなく、**専用 render path 側で topology も切り替わる**段階に進みました。

### 8. Phase 3 を完了扱いへ進めた

reaction-diffusion 系の dedicated runtime / shader / topology routing に加え、baseline browsing surfaces 側も同期しました。

追加した露出先:

- `lib/starterLibraryPresetExtensionChunk04.ts`
  - `starter-reaction-plate-labyrinth`
  - `starter-biofilm-colony-skin`
- `lib/starterLibrarySequenceExtensionChunk04.ts`
  - 上記 2 preset の sequence step
- `lib/expressionAtlasBundlesAnchorsElastic.ts`
  - `reaction-plate-labyrinth-anchor`
  - `biofilm-colony-anchor`

これにより、Phase 3 の新 render class は procedural panel だけでなく、**starter preset / preset sequence / expression atlas anchor** からも辿れる状態になりました。

## build 実測

### 変更前（同梱 `build.out`）

- `index-_21j54FJ.js`: **1415.65 kB**
- `three-core-CRqydIZK.js`: **675.03 kB**
- Vite chunk warning: **あり**

### 現在（2026-03-31 再計測）

- `index-DBOT5kv7.js`: **430.96 kB**
- `depiction-catalog-B8e6VC9t.js`: **327.00 kB**
- `starter-library-data-B0CBr1ai.js`: **226.58 kB**
- `scene-core-families-COB0V8U4.js`: **191.96 kB**
- `scene-surface-families-hogEgexv.js`: **169.28 kB**
- `scene-gpgpu--xN8mpx6.js`: **71.74 kB**
- `three-core-BbVy3ccf.js`: **675.03 kB**
- Vite chunk warning: **なし**

## 現在の実測値（現物同期済み）

| ファイル | 行数 | KB | 現在の責務 |
|---|---:|---:|---|
| `App.tsx` | 431 | 13.6 | app orchestrator |
| `components/AppScene.tsx` | 110 | 4.2 | scene orchestrator |
| `components/AppSceneLayerContent.tsx` | 251 | 14.7 | layer 別 scene family 集約 |
| `components/sceneGpgpuSystem.tsx` | 251 | 6.5 | GPGPU orchestrator |
| `components/controlPanelTabLayer2.tsx` | 436 | 31.2 | layer 2 controls |
| `components/controlPanelTabLayer3.tsx` | 436 | 31.2 | layer 3 controls |
| `lib/appStateConfig.ts` | 2 | 0.1 | config aggregate export |
| `lib/appStateConfigDefaults.ts` | 20 | 1.0 | config default aggregate |
| `lib/appStateConfigNormalization.ts` | 116 | 4.0 | normalize / synth helpers |
| `lib/appStateDefaultLayer2.ts` | 207 | 5.7 | layer2 default family |
| `lib/appStateDefaultLayer3.ts` | 207 | 5.7 | layer3 default family |
| `lib/depictionCoverage.ts` | 4 | 0.2 | coverage aggregate export |
| `lib/depictionCoverageTargets.ts` | 174 | 4.1 | target definitions |
| `lib/depictionCoverageLayerResolvers.ts` | 186 | 6.9 | layer/source/render resolver |
| `lib/depictionCoverageGpgpuResolvers.ts` | 138 | 6.4 | gpgpu / compute resolver |
| `lib/depictionCoverageFamilyResolvers.ts` | 253 | 15.4 | solver / physical / temporal / specialist resolver |
| `lib/depictionCoverageSummary.ts` | 95 | 4.1 | profile assembly / gap summary |
| `lib/starterLibraryPresetBaseChunk02.ts` | 615 | 19.5 | preset base data chunk |
| `lib/starterLibraryPresetExtensionChunk05.ts` | 609 | 21.0 | preset extension data chunk |
| `lib/starterLibrarySequenceExtensions.ts` | 12 | 0.7 | sequence extension aggregate |
| `vite.config.ts` | 101 | 4.7 | build / chunk policy |

## 残る大型ホットスポット

現在の **500行超 TypeScript / TSX** は **5本** です。  
前回の **7本 → 5本** に減少しました。

1. `lib/starterLibraryPresetBaseChunk02.ts` — 615行
2. `lib/starterLibraryPresetExtensionChunk05.ts` — 609行
3. `lib/starterLibraryPresetExtensionChunk03.ts` — 596行
4. `lib/starterLibraryPresetBaseChunk01.ts` — 554行
5. `lib/hybridTemporalVariantBase.ts` — 506行

したがって、現在の中心問題は `config / coverage` ではなく、**starter preset data と hybrid temporal variant** 側です。

## 正式ロードマップ進捗

### Phase 2

`UPGRADE_ROADMAP.md` の要件は現物コードで満たしています。

- `lib/renderModeRegistry.ts` に render mode registry 本体がある
- category と support level（stable / experimental / heavy）を保持している
- `components/controlPanelGlobalDisplay.tsx` がこの registry を集計表示している

したがって、**正式な描写機能拡張の軸では Phase 2 は完了扱いでよい**です。

### Phase 3

現時点で確認できる進捗は次です。

- 3b: Brush / Filament connection lines — 実装済み
- 3c: image / video / text の media luminance sampling 強化 — 実装済み
- 3e: sheet / membrane surface — 実装済み
- 3f: text / glyph driven instancing 強化 — 今回実装
- 3d: reaction-diffusion は dedicated runtime / shader / render を持ち、さらに mode / source 別 topology routing まで入った。残課題は preset 同期と capability-aware routing への接続

Phase 3 は**今回で完了扱い**です。

## 検証結果

### 成功

- `npm run typecheck`
- `npm run build`
- `npm run verify:public-library`
- `npm audit --json`（clean）

### 未完

- `npm run verify:library`
  - Playwright browser binary が環境に無いため停止
  - `npx playwright install chromium` も DNS `EAI_AGAIN` で取得失敗
  - したがって、**ライブラリ verify の未完はコード不具合確定ではなく、実行環境不足**

## 文書運用

- root の正本:
  - `CURRENT_STATUS.md`
  - `REVIEW.md`
  - `REFACTOR_PLAN_LARGE_FILES.md`
  - `PHASE0_COMPLETION_STATUS.md`
  - `SYSTEM_DESIGN_BLUEPRINT.md`
  - `UPGRADE_ROADMAP.md`
- 旧ログ / 旧進捗 / build log:
  - `docs/archive/root-history/`
  - `docs/archive/build-logs/2026-03-31/`

- Phase 3 進捗追記: reaction-diffusion 系の procedural grouping / quick preset / controls 同期を実施。`cellular_front` と `biofilm_skin` に quick preset を追加し、procedural panel で reaction family controls と guide-aware reset source が機能するようにした。

## Phase 4 追加進捗（2026-03-31, snapshot-first continuation）

今回の差分では、Phase 4 の残りを **scene subsystem 個別内部でも同じ routing plan を使う** 方向で前進させた。

### 実施

- `lib/sceneRenderRouting.ts`
  - `LayerSceneRenderPlan`
  - `GpgpuRenderOutputPlan`
  を追加
- Layer 2 / 3 について、particle / procedural / hybrid / glyph / aux / spark / connection / ghost trail の scene branch を単一 plan として返すようにした
- GPGPU について、point / instanced / trail / ribbon / tube / streak / smooth tube / metaball / volumetric の output 判定を単一 plan として返すようにした
- `components/AppSceneLayerContent.tsx` は Layer 2 / 3 と GPGPU の描画条件を plan 参照へ変更
- `components/gpgpuRenderOutputs.tsx` は GPGPU output branch を plan 参照へ変更
- `lib/renderModeRegistry.ts` は GPGPU active 判定を plan 参照へ変更

### 意味

これにより、Phase 4 の capability-aware routing は

- manifest
- diagnostics
- render mode summary
- scene family selection
- GPGPU output rendering

で同じ routing / branch 語彙を共有する状態にさらに近づいた。

### 進捗目安

- 正式ロードマップ全体: **約 78%**
- Phase 4 単体: **約 76%**

残りの中心課題は、scene subsystem 内部にまだ残る個別 config 解釈と、manifest / export 側への scene branch plan のさらなる反映である。

- Phase 4 update: manifest execution entries now include sceneBranches, and procedural scene subsystem mode reads are routed through `getLayerRuntimeMode()` so exported routing, UI cards, and subsystem profile selection use the same mode vocabulary.

- Phase 4 continuation: subsystem runtime setting reads now extend beyond `mode/source/material/color/radiusScale` into `temporal`, `line style`, `deposition`, `patch`, `growth`, and `fog` snapshots. `useAppSceneTemporalConfig`, `sceneLineSystemRuntime`, `sceneDepositionFieldSystem`, `sceneGrowthFieldSystem*`, `sceneSurfacePatchSystemShared`, and `sceneVolumeFogSystemRuntime` now resolve more of their runtime state through `lib/sceneRenderRouting.ts`.

- Phase 4 continuation: `sceneRenderRouting` now owns source-layout-aware runtime snapshots and particle-layout dependency assembly for more subsystems. Crystal aggregate / crystal deposition / voxel lattice / erosion trail / brush surface config now read `source`, `sourceCount`, `sourceSpread`, `density`, `opacity`, `materialStyle`, and `radiusScale` through shared helpers instead of repeating raw `config.layer2*` / `config.layer3*` lookups.
- Phase 4 progress estimate update: 正式ロードマップ全体 **約86%**、Phase 4 単体 **約95%**。残る主課題は subsystem 内にまだ残る一部 source-specific tuning の helper 化、manifest/export 側の runtime snapshot 反映の詰め、build 完走確認。

- Phase 4 continuation: particle core runtime reads are now routed through shared snapshots. `sceneParticleSystemShared`, `sceneParticleSystemRender`, `particleData`, and `sceneParticleSystem` now consume routing-owned particle field / visual / SDF / ghost-trail helpers, eliminating direct `config.layer2*` / `config.layer3*` reads inside those target files.
- Phase 4 progress estimate update: 正式ロードマップ全体 **約88%**、Phase 4 単体 **約98%**。残る主課題は build 完走確認、manifest/export 側の最終同期整理、一部 routing builder 側の historical raw branching の整理。

## Future native families scaffold

This pass added a forward-implementation scaffold for still-non-native solver families under `docs/future-native-families/` and `lib/future-native-families/`.

Covered families:
- MPM: granular / viscoplastic / snow / mud / paste
- PBD: cloth / membrane / rope / softbody
- fracture: lattice / voxel / crack propagation / debris
- volumetric: smoke / density transport / advection / pressure coupling / light-shadow coupling
- specialist-native: Houdini-like / Niagara-like / TouchDesigner-like / Unity VFX-like

What exists now is registry/type/default/serialization/prompt scaffolding for later AI or human passes. These are **not** yet claimed as runtime-complete native solvers.

## 2026-03-31 future native family scaffold expansion
- Added starter runtime stubs for `pbd-rope` and `mpm-granular`.
- Added implementation packet builder and `npm run emit:future-family-packet -- <family-id>` CLI.
- Added starter-runtime folder for schema/solver scaffolds that later AI can extend.

- Added first-wave starter stubs for `fracture-lattice` and `volumetric-density-transport`.

- 2026-03-31 update: volumetric-density-transport now includes pressure field approximation plus lighting/shadow coupling; dedicated verifier and first-wave verifier pass with scalar coverage for pressure/light/shadow.
- Added Python packet emitter for all registered future native family IDs.

## Future native families update

- `pbd-rope` は first-wave scaffold から一段進み、deterministic CPU PBD-lite stepper と dedicated verifier を持つ native starter へ移行。
- `npm run verify:pbd-rope` で 48 frame の anchor / stretch / sag / render payload を確認可能。

## 2026-03-31 pbd-rope bend/collision starter

- pbd-rope native starter に bend constraint を追加
- floor / circle collider primitive を追加
- verify:pbd-rope を 64 frame / floor contact / circle contact / bend deviation 検証へ更新

- 2026-03-31: `mpm-granular` advanced from seed-only starter to native starter runtime with deterministic stepping, floor/wall bounds, pair contact resolution, dedicated verifier, and render payload sync.

## Future native family scaffold
- `fracture-lattice` advanced from scaffold-only to native starter with deterministic impact fracture, debris spawn, dedicated verifier, and first-wave verification integration.

## Future native family progress update
- `volumetric-density-transport` promoted from scaffold to native starter.
- Added deterministic 2D density + velocity runtime, buoyancy/swirl injection, lightweight pressure relaxation, and dedicated verifier.

## 2026-03-31 MPM granular grid/transfer substrate

- `mpm-granular` native starter を、pair-contact pile から **grid/transfer substrate 付き** に拡張。
- `MpmGranularGridState` を追加し、P2G 風の mass/velocity accumulation と G2P 風の velocity blend を導入。
- `verify:mpm-granular` / `verify:future-first-wave` / `typecheck` を通過。
- `fracture-lattice` をさらに進め、directional crack propagation bias / largest broken cluster / propagation advance を導入。
- `verify:fracture-lattice` / `verify:future-first-wave` は通過。
- この ZIP 単体では同梱 `node_modules` の `tsc` 実体欠落で `typecheck` が止まるため、依存再構成が必要。
- 現段階では true MPM ではなく、**grid-aware granular starter**。今後の mud / snow / paste 派生の足場。

- 2026-03-31 追記: `mpm-granular` に materialKind (`sand/snow/mud/paste`)・kernelRadius・plasticity・yieldRate を追加し、grid/transfer 下地を plasticity-aware starter へ拡張。`verify:mpm-granular` で plastic strain / compactness / dense cell を確認。

- 2026-03-31 update: pbd-rope native starter extended with capsule collider and self-collision spacing guard; `verify:pbd-rope`, `verify:future-first-wave`, and `typecheck` passed.

- 2026-03-31 update: fracture-lattice native starter extended with detached fragment grouping / cluster split handoff; `verify:fracture-lattice`, `verify:future-first-wave`, and `typecheck` passed.

- Added shared future-native progress/report layer with JSON/Markdown emitter (`npm run emit:future-native-report`).

- 2026-03-31 update: Added shared future-native integration layer for first-wave families. `verify:future-native-integration` and `emit:future-native-integration` now produce unified serializer/UI/runtime snapshots and JSON/Markdown reports.

## 2026-03-31 future-native project export/import connection

- Connected future-native first-wave integration metadata into `ProjectSerializationSnapshot.futureNative`.
- `buildProjectSerializationSnapshot()` now emits a light-weight future-native block with summary + firstWave family entries.
- `parseProjectData()` now preserves `serialization.futureNative` on round-trip and rebuilds it for legacy payloads.
- Bumped `PROJECT_SERIALIZATION_SCHEMA_VERSION` to `3`.
- `npm run typecheck` and `npm run verify:project-state` now cover future-native serialization round-trip checks.

- 2026-03-31 追加: `serialization.futureNative.firstWave[*]` に `runtimeConfig` と `statsKeys` を追加。project export/import round-trip と legacy migration 後も保持/再構築されることを `verify:project-state` で確認。

- 2026-03-31: future-native first-wave serialization now includes per-family `runtimeState` blocks alongside `runtimeConfig`, and `verify:project-state` checks round-trip and migration for both.

## 2026-03-31 Future-native shared runtime verification

- Added `lib/future-native-families/futureNativeFamiliesVerifier.ts` as a shared verification utility for first-wave integration snapshots and project-side runtime-state snapshots.
- Added `npm run verify:future-native-runtime-state` and verified all first-wave families pass shared runtime-state checks.
- Verified `npm run typecheck`, `npm run verify:future-native-integration`, `npm run verify:future-native-runtime-state`, and `npm run verify:project-state`.

## 2026-03-31 future-native project snapshots

- Added `verify:future-native-project-snapshots` and `emit:future-native-project-snapshots`.
- Added project-level future-native snapshot report generation for baseline, hybrid/video, and text/fiber+GPGPU scenarios.
- Future-native project JSON now has shared coverage reporting outside of the phase-5 project-state verifier.

- future-native first-wave: `mpm-granular` を APIC / stress-aware starter へ更新。kernel-weighted transfer に affine velocity と stress metrics を追加し、`verify:mpm-granular` / `verify:future-first-wave` / `typecheck` を通過。

- Added `pbd-cloth` native starter using shared PBD constraints, with grid topology, structural/shear/bend links, floor collision, self-collision spacing guard, and dedicated verifier.

- Future-native PBD band was expanded: `pbd-membrane` is now a native starter with shared constraints, inflation, boundary tension, and a dedicated verifier (`npm run verify:pbd-membrane`).

- 2026-03-31: `pbd-cloth` / `pbd-membrane` に shared circle/capsule collider coupling を追加。`verify:pbd-cloth` / `verify:pbd-membrane` / `verify:future-first-wave` / `typecheck` を通過。

- 2026-03-31: pbd-cloth / pbd-membrane に tear threshold と pin-group を追加。shared tearable links で brokenLinks / tearEvents を dedicated verifier まで確認。

- PBD surface 系に shared `pbd_surfaceForces.ts` を追加し、cloth / membrane の wind / pressure coupling を共有層へ寄せた。

- Future-native PBD surface: multi pin-group and tear propagation sharedization added for cloth/membrane; dedicated verifiers and first-wave verifier pass.

- PBD surface shared layer: obstacle field と directional tear weighting を cloth / membrane に追加。 dedicated verifier と first-wave verifier を通過。

- 2026-03-31 update: PBD surface shared layer now supports multi-obstacle fields and tear bias maps for cloth/membrane, with dedicated and first-wave verifiers passing.

- Future-native PBD surface shared layer was extended with pin choreography and layered obstacle presets. Cloth and membrane now expose choreography drift and obstacle layer counts in dedicated verification.

- 2026-04-01: 配布 zip 内の空 `node_modules/` に引きずられないよう、`bootstrap` / `doctor:tooling` / `audit=false` を追加。以後は `npm run bootstrap` → `npm run doctor:tooling` を基準復旧経路とする。

- 2026-04-01: `START_MONOSPHERE.command` と `launch-kalokagathia.command` を `doctor:tooling` 基準へ修正。空の `node_modules/` が残っていても `bootstrap` に自動フォールバックする。

- 2026-04-01: `cloth_membrane` を `pbd-cloth` の `native-surface` binding に更新し、scene handoff で cloth surface mesh / hull / depth range を出力するよう拡張。

- 2026-04-01: `sceneRenderRoutingRuntime.ts` を `sceneRenderRoutingShared.ts` / `sceneRenderRoutingSnapshots.ts` / `sceneRenderRoutingProceduralSnapshots.ts` / `sceneRenderRoutingRenderPredicates.ts` に分割。routing 本体は barrel 化し、`typecheck` / `verify:future-native-project-snapshots` / `vite build --emptyOutDir` を通過。

- 2026-04-01: `pbd_sharedConstraints.ts` を `pbd_sharedTypes.ts` / `pbd_pinConstraints.ts` / `pbd_tearConstraints.ts` / `pbd_collisionConstraints.ts` に分割。barrel 化後も `typecheck` / `verify:future-native-project-snapshots` / `vite build --emptyOutDir` を通過。

- 2026-04-01: `pbd_softbodySolver.ts` を `pbd_softbodyTypes.ts` / `pbd_softbodyState.ts` / `pbd_softbodyShape.ts` / `pbd_softbodyForces.ts` / `pbd_softbodyStats.ts` に分割。barrel 化後も `typecheck` / `verify:future-native-project-snapshots` / `vite build --emptyOutDir` を通過。

- 2026-04-01: `projectStateManifest.ts` を `projectStateManifestShared.ts` / `projectStateManifestBuilder.ts` / `projectStateManifestNormalizer.ts` に分割。manifest 本体は barrel 化し、`typecheck` / `verify:future-native-project-snapshots` / `vite build --emptyOutDir` を通過。

- 2026-04-01: `controlPanelTabLayer2.tsx` / `controlPanelTabLayer3.tsx` を `controlPanelTabLayerShared.tsx` へ共通化。Layer 2/3 は薄い wrapper 化し、`typecheck` / `verify:future-native-project-snapshots` / `vite build --emptyOutDir` を通過。
- 2026-04-01: `sceneParticleSystem.tsx` を `sceneParticleSystemFrame.ts` / `sceneParticleSystemGhosts.ts` に分割。frame update と ghost trail 同期を外出しし、本体は orchestration のみへ整理。`typecheck` / `verify:future-native-project-snapshots` / `vite build --emptyOutDir` を通過。


- 2026-04-01: `sceneMembraneSystem.tsx` を `sceneMembraneProfiles.ts` / `sceneMembraneLayout.ts` / `sceneMembraneFrame.ts` に分割。membrane profile / layout / frame update を分離し、`typecheck` / `verify:future-native-project-snapshots` / `vite build --emptyOutDir` を通過。

- 2026-04-01: `sceneMotionEstimator.ts` を `sceneMotionEstimatorShared.ts` / `sceneMotionEstimatorSpecific.ts` / `sceneMotionEstimatorGroups.ts` に分割。motion specific / fallback groups / shared helper を分離し、`typecheck` / `verify:future-native-project-snapshots` / `vite build --emptyOutDir` を通過。

- 2026-04-01: `sceneParticleSystemFrame.ts` を `sceneParticleSystemFrameShared.ts` / `sceneParticleSystemFrameUniforms.ts` に分割。frame orchestration と uniform update を分離し、`typecheck` / `verify:future-native-project-snapshots` / `vite build --emptyOutDir` を通過。

- 2026-04-01: `hybridTemporalVariantBase.ts` を `hybridTemporalVariantBaseShared.ts` / `hybridTemporalVariantBaseAtmospheric.ts` / `hybridTemporalVariantBaseMaterial.ts` / `hybridTemporalVariantBaseSourceAware.ts` に分割。temporal pair base は barrel 化し、`typecheck` / `verify:future-native-project-snapshots` / `vite build --emptyOutDir` を通過。

- 2026-04-01: `expressionAtlasBundlesBase.ts` を `expressionAtlasBundlesBaseShared.ts` / `expressionAtlasBundlesBaseAtmospheric.ts` / `expressionAtlasBundlesBaseMaterial.ts` / `expressionAtlasBundlesBaseSourceAware.ts` に分割。bundle base は barrel 化し、`typecheck` / `verify:future-native-project-snapshots` / `vite build --emptyOutDir` を通過。

- 2026-04-01: `temporalProfiles.ts` を `temporalProfilesShared.ts` / `temporalProfilesGroupA.ts` / `temporalProfilesGroupB.ts` に分割。layer temporal modulation を shared helper と profile group へ分離し、zip 展開時に落ちた `esbuild` 実行権限を補正した上で `typecheck` / `verify:future-native-project-snapshots` / `vite build --emptyOutDir` を通過。

## 2026-04-01 追加 40
- source-aware shaping surface family を分割し、`lib/sourceAwareShapingSurfaceFamilies.ts` を再公開だけの入口へ縮小。
- 新規: `lib/sourceAwareShapingSurfaceCrossFamily.ts` / `lib/sourceAwareShapingSurfaceSourceProfiles.ts`
- `typecheck` / `verify:future-native-project-snapshots` / `build` の再通過を確認。
- これで 450行超の実装コアは `0` 本になった。残る大型ファイル帯は preset chunk と `renderModeRegistry.ts` の 450 行境界のみ。

## 2026-04-01 追加 41
- `renderModeRegistry.ts` を `renderModeRegistryShared.ts` / `renderModeRegistryLayerModes.ts` / `renderModeRegistryGpuModes.ts` / `renderModeRegistryPostFxModes.ts` に分割し、本体は barrel 化した。
- render mode 定義を layer / gpgpu / post fx に分離し、summary 関数は既存 API を維持したまま `renderModeRegistry.ts` に残した。
- `typecheck` / `verify:future-native-project-snapshots` / `build` の再通過を確認。
- これで 450行以上の実装コアは `0` 本になった。残る大型ファイル帯は preset chunk と文書が中心。

## 2026-04-01 追加 42
- `starterLibraryPresetBaseChunk02.ts` を `starterLibraryPresetBaseChunk02Procedural.ts` / `starterLibraryPresetBaseChunk02Flow.ts` / `starterLibraryPresetBaseChunk02Hybrid.ts` に分割し、本体は barrel 化した。
- preset 群を procedural / flow / hybrid の3帯域へ整理し、既存の配列順は維持したまま拡張しやすい構造へ変更した。
- `typecheck` / `verify:future-native-project-snapshots` / `build` の再通過を確認。
- これで starter base 側の最大塊は chunk02 から procedural / flow / hybrid の分割単位へ縮小した。残る最大塊は preset extension / base の他 chunk と文書帯域が中心。

## 2026-04-01 追加 35
- `lib/starterLibraryPresetExtensionChunk03.ts` を分割。`Chunk03` は barrel 化し、`Atmospheric / FiberInk / SourceContrast / Review` の4ファイルへ再配置。
- 行数: `starterLibraryPresetExtensionChunk03.ts` 596行 → 12行、分割先は 127 / 136 / 156 / 194 行。
- 検証: `npm run typecheck` ✅ / `npm run verify:future-native-project-snapshots` ✅ / `vite build --emptyOutDir` ✅。
- build 出力の主要 chunk: `index-CmtvnG3n.js` 586.66 kB / `starter-library-data-BmicKKTY.js` 228.87 kB / `depiction-catalog-UBpCZwr_.js` 375.25 kB。
- 主指標の 450行超実装コア 0本は維持。preset 系の残る最大塊は `starterLibraryPresetBaseChunk01.ts` 554行。

## 2026-04-01 追加 44
- `lib/starterLibraryPresetBaseChunk01.ts` を分割。`Chunk01` は barrel 化し、`Geometric / Flow / Reactive` の3ファイルへ再配置。
- 行数: `starterLibraryPresetBaseChunk01.ts` 554行 → 10行、分割先は 195 / 97 / 272 行。
- 検証: `npm run typecheck` ✅ / `npm run verify:future-native-project-snapshots` ✅ / `vite build --emptyOutDir` ✅。
- build 出力の主要 chunk: `index-3y7t8iBf.js` 586.66 kB / `starter-library-data-Bq5bTZm3.js` 228.90 kB / `depiction-catalog-UBpCZwr_.js` 375.25 kB。
- 主指標の 450行超実装コア 0本は維持。preset 系の残る最大塊は `starterLibraryPresetExtensionChunk02.ts` 490行。

## 2026-04-01 追加 45
- `lib/starterLibraryPresetExtensionChunk02.ts` を分割。`Chunk02` は barrel 化し、`Atmospheric / SourceContrast / GlyphWeave / MaterialForms / Manuscript` の5ファイルへ再配置。
- 行数: `starterLibraryPresetExtensionChunk02.ts` 490行 → 14行、分割先は 111 / 90 / 71 / 181 / 56 行。
- 検証: `npm run typecheck` ✅ / `npm run verify:future-native-project-snapshots` ✅ / `vite build --emptyOutDir` ✅。
- build 出力の主要 chunk: `index-DaoQMaaL.js` 586.66 kB / `starter-library-data-BYLUV2zO.js` 228.96 kB / `depiction-catalog-UBpCZwr_.js` 375.25 kB。
- 主指標の 450行超実装コア 0本は維持。残る 450行以上の project 大型ファイルは `CURRENT_STATUS.md` 887行 / `starterLibraryPresetBaseChunk03.ts` 474行 / `REFACTOR_PLAN_LARGE_FILES.md` 469行 / `starterLibraryPresetBaseChunk04.ts` 455行。
