# Export inline runtime isolation

- Date: 2026-04-02
- Scope: `scripts/verify-export.mjs`, `scripts/verify-export-inline-runtime.mjs`

## Why

Inline runtime export verification could stall the parent verifier on constrained hosts when Playwright or inline bundle execution hung.

## What changed

- Moved inline runtime export execution into `scripts/verify-export-inline-runtime.mjs`.
- Parent verifier now launches the helper via `spawnSync` with a timeout.
- If the helper times out or fails, `verify-export.mjs` records the error and falls back to the existing skia/pngjs harness path instead of hanging indefinitely.

## Expected result

- `verify-export.mjs` no longer blocks forever on inline runtime attempts.
- Logs still show whether the result came from live browser, inline runtime fallback, skia runtime fallback, or pngjs static harness fallback.
