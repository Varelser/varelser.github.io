# Build Log Summary — 2026-03-31

## Purpose
This directory intentionally keeps both **failure logs** and **success logs** from the same refactor day.
They are historical evidence, not a single linear narrative.

## Canonical reading order
1. `typecheck.summary.md`  
   Read this first for the earliest failure snapshot. It gives the error totals, dominant categories, and affected subsystems.
2. `typecheck.out`  
   Raw earliest large failure snapshot. Use only when you need the exact line-level evidence behind the summary.
3. `typecheck2.out` / `typecheck3.out` / `typecheck4.out`  
   Intermediate reduction snapshots. Use only for transition history.
4. `build.out`  
   Early successful production build snapshot after type-path recovery.
5. `build_2026-03-31_after_chunking.out`  
   Successful build after chunking/refactor stage.
6. `build_phase1b.out` / `build_phase2a.out` / `build_phase45.out` / `build_split_only.out`  
   Checkpoint builds for specific phases.
7. `verify_public_library_2026-03-31.out` / `verify_library_2026-03-31.out`  
   Library verification snapshots.
8. `audit_phase1.json` / `npm_audit_2026-03-31_clean.json`  
   Dependency audit snapshots.

## Which files are authoritative now
For the current repository state, these archived logs are **not** the source of truth.
The source of truth is:
- current npm scripts in `package.json`
- current summary docs in `CURRENT_STATUS.md` and `REFACTOR_PLAN_LARGE_FILES.md`
- fresh command output from the present workspace

## Interpretation rule
- Treat `*.out` files here as **dated evidence**.
- Do not infer the current state from a single archived failure log.
- If archived logs disagree, prefer the later successful build/verify snapshots and then re-run the command in the current tree.


## Typecheck reduction snapshot
- `typecheck.out`: **477** errors
- `typecheck2.out`: **69** errors
- `typecheck3.out`: **4** errors
- `typecheck4.out`: **0** errors
