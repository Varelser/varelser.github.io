# Audio hotspot audit packet

- packetId: role-audio-hotspots
- packetType: role-audit
- recommendedRole: audio-worker
- recommendedReturnUnit: patch

## Worker return template

```md
- 対象: role-audio-hotspots
- 種別: patch
- 触った範囲:
- 触っていない幹線:
- 実行 verify:
- 残件:
- mainline 判断が必要な点:
```

## Verify commands

- npm run verify:audio
- npm run typecheck:audio-reactive:attempt
- node scripts/inspect-project-health.mjs

## Evidence paths

- components/controlPanelTabsAudioRouteEditor.tsx
- components/controlPanelTabsAudioLegacyConflict.tsx
- components/useAudioLegacyConflictBatchActions.ts
- lib/audioReactiveValidation.ts
- components/useAudioLegacyConflictManager.ts
- lib/audioReactiveRetirementMigration.ts
- components/useAudioLegacyConflictFocusedActions.ts

## Hotspots

- components/controlPanelTabsAudioRouteEditor.tsx (1125 lines)
- components/controlPanelTabsAudioLegacyConflict.tsx (1059 lines)
- components/useAudioLegacyConflictBatchActions.ts (855 lines)
- lib/audioReactiveValidation.ts (775 lines)
- components/useAudioLegacyConflictManager.ts (580 lines)
- lib/audioReactiveRetirementMigration.ts (567 lines)
- components/useAudioLegacyConflictFocusedActions.ts (470 lines)

## Open checks

- 巨大 UI / hook を分割しても routing meaning を変えないこと
- legacy conflict / route editor 周辺の state 共有境界を確認すること
- audio verify と typecheck の両方で退行がないこと

## Untouched trunks

- manifest 正本の意味変更
- registry 正本の意味変更
- routing 正本の意味変更
- package class の最終決定
- CURRENT_STATUS.md の最終同期
- REVIEW.md / DOCS_INDEX.md の最終 truth 化

## Mainline decision points

- audio docs truth の最終同期
- 分割単位を patch に留めるか branch にするか

