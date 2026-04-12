# Kalokagathia Intel Mac Projection Follow-up Report

- date: 2026-04-06
- scope: Intel Mac live-browser proof 導線の追加厳格化と finalize 後投影の可視化

## Progress
- MD2 patch readiness: 6 / 6 = 100.00%
- mainline runtime migration: 6 / 6 = 100.00%
- large implementation files unresolved: 0 / 0 = 100.00%
- repo package integrity: 29 / 29 ok = 100.00%
- Intel Mac target runtime readiness: 2 / 2 ok = 100.00%
- Intel Mac target live browser readiness: 2 / 6 ok = 33.33%
- Intel Mac live-proof automation coverage: 10 / 10 = 100.00%
- Intel Mac live-proof drop check: 4 / 10 ok = 40.00%
- projected after finalize: 2 / 6 = 33.33%

## What changed
- proof summary に列挙した screenshots / logs / exports の path 実在確認を追加
- `capture.sourceProjectSlug` と export JSON の対応確認を追加
- `report:intel-mac-live-browser-proof-projection` を追加
- doctor / finalize / ingest が projection report を再生成するよう更新
- Intel Mac live-proof status に projected-after-finalize 数値を追加

## Current blockers
- valid real-export fixture JSON
- captured `real-export-proof.json`
- proof summary 内 artifact path の実ファイル対応
- `capture.sourceProjectSlug` と export JSON の一致
- structured proof artifact
- Intel Mac target browser executable

## Output files
- `docs/archive/intel-mac-live-browser-proof-projection.json`
- `docs/archive/intel-mac-live-browser-proof-projection.md`
- `docs/archive/intel-mac-live-browser-proof-status.json`
- `docs/archive/intel-mac-live-browser-proof-doctor.json`
