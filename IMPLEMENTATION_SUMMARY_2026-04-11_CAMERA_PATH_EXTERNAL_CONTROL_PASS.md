# Implementation Summary — 2026-04-11 — Camera Path External Control Pass

## Scope

Added direct external-control / OSC support for camera path operations on top of the current camera-path + export-queue base.

## Implemented

- `external-control-camera-path` inbound message family
- JSON bridge support for:
  - `capture-slot`
  - `load-slot`
  - `morph-slot`
  - `clear-slot`
  - `play`
  - `stop`
  - `set-duration`
  - `set-export-enabled`
  - `copy-duration-to-export`
- OSC mapping for:
  - `/kalokagathia/camera-path/capture`
  - `/kalokagathia/camera-path/load`
  - `/kalokagathia/camera-path/morph`
  - `/kalokagathia/camera-path/clear`
  - `/kalokagathia/camera-path/play`
  - `/kalokagathia/camera-path/stop`
  - `/kalokagathia/camera-path/duration`
  - `/kalokagathia/camera-path/export-enabled`
  - `/kalokagathia/camera-path/copy-duration-to-export`
- External-control status payload now includes:
  - `cameraPathSlotCount`
  - `cameraPathDurationSeconds`
  - `cameraPathExportEnabled`
  - `isCameraPathPlaying`
- Bridge-side validation / error reporting for invalid slot indices and invalid duration values
- App wiring from bridge into current camera-path handlers
- Unit coverage for parser / OSC mapping / status snapshot update

## Notes

- OSC slot arguments accept `1..N` and are converted to zero-based slot indices internally.
- Current implementation validates slot index range against the current in-app slot array length.
- Camera path play via bridge requires at least two filled slots; otherwise the bridge emits an error payload.

## Verification

- `npm run typecheck`
- `npm run build`
- `npm run test:unit:match -- externalControlBridge`

## Updated Files

- `lib/externalControlBridge.ts`
- `lib/useExternalControlBridge.ts`
- `components/AppBodySceneConnected.tsx`
- `tests/unit/externalControlBridge.test.ts`
- `tests/unit/externalControlBridgeStatus.test.ts`
