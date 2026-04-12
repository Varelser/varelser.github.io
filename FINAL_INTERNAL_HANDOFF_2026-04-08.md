# Kalokagathia Final Internal Handoff (2026-04-08)

## 1. この ZIP の位置づけ

この時点の内部作業は、**repo 内で安全に進められる改善をほぼ完了**しています。

このパッケージは、2026-04-08 時点での**推奨正本**です。
以後の作業は、この ZIP を土台にしてください。

## 2. この版を正本とする理由

- build / unit / package integrity / repo status が通過している
- html preload は **最小系** に固定されている
- dead-code application candidate は **0**
- ControlPanel / Audio / PostFX / future-native の低リスク分割が一通り入っている
- 壊れた ZIP や warning が残る試行版を採用していない

## 3. 現在の到達点

### 3.1 進捗
- repo 内更新進捗: **100%**
- 全体進捗: **96%**
- Intel Mac target readiness: **83% (5/6)**
- Intel Mac drop intake: **36% (4/11)**

### 3.2 固定できている重要条件
- `dist/index.html` の preload は **react-vendor のみ**
- `verify:preload-minimum` で preload 退行を自動検知できる
- `verify:three-namespace-imports` で `import * as THREE from 'three'` の再混入を自動検知できる

### 3.3 代表 build 実測
- `three-core`: **674.69 KB**
- `ui-control-panel`: **234.81 KB**
- `ui-control-panel-audio`: **34.04 KB**
- `ui-control-panel-audio-synth`: **6.86 KB**
- `scene-future-native`: **21.70 KB**
- `scene-future-native-bridges`: **5.46 KB**
- `scene-future-native-pbd`: **97.92 KB**
- `scene-future-native-mpm`: **34.06 KB**
- `scene-future-native-fracture`: **25.66 KB**
- `scene-future-native-volumetric`: **119.32 KB**
- `scene-postfx-composer`: **87.03 KB**
- `scene-postfx-n8ao-vendor`: **131.43 KB**

## 4. 採用済みの重要改善

### 4.1 preload / startup
- runtime / families / starter library / future-native / projectState などの preload 除外を整理
- `verify:preload-minimum` を追加し、preload の戻りを自動検知

### 4.2 dead-code / import hygiene
- application candidate **43 -> 0**
- `verify:three-namespace-imports` を追加し、app source 上の broad `THREE.*` import 再混入を防止

### 4.3 ControlPanel
- closed shell
- open body split
- connected state split
- state/chrome split
- audio legacy split
- audio route editor chunk split
- audio synth lazy
- ambient/audio decouple

### 4.4 future-native
- runtime shell / bridges / volumetric / specialist を分離
- PBD / MPM / fracture route split
- circular chunk warning を解消済み

### 4.5 PostFX
- N8AO vendor 分離
- composer/basic boundary 分離

### 4.6 Intel Mac proof 導線
- capture kit を同梱
- host ingest wrapper を追加
- 実機採取後の host 側手順を 1 コマンド化

## 5. 採用しなかったもの

以下は試行したが、**正本には入れない**判断です。

- ControlPanel content stage experiment
  - build/verify は通るが、`ui-control-panel` 実測が悪化
- Audio route preset pack 分離試行
  - 数値改善は出たが circular chunk warning が残る
- 壊れた 62MB ZIP 系統
  - ZIP 自体が不完全で unsafe

## 6. 残課題

### 6.1 外部 blocker
- Intel iMac 実機 live proof
  - `real-export` UI 実行由来 JSON
  - `real-export-proof.json`
  - screenshots / structured logs
  - 実ブラウザ path 証跡

### 6.2 内部で残る本命
- `three-core` の deeper trim

ただし、この時点では
**内部で安全に進められる改善はかなり終盤**で、
これ以上は改善量より回帰リスクが上がりやすい段階です。

## 7. 次の担当者がやること

### 最優先
1. Intel iMac 実機で capture kit を使って proof を採取
2. host 側で ingest wrapper を実行
3. doctor / status を再生成

### 次点
4. 実機 proof 後に、本当に必要なら `three-core` deeper trim を再開

## 8. これ以上内部最適化を続けるべきか

現時点の判断では、**むやみに続けない方がよい**です。
理由は以下です。

- preload はすでに最小系
- repo 内更新は 100%
- 大きな未整理は外部実機 proof 側に寄っている
- 最近の試行では、改善量が小さい一方で warning / 悪化が出やすい

したがって、次の合理的な一手は
**内部の追加最適化ではなく、実機 proof の取得**です。
- Intel Mac proof closeout の最終実行カード: `docs/archive/intel-mac-proof-final-execution-card-2026-04-09.md`

<!-- PHASE_BCDE_CURRENT_SYNC:START -->
## 2026-04-09 phase current sync

- canonical current docs:
  - `docs/PHASE_BCDE_CLOSEOUT_SCORECARD_CURRENT.md`
  - `docs/INTEL_MAC_LIVE_BROWSER_PROOF_CURRENT.md`
  - `docs/INTEL_MAC_INCOMING_ONE_SHOT_CURRENT.md`
  - `docs/EXECUTION_SURFACES_CURRENT.md`
  - `docs/UX_CLOSEOUT_MATRIX_CURRENT.md`
  - `docs/UX_IMPLEMENTATION_BOUNDARY_CURRENT.md`
  - `docs/WEBGPU_CAPABILITY_STATUS_CURRENT.md`
  - `docs/WEBGPU_EXECUTION_MODE_MATRIX_CURRENT.md`
  - `docs/CHUNK_WARNING_INVENTORY_CURRENT.md`

- summary:
  - generatedAt: 2026-04-09T19:26:49.998Z
  - Phase B: repo-closed / done 22 / limited 0 / preview-only 0
  - Phase C: host-proof-required / verdict ready-for-real-capture / drop 6/11 / target 5/6 / blockers 6
  - Phase D: repo-closed / done 5 / deferred 0 / host-proof-required 1

- intel mac current:
  - generatedAt: 2026-04-09T19:26:49.765Z
  - verdict: ready-for-real-capture
  - drop: 6/11
  - target: 5/6
  - blockerCount: 6
  - fixtureCount: 0
<!-- PHASE_BCDE_CURRENT_SYNC:END -->
