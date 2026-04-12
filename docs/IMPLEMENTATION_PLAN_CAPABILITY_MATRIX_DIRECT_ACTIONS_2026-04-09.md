# Implementation plan — capability matrix direct actions (2026-04-09)

## Goal
Close the remaining Project I/O action gap by letting a capability-matrix row emit the next useful packet directly.

## Scope
- representative preset packet copy
- route focus packet copy
- specialist packet copy
- unit coverage for new packet builders

## Steps
1. Extend `projectFutureNativeCapabilityMatrix.ts` with packet builders for representative preset, route focus, and specialist tracking.
2. Add row-level buttons in `controlPanelProjectIOFutureNativeSection.tsx`.
3. Add unit assertions for density-transport preset/route packets and specialist packet output.
4. Re-run `typecheck`, `test:unit`, and `package:full-zip`.

## Completion criteria
- capability matrix rows expose direct copy actions for preset / route / specialist flows
- unit coverage includes the new packet builders
- packaging succeeds without regressions
