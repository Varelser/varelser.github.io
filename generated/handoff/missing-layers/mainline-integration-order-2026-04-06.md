# KALOKAGATHIA mainline integration order index

- 作成日: 2026-04-06
- directPatchCandidateCount: 18
- specialistReviewCount: 4
- stages: 8
- reviewReadyDirectCount: 17
- needsReviewDirectCount: 1

## Stage summary

| stageId | mergeMode | familyCount | avgProgress | risk | missing verify scripts |
|---|---|---:|---:|---|---:|
| stage-0-preflight | preflight | 0 | - | low | 0 |
| stage-1-pbd-direct | direct-patch | 4 | 98 | low | 0 |
| stage-2-mpm-direct | direct-patch | 5 | 98 | low | 0 |
| stage-3-fracture-direct | direct-patch | 4 | 98 | medium | 0 |
| stage-4-volumetric-core | direct-patch | 4 | 98 | medium | 0 |
| stage-5-volumetric-smoke-review | mainline-review | 1 | 100 | high | 0 |
| stage-6-specialist-review | patch-with-mainline-review | 4 | 98 | high | 0 |
| stage-7-truth-sync-closeout | docs-truth-sync | 17 | 98 | high | 0 |

## stage-0-preflight — Overlay preflight and additive verify gate

- mergeMode: preflight
- familyCount: 0
- progressPercentAverage: -
- riskBand: low
- verifyCoverage: 6/6 existing

### Families

- なし

### Verify commands

- `node scripts/verify-missing-layers-overlay.mjs --repo .`
- `node scripts/verify-missing-layers-worker-packets.mjs --repo .`
- `node scripts/verify-missing-layers-low-risk-patches.mjs --repo .`
- `node scripts/verify-missing-layers-family-closure-patches.mjs --repo .`
- `node scripts/verify-missing-layers-direct-patch-candidates.mjs --repo .`
- `npm run verify:future-native-project-state-fast`

### Notes

- まだ CURRENT_STATUS / REVIEW / DOCS_INDEX は更新しない。
- まず additive overlay 側の整合だけを固定する。

## stage-1-pbd-direct — Review-ready PBD direct patch candidates

- mergeMode: direct-patch
- familyCount: 4
- progressPercentAverage: 98
- riskBand: low
- verifyCoverage: 6/6 existing

### Families

- pbd-cloth
- pbd-membrane
- pbd-rope
- pbd-softbody

### Verify commands

- `npm run verify:pbd-cloth`
- `npm run verify:future-native-nonvolumetric-routes`
- `npm run verify:future-native-project-state-fast`
- `npm run verify:pbd-membrane`
- `npm run verify:pbd-rope`
- `npm run verify:pbd-softbody`

### Notes

- PBD 群は nonvolumetric routes 前提でまとめて戻す。
- surface integration は局所 verify として維持し、manifest 正本はまだ触らない。

## stage-2-mpm-direct — Review-ready MPM direct patch candidates

- mergeMode: direct-patch
- familyCount: 5
- progressPercentAverage: 98
- riskBand: low
- verifyCoverage: 7/7 existing

### Families

- mpm-granular
- mpm-mud
- mpm-paste
- mpm-snow
- mpm-viscoplastic

### Verify commands

- `npm run verify:mpm-granular`
- `npm run verify:future-native-nonvolumetric-routes`
- `npm run verify:future-native-project-state-fast`
- `npm run verify:mpm-mud`
- `npm run verify:mpm-paste`
- `npm run verify:mpm-snow`
- `npm run verify:mpm-viscoplastic`

### Notes

- MPM 群は PBD の後に戻す。
- UI truth より runtime / preset / preview evidence を先に固める。

## stage-3-fracture-direct — Review-ready fracture direct patch candidates

- mergeMode: direct-patch
- familyCount: 4
- progressPercentAverage: 98
- riskBand: medium
- verifyCoverage: 6/6 existing

### Families

- fracture-crack-propagation
- fracture-debris-generation
- fracture-lattice
- fracture-voxel

### Verify commands

- `npm run verify:fracture-crack-propagation`
- `npm run verify:future-native-nonvolumetric-routes`
- `npm run verify:future-native-project-state-fast`
- `npm run verify:fracture-debris-generation`
- `npm run verify:fracture-lattice`
- `npm run verify:fracture-voxel`

### Notes

- fracture は debris / crack propagation の意味衝突をまとめて確認する。
- render handoff 影響が見えた場合は単独 family 統合へ降格させる。

## stage-4-volumetric-core — Review-ready volumetric direct patch candidates except smoke

- mergeMode: direct-patch
- familyCount: 4
- progressPercentAverage: 98
- riskBand: medium
- verifyCoverage: 4/4 existing

### Families

- volumetric-advection
- volumetric-density-transport
- volumetric-light-shadow-coupling
- volumetric-pressure-coupling

### Verify commands

- `npm run verify:volumetric-advection`
- `npm run verify:future-native-volumetric-routes`
- `npm run verify:future-native-project-state-fast`
- `npm run verify:volumetric-density-transport`

### Notes

- volumetric core は smoke を分離して先に戻す。
- volumetric routes と safe pipeline core を一緒に確認する。

## stage-5-volumetric-smoke-review — Volumetric smoke review gate

- mergeMode: mainline-review
- familyCount: 1
- progressPercentAverage: 100
- riskBand: high
- verifyCoverage: 4/4 existing

### Families

- volumetric-smoke

### Verify commands

- `npm run verify:volumetric-smoke`
- `npm run verify:future-native-volumetric-routes`
- `npm run verify:future-native-project-state-fast`
- `npm run verify:future-native-safe-pipeline:core`

### Notes

- volumetric-smoke は needs-review のため direct merge しない。
- mainline owner が routing / preview / package truth への影響を確認してから扱う。

## stage-6-specialist-review — Specialist-native mainline review queue

- mergeMode: patch-with-mainline-review
- familyCount: 4
- progressPercentAverage: 98
- riskBand: high
- verifyCoverage: 8/8 existing

### Families

- specialist-houdini-native
- specialist-niagara-native
- specialist-touchdesigner-native
- specialist-unity-vfx-native

### Verify commands

- `npm run verify:specialist-houdini-native`
- `npm run verify:future-native-nonvolumetric-routes`
- `npm run verify:future-native-project-state-fast`
- `npm run verify:specialist-niagara-native`
- `npm run verify:specialist-touchdesigner-native`
- `npm run verify:specialist-unity-vfx-native`
- `npm run verify:future-native-specialist-routes`
- `npm run verify:future-native-specialist-runtime-export-regression`

### Notes

- specialist-native 4 family は patch-with-mainline-review のまま維持する。
- nonvolumetric routes と specialist export regression を両方確認する。

## stage-7-truth-sync-closeout — Truth sync and closeout

- mergeMode: docs-truth-sync
- familyCount: 17
- progressPercentAverage: 98
- riskBand: high
- verifyCoverage: 2/2 existing

### Families

- pbd-cloth
- pbd-membrane
- pbd-rope
- pbd-softbody
- mpm-granular
- mpm-mud
- mpm-paste
- mpm-snow
- mpm-viscoplastic
- fracture-crack-propagation
- fracture-debris-generation
- fracture-lattice
- fracture-voxel
- volumetric-advection
- volumetric-density-transport
- volumetric-light-shadow-coupling
- volumetric-pressure-coupling

### Verify commands

- `npm run verify:future-native-project-state-fast`
- `npm run verify:future-native-safe-pipeline:core`

### Notes

- ここで初めて CURRENT_STATUS / REVIEW / DOCS_INDEX を同期する。
- overlay generated index と docs truth の数値を一致させる。
- needs-review 系が残っている場合は closeout に未解決点として明記する。
