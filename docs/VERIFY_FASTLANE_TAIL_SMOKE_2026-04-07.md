# VERIFY FASTLANE TAIL SMOKE 2026-04-07

## Added lanes

- `npm run verify:export:smoke`
- `npm run verify:phase4:smoke`
- `npm run verify:all:fast:tail-smoke`

## Purpose

Split the unstable post-build verification tail into independent smoke checks so long chained runs do not need to re-run full browser/export verification.

## Notes

- `verify:export:smoke` skips browser and inline-runtime phases and validates alpha semantics through the node harness path.
- `verify:phase4:smoke` reuses a fresh `dist` when available and only falls back to a fast build when the artifact is stale or missing.
- Build freshness reuse now tracks app/build inputs instead of the whole `scripts/` tree, so verify-script edits do not force a rebuild.

- `verify:project-state:smoke` is an interface/source-contract smoke check over the Phase 4 project-state files and entry wiring.
- `verify:phase5:smoke` was reduced to 4 checks (`fixture sync / sparse recovery / legacy migration / import diagnostics`) to remove the slow fixture parsing leg from the smoke lane.
