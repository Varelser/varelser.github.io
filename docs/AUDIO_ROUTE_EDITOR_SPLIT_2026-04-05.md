# Audio Route Editor split — 2026-04-05

- `components/controlPanelTabsAudioRouteEditor.tsx` を新規追加し、route/preset/transfer/editor UI を親から分離。
- `components/controlPanelTabsAudio.tsx` は route editor 大帯域の JSX を保持しない薄い合成側へ縮小。
- `AudioSequenceTriggerPanel` は route editor 側へ移動し、audio routing 周辺の UI 帯域を集約。
- 検証: `npm run typecheck` pass / `node scripts/run-vite.mjs build` pass / `node scripts/verify-phase5.mjs` pass。
- sandbox 待機層の都合で `verify-phase4` の今回固定採取は未完。
- 追補: route editor の残件だった drag sort を実装し、drag handle で hover 先 route の直前へ drop できるようにした。
