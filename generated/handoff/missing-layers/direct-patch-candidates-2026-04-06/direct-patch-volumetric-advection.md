# Volumetric Advection direct patch candidate

- patchId: direct-volumetric-advection
- familyId: volumetric-advection
- group: volumetric
- progressPercent: 98
- officialStateCandidate: implemented
- closureCandidate: review-ready
- ownershipClass: conditional
- mergeClass: direct-patch-candidate

## Ready-to-return outputs

- volumetric-advection evidence note md
- volumetric-advection verify checklist md
- volumetric-advection closure gap memo md
- volumetric-advection mainline handoff summary md

## Verify commands

- `npm run verify:volumetric-advection`
- `npm run verify:future-native-volumetric-routes`
- `npm run verify:future-native-project-state-fast`

## Touchable zones

- docs/handoff
- lib/future-native-families

## Key evidence paths

- docs/handoff/FUTURE_NATIVE_RELEASE_REPORT.md
- lib/future-native-families/futureNativeFamiliesIntegrationShared.ts
- lib/future-native-families/futureNativeFamiliesIntegrationVolumetricFixtures.ts
- lib/future-native-families/futureNativeFamiliesProgress.ts
- lib/future-native-families/futureNativeFamiliesRegistry.ts
- lib/future-native-families/futureNativeFamiliesVolumetric.ts
- lib/future-native-families/futureNativeNonVolumetricBindingMetadata.ts
- lib/future-native-families/futureNativeNonVolumetricBindingMetadataMpm.ts
- lib/future-native-families/futureNativeNonVolumetricBundleCoverage.ts
- lib/future-native-families/futureNativeNonVolumetricFamilyMetadata.ts
- lib/future-native-families/futureNativeNonVolumetricRouteGroupTrend.ts
- lib/future-native-families/futureNativeNonVolumetricRouteHighlights.ts

## Key runtime files

- lib/future-native-families/starter-runtime/volumetric_density_transportAdapter.js
- lib/future-native-families/starter-runtime/volumetric_density_transportAdapter.ts
- lib/future-native-families/starter-runtime/volumetric_density_transportDerived.js
- lib/future-native-families/starter-runtime/volumetric_density_transportDerived.ts
- lib/future-native-families/starter-runtime/volumetric_density_transportInjector.js
- lib/future-native-families/starter-runtime/volumetric_density_transportInjector.ts
- lib/future-native-families/starter-runtime/volumetric_density_transportLighting.js
- lib/future-native-families/starter-runtime/volumetric_density_transportLighting.ts
- lib/future-native-families/starter-runtime/volumetric_density_transportObstacle.js
- lib/future-native-families/starter-runtime/volumetric_density_transportObstacle.ts
- lib/future-native-families/starter-runtime/volumetric_density_transportRenderer.js
- lib/future-native-families/starter-runtime/volumetric_density_transportRenderer.ts

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
- route verify と density / pressure / lighting coupling の組み合わせ確認が必要

## Return template

```md
- 対象: volumetric-advection
- 種別: patch
- 触った範囲: docs/handoff, generated/handoff, lib/future-native-families の局所
- 触っていない幹線: manifest / registry / routing / CURRENT_STATUS / REVIEW / DOCS_INDEX
- 実行 verify: 
- 残件: 
- mainline 判断が必要な点: 
```
