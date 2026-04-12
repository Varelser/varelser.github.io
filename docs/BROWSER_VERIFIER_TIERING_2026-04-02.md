# Browser verifier tiering fix — 2026-04-02

## What changed

- `verify-public-ui.mjs` no longer reports inline HTML fallback as if live browser navigation had passed.
- `verifyRuntimeFallback.mjs` now emits explicit fields for:
  - `liveAttempted`
  - `liveVerified`
  - `fallbackUsed`
  - `fallbackVerified`
  - `unresolvedLiveCoverage`
  - `verificationTier`
- `verify-export.mjs` now labels fallback output as either:
  - `node-skia-runtime-fallback`
  - `pngjs-static-harness-fallback`
  instead of leaving the result as a generic pass.

## Why

Previously, browser-host constraints could block localhost/file navigation while the verifier still ended as `passed: true` through fallback paths. That made it too easy to confuse:

1. live browser proof
2. inline runtime proof
3. source/static proof

The new output keeps these tiers separate so the remaining unverified live coverage is visible in logs and handoff documents.
