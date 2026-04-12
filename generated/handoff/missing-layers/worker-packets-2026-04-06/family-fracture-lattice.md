# Lattice Fracture

- packetId: family-fracture-lattice
- packetType: family-evidence
- familyId: fracture-lattice
- group: fracture
- currentStage: project-integrated
- progressPercent: 98
- ownershipClass: conditional
- officialStateCandidate: implemented
- closureCandidate: review-ready
- recommendedRole: family-fracture-worker
- recommendedReturnUnit: patch

## Worker return template

```md
- 対象: fracture-lattice
- 種別: patch
- 触った範囲:
- 触っていない幹線:
- 実行 verify:
- 残件:
- mainline 判断が必要な点:
```

## Mode bindings

- fracture_grammar / native-structure / source=grid / minPoints=24

## Verify commands

- npm run verify:fracture-lattice
- npm run verify:future-native-nonvolumetric-routes
- npm run verify:future-native-project-state-fast

## Evidence paths

- docs/handoff/FUTURE_NATIVE_RELEASE_REPORT.md
- lib/future-native-families/futureNativeFamiliesFracture.ts
- lib/future-native-families/futureNativeFamiliesIntegrationFractureFixtures.ts
- lib/future-native-families/futureNativeFamiliesIntegrationShared.ts
- lib/future-native-families/futureNativeFamiliesProgress.ts
- lib/future-native-families/futureNativeFamiliesRegistry.ts
- lib/future-native-families/futureNativeFractureDedicatedReportPreview.ts
- lib/future-native-families/futureNativeFractureFamilyPreview.ts
- lib/future-native-families/futureNativeFractureLatticeReportPreview.ts
- lib/future-native-families/futureNativeSceneBridgeFractureDedicated.ts
- lib/future-native-families/futureNativeSceneBridgeFractureInputs.ts
- lib/future-native-families/futureNativeScenePresetPatchesFracture.ts
- lib/future-native-families/futureNativeScenePresetPatchesFractureDedicated.ts
- lib/future-native-families/starter-runtime/fracture_latticeAdapter.js
- lib/future-native-families/starter-runtime/fracture_latticeAdapter.ts
- lib/future-native-families/starter-runtime/fracture_latticeRenderer.js
- lib/future-native-families/starter-runtime/fracture_latticeRenderer.ts
- lib/future-native-families/starter-runtime/fracture_latticeRendererDebris.ts
- lib/future-native-families/starter-runtime/fracture_latticeRendererPatterns.ts
- lib/future-native-families/starter-runtime/fracture_latticeRendererShared.ts
- lib/future-native-families/starter-runtime/fracture_latticeRendererShells.ts
- lib/future-native-families/starter-runtime/fracture_latticeSchema.js
- lib/future-native-families/starter-runtime/fracture_latticeSchema.ts
- lib/future-native-families/starter-runtime/fracture_latticeSolver.js

## Runtime / implementation focus

- lib/future-native-families/starter-runtime/fracture_latticeAdapter.js
- lib/future-native-families/starter-runtime/fracture_latticeAdapter.ts
- lib/future-native-families/starter-runtime/fracture_latticeRenderer.js
- lib/future-native-families/starter-runtime/fracture_latticeRenderer.ts
- lib/future-native-families/starter-runtime/fracture_latticeRendererDebris.ts
- lib/future-native-families/starter-runtime/fracture_latticeRendererPatterns.ts
- lib/future-native-families/starter-runtime/fracture_latticeRendererShared.ts
- lib/future-native-families/starter-runtime/fracture_latticeRendererShells.ts
- lib/future-native-families/starter-runtime/fracture_latticeSchema.js
- lib/future-native-families/starter-runtime/fracture_latticeSchema.ts
- lib/future-native-families/starter-runtime/fracture_latticeSolver.js
- lib/future-native-families/starter-runtime/fracture_latticeSolver.ts
- lib/future-native-families/starter-runtime/fracture_latticeUi.ts

## Open checks

- registry entry が現物と一致するか
- progress entry と verify 結果が矛盾しないか
- mode binding の source / bindingMode を再確認すること
- scene bridge / preset patch の接続を確認すること
- manifest / routing truth を変更していないことを確認すること

## Untouched trunks

- manifest 正本の意味変更
- registry 正本の意味変更
- routing 正本の意味変更
- package class の最終決定
- CURRENT_STATUS.md の最終同期
- REVIEW.md / DOCS_INDEX.md の最終 truth 化

## Mainline decision points

- officialState の最終確定
- closureCandidate の最終確定
- parallel / conditional / mainline-only の最終確定
- merge unit を patch のまま保持するか branch 化するか

