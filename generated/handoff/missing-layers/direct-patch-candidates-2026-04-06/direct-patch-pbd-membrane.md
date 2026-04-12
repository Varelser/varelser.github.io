# PBD Membrane direct patch candidate

- patchId: direct-pbd-membrane
- familyId: pbd-membrane
- group: pbd
- progressPercent: 98
- officialStateCandidate: implemented
- closureCandidate: review-ready
- ownershipClass: conditional
- mergeClass: direct-patch-candidate

## Ready-to-return outputs

- pbd-membrane evidence note md
- pbd-membrane verify checklist md
- pbd-membrane closure gap memo md
- pbd-membrane mainline handoff summary md

## Verify commands

- `npm run verify:pbd-membrane`
- `npm run verify:future-native-nonvolumetric-routes`
- `npm run verify:future-native-project-state-fast`

## Touchable zones

- docs/handoff
- lib/future-native-families

## Key evidence paths

- docs/handoff/FUTURE_NATIVE_RELEASE_REPORT.md
- lib/future-native-families/futureNativeFamiliesIntegrationShared.ts
- lib/future-native-families/futureNativeFamiliesPbd.ts
- lib/future-native-families/futureNativeFamiliesProgress.ts
- lib/future-native-families/futureNativeFamiliesRegistry.ts
- lib/future-native-families/futureNativePbdFamilyPreview.ts
- lib/future-native-families/futureNativePbdMembraneRoutePreview.ts
- lib/future-native-families/futureNativePbdRopeRoutePreview.ts
- lib/future-native-families/futureNativeSceneBridgePbdClothSoftbody.ts
- lib/future-native-families/futureNativeSceneBridgePbdMembrane.ts
- lib/future-native-families/futureNativeScenePresetPatchesPbdClothSoftbody.ts
- lib/future-native-families/futureNativeScenePresetPatchesPbdMembrane.ts

## Key runtime files

- lib/future-native-families/starter-runtime/pbd_clothAdapter.js
- lib/future-native-families/starter-runtime/pbd_clothAdapter.ts
- lib/future-native-families/starter-runtime/pbd_clothRenderer.js
- lib/future-native-families/starter-runtime/pbd_clothRenderer.ts
- lib/future-native-families/starter-runtime/pbd_clothSchema.js
- lib/future-native-families/starter-runtime/pbd_clothSchema.ts
- lib/future-native-families/starter-runtime/pbd_clothSolver.js
- lib/future-native-families/starter-runtime/pbd_clothSolver.ts
- lib/future-native-families/starter-runtime/pbd_clothUi.ts
- lib/future-native-families/starter-runtime/pbd_collisionConstraints.js
- lib/future-native-families/starter-runtime/pbd_collisionConstraints.ts
- lib/future-native-families/starter-runtime/pbd_membraneAdapter.js

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
- runtime 16/16 files exist
- 98% progress candidate / project-integrated
- implemented / review-ready / conditional
- surface integration / rope payload の取り違えに注意

## Return template

```md
- 対象: pbd-membrane
- 種別: patch
- 触った範囲: docs/handoff, generated/handoff, lib/future-native-families の局所
- 触っていない幹線: manifest / registry / routing / CURRENT_STATUS / REVIEW / DOCS_INDEX
- 実行 verify: 
- 残件: 
- mainline 判断が必要な点: 
```
