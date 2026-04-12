# Docs and package evidence packet

- packetId: role-docs-package
- packetType: role-audit
- recommendedRole: docs-package-worker
- recommendedReturnUnit: patch

## Worker return template

```md
- 対象: role-docs-package
- 種別: patch
- 触った範囲:
- 触っていない幹線:
- 実行 verify:
- 残件:
- mainline 判断が必要な点:
```

## Verify commands

- node scripts/doctor-package-handoff.mjs
- node scripts/verify-package-integrity.mjs --strict

## Evidence paths

- docs/handoff/FUTURE_NATIVE_RELEASE_REPORT.md
- scripts/doctor-package-handoff.mjs
- scripts/verify-package-integrity.mjs

## Open checks

- package class 表記揺れを evidence として抽出すること
- docs truth を先に確定しないこと
- closeout / handoff は最終現物で同期すること

## Untouched trunks

- manifest 正本の意味変更
- registry 正本の意味変更
- routing 正本の意味変更
- package class の最終決定
- CURRENT_STATUS.md の最終同期
- REVIEW.md / DOCS_INDEX.md の最終 truth 化

## Mainline decision points

- package class の最終確定
- docs truth の最終同期タイミング

