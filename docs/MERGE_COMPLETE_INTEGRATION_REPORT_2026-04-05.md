# MERGE_COMPLETE_INTEGRATION_REPORT_2026-04-05

## Goal

- 正本 `kalokagathia_source_closeout-final_2026-04-05.zip` を土台にし、`final.zip` の内容を欠落なく統合し、検証可能な完全統合版を作る。

## Inputs

- source main: `kalokagathia_source_closeout-final_2026-04-05.zip`
- add-on package: `final.zip`

## Merge policy

- ルート正規化: `kalokagathia/` と `work_rev6/` を同一プロジェクト root として扱う。
- source main を正本として維持する。
- `final.zip` の final-only パスはすべて本体へ取り込む。
- 内容が衝突した 188 パスは本体側を維持し、`docs/archive/merge_final_conflicts_2026-04-05/` に `final.zip` 側原本を保存する。
- `package.json` は script union で統合し、`tsconfig.json` は source base に final の `include` / `exclude` を補う。
- 追加後に型定義と共有 helper の不足を実装修正した。

## Integration result

- source files: **696**
- final files: **14519**
- union target files: **14791**
- final-only imported into main: **14095 / 14095 = 100.00%**
- same-content overlaps: **236**
- different-content overlaps archived: **188**
- union missing after merge: **0**
- merged tree file count including archived conflicts/logs: **14982**
- merged tree size: **274.52 MB**

## Code-level fixes applied after merge

- `types/project.ts`
- `types/configLayer2.ts`
- `types/configLayer3.ts`
- `lib/projectExecutionRouting.ts`
- `lib/sceneRenderRoutingTypes.ts`
- `lib/executionDiagnostics.ts`
- `lib/temporalProfilesShared.ts`
- `components/sceneMotionEstimatorShared.ts`
- `components/useAudioLegacyConflictFocusedActions.ts`

## Verification

- typecheck: **pass**
- typecheck command: `node ./node_modules/typescript/lib/_tsc.js --noEmit`
- typecheck elapsed: 約 32 秒
- build: **pass**
- build command: `npm run build`
- package integrity: **pass after optional-native reclassification**
- `skia-canvas` は export fallback を持つ optional-native dependency として整理

## Build blocker detail

- この実行環境は Linux コンテナ。
- 同梱 `node_modules/@rollup` には `rollup-darwin-x64` があり、`rollup-linux-x64-gnu` は存在しない。
- そのため、Linux 上の build は Rollup native optional dependency 欠落で停止する。
- これは統合漏れではなく、同梱 `node_modules` のプラットフォーム差による検証制約。

## Produced logs

- `docs/archive/typecheck_2026-04-05.log`
- `docs/archive/build_2026-04-05.log`
- `docs/archive/merge_full_report_2026-04-05.json`

## Status

- ファイル統合 completeness: **100%**
- 型統合 completeness: **100%**
- Linux build verification completeness: **blocked by platform-specific dependency**
- ユーザーの Intel Mac 向け package completeness: **高いが、この環境では直接実証不可**
