# Audio Reactive Environment

## Goal
音反応系の実装を、全体 repo の既存不整合に引きずられず、高速に検証できる状態へ寄せるための最小環境です。

## Bootstrap
```bash
npm run bootstrap:dev
```

この bootstrap は次を行います。
- `npm ci`
- `--ignore-scripts` を使い、`skia-canvas` の外部バイナリ取得失敗で止まらないようにする
- public npm registry を直接使う

## Fast verification rail
```bash
npm run check:audio-reactive
npm run verify:audio-reactive
```

### check:audio-reactive
`typescript.transpileModule` を使い、音反応系で触っている主要ファイルの構文破綻を高速確認します。

### typecheck:audio-reactive:attempt
`tsconfig.audio-reactive.json` を使った本来の型確認です。現時点では shared barrel 経由で repo の別系統既存破綻に引っ張られるため、試行用として残しています。

### verify:audio-reactive
次をまとめて確認します。
- 音反応系 md の存在
- progress 記述の存在
- coverage / progress から live systems / live targets を読めること

## Why this rail exists
全体 `npm run typecheck` は、現時点では音反応と無関係な既存破綻でも停止します。音反応の進行効率を上げるため、まずはこの専用レールで回します。

## Current full-typecheck blockers
2026-04-01 時点の主な停止帯域:
- `components/controlPanelLayerTabParticleSections.tsx`
- `components/controlPanelLayerTabShared.tsx`
- `components/controlPanelLayerTabSourceSections.tsx`
- `components/sceneFiberFieldSystemGeometry.ts`
- `components/sceneFiberFieldSystemShared.ts`
- `lib/projectTransferPrepare.ts`
- `lib/sceneRenderRoutingRuntimePredicates.ts`
- `lib/starterLibraryPresetExtensionChunk05PostFx.ts`
- `scripts/generate-phase5-real-export-manifest-entry.ts`
- `scripts/verifyPhase5FixtureScenarios.ts`
- `scripts/verifyPhase5ImportScenarios.ts`

## Decision
最高効率で進めるなら、次の順が安全です。
1. 音反応系は専用レールで前進
2. 音反応の本命が一段落した後で、上記の全体 blocker を別フェーズで潰す
