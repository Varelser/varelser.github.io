# AUDIO_REACTIVE_PATCH_SEQUENCE_INTEGRATION_2026-04-06

- patch runtime (`components/sceneHybridSurfacePatchSystemRuntime.ts`) now evaluates route-driven `surface.*` / `patch.*` targets via `resolveSurfaceAudioDrives(..., 'patch')`.
- patch uniforms now expose `uAudioReactive` so displacement/relief/opacity/sliceDepth/wireframe drives can influence live rendering rather than only the legacy hybrid audio scalar.
- sequence trigger runtime now accepts scoped seed-mutation targets:
  - `sequence.seedMutation.motion`
  - `sequence.seedMutation.structure`
  - `sequence.seedMutation.surface`
  - `sequence.seedMutation.hybrid`
- scoped seed-mutation targets override the fallback `audioSequenceSeedMutationScope` only for the triggering route.
- fallback compatibility is preserved:
  - `sequence.randomizeSeed`
  - `sequence.seedMutation`

## Verification
- `npm run check:audio-reactive`
- `npm run verify:audio-reactive`
- `npm run typecheck`
