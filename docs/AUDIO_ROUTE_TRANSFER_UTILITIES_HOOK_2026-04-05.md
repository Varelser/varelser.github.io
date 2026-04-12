# Audio Route Transfer Utilities Hook — 2026-04-05

- `components/useAudioRouteTransferUtilities.ts` を追加し、route transfer / bulk numeric offset / clipboard / drag-drop / import-export utility 群を `controlPanelTabsAudio.tsx` から分離した。
- `components/controlPanelTabsAudio.tsx` は 2674 行から 2422 行へ縮小。
- `npm run typecheck` / `node scripts/run-vite.mjs build` / `node scripts/verify-phase5.mjs` pass。
- `verify-phase4` はこの sandbox では引き続き待機不安定のため未固定。
