# sceneErosionTrailSystem three-layer split

- `components/sceneErosionTrailSystem.tsx` を facade 化。
- `components/sceneErosionTrailSystemShared.ts` に型・layout/runtime helper・shader/uniform を集約。
- `components/sceneErosionTrailSystemRuntime.ts` に `useFrame` / geometry lifecycle を移動。
- `components/sceneErosionTrailSystemRender.tsx` に render 層を分離。
- `npm run typecheck` / `node scripts/run-vite.mjs build` / `node scripts/verify-phase5.mjs` pass。
