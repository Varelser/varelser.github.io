# Verification suite tier reporting and runtime self-heal

Date: 2026-04-02

## What changed

- `scripts/verify-step-runner.mjs` now records `verificationTier`, `liveAttempted`, `liveVerified`, `fallbackUsed`, and `unresolvedLiveCoverage` in each step report.
- `scripts/verify-suite.mjs` now writes both JSON and Markdown suite summaries with:
  - execution breakdown by tiered fallback type
  - verification tier breakdown
  - unresolved live-coverage step list
- `scripts/run-vite.mjs` now calls `scripts/ensure-runtime-executables.mjs` before invoking Vite.
- `scripts/ensure-runtime-executables.mjs` restores execute bits for bundled runtime binaries commonly lost on constrained extraction paths (`.bin`, `esbuild`, native bin folders).

## Why

- Prior suite summaries mixed fallback success with live-browser success too loosely.
- Python/sandbox extraction could drop execute bits and cause `verify-inline` or other Vite/esbuild-backed checks to fail with `EACCES`.

## Expected effect

- Future suite reports should show which steps are still unresolved in live-browser coverage.
- Inline verification builds should self-heal common executable-bit loss before Vite/esbuild runs.
