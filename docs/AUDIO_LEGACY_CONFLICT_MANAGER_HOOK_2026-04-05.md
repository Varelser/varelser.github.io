# AUDIO_LEGACY_CONFLICT_MANAGER_HOOK_2026-04-05

- `components/useAudioLegacyConflictManager.ts` を追加。
- `controlPanelTabsAudio.tsx` に残っていた legacy conflict / retirement / hotspot / curation recommendation の巨大ロジックを hook 化。
- `AudioLegacyConflictPanel` への props 組み立ても hook 側へ移動。
- `controlPanelTabsAudio.tsx` は 2303 行から 329 行へ縮小。
- `npm run typecheck` / `node scripts/run-vite.mjs build` / `node scripts/verify-phase5.mjs` pass。
