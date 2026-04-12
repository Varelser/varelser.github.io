# PBD family closure evidence bundle

- bundleId: bundle-pbd-family-closure-evidence
- bundleClass: low-risk-docs-generated-patch
- scope: family-pbd
- recommendedRole: family-pbd-worker
- recommendedReturnUnit: patch
- overlayPath: low-risk-patches-2026-04-06/bundle-pbd-family-closure-evidence.md

## Scope

- この bundle は low-risk の additive patch 候補に限定する
- manifest / registry / routing / docs truth の最終決定は含めない

## Included packets

- family-pbd-cloth (pbd-cloth)
- family-pbd-membrane (pbd-membrane)
- family-pbd-rope (pbd-rope)
- family-pbd-softbody (pbd-softbody)

## Included families

- pbd-cloth
- pbd-membrane
- pbd-rope
- pbd-softbody

## Included groups

- pbd

## Verify commands

- `npm run verify:pbd-cloth`
- `npm run verify:future-native-nonvolumetric-routes`
- `npm run verify:future-native-project-state-fast`
- `npm run verify:pbd-membrane`
- `npm run verify:pbd-rope`
- `npm run verify:pbd-softbody`

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

- 4 family packet をまとめる group bundle
- 0 family が implemented 以外候補
- surface integration / rope payload 接続不足を確認する

## Worker return template

```md
- 対象: family-pbd
- 種別: patch
- 触った範囲: 
- 触っていない幹線: 
- 実行 verify: 
- 残件: 
- mainline 判断が必要な点: 
```
