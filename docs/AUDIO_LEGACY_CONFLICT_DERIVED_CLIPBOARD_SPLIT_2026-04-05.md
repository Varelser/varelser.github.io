# AUDIO_LEGACY_CONFLICT_DERIVED_CLIPBOARD_SPLIT_2026-04-05

- `useAudioLegacyConflictManager.ts` から derived-state 帯域と clipboard/report 帯域を分離した。
- 追加: `useAudioLegacyConflictDerivedState.ts`, `useAudioLegacyConflictClipboard.ts`
- `controlPanelTabsAudio.tsx` は 329 行を維持、legacy manager は 2122 行 → 1707 行へ縮小。
- `npm run typecheck` / `node scripts/run-vite.mjs build` / `node scripts/verify-phase5.mjs` を通過。
