# IMPLEMENTATION SUMMARY — 2026-04-11 EXPORT PRESET STATUS PASS

## Scope
- external control から export preset catalog を問い合わせ可能にする
- external-control status に export preset 一覧と推奨 preset を載せる
- JSON / OSC の両方から問い合わせ可能にする

## Implemented
- `external-control-export-preset-query` を追加
- OSC `/kalokagathia/export/preset/status` を追加
- `external-control-status` に以下を追加
  - `exportPresetIds`
  - `exportPresetCatalog`
  - `recommendedExportPresetId`
- 現在の export state に最も近い preset を返す推奨ロジックを追加
- `useExternalControlBridge` に status payload builder を追加して status 送信経路を共通化
- unit tests を更新

## Validation
- `npm run typecheck` ✅
- `npm run test:unit:match -- externalControlBridge` ✅
- `npm run build` ⚠️
  - この container では Vite build が `transforming...` 段階で終了コード回収前に停止し、完走確認を取得できなかった
  - したがって今回は build 成功を未確認扱いにしている

## Main files
- `lib/externalControlExportPresets.ts`
- `lib/externalControlBridge.ts`
- `lib/useExternalControlBridge.ts`
- `tests/unit/externalControlBridge.test.ts`
- `tests/unit/externalControlBridgeStatus.test.ts`

## Notes
- 今回は新規項目数を増やす pass ではなく、OSC / external control 系の運用性を上げる pass
- 次に効率が高いのは、preset catalog へ tags / use-case / quality tier を与えて remote 側で選びやすくすること
