# Closeout Repair Lane Pass 4 — 2026-04-07

## 今回の目的
残っていた高優先循環 import のうち、`projectExecutionRouting` 系 7 ファイル循環と `volumetric_density_transport` 系 3 ファイル循環を、安全な shared contract 抽出で解消する。

## 実施内容
1. `lib/sceneRenderRoutingBranchBuilders.ts` を追加
   - `projectExecutionRouting` が `sceneRenderRouting` barrel を経由せず、route 引数から scene branch を組み立てる経路へ切替
2. `lib/projectExecutionRouting.ts` を更新
   - `getLayerSceneBranchesFromRoute` / `getGpgpuSceneBranchesFromRoute` を使用するよう変更
3. `lib/future-native-families/starter-runtime/volumetric_density_transportState.ts` を source of truth 化
   - `VolumetricDensityTransportRuntimeState`
   - `VolumetricDensityTransportStats`
   - `VolumetricDensityTransportDerivedFields`
4. `volumetric_density_transportSolver.ts` から上記 interface 定義を除去し、state module から re-export する形へ変更
5. `Injector / Derived / Stats / RendererShared` の型 import を solver 依存から state 依存へ変更

## 結果
- `projectExecutionRouting` 系 SCC: 1 -> 0
- `volumetric_density_transport` 系 SCC: 1 -> 0
- 残存 SCC: 1 クラスタのみ
  - future-native volumetric bindings / route resolvers (16 files)

## 検証
- `npm run typecheck` : pass
- `npm run verify:future-native-specialist-routes` : pass
- `npm run verify:volumetric-density-transport` : pass

## 補足
- コンテナ環境で `npm run build` 実行中に sandbox EOF が再発したため、今回は build 再確認を確定扱いにしていない。
- 変更は type-only 分離と route branch builder の抽出が中心で、runtime 挙動の大規模変更は行っていない。

## 次の最優先
1. `futureNativeSceneBindings` / `futureNativeVolumetricRouteResolvers` 系 16 ファイル循環の shared contract 抽出
2. 未使用依存 (`zustand` など) の整理
3. `strictNullChecks` 導入可否の事前棚卸し
