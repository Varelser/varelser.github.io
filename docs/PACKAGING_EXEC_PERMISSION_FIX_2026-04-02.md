# Packaging / executable permission fix (2026-04-02)

## What was fixed
- Restored executable bits for bundled runtime files under `node_modules/.bin/*` and `node_modules/*/bin/*`.
- Restored executable bits for launcher `.command` files.
- Repacked the project as a fresh ZIP and revalidated from a new extraction.

## Why this was necessary
The bundled archive lost Unix executable bits on fresh extraction, causing failures in `build`, `verify-project-state`, `verify-phase4`, and `verify-phase5` via `esbuild` and related runtime binaries.

## Verification target
Fresh extraction must pass:
- `node ./node_modules/typescript/lib/_tsc.js --noEmit`
- `node scripts/run-vite.mjs build`
- `node scripts/verify-project-state.mjs`
- `VERIFY_PHASE4_SKIP_EXPORT=1 node scripts/verify-phase4.mjs`
- `node scripts/verify-phase5.mjs`
