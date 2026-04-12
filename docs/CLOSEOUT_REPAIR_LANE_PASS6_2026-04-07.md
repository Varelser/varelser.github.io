# CLOSEOUT REPAIR LANE PASS6 (2026-04-07)

## Goal
Advance closeout quality by removing dead direct dependency usage, enabling `strictNullChecks`, and fixing strict-null fallout without reopening resolved routing/cycle work.

## Completed
- Removed unused direct dependency `zustand` from `package.json` / lockfile.
- Enabled `strictNullChecks: true` in `tsconfig.json`.
- Reduced strict-null errors from 310 lines to 0.
- Fixed array-hole / undefined recipe issues in hybrid expression recipe files.
- Fixed starter library preset chunk array holes (`),,` -> `),`).
- Added null-safe guards for particle-data dependent scene runtime/shared functions.
- Added ref casts for JSX refs that became incompatible under strict null typing.
- Hardened future-native project / snapshot / specialist comparison code against optional manifest / serialization payloads.
- Fixed `gpgpuTransformFeedbackNativeCapturePass` null-state handling.
- Fixed volumetric debug renderer optional z access.
- Updated volumetric verify shared helper to seed volumetric authoring state into verification projects.

## Verified
- `npm run typecheck` : PASS
- `node ./node_modules/typescript/lib/_tsc.js --noEmit --strictNullChecks` : PASS
- `npm run verify:future-native-project-state-fast` : PASS
- `node scripts/run-ts-entry.mjs scripts/verify-future-native-project-snapshots-entry.ts` : PASS

## Not fully verified in this container
- `npm run build` stalls at Vite `transforming...` in this environment.
- `npm run verify:volumetric-advection` / `pressure` / `light-shadow` no longer fail immediately, but do not terminate within a 30s timeout in this container, so they are not counted as PASS here.

## Position
- Closeout repair lane status: advanced.
- Remaining high-value work: investigate non-terminating build / volumetric verify runtime, then add unit-test base and continue broader strictness (`strict`).
