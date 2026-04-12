# Audio Legacy UI Coverage Pass — 2026-04-09

## Goal
Expose already-implemented manual/stored/everywhere batch migration actions in the main audio legacy panel so the remaining migration workflow is reachable without code-level intervention.

## Scope
1. Surface stored manual queue batch actions in the current conflict queue panel.
2. Surface everywhere manual queue batch actions in the same panel.
3. Surface copy action for the last manual batch summary.
4. Preserve existing behavior and verify type / unit coverage.

## Success criteria
- Manual queue panel can trigger current, stored, and everywhere top-N migration passes.
- Last manual batch summary can be copied from the panel.
- Typecheck, unit tests, and key audio legacy flows remain green.
