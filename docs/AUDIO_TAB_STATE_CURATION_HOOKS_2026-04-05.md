# Audio tab state / curation hook extraction

- `components/useAudioTabState.ts` を追加し、audio tab 親に残っていた route editor / transfer / autofix notice / hotspot batch / focused conflict / bulk numeric offset / file input ref の state 群を抽出。
- `components/useAudioCurationHistory.ts` を追加し、curation history summary / key set / queue filter / append / clear / copy を抽出。
- `components/controlPanelTabsAudio.tsx` は 2991 行から 2915 行へ縮小。
- 再検証: `npm run typecheck` / `node scripts/run-vite.mjs build` / `node scripts/verify-phase5.mjs` pass。
