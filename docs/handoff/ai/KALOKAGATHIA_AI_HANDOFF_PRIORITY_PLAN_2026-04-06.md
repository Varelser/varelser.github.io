# KALOKAGATHIA AI引き継ぎ用 優先順位・修正計画

- 作成日: 2026-04-06
- 対象アーカイブ: `kalokagathia_complete.zip`
- 対象ルート: `kalokagathia/`
- 目的: 次のAI/作業者が、現状把握・優先順位判断・実装修正・検証再実行を最短で開始できるようにする

---

## 1. 結論

このパッケージは **zip自体は正常**、ソース量・機能量・文書量も十分に大きく、単なる差分パッチではなく **継続開発用の完全寄り作業パッケージ** である。

ただし、現時点では **「完全に再現可能な handoff 完成版」ではない**。
最大の理由は以下の2点。

1. **manifest 系の実装が旧新二重化しており、runtime 側の参照が旧系のまま**
2. **`node_modules` 同梱だが、OS依存 native バイナリ混入により cross-platform 再検証が崩れる**

したがって、最優先は **軽量化でも docs 整理でもなく、manifest 配線の一本化と検証再現性の回復** である。

---

## 2. 現在の評価

### 2-1. 総合評価

- 総合: **72 / 100**
- 機能量・設計厚み: **87 / 100**
- 文書整備・検証文化: **88 / 100**
- 配布完成度: **58 / 100**
- 再現性 / 移植性: **45 / 100**
- 保守性: **68 / 100**

### 2-2. 進捗の意味

0〜72 は既に達成済み。

- ソース量は大きい
- 将来拡張用 family / scripts / generated artifacts が揃っている
- `typecheck` は通る
- 一部 verifier は通る
- handoff 文書や archive が厚い

72〜100 で未達なのは以下。

- runtime と generated status の一致
- future-native artifact suite の再現通過
- package/handoff の明確化
- cross-platform での再実行性
- 文書と現物の同期

---

## 3. 確認できた事実

### 3-1. アーカイブ自体

- `kalokagathia_complete.zip` は展開可能
- サイズは大きく、`node_modules` を含む
- `dist`、`docs`、`generated`、`scripts`、`lib`、`components` を含む

### 3-2. package scripts の充実度

`package.json` には以下がある。

- `typecheck`
- `build`
- `verify:project-state`
- `verify:future-native-project-state-fast`
- `verify:future-native-safe-pipeline:core`
- `verify:future-native-safe-pipeline:full`
- `emit:future-native-artifact-suite`
- `verify:future-native-artifact-suite`
- `doctor:tooling`
- `doctor:package-handoff`
- `verify:package-integrity`

つまり、検証文化そのものは存在している。
問題は **検証の現物再現が一部崩れていること** である。

### 3-3. 実際に見えた良い点

- `npm run typecheck` は通る
- `npm run verify:future-native-safe-pipeline:core` は通る
- 文書量が多く、引き継ぎ前提の設計意図が見える
- future-native 関連の scripts と generated artifacts が多数存在する

### 3-4. 実際に見えた悪い点

- `build` はこの環境で失敗
- 一部 verifier が再現実行で失敗
- 原因の一つが **manifest 系の旧新二重実装**
- 同梱 `node_modules` は **macOS 向け native** を含み、Linux 環境でそのまま再利用できない

---

## 4. 最重要の不整合

### 4-1. 直接原因

以下の export が古い。

```ts
// lib/projectStateManifest.ts
export { buildProjectManifest } from './projectStateManifestBuild';
export { normalizeProjectManifest } from './projectStateManifestNormalize';
```

一方で、新しい実装側には future-native specialist packet を含む処理がある。

```ts
// lib/projectStateManifestBuilder.ts
futureNativeSpecialistPackets: buildProjectFutureNativeSpecialistPacketEntries(),
futureNativeSpecialistRoutes: buildProjectFutureNativeSpecialistRouting(ui?.futureNativeSpecialistRouteControls),
```

つまり、**storage 側は旧 manifest 経路を通っているのに、現プロジェクトは新 manifest 前提の generated / verify 群を持っている**。

### 4-2. 影響

- `verify:future-native-project-state-fast` が落ちる原因になる
- `verify:future-native-artifact-suite` の前提が崩れる
- generated status に pass 記録があっても、現ソースで再実行すると一致しない

### 4-3. 関連ファイル

- `lib/projectStateManifest.ts`
- `lib/projectStateManifestBuild.ts`
- `lib/projectStateManifestNormalize.ts`
- `lib/projectStateManifestBuilder.ts`
- `lib/projectStateManifestNormalizer.ts`
- `lib/projectStateStorage.ts`
- `scripts/verify-future-native-project-state-fast.mjs`
- `scripts/verify-future-native-artifact-suite.mjs`

---

## 5. 優先順位

## P0. manifest 系の一本化

### 目的
runtime の不整合を止血する。

### やること

1. `lib/projectStateManifest.ts` の export 先を旧系から新系へ切替する
2. 旧系と新系の差分を洗い、必要処理が欠落しないことを確認する
3. `projectStateStorage.ts` の build / normalize の往復で情報落ちがないか確認する
4. 旧系が不要なら deprecated 明記または削除候補として隔離する

### 完了条件

- `npm run verify:future-native-project-state-fast` が通る
- future-native specialist packet / route 関連が manifest に残る

### 期待効果

- 進捗 **72 → 82**

---

## P1. 検証再現性の正常化

### 目的
現ソースと generated status を一致させる。

### やること

P0 修正後、以下を順に実行する。

```bash
npm run typecheck
npm run verify:future-native-safe-pipeline:core
npm run verify:future-native-artifact-tail
npm run verify:future-native-artifact-suite
```

必要なら以下も行う。

```bash
npm run emit:future-native-artifact-core
npm run emit:future-native-artifact-tail
npm run emit:future-native-artifact-suite
npm run emit:future-native-suite-status-report
```

### 注意

- `generated/future-native-suite-status/*.json` の過去成功記録を鵜呑みにしない
- **現ソースの再実行結果を正** とする

### 完了条件

- `verify:future-native-artifact-suite` 通過
- `generated/future-native-suite-status` の内容が再実行結果と一致

### 期待効果

- 進捗 **82 → 88**

---

## P2. package / handoff の定義整理

### 目的
「何を渡しているパッケージか」を曖昧にしない。

### 現状の問題

- `node_modules` 同梱でも cross-platform では再現不能
- この package は実態として `full` より **`platform-specific-runtime-bundled` 寄り**
- 受け手が「そのまま全部通る」と誤認しやすい

### やること

1. package を少なくとも以下に分離する
   - `source-only`
   - `full-local-dev`（Mac 前提）
2. package manifest に以下を明記する
   - 対象OS
   - package class
   - bootstrap 必要性
   - 推奨実行順
3. `doctor:package-handoff` の出力を handoff 可否の判断基準にする
4. 「complete.zip」の意味を再定義する

### 完了条件

- 配布物の性格が明確
- handoff 先が bootstrap 要否を迷わない
- docs と package class が一致

### 期待効果

- 進捗 **88 → 92**

---

## P3. 文書の現物同期

### 目的
次回の AI / 人間が docs を読んで誤認しないようにする。

### 対象

- `CURRENT_STATUS.md`
- `REVIEW.md`
- `UPGRADE_ROADMAP.md`
- closeout / handoff / archive 系 md

### やること

以下を現物ベースで書き直す。

- 通るコマンド
- 通らないコマンド
- 失敗理由
- コード要因か環境要因か
- 次回最短開始コマンド
- package class の定義

### 完了条件

- 文書を見た判断と、実際に叩いた結果が一致する

### 期待効果

- 進捗 **92 → 94**

---

## P4. 大型ファイルの責務分割

### 目的
今後の改修速度と安全性を上げる。

### 現時点で特に大きいもの

- `components/controlPanelTabsAudioRouteEditor.tsx` — 1124行
- `components/controlPanelTabsAudioLegacyConflict.tsx` — 1058行
- `components/useAudioLegacyConflictBatchActions.ts` — 854行
- `lib/audioReactiveValidation.ts` — 774行

### やること

1. UI / state / derived / action / validation に責務分離する
2. 先に verifier / snapshot がある箇所から分割する
3. import 面を壊さない facade を残す

### 完了条件

- 450行超ファイルを段階的に削減
- 既存機能差分なし

### 期待効果

- 進捗 **94 → 96**

---

## P5. 起動体験の軽量化

### 目的
体感起動を改善する。

### 現状

- `dist/assets` の JS 合計は約 **3.54MB**
- `dist/index.html` に `modulepreload` が **11件** ある
- 初回ロードで重い chunk を先読みしている可能性が高い

### やること

1. family preview / specialist 系の lazy load 再整理
2. modulepreload の対象見直し
3. 初回表示に不要な chunk を後読込へ移す

### 完了条件

- 初回ロードの軽量化
- 既存 verifier を壊さない

### 期待効果

- 進捗 **96 → 100**

---

## 6. 実行順

以下の順で進めること。

```text
P0 manifest 一本化
→ P1 検証再現性回復
→ P2 package/handoff 定義整理
→ P3 docs 現物同期
→ P4 大型ファイル分割
→ P5 起動軽量化
```

これ以外の順、特に **軽量化や docs 整理を先にやる順** は手戻りが出やすい。

---

## 7. 具体的な開始手順

### 7-1. 最初に見るファイル

1. `lib/projectStateManifest.ts`
2. `lib/projectStateManifestBuilder.ts`
3. `lib/projectStateManifestBuild.ts`
4. `lib/projectStateManifestNormalizer.ts`
5. `lib/projectStateManifestNormalize.ts`
6. `lib/projectStateStorage.ts`
7. `scripts/verify-future-native-project-state-fast.mjs`
8. `scripts/verify-future-native-artifact-suite.mjs`

### 7-2. 最初の修正

- `lib/projectStateManifest.ts` の export 先を新系に切り替える
- 旧新で API 形状が一致するか確認する
- `projectStateStorage.ts` の import を追って、 manifest 経路が一本化されたか確認する

### 7-3. 最初の検証

```bash
npm run typecheck
npm run verify:future-native-project-state-fast
npm run verify:future-native-safe-pipeline:core
npm run verify:future-native-artifact-tail
npm run verify:future-native-artifact-suite
```

### 7-4. 通過後の生成更新

```bash
npm run emit:future-native-artifact-core
npm run emit:future-native-artifact-tail
npm run emit:future-native-artifact-suite
npm run emit:future-native-suite-status-report
```

### 7-5. その後に docs を直す

- `CURRENT_STATUS.md`
- `REVIEW.md`
- `UPGRADE_ROADMAP.md`
- 必要なら `docs/handoff/archive/generated/*` の説明系 md

---

## 8. 環境に関する注意

### 8-1. 同梱 `node_modules` の扱い

この package の `node_modules` は **macOS 由来 native 依存** を含む可能性が高い。
そのため、Linux など別OSで以下が壊れうる。

- `esbuild`
- `rollup`
- `vite build`

### 8-2. 解釈を誤らないこと

これは「ソースが壊れている」ことを必ずしも意味しない。
ただし、**完全 handoff と呼ぶには危うい**。

### 8-3. 推奨方針

- Mac ローカル継続用 package として扱うなら許容
- cross-platform handoff を目的にするなら `node_modules` 依存 package を見直す

---

## 9. 今やってはいけないこと

以下は優先順位を下げること。

1. 先に lazy load 最適化へ行く
2. 先に大規模分割へ行く
3. docs だけ先に整える
4. generated status を「通ったこと」にして維持する

理由は、**runtime 不整合が残ったまま表面だけ整う** ため。

---

## 10. 完了判定

最低限の「今回区切り」としては、以下を満たせばよい。

### 必須

- `projectStateManifest.ts` が新系へ統一済み
- `verify:future-native-project-state-fast` 通過
- `verify:future-native-artifact-suite` 通過
- `generated/future-native-suite-status` 再生成済み
- `CURRENT_STATUS.md` が現結果と一致

### 望ましい

- `doctor:package-handoff` の説明更新
- package class の文書化
- source-only / local-dev の明確化

---

## 11. 次のAIへの短い指示

最初にやるべきことは **manifest 系の旧新二重化解消**。  
`lib/projectStateManifest.ts` を起点に、`projectStateStorage.ts` が通る manifest 経路を新系へ揃えること。  
その後、`verify:future-native-project-state-fast` → `verify:future-native-artifact-suite` の順で現ソースを再検証し、pass した generated status を再生成すること。  
軽量化・分割・文書整理はその後でよい。

---

## 12. 補足メモ

- この package は中身の厚み自体はかなり強い
- 問題は「未完成」より **整合ズレ** に近い
- 直す順番を誤らなければ、完成度は比較的短い手数で引き上げられる
- 最優先は **止血 → 再現 → handoff 明確化** の順である

