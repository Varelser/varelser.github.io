# Implementation Summary — Dedicated Export Renderer Restore

Date: 2026-04-11

## What was implemented

- Restored a dedicated export render path for video / PNG sequence / GIF export.
- Added scene and camera refs from the main R3F scene to the export layer.
- Added a dedicated export renderer session helper with fallback to the older mirror path.
- Wired dedicated export rendering into:
  - WebM export
  - PNG sequence export
  - GIF export

## Behavioral change

Before this pass, export flows were primarily using a 2D mirror of the live canvas.
After this pass, export can render the live Three.js scene again into a separate export canvas using the main scene and camera state.

## Notes / current limits

- This is a practical restore, not a full offline re-simulation exporter.
- PostFX / overlay parity depends on whether they are represented directly in the scene graph.
- When dedicated export cannot be created, the app falls back to the previous mirror path.
- This is safer than forcing one path for every environment.

## Verification

- `npm run typecheck` ✅
- `vite build --configLoader runner` ✅

## Primary files changed

- `App.tsx`
- `components/AppScene.tsx`
- `components/AppSceneTypes.ts`
- `components/AppRootLayout.tsx`
- `components/AppBodyScene.tsx`
- `components/AppBodySceneConnected.tsx`
- `lib/useExportController.ts`
- `lib/useVideoExport.ts`
- `lib/useFrameExport.ts`
- `lib/useGifExport.ts`
- `lib/exportSceneRenderer.ts`
