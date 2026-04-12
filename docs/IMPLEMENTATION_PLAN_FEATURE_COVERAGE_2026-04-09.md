# Feature coverage implementation plan — 2026-04-09

## Goal
Bring the remaining user-visible gaps closer to full coverage by prioritizing runtime-safe UI exposure and existing-system upgrades over new heavy solvers.

## Chosen lane
1. Expose all 22 future-native families in the UI, including preset-only and specialist-preview families.
2. Promote volumetric-density-transport from “buried in reports” to “directly discoverable from the control panel”.
3. Expand audio route bulk edit from coarse toggles to exact-value editing so the route editor can cover the remaining high-volume curation work.

## Why this order
- No new solver risk.
- High user-visible coverage gain.
- Reuses existing previews / packets / presets instead of inventing new metadata.
- Can be verified with typecheck + unit + build + focused future-native/audio checks.

## Implementation steps
- Add a repo-side future-native family catalog builder that merges registry, scene bindings, preset bindings, previews, and specialist packets.
- Replace the broad 4-card overview-only UI with a second detailed family catalog grid for all 22 families.
- Keep direct Load / Queue actions wherever a representative preset exists.
- Extend audio bulk edit to support exact numeric assignment for amount / bias / clamp / smoothing / attack / release.
- Keep backward compatibility with existing bulk-edit verify by supporting `notesAppend` input.

## Verification
- `npm run typecheck`
- `npm run test:unit`
- `npm run build`
- `npm run verify:test:audio-midi-bulk`
- `npm run verify:future-native-scene-bindings`
- `npm run verify:future-native-runtime-state`
