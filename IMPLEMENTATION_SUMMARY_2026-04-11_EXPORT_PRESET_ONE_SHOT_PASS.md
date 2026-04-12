# Implementation Summary — 2026-04-11 — Export Preset One-Shot Pass

## What was added

- external control / OSC から export preset を **1コマンド**で呼べるようにした
- preset 実行方式を 3 種追加
  - `apply`
  - `enqueue`
  - `start`
- preset catalog を新設し、以下の preset を定義
  - `video-preview-square`
  - `video-story-vertical`
  - `video-sequence-pass`
  - `gif-loop-square`
  - `gif-loop-story`
  - `png-sequence-master`

## Bridge / OSC additions

### JSON payload

```json
{
  "type": "external-control-export-preset",
  "action": "apply | enqueue | start",
  "presetId": "video-story-vertical"
}
```

### OSC addresses

- `/kalokagathia/export/preset/apply <presetId>`
- `/kalokagathia/export/preset/enqueue <presetId>`
- `/kalokagathia/export/preset/start <presetId>`

## Runtime behavior

- `apply`
  - export mode / fps / duration / scale / aspect / transparent を一括反映
- `enqueue`
  - 上記設定を snapshot 化した job を queue に積む
- `start`
  - 上記設定を一括反映し、そのまま直接 export を開始
  - 既に video / png / gif export 中なら reject

## Validation

- `npm run typecheck` passed
- `npm run test:unit:match -- externalControlBridge` passed
- `npm run build` passed

## Main updated files

- `lib/externalControlExportPresets.ts`
- `lib/externalControlBridge.ts`
- `lib/useExternalControlBridge.ts`
- `lib/useExportBatchQueue.ts`
- `components/AppBodySceneConnected.tsx`
- `tests/unit/externalControlBridge.test.ts`
