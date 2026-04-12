# KALOKAGATHIA 本体とセットで握る未網羅層

- 作成日: 2026-04-06
- 目的: Kalokagathia 本体へ**後から patch で安全に加える**前提で、mainline owner AI が repo 本体と一緒に握るべき未網羅層だけを現物基準で固定する。
- 前提: この文書は `KALOKAGATHIA_00_missing_layers_split_guide_2026-04-06.md` と `KALOKAGATHIA_11_delegatable_missing_layers_for_other_ai_2026-04-06.md` の間に入る **10番** であり、worker AI へ委譲してはいけない本幹を定義する。

---

## 1. 現時点の現物確認

2026-04-06 時点で、この本体では次を確認した。

- `lib/projectStateManifest.ts` は旧 build/normalize ではなく、新しい builder / normalizer を export している
- `npm run typecheck` は pass
- `npm run verify:future-native-project-state-fast` は pass
- `npm run verify:future-native-safe-pipeline:core` は pass
- `generated/future-native-suite-status/verify-future-native-artifact-suite.json` は `ok: true`
- package class の canonical は `source-only` / `full-local-dev` / `platform-specific-runtime-bundled` に統一済み

したがって、以前の「manifest 旧新二重化の止血」は mainline の**過去 blocker**であり、現時点の未網羅層はより上位の **正本台帳化・product 閉鎖・global criteria 固定** に移っている。

---

## 2. mainline owner AI が repo と一緒に握るべきもの

以下は patch/branch の材料作成ではなく、**本体の正本決定**に当たるため mainline owner AI が握る。

### 2-1. 全 family / 全 mode / 全 subsystem の公式一覧

これは worker に抽出させてもよいが、**何を公式一覧とみなすか** は mainline 側が確定する。

特に以下は正本決定対象。

- future-native family の公式一覧
- render / procedural / routing の mode 一覧
- project state / manifest / package / handoff / docs truth を構成する subsystem 一覧
- audio / future-native / package / verification / generated-status の幹線一覧

### 2-2. 公式 state 判定

以下は evidence 収集ではなく、**公式 state** の決定である。

- implemented
- partial
- not-started
- retired
- blocked
- mainline-only

worker は suspected state まで。最終状態は mainline owner AI が決める。

### 2-3. parallel / conditional / mainline-only の最終判定

どの修正を branch へ出してよいか、どれを mainline 固定にするかは、merge 粒度と同じく本体の安全性に直結する。

### 2-4. dependency gate の固定

以下は先後関係を誤ると意味が崩れるため mainline 側で固定する。

- contract 固定前に進めてよい範囲
- registry / routing truth 固定前に進めてよい範囲
- manifest 接続前に product 化してよい範囲
- verify global criteria 固定前に pass 扱いしてよい範囲

### 2-5. merge 単位 / return 単位 / 完了条件の固定

- patch 返却か branch 返却か
- どこまでを 1 merge 単位とするか
- subsystem 完了扱いの global criteria
- docs をいつ truth に同期するか

### 2-6. conflict / meaning conflict の危険幹線判定

単なる text conflict ではなく、**意味衝突**の危険幹線を mainline 側で決める。

---

## 3. 本体で mainline 固定にすべき実ファイル群

以下は現物上、幹線として mainline 側で扱うべき候補群である。

### 3-1. project state / manifest 幹線（9 files）

- `lib/projectState.ts`
- `lib/projectStateManifest.ts`
- `lib/projectStateManifestBuild.ts`
- `lib/projectStateManifestBuilder.ts`
- `lib/projectStateManifestNormalize.ts`
- `lib/projectStateManifestNormalizer.ts`
- `lib/projectStateManifestShared.ts`
- `lib/projectStateShared.ts`
- `lib/projectStateStorage.ts`

### 3-2. registry / routing / capability 幹線（29 files）

- `lib/audioReactiveRegistry.ts`
- `lib/proceduralModeRegistry.ts`
- `lib/projectExecutionRouting.js`
- `lib/projectExecutionRouting.ts`
- `lib/renderModeRegistry.ts`
- `lib/renderModeRegistryGpgpuModes.ts`
- `lib/renderModeRegistryGpuModes.ts`
- `lib/renderModeRegistryLayerModes.ts`
- `lib/renderModeRegistryPostFxModes.ts`
- `lib/renderModeRegistryShared.ts`
- `lib/sceneRenderRouting.js`
- `lib/sceneRenderRouting.ts`
- `lib/sceneRenderRoutingPlans.js`
- `lib/sceneRenderRoutingPlans.ts`
- `lib/sceneRenderRoutingProceduralSnapshots.js`
- `lib/sceneRenderRoutingProceduralSnapshots.ts`
- `lib/sceneRenderRoutingRenderPredicates.js`
- `lib/sceneRenderRoutingRenderPredicates.ts`
- `lib/sceneRenderRoutingRuntime.js`
- `lib/sceneRenderRoutingRuntime.ts`
- `lib/sceneRenderRoutingRuntimeAccessors.ts`
- `lib/sceneRenderRoutingRuntimePredicates.ts`
- `lib/sceneRenderRoutingRuntimeSnapshots.ts`
- `lib/sceneRenderRoutingShared.js`
- `lib/sceneRenderRoutingShared.ts`
- `lib/sceneRenderRoutingSnapshots.js`
- `lib/sceneRenderRoutingSnapshots.ts`
- `lib/sceneRenderRoutingTypes.js`
- `lib/sceneRenderRoutingTypes.ts`

### 3-3. package / doctor / closeout / package-class 幹線（13 files）

- `docs/PACKAGE_CLASS_POLICY_2026-04-05.md`
- `docs/PACKAGE_HANDOFF_DOCTOR_2026-04-05.md`
- `docs/PHASE5_CLOSEOUT_CONSOLIDATION_2026-04-05.md`
- `scripts/doctor-package-handoff.mjs`
- `scripts/doctor-tooling.mjs`
- `scripts/generate-closeout-report.mjs`
- `scripts/inspect-package-lock.mjs`
- `scripts/package-full-zip.mjs`
- `scripts/package-future-native-source-only.mjs`
- `scripts/package-source-zip.sh`
- `scripts/packageIntegrityShared.mjs`
- `scripts/verify-package-integrity.mjs`
- `scripts/write-package-manifest.mjs`

### 3-4. future-native mainline 接続で mainline 判定が必要な代表ファイル

- `lib/future-native-families/futureNativeFamiliesRegistry.ts`
- `lib/future-native-families/futureNativeSceneBindings.ts`
- `lib/future-native-families/futureNativeFamiliesIntegration.ts`
- `lib/future-native-families/futureNativeFamiliesVerifier.ts`
- `lib/future-native-families/futureNativeFamiliesProjectReport.ts`
- `lib/future-native-families/futureNativeFamiliesProgress.ts`
- `lib/future-native-families/futureNativeFamiliesMilestones.ts`
- `lib/future-native-families/futureNativeFamiliesAcceptance.ts`
- `lib/future-native-families/futureNativeFamiliesTypes.ts`
- `lib/future-native-families/index.ts`
- `scripts/verify-future-native-safe-pipeline-suite.mjs`
- `scripts/verify-future-native-artifact-suite.mjs`
- `scripts/emit-future-native-artifact-suite.mjs`
- `scripts/emit-future-native-suite-status-report.mjs`
- `generated/future-native-suite-status/verify-future-native-safe-pipeline-suite.json`
- `generated/future-native-suite-status/verify-future-native-artifact-suite.json`

### 3-5. audio で meaning conflict が起きやすい代表ファイル

- `components/controlPanelTabsAudio.tsx`
- `components/controlPanelTabsAudioLegacyConflict.tsx`
- `components/controlPanelTabsAudioLegacySliders.tsx`
- `components/controlPanelTabsAudioRouteEditor.tsx`
- `components/controlPanelTabsAudioSequenceTrigger.tsx`
- `components/controlPanelTabsAudioSynth.tsx`
- `components/useAudioLegacyConflictManager.ts`
- `components/useAudioLegacyConflictDerivedState.ts`
- `components/useAudioLegacyConflictClipboard.ts`
- `components/useAudioLegacyConflictBatchState.ts`
- `components/useAudioLegacyConflictBatchActions.ts`
- `components/useAudioLegacyConflictFocusedActions.ts`
- `components/useAudioRouteEditorCore.ts`
- `components/useAudioRouteTransferUtilities.ts`
- `components/useAudioTabState.ts`
- `lib/audioReactiveValidation.ts`
- `lib/audioReactiveRegistry.ts`
- `lib/audioReactiveRuntime.ts`

### 3-6. archive 取り違え危険帯

- `docs/archive/`
- `docs/handoff/archive/`
- `docs/archive/merge_final_conflicts_2026-04-05/`

archive は参照専用。worker が現行 root / lib / components と混同して patch を返すのを mainline 側で防ぐ。

---

## 4. 現時点で mainline 側に残っている「未網羅層」

### 4-1. 公式台帳の未固定

現 repo には handoff 文書が複数あるが、以下はまだ 1 本の正本としてまとまっていない。

- 全 family / mode / subsystem の公式一覧
- 各項目の公式 state
- parallel / conditional / mainline-only の official class
- merge unit / verify unit / completion criteria
- conflict hot spine と meaning conflict spine

### 4-2. future-native の product 完了判定の未固定

verify は厚いが、以下を満たした時点を official product completion とするかの基準は mainline で固定が必要。

- control panel 通常導線
- preset browsing
- export / import
- manifest roundtrip
- routing truth
- generated status と現ソース再実行結果の一致

### 4-3. live browser proof fixture の global criteria 未固定

script verify は多いが、browser proof をどの fixture / screenshot / log で完了扱いとするかは mainline 側に残る。

### 4-4. audio bulk edit / legacy slider 縮退の official finish line 未固定

分割は進んでいるが、どこで「legacy bridge を段階的退役した」と判断するかは mainline 側で決める必要がある。

### 4-5. docs truth の最終同期順未固定

- `CURRENT_STATUS.md`
- `REVIEW.md`
- `DOCS_INDEX.md`
- `docs/handoff/SESSION_CHECKPOINT_2026-04-06.md`
- `docs/handoff/ai/*.md`

これらをどの順で同期し、どれを truth とするかの最終ルールは mainline owner AI が固定する。

---

## 5. mainline owner AI の着手順

1. **正本台帳固定**
   - family / mode / subsystem / state / class / verify gate の official ledger を 1 本化する
2. **危険幹線固定**
   - mainline-only files / archive 混同禁止 / meaning conflict spine を固定する
3. **worker 用返却条件固定**
   - patch/branch 単位、verify scope、未解決点の返却書式を固定する
4. **product completion 固定**
   - future-native / audio / package / browser proof の完了条件を確定する
5. **最後に docs truth を同期**

---

## 6. この文書を patch として加える理由

この文書は既存 root 文書を上書きせず、`docs/handoff/ai/` に**追加だけ**で入れられる。

- 本体の single source of truth に直接変更を加えない
- 先に multi-AI 運用の境界を固定できる
- 後から本体へ本実装 patch を当てる前の「交通整理」として使える

---

## 7. まとめ

今の Kalokagathia で mainline owner AI が本体と一緒に握るべき未網羅層は、単なる不足機能ではない。

- **公式台帳**
- **公式 state**
- **global verify criteria**
- **merge / return 単位**
- **meaning conflict 幹線**
- **product completion の定義**

これらを先に固定しない限り、worker AI の作業量を増やしても安全に本体へ統合できない。
