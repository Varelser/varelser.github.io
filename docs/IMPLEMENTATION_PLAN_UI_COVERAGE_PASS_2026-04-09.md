# Implementation Plan — UI Coverage Pass 2026-04-09

## Goal
Push remaining user-visible gaps toward feature/UI coverage instead of only generated status coverage.

## Targets
1. Promote `volumetric-density-transport` from preset-only to scene-bound UI coverage.
2. Add direct layer activation controls for scene-bound future-native families from the global overview.
3. Expose specialist packet families in the main control panel as packet preview cards.

## Acceptance
- `volume_fog` resolves to `volumetric-density-transport` with a primary preset and at least 3 preset bindings.
- Future-native overview can activate a scene-bound family into layer 2 or layer 3 without leaving the global tab.
- Specialist families are visible in the main control panel with route / adapter / target / warning summary.
- `typecheck`, `verify:future-native-scene-bindings`, `verify:future-native-runtime-state`, and `test:unit` pass.
