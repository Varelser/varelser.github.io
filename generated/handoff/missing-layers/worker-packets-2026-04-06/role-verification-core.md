# Verification core packet

- packetId: role-verification-core
- packetType: role-audit
- recommendedRole: verification-worker
- recommendedReturnUnit: patch

## Worker return template

```md
- 対象: role-verification-core
- 種別: patch
- 触った範囲:
- 触っていない幹線:
- 実行 verify:
- 残件:
- mainline 判断が必要な点:
```

## Verify commands

- npm run typecheck
- npm run verify:future-native-project-state-fast
- npm run verify:future-native-safe-pipeline:core
- node scripts/verify-package-integrity.mjs --strict

## Evidence paths

- scripts/verify-future-native-project-state-fast.mjs
- scripts/verify-future-native-safe-pipeline-core.mjs
- scripts/verify-package-integrity.mjs

## Open checks

- global criteria を subsystem checklist に落とすこと
- family verify と core verify の乖離がないか確認すること
- resume 系 verify を正本にしないこと

## Untouched trunks

- manifest 正本の意味変更
- registry 正本の意味変更
- routing 正本の意味変更
- package class の最終決定
- CURRENT_STATUS.md の最終同期
- REVIEW.md / DOCS_INDEX.md の最終 truth 化

## Mainline decision points

- official verify criteria の最終固定

