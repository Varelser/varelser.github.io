# Volumetric family closure evidence bundle

- bundleId: bundle-volumetric-family-closure-evidence
- bundleClass: low-risk-docs-generated-patch
- scope: family-volumetric
- recommendedRole: family-volumetric-worker
- recommendedReturnUnit: patch
- overlayPath: low-risk-patches-2026-04-06/bundle-volumetric-family-closure-evidence.md

## Scope

- この bundle は low-risk の additive patch 候補に限定する
- manifest / registry / routing / docs truth の最終決定は含めない

## Included packets

- family-volumetric-advection (volumetric-advection)
- family-volumetric-density-transport (volumetric-density-transport)
- family-volumetric-light-shadow-coupling (volumetric-light-shadow-coupling)
- family-volumetric-pressure-coupling (volumetric-pressure-coupling)
- family-volumetric-smoke (volumetric-smoke)

## Included families

- volumetric-advection
- volumetric-density-transport
- volumetric-light-shadow-coupling
- volumetric-pressure-coupling
- volumetric-smoke

## Included groups

- volumetric

## Verify commands

- `npm run verify:volumetric-advection`
- `npm run verify:future-native-volumetric-routes`
- `npm run verify:future-native-project-state-fast`
- `npm run verify:volumetric-density-transport`
- `npm run verify:volumetric-smoke`

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

- family evidence note md
- family verify checklist md
- family closure gap note md

## Risk notes

- 5 family packet をまとめる group bundle
- 0 family が implemented 以外候補
- scene / preset / runtime coupling の確認を先に行う

## Worker return template

```md
- 対象: family-volumetric
- 種別: patch
- 触った範囲: 
- 触っていない幹線: 
- 実行 verify: 
- 残件: 
- mainline 判断が必要な点: 
```
