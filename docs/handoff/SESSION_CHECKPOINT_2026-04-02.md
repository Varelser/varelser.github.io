# SESSION_CHECKPOINT_2026-04-02

## この時点で完了していること
- root に混在していた `.tmp_*` / `out*` 一時生成物は配布物から除去済み。
- 同名 `.ts` / `.js` 重複 107 組は除去済み。
- `package-lock` の `resolved` は public npm registry へ正規化済み。
- `esbuild` は root `devDependencies` へ明示追加済み。
- `inspect:source-shadowing` / `verify:source-shadowing` を追加済み。
- `inspect:project-health` / `verify:project-health` を追加し、root temp dir 混入・450行超実装コア数・文書数値不一致を検出できる状態にした。
- `REFACTOR_PLAN_LARGE_FILES.md` は現物の large-file 数と一致するよう更新済み。

## 主要指標
- rootTempDirCount: **0**
- largeImplementationFileCount: **5**
- passedChecks / totalChecks: **56 / 56**（前回確認値）
- averageProgressPercent: **80.29%**
- totalUiControls: **168**

## large file 現状
1. `lib/future-native-families/futureNativeSceneRendererBridge.ts`
2. `lib/future-native-families/starter-runtime/volumetric_density_transportSolver.ts`
3. `lib/future-native-families/starter-runtime/fracture_latticeRenderer.ts`
4. `lib/future-native-families/starter-runtime/volumetric_density_transportRenderer.ts`
5. `lib/future-native-families/starter-runtime/mpm_granularRenderer.ts`

## 次回の最短候補
1. `futureNativeSceneRendererBridge.ts` から rope payload helper を外出しする。
2. `volumetric_density_transportSolver.ts` を wake / light / vortex / injector helper 単位へ再分割する。
3. `fracture_latticeRenderer.ts` と `mpm_granularRenderer.ts` の descriptor helper を外出しする。

## 次回の再開順
1. `CURRENT_STATUS.md`
2. `docs/handoff/SESSION_CHECKPOINT_2026-04-02.md`
3. `REFACTOR_PLAN_LARGE_FILES.md`
4. `npm run inspect:project-health`
