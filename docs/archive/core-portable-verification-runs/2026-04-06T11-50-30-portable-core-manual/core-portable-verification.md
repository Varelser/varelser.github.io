# Core Portable Verification Report

- Generated: 2026-04-06T11:50:30.000Z
- Run ID: 2026-04-06T11-50-30-portable-core-manual
- Host: linux/x64/gnu
- Portable pass: 5/5
- Blocked host-runtime steps: 3
- Portable progress: 100.0%

## Host runtime summary

- Checks: 2
- Passed: 0
- Failed: 2
- Missing targets:
  - rollup :: node_modules/@rollup/rollup-linux-x64-gnu
  - esbuild :: node_modules/@esbuild/linux-x64

## Step summary

| Step | Category | Result | Execution | Tier | Notes |
| --- | --- | --- | --- | --- | --- |
| typecheck:audio-reactive:attempt | portable-core | PASS | opaque |  |  |
| verify:audio-reactive:check | portable-core | PASS | direct |  |  |
| verify:audio-reactive | portable-core | PASS | direct |  |  |
| typecheck | portable-core | PASS | opaque |  |  |
| build | host-runtime | BLOCKED | blocked-host-runtime | host-runtime-blocked | current host is missing native runtime pieces required for this verification step |
| verify:phase4 | host-runtime | BLOCKED | blocked-host-runtime | host-runtime-blocked | current host is missing native runtime pieces required for this verification step |
| verify:phase5 | host-runtime | BLOCKED | blocked-host-runtime | host-runtime-blocked | current host is missing native runtime pieces required for this verification step |
| verify:export | portable-core | PASS | pngjs-static-harness-fallback | pngjs-static-harness-fallback |  |
