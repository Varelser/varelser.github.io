# Verification Suite Report

- Generated: 2026-04-06T21:48:21.282Z
- Run ID: 2026-04-06T21-47-54-468Z
- Run dir: docs/archive/verification-suite-runs/2026-04-06T21-47-54-468Z
- Requested mode: static
- Passed: 7/7
- Failed: 0
- Blocked: 0
- Progress: 100%

## Coverage breakdown

- Live attempted: 0
- Live verified: 0
- Fallback used: 2
- Unresolved live coverage: 0

## Execution breakdown

- live: 0
- inlineRuntimeFallback: 0
- sourceStaticFallback: 0
- nodeSkiaRuntimeFallback: 0
- pngjsStaticHarnessFallback: 1
- blockedHostRuntime: 0
- direct: 4
- opaque: 1
- cachedBuild: 1

## Verification tiers

- none: 5
- artifact-fresh: 1
- pngjs-static-harness-fallback: 1

## Blocked steps

- None

## Unresolved live-coverage steps

- None

## Step summary

| Step | Group | Result | Execution | Tier | Live | Fallback |
| --- | --- | --- | --- | --- | --- | --- |
| verify:audio-reactive:check | core | PASS | direct |  |  |  |
| verify:audio-reactive | core | PASS | direct |  |  |  |
| typecheck | core | PASS | opaque |  |  |  |
| build | core | PASS | cached-build | artifact-fresh |  | yes |
| verify:phase4 | core | PASS | direct |  |  |  |
| verify:phase5 | core | PASS | direct |  |  |  |
| verify:export | core | PASS | pngjs-static-harness-fallback | pngjs-static-harness-fallback |  | yes |
