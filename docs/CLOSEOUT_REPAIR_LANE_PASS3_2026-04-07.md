# Closeout Repair Lane Pass 3 — 2026-04-07

## 今回の目的
高リスク循環 import のうち、低リスクかつ型・挙動を壊しにくい小クラスタを先に解消し、残クラスタを大型本丸だけに絞る。

## 実施内容
1. reaction-diffusion profile 型を `components/sceneReactionDiffusionProfileTypes.ts` へ分離
2. non-volumetric binding registration 型を `lib/future-native-families/futureNativeNonVolumetricBindingMetadataTypes.ts` へ分離
3. rope refinement 型を `lib/future-native-families/futureNativeSceneBridgeRopeRefinementTypes.ts` へ分離
4. specialist packet / route family 型を `lib/future-native-families/futureNativeFamiliesSpecialistPacketTypes.ts` へ分離
5. hybrid/operator 系の type-only 参照を barrel 経由から専用 type module 経由へ変更

## 結果
- 循環 import クラスタ数: 8 -> 3
- 循環 import 対象ファイル数: 41 -> 25
- 解消済みクラスタ:
  - reaction diffusion (2)
  - non-volumetric binding metadata (2)
  - rope refinements (4)
  - hybrid/operator (4)
  - specialist packets/routes (4)

## 残存クラスタ
1. future-native volumetric bindings / route resolvers (15)
2. project execution / scene render routing (7)
3. volumetric density transport solver/injector/derived (3)

## 検証
- `npm run typecheck` : pass
- `npm run build` : pass
- `npm run verify:future-native-specialist-routes` : pass

## 次の最優先
1. `projectExecutionRouting` 系 7 ファイル循環の切断
2. `volumetric_density_transport*` 3 ファイル循環の型分離
3. `futureNativeSceneBindings` 系 15 ファイル循環の shared contract 抽出
