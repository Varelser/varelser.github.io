# VERIFY_FAST_FULL_STABILIZATION_2026-04-07

## What changed
- `scripts/verify-suite.mjs` now maps the `fast` profile tail to:
  - `scripts/verify-phase4-smoke.mjs`
  - `scripts/verify-phase5-smoke.mjs`
  - `scripts/verify-export.mjs` with `VERIFY_EXPORT_PROFILE=smoke`
- This keeps `verify:all:fast` on the already-proven smoke path instead of the slower full tail.

## Verified in this pass
- `npm run typecheck`
- `KALOKAGATHIA_FAST_BUILD=1 node scripts/run-vite.mjs build`
- `npm run verify:all:fast`

## Current chunk note
- The remaining circular chunk warning is still present.
- It moved from:
  - `depiction-catalog -> scene-families-core -> depiction-catalog`
- to:
  - `depiction-catalog -> scene-runtime-shared -> depiction-catalog`
- So the coupling is narrower than before, but not fully removed.

## Observed build deltas in this pass
- `depiction-catalog`: 278.98 kB -> 233.68 kB
- `scene-families-core`: 170.63 kB -> 170.58 kB
- `scene-runtime-shared`: 224.89 kB -> 270.21 kB
- `index`: 312.48 kB -> 312.59 kB

## Interpretation
- The runtime/catalog bridge was narrowed and one large catalog chunk shrank.
- The shared runtime chunk absorbed more of the routing/depiction bridge logic.
- The remaining work is to isolate the last bidirectional edge between depiction metadata and runtime routing.
