# Optimization pass: frame export lazy loading (2026-04-07)

- Moved `jszip` loading in `lib/useFrameExport.ts` from top-level static import to `await import('jszip')` inside `startFrameExport()`.
- Goal: remove PNG frame export archive code from normal app boot.
- Result: build/typecheck/unit/package-integrity passed.
- Resulting main app chunk: `App-DAYHr2iV.js` at 204.56 kB.
- Warning status: no circular chunk warning introduced.
