# Archive duplicate audit packet

- packetId: role-archive-duplicate-audit
- packetType: role-audit
- recommendedRole: docs-package-worker
- recommendedReturnUnit: patch

## Worker return template

```md
- 対象: role-archive-duplicate-audit
- 種別: patch
- 触った範囲:
- 触っていない幹線:
- 実行 verify:
- 残件:
- mainline 判断が必要な点:
```

## Verify commands

- node scripts/verify-package-integrity.mjs --strict

## Evidence paths

- .gitignore
- .npmrc
- App.tsx
- components/AppComparePreview.tsx
- components/AppExecutionDiagnosticsOverlay.tsx
- components/AppSceneCameraRig.tsx
- components/AppSceneLayerContent.tsx
- components/canvasStreamWidget.tsx
- components/ControlPanel.tsx
- components/controlPanelChrome.tsx
- components/controlPanelGlobalDisplay.tsx
- components/controlPanelGlobalDisplayGpgpu.tsx
- components/controlPanelGlobalDisplayGpgpuAdvancedRender.tsx
- components/controlPanelGlobalDisplayGpgpuForces.tsx
- components/controlPanelGlobalDisplayGpgpuTrails.tsx
- components/controlPanelGlobalDisplayPostFx.tsx
- components/controlPanelGlobalDisplayProductPacks.tsx
- components/controlPanelGlobalDisplayScreenFx.tsx
- components/controlPanelGlobalExport.tsx
- components/controlPanelGlobalPresets.tsx
- components/controlPanelGlobalProject.tsx
- components/controlPanelGlobalSequence.tsx
- components/controlPanelPartsInputs.tsx
- components/controlPanelPartsMotion.tsx
- components/controlPanelPartsPreview.tsx
- components/controlPanelPartsSequence.tsx
- components/controlPanelPartsSourceMedia.tsx
- components/controlPanelPartsSourceShared.tsx
- components/controlPanelPresetCard.tsx
- components/controlPanelPresetLibraryIO.tsx
- components/controlPanelProceduralModeSettings.tsx
- components/controlPanelProjectIO.tsx
- components/controlPanelProjectIOCompareSection.tsx
- components/controlPanelProjectIOCompareShared.tsx
- components/controlPanelProjectIOManifestSection.tsx
- components/controlPanelProjectIOManifestShared.tsx
- components/controlPanelProjectIOSnapshotCard.tsx
- components/controlPanelSequenceItemActions.tsx
- components/controlPanelSequenceItemCard.tsx
- components/controlPanelSequenceItemEditable.tsx
- components/controlPanelSequenceItemReadonly.tsx
- components/controlPanelTabLayer1.tsx
- components/controlPanelTabLayer2.tsx
- components/controlPanelTabLayer3.tsx
- components/controlPanelTabs.tsx
- components/controlPanelTabsAudio.tsx
- components/controlPanelTabsShared.tsx
- components/controlPanelTypes.ts
- components/gpgpuDiagnostics.ts
- components/motionCatalog.ts
- components/proceduralModeSettingsOverview.tsx
- components/proceduralModeSettingsQuickPresets.ts
- components/proceduralModeSpecificControls.tsx
- components/sceneBrushSurfaceSystem.tsx
- components/sceneBrushSurfaceSystemRuntime.ts
- components/sceneCrystalAggregateSystem.tsx
- components/sceneCrystalDepositionSystem.tsx
- components/sceneDepositionFieldSystem.tsx
- components/sceneErosionTrailSystem.tsx
- components/sceneFiberFieldSystem.tsx
- components/sceneGlyphOutlineSystem.tsx
- components/sceneGpgpuSystem.tsx
- components/sceneGrowthFieldSystemRuntime.ts
- components/sceneHybridFiberFieldSystem.tsx
- components/sceneHybridGranularFieldSystem.tsx
- components/sceneHybridMembraneSystem.tsx
- components/sceneHybridSurfacePatchSystem.tsx
- components/sceneLineSystemRuntime.ts
- components/sceneLineSystemShared.ts
- components/sceneMembraneSystem.tsx
- components/sceneMetaballSystem.tsx
- components/sceneMotionEstimator.ts
- components/sceneMotionEstimatorShared.ts
- components/sceneMotionEstimatorSpecific.ts
- components/sceneMotionMap.ts
- components/sceneOverlay.tsx
- components/sceneParticleSystem.tsx
- components/sceneParticleSystemRender.tsx
- components/scenePrimitives.tsx
- components/sceneReactionDiffusionProfiles.ts

## Open checks

- archive と現行 root の同 relative path 取り違えリスクを注記すること
- archive 由来のファイルを正本扱いしないこと
- CURRENT_STATUS だけを先に更新しないこと

## Untouched trunks

- manifest 正本の意味変更
- registry 正本の意味変更
- routing 正本の意味変更
- package class の最終決定
- CURRENT_STATUS.md の最終同期
- REVIEW.md / DOCS_INDEX.md の最終 truth 化

## Mainline decision points

- archive 整理を docs only にするか closeout 時にまとめるか

