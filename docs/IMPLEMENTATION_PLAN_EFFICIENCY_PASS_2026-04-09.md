# Implementation Plan — Efficiency Pass (2026-04-09)

## Goal
Close the remaining confirmed internal future-native gaps on top of the restored exact full-local-dev source, then regenerate the status artifacts so docs and generated state match the current source.

## Fixed target
1. Promote the 6 shared-core families to fully-owned kernel handling.
2. Regenerate dedicated core ownership / expression coverage / final closeout status.
3. Rebuild the future-native release report.
4. Package a fresh full-local-dev ZIP from the updated source.

## Scope rules
- Do not delete legacy or scaffold files during this pass.
- Treat the restored exact source as the baseline.
- Prefer applying already-proven patch content over re-deriving the same change.

## Execution order
1. Apply the fully-owned kernel patch bundle.
2. Run `npm run typecheck`.
3. Run the future-native ownership / coverage verify + emit commands.
4. Run `npm run emit:future-native-report`.
5. Run `npm run package:full-zip`.
6. Record resulting progress in generated artifacts and this handoff note.

## Expected completion signal
- `generated/future-native-final-closeout-status/future-native-final-closeout-status.json`
  reports `remainingInternalTrackCount = 0`.
- `generated/future-native-expression-coverage/future-native-expression-coverage.json`
  reports `independentCount = 22` and `closureProgressPercent = 100`.
- `generated/future-native-dedicated-core-ownership/future-native-dedicated-core-ownership.json`
  reports `fullyOwnedKernelFamilyCount = 6`.
