# Voxel Fracture direct patch candidate

- patchId: direct-fracture-voxel
- familyId: fracture-voxel
- group: fracture
- progressPercent: 98
- officialStateCandidate: implemented
- closureCandidate: review-ready
- ownershipClass: conditional
- mergeClass: direct-patch-candidate

## Ready-to-return outputs

- fracture-voxel evidence note md
- fracture-voxel verify checklist md
- fracture-voxel closure gap memo md
- fracture-voxel mainline handoff summary md

## Verify commands

- `npm run verify:fracture-voxel`
- `npm run verify:future-native-nonvolumetric-routes`
- `npm run verify:future-native-project-state-fast`

## Touchable zones

- docs/handoff
- lib/future-native-families

## Key evidence paths

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

## Key runtime files

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

## Risk notes

- evidence 24/24 paths exist
- runtime 13/13 files exist
- 98% progress candidate / project-integrated
- implemented / review-ready / conditional
- preset / scene binding と crack / debris runtime の対応確認が必要

## Return template

```md
- 対象: fracture-voxel
- 種別: patch
- 触った範囲: docs/handoff, generated/handoff, lib/future-native-families の局所
- 触っていない幹線: manifest / registry / routing / CURRENT_STATUS / REVIEW / DOCS_INDEX
- 実行 verify: 
- 残件: 
- mainline 判断が必要な点: 
```
