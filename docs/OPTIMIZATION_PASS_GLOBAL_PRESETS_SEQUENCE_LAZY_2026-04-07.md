# Optimization pass: global presets / sequence lazy

- Lazy-loaded `GlobalPresetsSection` and `GlobalSequenceSection` from `controlPanelTabsGlobal`.
- Added dedicated control-panel chunks for presets and sequence sections.
- Result: `ui-control-panel` reduced from 336.00 kB-class to 326.95 kB, with presets/sequence isolated as async chunks.
- Build remains functional; Vite still reports pre-existing audioSynth/audioSynthSource advisory for video export dynamic imports.
