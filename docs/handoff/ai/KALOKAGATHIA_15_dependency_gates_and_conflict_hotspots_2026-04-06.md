# KALOKAGATHIA dependency gates and conflict hot spots

- 作成日: 2026-04-06
- 目的: 後から additive patch を当てる前に、**どこが先行ゲートでどこが衝突帯か** を固定する
- 前提: これは mainline owner AI のための統合作業補助である

---

## 1. 最重要ゲート

### Gate A. project state / manifest

代表 file:

- `lib/projectStateManifest.ts`
- `lib/projectStateManifestBuilder.ts`
- `lib/projectStateManifestNormalizer.ts`
- `lib/projectStateStorage.ts`
- `lib/projectSerializationSnapshot.ts`

### ここが先である理由

- 保存互換
- export/import roundtrip
- specialist route / packet の保持
- future-native snapshot の再現性

### worker AI 禁止内容

- schema の final 確定
- manifest feature truth の変更
- migration / versioning の独断更新

---

## 2. Gate B. render registry / routing

代表 file:

- `lib/renderModeRegistry.ts`
- `lib/renderModeRegistryLayerModes.ts`
- `lib/renderModeRegistryGpgpuModes.ts`
- `lib/renderModeRegistryPostFxModes.ts`
- `lib/projectExecutionRouting.ts`
- `lib/sceneRenderRouting.ts`

### ここが先である理由

- 全 family の入口
- active mode の意味
- capability fallback の意味
- scene binding の最終接続

### worker AI 禁止内容

- mode id 追加・改名の final 確定
- routing truth の独断更新
- fallback policy の確定変更

---

## 3. Gate C. future-native integration bridge

代表 file:

- `lib/future-native-families/futureNativeFamiliesRegistry.ts`
- `lib/future-native-families/futureNativeFamiliesIntegration.ts`
- `lib/future-native-families/futureNativeSceneBindings.ts`
- `lib/future-native-families/futureNativeSceneRendererBridge.ts`
- `lib/future-native-families/futureNativeScenePresetPatches.ts`

### ここが先である理由

- family 実装が product 化へ接続される中継帯
- registry / scene bindings / preset patch / runtime export が交差する
- PBD / MPM / fracture / volumetric を個別に触っても、最後にここで意味が揃っていないと閉じない

---

## 4. Gate D. package / handoff / docs truth

代表 file:

- `CURRENT_STATUS.md`
- `REVIEW.md`
- `DOCS_INDEX.md`
- `package.json`
- `scripts/verify-package-integrity.mjs`
- `scripts/doctor-package-handoff.mjs`
- `scripts/generate-closeout-report.mjs`

### ここが先である理由

- 「何を完成と呼ぶか」を決める
- package class と closeout report がぶれると handoff 不能になる
- docs 先行確定は現物ズレを起こす

---

## 5. additive patch の推奨順序

1. docs overlay の投入
2. official ledger 下書きの受け皿固定
3. worker AI による evidence / inventory / checklist 回収
4. mainline で official state / merge unit / verify global criteria を確定
5. 低リスク patch から統合
6. family product closure の patch を統合
7. 最後に `CURRENT_STATUS.md` / `REVIEW.md` / closeout を同期

---

## 6. 現物で見える hot spot

### Audio hot zone

- `components/controlPanelTabsAudioRouteEditor.tsx`
- `components/controlPanelTabsAudioLegacyConflict.tsx`
- `components/useAudioLegacyConflictBatchActions.ts`
- `components/useAudioLegacyConflictManager.ts`
- `components/useAudioLegacyConflictFocusedActions.ts`
- `lib/audioReactiveValidation.ts`
- `lib/audioReactiveRetirementMigration.ts`

### 理由

- 行数が大きい
- control panel / derived state / batch actions / legacy retirement が交差する
- UI と内部 state の両方にまたがる

### future-native hot zone

- `lib/future-native-families/futureNativeFamiliesRegistry.ts`
- `lib/future-native-families/futureNativeFamiliesIntegration.ts`
- `lib/future-native-families/futureNativeSceneBindings.ts`
- `lib/future-native-families/futureNativeSceneRendererBridge.ts`
- `lib/future-native-families/futureNativeScenePresetPatches.ts`
- `scripts/verify-future-native-family-entry.ts`
- `scripts/verify-future-native-render-handoff-entry.ts`

### 理由

- family 実装・preset・scene binding・verify が一点に集中する
- bridge と verify を別 AI が独立に触ると meaning conflict になりやすい

---

## 7. 現物で確認した large implementation file risk

`inspect-project-health.mjs` は large implementation file を **7 本** と報告している。  
代表は以下。

- `lib/future-native-families/futureNativeSceneBridgeRopePayload.js`: 1848 lines
- `components/controlPanelTabsAudioRouteEditor.tsx`: 1124 lines
- `components/controlPanelTabsAudioLegacyConflict.tsx`: 1058 lines
- `components/useAudioLegacyConflictBatchActions.ts`: 854 lines
- `scripts/verify-future-native-family-entry.ts`: 818 lines
- `lib/audioReactiveValidation.ts`: 774 lines
- `lib/future-native-families/starter-runtime/volumetric_density_transportRenderer.js`: 712 lines
- `lib/future-native-families/starter-runtime/fracture_latticeRenderer.js`: 693 lines
- `components/useAudioLegacyConflictManager.ts`: 579 lines
- `lib/audioReactiveRetirementMigration.ts`: 566 lines

### 読み方

- 「分割が必要」ではなく「**複数 branch が同時に触ると危険**」の印として使う
- これらは worker AI へ無制限に配るべきではない

---

## 8. archive 混入 risk

`docs/archive/merge_final_conflicts_2026-04-05/` と現本体 root では、**同 relative path 重複が 188 件** ある。

### 特に注意すべき重複

- `CURRENT_STATUS.md`
- `REVIEW.md`
- `DOCS_INDEX.md`
- `package.json`
- `package-lock.json`
- `types.ts`
- `vite.config.ts`
- `App.tsx`
- `index.tsx`
- `components/*`
- `lib/*`

### 運用 rule

- worker AI に archive を読ませてもよい
- ただし **現行編集元として使ってはいけない**
- current へ戻す patch は必ず root 側 file を正本として再比較する

---

## 9. 低リスク patch と高リスク patch

### 低リスク patch
- md inventory
- md checklist
- verify note
- package evidence note
- directory/file 担当表
- conflict audit

### 中リスク patch
- 1 family に閉じた preset / preview / report 補助
- 1 verify script の補助チェック
- starter-runtime 局所の docs 追記

### 高リスク patch
- manifest
- render registry
- routing
- project state storage
- current status truth
- package class / doctor rule
- archive/current 跨ぎの戻し

---

## 10. mainline owner AI が最後に確定すべきもの

1. official family / mode / subsystem ledger
2. official state (`implemented / partial / not-started`)
3. final class (`parallel / conditional / mainline-only`)
4. merge unit
5. verify global criteria
6. product closure 定義
7. handoff truth
