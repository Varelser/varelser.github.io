# KALOKAGATHIA 統合課題・優先順位・引き継ぎ md

- 作成日: 2026-04-06
- 統合元:
  - `KALOKAGATHIA_AI_HANDOFF_PRIORITY_PLAN_2026-04-06.md`
  - `kalokagathia_missing_features_and_roadmap_for_ai.md`
- 目的: 次の AI / 作業者が、現状の不整合、未完了機能、今後の実装優先順位を混乱なく引き継げるようにする

---

## 1. 結論

現状の主要課題は、単純な「未実装」よりも、以下の2点に集約される。

1. **整合ズレ**
   - manifest 系の旧新二重化
   - verify / generated status / runtime の不一致
   - package / report / docs / 現物のズレ

2. **product 未閉鎖**
   - コードや verify は存在するが、通常機能として閉じていない
   - UI / preset / export / manifest / routing まで一貫していない

したがって、今後の進め方は **機能追加先行ではなく、止血 → 再現性回復 → product 化 → 拡張** の順が妥当である。

---

## 2. この統合版での判断ルール

今後は課題を以下の3種類に分けて扱う。

### 2-1. Confirmed blocker
現物上、実害または不整合が確認されているもの。

例:
- manifest 旧新二重化
- verify 再現性不良
- package / report / docs のズレ

### 2-2. Confirmed partial
コードや verify は存在するが、製品機能として閉じていないもの。

例:
- future-native mainline 統合未完
- audio bulk edit 未完
- volumetric / PBD / fracture / MPM の product 未閉鎖

### 2-3. Strategic expansion
今後の表現帯域や設計強化として必要なもの。

例:
- plugin contract
- capability matrix の完全形式化
- family ごとの独立 runtime 強化
- 起動体験の軽量化

---

## 3. 2本の元 md の整合性まとめ

### 3-1. 一致している点

両文書は以下の主張で一致している。

1. future-native はコードや verify はあるが、通常機能として閉じていない
2. live browser proof が不足している
3. package / report / handoff / manifest のズレがある
4. audio 系は追加実装より整理が優先
5. 「コードがある」だけでは完成ではなく、UI / preset / export / manifest / routing まで揃って初めて product 完了とみなす

### 3-2. ズレていた点

統合前は以下がズレていた。

1. **優先順位の逆転**
   - handoff 計画書は manifest / verify / package を先に置く
   - 不足機能メモは future-native 統合や plugin contract を先に置く

2. **事実と戦略の混在**
   - 現物確認ベースの課題
   - product 化の未完課題
   - 将来拡張課題
   が同じ粒度で並んでいた

3. **package taxonomy の揺れ**
   - `platform-specific-runtime-bundled`
   - `full-local-dev`
   - `platform-specific package`
   - `full package`
   などが混在していた

この統合版では、上記を一本化して並べ直す。

---

## 4. 統合後の優先順位

# P0. 再現性ブロッカーの止血

## 4-1. manifest 系の旧新二重化解消

### 現状
- `projectStateManifest.ts` が旧系 export 経路を向いている
- 別に新系 builder / normalizer が存在する
- future-native specialist packet / route は新系側に寄っている

### 問題
- runtime / storage / generated / verify の前提がずれる
- project state 検証と artifact suite 検証の一致が壊れる

### やること
1. `projectStateManifest.ts` を起点に manifest 経路を一本化する
2. `projectStateStorage.ts` を含め build / normalize の往復を確認する
3. 旧系が不要なら deprecated 明記または隔離する

### 完了条件
- `verify:future-native-project-state-fast` が通る
- future-native specialist packet / route が manifest に残る

---

## 4-2. verify / generated status / runtime の一致回復

### 現状
- typecheck や一部 verify は存在する
- generated status もある
- ただし現ソース再実行と generated status がズレる可能性がある

### やること
1. manifest 修正後に verify を再実行する
2. pass 結果を基準に generated status を再生成する
3. 過去の成功記録を正とせず、現ソース再実行結果を正とする

### 完了条件
- `verify:future-native-artifact-suite` 通過
- `generated/future-native-suite-status` が現結果と一致

---

## 4-3. package / handoff class の明確化

### 現状
- `node_modules` 同梱でも cross-platform 再現は崩れうる
- docs と実体で package class の表現が揺れている

### 統一する用語
今後は package class を以下に固定する。

1. `source-only`
2. `full-local-dev`
3. `platform-specific-runtime-bundled`

### やること
1. package manifest / handoff docs / doctor 出力の語彙を統一する
2. OS 依存 native バイナリ混入の注意を明記する
3. bootstrap 要否を package class ごとに明記する

### 完了条件
- handoff 先が bootstrap 要否を迷わない
- docs と実体の package class が一致する

---

# P1. product 化の必須課題

## 5-1. future-native の mainline product 化

### 現状
- コードはある
- verify 系もある
- preview / bridge もある

### 不足
- layer workflow に完全統合されていない
- control panel 上で mainline mode と同格でない
- preset / export / import / manifest / routing まで閉じていない

### やること
1. mode 選択 UI へ完全統合
2. control panel 通常導線追加
3. preset browser 対応
4. export / import 対応
5. manifest / renderModeRegistry / projectExecutionRouting との整合

### 完了条件
- future-native が preview 専用でなく通常運用可能になる

---

## 5-2. live browser proof の fixture 化

### 現状
- typecheck / build / script verify はある
- 実ブラウザでの成立証跡が固定されていない

### やること
1. 実ブラウザ fixture を常設化する
2. 実行ログ / スクリーンショット / 成功基準を固定する
3. proof を docs と verify 導線に接続する

### 完了条件
- repo 上でブラウザ成立証跡が客観的に残る
- CURRENT_STATUS の external blocker を減らせる

---

## 5-3. package / report / manifest / docs の single source 化

### 現状
- report 系と現物がズレる箇所がある
- closeout / doctor / handoff / docs の信頼性が揺れる

### やること
1. package class 判定の一本化
2. manifest と closeout report の整合固定
3. doctor / report / 実体 / docs の single source 化

### 完了条件
- 文書を見た判断と現物結果が一致する

---

## 5-4. audio route bulk edit 完成 + legacy slider 整理

### 現状
- drag sort はある
- audio route editor は強い
- live binding もかなり進んでいる

### 不足
- bulk edit が未完寄り
- legacy slider bridge が残る
- UI の責務が整理途中

### やること
1. bulk edit を完成させる
2. legacy slider を段階的に退役する
3. route editor / legacy bridge / binding UI の責務を整理する

### 完了条件
- 音反応運用が通常 workflow として成立する

---

# P2. 設計基盤の一本化

## 6-1. plugin contract 導入

### 目的
mode / family を増やしても破綻しにくい設計にする。

### 現状不足
以下が完全に一本化されていない。

- id
- label
- category
- support level
- settings schema
- scene component
- manifest features
- performance classification

### やること
1. plugin contract 型を導入する
2. 各 mode / family を contract 準拠にする
3. UI / registry / runtime / manifest が共通参照するようにする

---

## 6-2. render mode 定義の単一ソース化

### 背景
元 md では以下が別タスクとして出ていた。

- plugin contract 化
- render registry と runtime の完全同期
- registry / routing / diagnostics / manifest の単一ソース化

これらは実質的に近い課題であるため、この統合版では一つに束ねる。

### やること
1. render mode の source data を一箇所に寄せる
2. UI / runtime / export / manifest / diagnostics が derived data として追従するようにする
3. 二重管理箇所を削減する

### 完了条件
- registry を変えた時に UI / runtime / export / manifest がズレにくくなる

---

## 6-3. capability routing の完全形式化

### 現状
- capability guard はかなり進んでいる
- routing も存在する
- ただし heuristic が残る

### やること
1. capability matrix を定義固定する
2. 各 system / mode の要求条件を明文化する
3. fallback policy を docs / runtime / verify で共有する
4. device / WebGL / WebGPU / mobile risk を統一的に扱う

### 完了条件
- ルーティング判断が暗黙知でなくなる

---

# P3. 表現帯域の product 化

## 7-1. volumetric family の product 化

### 現状
コード上には以下がある前提で整理されている。

- smoke
- density transport
- advection
- pressure coupling
- light-shadow coupling

### 不足
- mainline workflow で使いやすく閉じていない
- UI / preset / export / performance control が弱い

### やること
1. volumetric family を通常導線に乗せる
2. density / lighting / step count / coupling の制御 UI を整備する
3. fallback / capability routing を明示する
4. scene preset を整備する

---

## 7-2. PBD family の product 化

### 対象
- cloth
- membrane
- rope
- softbody

### 不足
- pin
- collision
- tearing
- editing
- authoring workflow

が product として閉じていない

### 優先
- cloth
- membrane
- rope

### やること
1. pin / anchor / constraint 編集
2. collision 対応
3. tearing / fracture 連動
4. preset / export / playback 導線整備

---

## 7-3. fracture family の専用 runtime 強化

### 現状
- fracture 系基盤はある
- lattice fracture 基盤もある

### 不足
- voxel fracture
- crack propagation
- debris generation

が専用 runtime として閉じ切っていない

### やること
1. voxel fracture の独立化
2. crack propagation の状態遷移整備
3. debris generation の専用 runtime 化
4. fracture family の preset / UI 導線統一

---

## 7-4. MPM family の独立強化

### 対象
- granular
- viscoplastic
- snow
- mud
- paste

### 不足
- shared substrate 依存が大きい
- constitutive model の独立性が弱い
- parameter schema / diagnostics / runtime 差別化が弱い

### やること
1. family ごとの constitutive model を明確分離する
2. parameter schema を独立させる
3. preset / diagnostics / runtime の差分を明確化する

---

# P4. 保守性と体験改善

## 8-1. audio 巨大ファイルの責務分割

### 現時点で特に大きいもの
- `components/controlPanelTabsAudioRouteEditor.tsx`
- `components/controlPanelTabsAudioLegacyConflict.tsx`
- `components/useAudioLegacyConflictBatchActions.ts`
- `lib/audioReactiveValidation.ts`

### やること
1. UI / state / derived / action / validation に責務分離する
2. verifier / snapshot がある箇所から分割する
3. facade を残して import 面を壊さない

### 注意
これは重要だが、manifest / verify / product 化より先に置かない。

---

## 8-2. lazy load / preload 整理

### 現状
- specialist / preview / family 系が初回ロードを重くしている可能性がある
- modulepreload の整理余地がある

### やること
1. family preview / specialist 系の lazy load 再整理
2. preload 対象を見直す
3. 初回表示に不要な chunk を後読込へ移す

### 完了条件
- 既存 verifier を壊さず、初回体験を軽くする

---

## 8-3. 起動体験の軽量化

### 位置づけ
これは意味のある改善だが、manifest / verify / product 化の後段に置く。

### 理由
runtime 不整合が残ったまま軽量化だけ進めると、表面だけ整って再度手戻りが出るため。

---

## 8-4. cross-platform packaging の整理

### やること
1. `source-only`
2. `full-local-dev`
3. `platform-specific-runtime-bundled`

の運用と生成手順を明確化する。

### 目的
- 配布物の意味を曖昧にしない
- handoff 時の誤認を減らす

---

## 9. 実行順

以下の順で進める。

```text
P0 再現性ブロッカーの止血
→ P1 product 化の必須課題
→ P2 設計基盤の一本化
→ P3 表現帯域の product 化
→ P4 保守性と体験改善
```

特に避けるべき順は以下。

- 先に軽量化へ行く
- 先に大規模分割へ行く
- docs だけ先に整える
- generated status を現ソース検証なしで正扱いする

---

## 10. 次の AI / 作業者への開始手順

### 最初に確認するファイル
1. `lib/projectStateManifest.ts`
2. `lib/projectStateManifestBuilder.ts`
3. `lib/projectStateManifestBuild.ts`
4. `lib/projectStateManifestNormalizer.ts`
5. `lib/projectStateManifestNormalize.ts`
6. `lib/projectStateStorage.ts`
7. `scripts/verify-future-native-project-state-fast.mjs`
8. `scripts/verify-future-native-artifact-suite.mjs`

### 最初にやる修正
1. manifest export 経路の一本化
2. storage の build / normalize 経路確認
3. verify 再実行
4. generated status 再生成
5. package class / docs / doctor の用語統一

### その後の順序
1. future-native mainline 統合
2. live browser proof fixture 化
3. audio bulk edit 完成 + legacy slider 整理
4. plugin contract / single source 化
5. volumetric / PBD / fracture / MPM の product 化
6. 分割 / lazy load / packaging 整理

---

## 11. 完了判定

### 最低限の区切り
- manifest 経路が新旧二重化していない
- `verify:future-native-project-state-fast` が通る
- `verify:future-native-artifact-suite` が通る
- generated status が現結果と一致する
- package class が docs / doctor / 実体で一致する

### product 化の区切り
- future-native が mainline workflow で通常機能として使える
- live browser proof が repo 常設になる
- audio 運用が bulk edit / binding / route editor まで閉じる

### 拡張段階の区切り
- volumetric / PBD / fracture / MPM が UI / preset / export / manifest / routing を含めて product 完了している

---

## 12. 運用ルール

1. 「コードがある」だけでは完了扱いにしない
2. UI / preset / export / manifest / routing まで揃って初めて product 完了とみなす
3. docs は必ず現物検証結果と同期させる
4. generated status は再実行結果と一致して初めて信用する
5. 先に止血し、その後に拡張する

---

## 13. 要約

このプロジェクトは中身が弱いのではなく、**整合ズレと product 未閉鎖が主問題**である。

したがって、最適な進め方は以下である。

1. manifest / verify / package の不整合を止血する
2. future-native / audio / proof / docs を product として閉じる
3. plugin contract と single source 化で拡張基盤を固める
4. その上で volumetric / PBD / fracture / MPM を通常機能として完成させる
5. 最後に分割・軽量化・配布整理で保守性と体験を上げる

