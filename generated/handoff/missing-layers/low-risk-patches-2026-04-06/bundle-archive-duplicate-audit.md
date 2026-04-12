# Archive duplicate audit low-risk patch bundle

- bundleId: bundle-archive-duplicate-audit
- bundleClass: low-risk-docs-generated-patch
- scope: archive-duplicate-audit
- recommendedRole: docs-package-worker
- recommendedReturnUnit: patch
- overlayPath: low-risk-patches-2026-04-06/bundle-archive-duplicate-audit.md

## Scope

- この bundle は low-risk の additive patch 候補に限定する
- manifest / registry / routing / docs truth の最終決定は含めない

## Included packets

- role-archive-duplicate-audit (docs-package-worker)

## Included families

- none

## Included groups

- none

## Verify commands

- `node scripts/verify-package-integrity.mjs --strict`

## Untouched trunks

- manifest 正本の意味変更
- registry 正本の意味変更
- routing 正本の意味変更
- package class の最終決定
- CURRENT_STATUS.md の最終同期
- REVIEW.md / DOCS_INDEX.md の最終 truth 化

## Mainline decision points

- archive 整理を docs only にするか closeout 時にまとめるか

## Candidate additive outputs

- archive duplicate audit md
- same-relative-path danger list md
- mainline escalation memo md

## Risk notes

- archive duplicate undefined 件は誤統合事故源
- audit は low-risk だが archive 削除や移動は mainline 判断

## Worker return template

```md
- 対象: archive-duplicate-audit
- 種別: patch
- 触った範囲: 
- 触っていない幹線: 
- 実行 verify: 
- 残件: 
- mainline 判断が必要な点: 
```
