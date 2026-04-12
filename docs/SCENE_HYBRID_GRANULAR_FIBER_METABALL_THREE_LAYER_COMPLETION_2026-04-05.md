# Task 6 completion update (2026-04-05)

- `sceneHybridGranularFieldSystem.tsx` を Shared / Runtime / Render + facade に分割。
- `sceneHybridFiberFieldSystem.tsx` を Shared / Runtime / Render + facade に分割。
- `sceneMetaballSystem.tsx` を Shared / Runtime / Render + facade に分割。
- これで Task 6 対象の 13 系統はすべて三層化完了。
- `npm run typecheck` / `node scripts/run-vite.mjs build` / `node scripts/verify-phase5.mjs` pass.
