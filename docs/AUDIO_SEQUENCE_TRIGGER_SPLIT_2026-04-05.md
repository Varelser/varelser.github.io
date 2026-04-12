# Audio Sequence Trigger split — 2026-04-05

- `components/controlPanelTabsAudio.tsx` から Sequence Trigger 帯域を分離した。
- 追加ファイル:
  - `components/controlPanelTabsAudioSequenceTrigger.tsx`
  - `components/useAudioSequenceTriggerDebug.ts`
- 分離対象:
  - tuning preset buttons
  - enter / exit / cooldown sliders
  - seed mutation scope toggle
  - live trigger state panel
  - 160ms polling debug hook
- 検証:
  - `npm run typecheck` pass
  - `node scripts/run-vite.mjs build` pass
  - `node scripts/verify-phase5.mjs` pass
- 行数変化:
  - `components/controlPanelTabsAudio.tsx` 4957行 → 4765行
