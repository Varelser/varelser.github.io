# closeoutCurrent manifest snapshot diff 実装メモ

## 今回の目的
- `closeoutCurrent` 本体を `ProjectManifest` に保存する
- current 計算値との diff を UI で可視化する
- packet コピー導線を維持したまま snapshot 差分を確認できるようにする

## 実装内容
1. `types/project.ts`
   - `ProjectCloseoutCurrentSummary` を型定義へ昇格
   - `ProjectManifest.closeoutCurrent` を追加
2. `lib/projectCloseoutCurrent.ts`
   - summary 型参照を `../types` に統一
   - `buildProjectCloseoutCurrentDeltaValues()` を追加
3. `lib/projectStateManifestBuilder.ts`
   - manifest build 時に `exportHandoffSummary` を先に作成
   - `closeoutCurrentSummary` を算出して `manifest.closeoutCurrent` に保存
4. `lib/projectStateManifestNormalizer.ts`
   - `closeoutCurrent` payload の復元処理を追加
5. `components/controlPanelProjectIOFutureNativeSection.tsx`
   - `closeout drift` バッジを追加
   - `Closeout / current snapshot diff` セクションを追加
   - manifest/current の要約値、bundle、command を並列表示
6. `tests/unit/projectCloseoutCurrent.test.ts`
   - delta 判定の unit を追加

## 検証
- typecheck: pass
- test:unit: 14/14 pass
- build: pass
- verify:all:fast: 5/5 pass

## まだ未実装のもの
- closeout diff の永続履歴一覧
- 複数 snapshot 間の timeline compare
- diff 項目ごとの詳細 explanation / jump link
