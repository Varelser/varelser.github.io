# KALOKAGATHIA worker assignment matrix for additive patching

- 作成日: 2026-04-06
- 目的: worker AI に実際に振れる範囲を、**現 repo の directory / file 単位** へ落とす
- 前提: mainline owner AI は `10` の幹線を握ったまま、worker AI には材料作成と局所補助だけを返させる

---

## 1. 使い方

この文書は、複数 AI を同時に動かす時の **最初の担当表原案** である。

- まず `10` を読む
- 次に `13` で現物 inventory を見る
- その上で、この `14` の担当を branch / patch 単位で配る
- 最後に mainline owner AI が受け取って統合する

---

## 2. 実担当表

| worker role | 主対象 | 触ってよい範囲 | 触ってはいけない幹線 | 推奨返却 | 最低 verify |
|---|---|---|---|---|---|
| 調査専任 AI | `components/`, `lib/`, `scripts/`, `docs/` | inventory / evidence / checklist / conflict audit | manifest truth / registry truth / routing truth / package class truth | patch | file list + evidence table |
| audio 専任 AI | audio tab 周辺 | docs, checklist, split proposal, low-risk local refactor案 | global routing / manifest / CURRENT_STATUS final fix | branch または patch | `npm run verify:audio`, `npm run verify:shared-audio` |
| family 専任 AI | PBD / MPM / fracture / volumetric | family ごとの product 未閉鎖箇所の列挙、preset / UI / export / import 導線の不足洗い出し | render registry final / project state final | patch | family verify + note |
| verification 専任 AI | `scripts/` / `generated/` | subsystem 別 checklist、proof 収集、resume 用 evidence 整理 | quality gate の最終変更 | patch | 再実行ログ添付 |
| docs-package 監査 AI | `docs/`, root md, package scripts | docs 矛盾洗い出し、closeout 補助、manifest recovery plan の evidence 整理 | package class final, final handoff truth | patch | doctor + integrity |

---

## 3. 調査専任 AI へ振る対象

### 任せる対象 directory

- `components/`
- `lib/`
- `scripts/`
- `docs/`
- `generated/`

### 任せる成果物

- subsystem inventory
- state evidence table
- archive 混入危険箇所
- conflict hot spot 監査
- verify checklist 草案

### 禁止

- `CURRENT_STATUS.md` の final status 化
- `REVIEW.md` の final truth 化
- manifest / routing / registry の確定変更

---

## 4. audio 専任 AI へ振る対象

### 優先対象 file

- `components/controlPanelTabsAudioRouteEditor.tsx`
- `components/controlPanelTabsAudioLegacyConflict.tsx`
- `components/useAudioLegacyConflictBatchActions.ts`
- `components/useAudioLegacyConflictManager.ts`
- `components/useAudioLegacyConflictFocusedActions.ts`
- `lib/audioReactiveValidation.ts`
- `lib/audioReactiveRetirementMigration.ts`

### 任せる内容

- split proposal
- docs / checklist 補強
- batch action と focused action の境界監査
- route editor drag sort 周辺の局所 proof 整理
- legacy slider 縮退の残件棚卸し

### 禁止

- global control panel routing の意味変更
- project state / manifest の変更
- `CURRENT_STATUS.md` 先行更新

### 推奨 verify

- `verify:audio`
- `verify:audio-reactive`
- `verify:shared-audio`
- `verify:standalone-synth`
- `verify:video-audio`

---

## 5. family 専任 AI へ振る対象

### PBD 帯域

- `lib/future-native-families/futureNativeFamiliesPbd.ts`
- `lib/future-native-families/futureNativePbdFamilyPreview.ts`
- `lib/future-native-families/futureNativeSceneBridgePbdClothSoftbody.ts`
- `lib/future-native-families/futureNativeSceneBridgePbdMembrane.ts`
- `lib/future-native-families/starter-runtime/pbd_*`

推奨 verify:
- `verify:pbd-cloth`
- `verify:pbd-membrane`
- `verify:pbd-rope`
- `verify:pbd-softbody`
- `verify:pbd-surface-integration`

### MPM 帯域

- `lib/future-native-families/futureNativeFamiliesMpm.ts`
- `lib/future-native-families/futureNativeMpmFamilyPreview.ts`
- `lib/future-native-families/futureNativeSceneBridgeMpm*.ts`
- `lib/future-native-families/starter-runtime/mpm_*`

推奨 verify:
- `verify:mpm-granular`
- `verify:mpm-mud`
- `verify:mpm-paste`
- `verify:mpm-snow`
- `verify:mpm-viscoplastic`

### fracture 帯域

- `lib/future-native-families/futureNativeFamiliesFracture.ts`
- `lib/future-native-families/futureNativeFractureFamilyPreview.ts`
- `lib/future-native-families/futureNativeSceneBridgeFracture*.ts`
- `lib/future-native-families/starter-runtime/fracture_*`

推奨 verify:
- `verify:fracture-crack-propagation`
- `verify:fracture-debris-generation`
- `verify:fracture-lattice`
- `verify:fracture-voxel`

### volumetric 帯域

- `lib/future-native-families/futureNativeFamiliesVolumetric.ts`
- `lib/future-native-families/futureNativeVolumetricFamilyPreview.ts`
- `lib/future-native-families/futureNativeSceneBridgeVolumetric*.ts`
- `lib/future-native-families/starter-runtime/volumetric_*`

推奨 verify:
- `verify:volumetric-advection`
- `verify:volumetric-density-transport`
- `verify:volumetric-light-shadow`
- `verify:volumetric-pressure`
- `verify:volumetric-smoke`

### family 専任 AI 共通の返却物

```md
- 対象:
- 種別: patch / branch
- 触った範囲:
- 触っていない幹線:
- 実行 verify:
- 残件:
- mainline 判断が必要な点:
```

---

## 6. verification 専任 AI へ振る対象

### 主対象 scripts

- `scripts/verify-future-native-safe-pipeline-core.mjs`
- `scripts/verify-future-native-artifact-suite.mjs`
- `scripts/verify-future-native-artifact-tail.mjs`
- `scripts/run-step-suite.mjs`
- `scripts/verify-package-integrity.mjs`
- `scripts/doctor-package-handoff.mjs`

### 任せる内容

- subsystem 別 checklist の統一
- resume 実行の証跡整理
- generated status と現再実行結果の比較補助
- 未実行 step の一覧化

### 禁止

- accept criteria の独断変更
- pass/fail ルールの最終変更

---

## 7. docs-package 監査 AI へ振る対象

### 主対象

- `CURRENT_STATUS.md`
- `REVIEW.md`
- `DOCS_INDEX.md`
- `docs/handoff/`
- `docs/archive/`
- `scripts/write-package-manifest.mjs`
- `scripts/generate-closeout-report.mjs`

### 任せる内容

- docs 間の矛盾洗い出し
- archive と current の混同防止メモ
- package class の evidence 収集
- recovery plan の引用整理

### 禁止

- package class の final 命名変更
- final handoff の確定

---

## 8. patch で返すべきもの / branch で返すべきもの

### patch 向き
- md inventory
- md checklist
- conflict report
- verify evidence note
- 1 directory 内の局所 docs 修正
- 低リスク file split 提案

### branch 向き
- 1 family の product 化補助一式
- 1 UI 領域の局所再編
- audio 周辺の局所分割
- starter-runtime の局所改善

### 返してはいけないもの
- manifest truth を変えた patch
- render registry を勝手に変えた branch
- `CURRENT_STATUS.md` だけ先に更新した patch
- archive 由来の古いファイルを current に戻した patch
