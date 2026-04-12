# Audio synth / legacy sliders split — 2026-04-05

- `controlPanelTabsAudio.tsx` から synth controls と legacy sliders 帯域を分離。
- 新規: `components/controlPanelTabsAudioSynth.tsx`
- 新規: `components/controlPanelTabsAudioLegacySliders.tsx`
- 親は audio source / notices / route/legacy panels の合成責務へ寄せた。
