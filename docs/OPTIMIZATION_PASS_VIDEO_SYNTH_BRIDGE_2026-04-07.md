# Optimization Pass: Video Export Synth Bridge (2026-04-07)

- Added `lib/videoExportSynthBridge.ts` as a video-export-only async boundary.
- Replaced direct dynamic imports of `audioSynth` and `audioSynthSource` inside `useVideoExport.ts`.
- Preserved warning-free build, unit pass, and package integrity pass.
- Goal: remove Vite advisory caused by modules being both dynamically and statically imported.
