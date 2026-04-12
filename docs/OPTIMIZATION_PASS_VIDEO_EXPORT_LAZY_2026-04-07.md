# Optimization pass — video export lazy loading (2026-04-07)

- Moved `videoExportHelpers` and `videoExportRecording` behind dynamic imports from `useVideoExport`.
- Moved synth helpers used only during video recording (`audioSynth`, `audioSynthSource`) behind dynamic imports.
- Verified `videoExportHelpers-*` and `videoExportRecording-*` build as independent async chunks.
- Verified they are not present in `dist/index.html` modulepreload links.
- Verification: `npm run typecheck`, `node scripts/run-vite.mjs build`, `npm run test:unit`, `node scripts/verify-package-integrity.mjs --strict`.
