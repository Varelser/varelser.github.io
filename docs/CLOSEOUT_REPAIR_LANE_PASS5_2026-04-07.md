# CLOSEOUT REPAIR LANE PASS5 — 2026-04-07

## Goal
- Resolve the final future-native volumetric circular-import cluster without destabilizing runtime behavior.

## Result
- `lib/future-native-families` circular-import clusters: `1 -> 0`
- Full remaining repair-lane circular-import clusters: `1 -> 0`
- `npm run typecheck`: pass
- `npm run verify:future-native-volumetric-routes`: pass
- `npm run verify:future-native-scene-bindings`: pass
- `npm run build`: pass

## Implemented changes
1. Added `futureNativeVolumetricRouteTypes.ts`
   - Extracted shared volumetric route/authoring types away from authoring/runtime helpers.
2. Added `futureNativeVolumetricRouteHighlights.ts`
   - Moved project route-highlight generation out of route-resolver logic.
3. Updated `futureNativeVolumetricAuthoringShared.ts`
   - Removed dependency on `futureNativeSceneBindings.ts`.
   - Bound directly to `futureNativeSceneBindingData.ts` and volumetric recommendation helpers.
4. Updated `futureNativeSceneBridgeShared.ts`
   - Switched `FutureNativeSceneBoundFamilyId` type import from `futureNativeSceneBindings.ts` to `futureNativeSceneBindingData.ts`.
5. Updated `futureNativeVolumetricFamilyMetadata.ts`
   - Switched shared type imports to the new route types file.
6. Updated `futureNativeVolumetricRouteResolvers.ts`
   - Reduced responsibility to recommendation/default-preset resolution only.
7. Updated consumers
   - Repointed route-highlight consumers to `futureNativeVolumetricRouteHighlights.ts`.

## Structural outcome
- The previous SCC path through
  `sceneBindings -> routeResolvers -> familyMetadata -> overrides -> inputs -> shared -> sceneBindings`
  has been cut.
- The previous SCC path through
  `authoringShared -> sceneBindings -> routeResolvers -> authoringShared`
  has been cut.

## Remaining high-value work
- Remove unused direct dependency candidates (`zustand` first).
- Introduce `strictNullChecks` as the next type-safety lane.
- Add lightweight unit-test coverage for volumetric recommendation and route-highlight logic.
