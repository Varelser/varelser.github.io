# MANUAL_CHUNKS_SIMPLIFICATION_2026-04-05

- `vite.config.ts` の `manualChunks` で scene 系の個別 `includes()` 列挙を、正規表現ベースの自動判定へ置換。
- `scene-gpgpu` は `/components/(gpgpu|useGpgpu|sceneGpgpu)/` を優先し、それ以外の `scene[A-Z]` は `scene-families` へ集約。
- build 比較では `scene-families` が **370,544B → 397,922B**、`index` が **581,731B → 554,433B**。大きな構成崩れはなく、scene 系コードが entry から family chunk 側へ寄った。
- `npm run typecheck` / `node scripts/run-vite.mjs build` / `node scripts/verify-phase5.mjs` pass。
