# PATCH BUNDLE remainder review (2026-04-07)

## Goal
Review the two remaining bundle items carefully and integrate only the parts that improve the current mainline without regressing the already-integrated lazy/runtime path.

## Decision
- Base patch (2026-04-06): **partial adoption only**
  - adopted: `AppSceneErrorBoundary` and scene wrapper usage in `AppRootLayout` / `AppComparePreview`
  - rejected: eager-import regressions in `sceneSystemRegistry` / `AppSceneLayerContent` / `AppRootLayout`
- Diff-only `last_summary_projectio`: **selectively adopted**
  - adopted: richer `AudioManualBatchSummary` payload, clipboard formatter, preview counters in queue UI, CURRENT_STATUS note
  - skipped: no-op pieces already present in current mainline (manifest schema / builder / normalizer / verify script)

## Why
The remaining base patch would roll current lazy-loading back to eager imports, which increases regression risk and duplicates already integrated `lazy_and_portable_tests`.
The diff-only summary patch still contained one useful slice: the manual batch preview summary payload was not fully wired into the clipboard/UI yet.

## Validation targets
- `npm run typecheck`
- `node scripts/run-vite.mjs build`
- `npm run verify:test:project-stored-queue-preview`
- `npm run verify:test:audio-legacy-closeout-packet`
- `npm run test:unit`
- `node scripts/verify-package-integrity.mjs --strict`

## Result
These changes are intentionally narrow and are meant to finish the useful remainder while keeping the current mainline architecture intact.
