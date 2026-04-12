# Verification Run ID Isolation

- `scripts/verify-suite.mjs` now writes each suite run into `docs/archive/verification-suite-runs/<runId>/`.
- Latest convenience mirrors remain at `docs/archive/verification-suite-report.json` and `.md`.
- `docs/archive/verification-suite-latest-run.json` points to the newest run directory.
- This prevents stale step reports/logs from older runs from being mistaken for the current suite execution.
