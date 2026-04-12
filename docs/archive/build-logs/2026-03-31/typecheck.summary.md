# typecheck.out Summary — 2026-03-31

## Purpose
This note summarizes the earliest large typecheck failure snapshot in this archive.
Use it to understand **what kind of breakage existed before the refactor wave**, not to judge the current workspace state.

## Current interpretation rule
- `typecheck.out` is a **historical failure snapshot**.
- The current repo state is determined by fresh commands in the present workspace.
- For this archive day, the reduction path was:
  - `typecheck.out`: **477** errors
  - `typecheck2.out`: **69** errors
  - `typecheck3.out`: **4** errors
  - `typecheck4.out`: **0** errors

## Main error families in `typecheck.out`
1. **Missing `THREE` namespace** — `TS2503` — **230** errors
   - Example: `Cannot find namespace 'THREE'.`
   - This is the dominant cluster and explains many downstream type failures in rendering/GPGPU files.
2. **Untyped generic calls** — `TS2347` — **111** errors
   - Example: `Untyped function calls may not accept type arguments.`
   - Typically appears after React / fiber / Three typing is already broken.
3. **React named import mismatch** — `TS2614` — **58** errors
   - Example: `Module '"react"' has no exported member 'useState'.`
   - Historical signal that module/type resolution was not healthy at that point.
4. **Property access on wrong/unknown types** — `TS2339` — **50** errors
   - Example: `Property 'scale' does not exist on type 'MarchingCubes'.`
5. **Module export drift** — `TS2459` — **11** errors
   - Example: shared project-state exports not re-exported correctly.

## File concentration
Most errors were concentrated in a few files and subsystems.

### Directory totals
- `components/` — **321** errors
- `lib/` — **150** errors
- root files — **6** errors

### Most affected files
- `components/useGpgpuRuntime.ts` — **34**
- `components/gpgpuSimulationPasses.ts` — **34**
- `lib/projectStateStorage.ts` — **28**
- `lib/projectStateManifest.ts` — **27**
- `components/gpgpuVisualUpdates.ts` — **24**
- `lib/useAudioController.ts` — **13**
- `components/sceneParticleSystem.tsx` — **13**
- `lib/useVideoExport.ts` — **10**
- `components/sceneVolumeFogSystemRuntime.ts` — **10**
- `components/sceneSurfacePatchSystem.tsx` — **10**

## What this log is best used for
- Seeing that the earliest failure state was **tooling/type-resolution heavy**, not a single local regression.
- Explaining why the later log sequence drops quickly once type paths and exports recover.
- Identifying which subsystems were most sensitive during the refactor wave: **GPGPU**, **project state**, **scene runtime**, **audio/video hooks**.

## What not to do
- Do **not** treat this file as the current truth.
- Do **not** start fixing code from this log without first re-running `npm run typecheck` in the present workspace.
- Do **not** compare this file directly against current build success without reading `SUMMARY.md` first.
