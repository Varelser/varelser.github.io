# CLOSEOUT REPAIR LANE PASS7 2026-04-07

## Scope
- continue from pass6 full tree
- resolve volumetric verify non-termination / excessive runtime lane
- preserve full-tree handoff packaging

## What changed
1. `scripts/verify-volumetric-family-shared.ts`
   - replaced `buildFutureNativeProjectSnapshotReport().baseline.routeHighlights` lookup with direct cached `buildProjectVolumetricRouteHighlights()` lookup
   - kept per-process cache for repeated route highlight assertions
2. `lib/projectStateStorage.ts`
   - parse path now preserves future-native volumetric authoring UI state:
     - `futureNativeSmokeAuthoring`
     - `futureNativeAdvectionAuthoring`
     - `futureNativePressureAuthoring`
     - `futureNativeLightShadowAuthoring`
   - added normalization for parsed authoring entry arrays instead of dropping them during project roundtrip
3. `lib/future-native-families/futureNativeFamiliesProjectReport.ts`
   - added optional in-process cache and invalidation hook for repeated project snapshot report calls

## Why
- volumetric verify scripts were not truly deadlocked; the main hotspot was route-highlight validation building the full project snapshot report when only volumetric route highlight data was needed
- project roundtrip verification was also failing because parsed project UI state dropped volumetric authoring entries

## Measured result
- `assertProjectSnapshotArtifacts` hotspot: about `22265ms -> 9ms` on the advection verification step probe
- `npm run verify:volumetric-advection` -> PASS (`~25s`)
- `npm run verify:volumetric-pressure` -> PASS (`~26s`)
- `npm run verify:volumetric-light-shadow` -> PASS (`~25s`)
- `npm run verify:volumetric-smoke` -> PASS (`~35s`)
- `node scripts/run-vite.mjs build --debug` -> PASS (`~22s`)
- `npm run typecheck` -> PASS

## Current status
- closeout lane target `build + volumetric verify cut` is completed
- remaining medium-term items are unchanged:
  - unit test base
  - broader verify data-driven consolidation
  - optional dependency / chunk-lightweight pass
