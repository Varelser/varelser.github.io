# Specialist native family mainline review bundle

- bundleId: bundle-specialist-family-mainline-review
- bundleClass: low-risk-docs-generated-patch
- scope: family-specialist-native
- recommendedRole: specialist-mainline-review
- recommendedReturnUnit: patch-with-mainline-review
- overlayPath: low-risk-patches-2026-04-06/bundle-specialist-family-mainline-review.md

## Scope

- この bundle は low-risk の additive patch 候補に限定する
- manifest / registry / routing / docs truth の最終決定は含めない

## Included packets

- family-specialist-houdini-native (specialist-houdini-native)
- family-specialist-niagara-native (specialist-niagara-native)
- family-specialist-touchdesigner-native (specialist-touchdesigner-native)
- family-specialist-unity-vfx-native (specialist-unity-vfx-native)

## Included families

- specialist-houdini-native
- specialist-niagara-native
- specialist-touchdesigner-native
- specialist-unity-vfx-native

## Included groups

- specialist-native

## Verify commands

- `npm run verify:specialist-houdini-native`
- `npm run verify:future-native-nonvolumetric-routes`
- `npm run verify:future-native-project-state-fast`
- `npm run verify:specialist-niagara-native`
- `npm run verify:specialist-touchdesigner-native`
- `npm run verify:specialist-unity-vfx-native`

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

## Candidate additive outputs

- specialist family evidence note md
- specialist route / export gap note md
- mainline review memo md

## Risk notes

- 4 family packet をまとめる group bundle
- 0 family が implemented 以外候補
- 4 family は mainline-only 候補を含む
- specialist family は final closure を mainline が握る

## Worker return template

```md
- 対象: family-specialist-native
- 種別: patch
- 触った範囲: 
- 触っていない幹線: 
- 実行 verify: 
- 残件: 
- mainline 判断が必要な点: 
```
