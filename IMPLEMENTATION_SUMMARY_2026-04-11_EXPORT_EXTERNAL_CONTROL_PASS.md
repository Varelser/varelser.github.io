# IMPLEMENTATION SUMMARY — 2026-04-11 — EXPORT EXTERNAL CONTROL PASS

## Scope

Added direct external-control / OSC commands for export setup so remote controllers can change export state without relying on generic config patch payloads.

## Added

- external-control export settings message family
- OSC routes for export mode / fps / duration / scale / aspect / transparent
- bridge-side validation and error replies for invalid export values
- status payload fields for current export state
- App bridge handlers that apply remote export settings to UI/config state
- parser + status unit coverage updates

## Supported direct commands

- `external-control-export-settings:set-mode`
- `external-control-export-settings:set-fps`
- `external-control-export-settings:set-duration`
- `external-control-export-settings:set-scale`
- `external-control-export-settings:set-aspect-preset`
- `external-control-export-settings:set-transparent`

## OSC routes

- `/kalokagathia/export/mode`
- `/kalokagathia/export/fps`
- `/kalokagathia/export/duration`
- `/kalokagathia/export/scale`
- `/kalokagathia/export/aspect`
- `/kalokagathia/export/transparent`

## Verification

- `npm run typecheck`
- `npm run test:unit:match -- externalControlBridge`
- `npm run build`

## Updated files

- `lib/externalControlBridge.ts` — 505 lines / 19.7KB
- `lib/useExternalControlBridge.ts` — 499 lines / 14.9KB
- `components/AppBodySceneConnected.tsx` — 506 lines / 20.1KB
- `tests/unit/externalControlBridge.test.ts` — 177 lines / 8.2KB
- `tests/unit/externalControlBridgeStatus.test.ts` — 59 lines / 2.0KB
