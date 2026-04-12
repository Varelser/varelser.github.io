# Verification Suite Report

- Generated: 2026-04-06T11:07:13.599Z
- Run ID: 2026-04-06T11-07-08-628Z
- Run dir: docs/archive/verification-suite-runs/2026-04-06T11-07-08-628Z
- Requested mode: static
- Passed: 1/4
- Failed: 0
- Blocked: 3
- Progress: 100%

## Coverage breakdown

- Live attempted: 1
- Live verified: 0
- Fallback used: 1
- Unresolved live coverage: 1

## Execution breakdown

- live: 0
- inlineRuntimeFallback: 0
- sourceStaticFallback: 0
- nodeSkiaRuntimeFallback: 0
- pngjsStaticHarnessFallback: 1
- blockedHostRuntime: 3
- direct: 0
- opaque: 0

## Verification tiers

- host-runtime-blocked: 3
- pngjs-static-harness-fallback: 1

## Blocked steps

- build [core] :: blocked-host-runtime :: current host is missing native runtime pieces required for this verification step
- verify:phase4 [core] :: blocked-host-runtime :: current host is missing native runtime pieces required for this verification step
- verify:phase5 [core] :: blocked-host-runtime :: current host is missing native runtime pieces required for this verification step

## Unresolved live-coverage steps

- verify:export [core] :: pngjs-static-harness-fallback :: pngjs-static-harness-fallback

## Step summary

| Step | Group | Result | Execution | Tier | Live | Fallback |
| --- | --- | --- | --- | --- | --- | --- |
| build | core | BLOCKED | blocked-host-runtime | host-runtime-blocked |  |  |
| verify:phase4 | core | BLOCKED | blocked-host-runtime | host-runtime-blocked |  |  |
| verify:phase5 | core | BLOCKED | blocked-host-runtime | host-runtime-blocked |  |  |
| verify:export | core | PASS | pngjs-static-harness-fallback | pngjs-static-harness-fallback | attempted | yes |
