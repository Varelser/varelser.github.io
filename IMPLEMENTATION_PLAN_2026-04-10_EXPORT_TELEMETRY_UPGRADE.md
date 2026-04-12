# Kalokagathia Export / Telemetry Upgrade — 2026-04-10

## Goal
Close high-value upgrades that can be implemented entirely in-code without waiting for Intel Mac real-browser proof collection.

## Scope completed
1. Export manifest sidecar / embedded manifest
   - WebM export now emits a `.manifest.json` sidecar.
   - Screenshot export now emits a `.manifest.json` sidecar.
   - PNG frame ZIP export now embeds `capture.manifest.json`.
2. Live performance telemetry
   - Execution diagnostics overlay now shows live FPS, average/worst frame time, long-frame ratio, dropped-frame count, renderer calls, primitive totals, and memory counters.
3. Budget advice surfacing
   - Display panel now shows compact performance-budget advice for heavy scenes.

## Files changed
- `lib/captureExportManifest.ts`
- `lib/useLivePerformanceTelemetry.ts`
- `lib/videoExportHelpers.ts`
- `lib/videoExportRecording.ts`
- `lib/useVideoExport.ts`
- `lib/useFrameExport.ts`
- `lib/useExportController.ts`
- `components/controlPanelGlobalExport.tsx`
- `components/controlPanelGlobalDisplay.tsx`
- `components/AppExecutionDiagnosticsOverlay.tsx`
- `components/AppRootLayout.tsx`
- `components/sceneCapture.tsx`
- `lib/performanceHints.ts`
- `tests/unit/captureExportManifest.test.ts`

## Verification target
- typecheck
- unit
- build
- verify:all:fast

## Remaining high-value upgrades not closed here
- Project-level deterministic seed lock / replay capture
- Render queue / batch export
- OSC / external live control bridge
- Intel Mac real-browser proof packet capture
