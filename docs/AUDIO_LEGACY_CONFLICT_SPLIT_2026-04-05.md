# Audio Legacy Conflict Split

- `controlPanelTabsAudio.tsx` から legacy conflict / retirement / curation / hotspot inspector 帯域を `components/controlPanelTabsAudioLegacyConflict.tsx` へ分離。
- typecheck / build / verify:phase5 を再確認。`verify:phase4` は sandbox wait EOF のため再採取未固定。
