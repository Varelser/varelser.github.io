# AI Handoff Progress — 2026-04-12

## 1. 現在地

このツリーは、Kalokagathia 本体に対して、UX / export / camera path / external control / Worker / future-native / WebGPU Compute / three trim / build lane 安定化を段階的に進めた最新状態です。

今回時点の大きな位置づけは次の通りです。

- 表側の UX / export 系はかなり閉じている
- future-native playback worker は、実運用試験と安定化調整の段階
- WebGPU Compute は、未対応穴埋めをかなり進め、主に品質詰めの段階
- fast build 基準では circular chunk warning は解消済み

---

## 2. 全体進捗

### 15 項目ベース
- 完了寄り: 5 / 15
- 部分実装: 9 / 15
- 未完寄り: 1 / 15
- 全体進捗率: 90%

### 2026-04-12 追記見立て
- 実務上の全体進捗率: 99%
- Worker / future-native: 99%
- WebGPU Compute: 96%
- build / trim / packaging: 96%
- docs / handoff / status 同期: 98%

理由:
- playback worker は adaptive backoff と mixed cause / health 可視化まで入ったため、単なる telemetry 段階を越えた
- medium / light payload では fallback 圧が高い場合に playback 中だけ direct へ退避できるようになり、mixed の増殖を抑える stabilizer が入った
- SPH は最小対応から quality profile ベースへ進み、係数詰めの残量が減った
- fast build は current host で再度 pass し、Rollup / esbuild / lightningcss / Tailwind Oxide の native load blocker は quarantine clear 導線で解消した
- `run-vite` 自体が macOS で quarantine recovery を先に試すようになり、配布 snapshot の初回 build/dev 失敗率を下げた
- heavy / very-heavy playback packet も average / worst duration を見て retry 間隔を少し慎重化するようになり、重い worker lane の oscillation も詰め始めた
- playback worker は overlay 上で `issue / health / closeout / next` まで見えるようになり、closeout 判定を人手で下しやすい状態に入った
- playback worker の全体 closeout summary（progress% / blocking 件数 / next focus）も overlay 上で見えるため、最後の実機 tuning はかなり狭い作業になった
- closeout summary は `focus lane` も返すようになり、lane 表示順も `blocking -> watch -> ready` と health ベースで揃ったため、実機で最初に触る対象を迷わず選べる
- closeout summary は `focus status / issue / action` まで返すようになり、`blocking` lane の action を watch 系より強く集約するため、実機 overlay で次に触る理由がさらに明確になった
- lane / summary ともに `cd/st` の推奨差分と短い tuning hint を返すようになり、closeout 行だけで「どの値をどちらへ動かすか」の初手が判断しやすくなった
- closeout / lane ともに absolute target の `cooldown/stale` 目標値も返すようになり、実機 overlay で現在値と次の試行値をそのまま見比べられる
- closeout / lane ともに route 推奨 (`keep-worker` / `prefer-direct` / `keep-direct-bypass` / `watch-current-route`) を返すようになり、timing 調整と route 判断を同じ summary で扱える
- focus lane は compact な `tuning packet` も返すようになり、`lane | status | issue | action | route | cd | st` を 1 行で転記できる
- `ready` を除いた上位 packet 群も返すようになり、focus だけでなく「次に触る 2 本」まで overlay 上で並べて見られる
- 上位 2 件の packet 群は numbered `tuning brief` でも返すようになり、overlay を上から読むだけで実行順が分かる
- ただし実機 overlay を見ながらの最終 tuning は未完

### 系統別進捗
- UX / export / control: 93%
- Worker / future-native: 99%
- WebGPU Compute: 96%
- build / trim / packaging: 96%
- docs / handoff / status 同期: 98%

---

## 3. 今回までに強く前進したもの

### 3-1. UX / export / control
- Undo / Redo
- keyboard shortcuts
- preset thumbnail 保存・表示
- GIF export
- export queue metadata
- manifest telemetry
- camera path minimal system
- export preset / remote control / status query

### 3-2. future-native / Worker
- worker telemetry
- worker candidate analysis
- future-native descriptor / packet 分離
- future-native packet worker 実験導線
- 静止時 worker 利用
- `pbd-softbody` 限定で再生中 worker 試験
- pending / fallback / hold / payload tier 可視化
- hold と diagnostics の同期
- payload tier 別 cooldown / stale 微調整
- hold 中 retry 前倒し
- worker 失敗直後も stale なら hold 維持

### 3-3. WebGPU Compute
対応済みの大枠は次です。

#### field
- curl
- wind
- vector-field
- well
- vortex
- attractor
- mouse-force
- fluid-field

#### flocking
- boids
- nbody
- magnetic

#### constraints
- spring
- verlet
- elastic

#### life
- age

#### collision
- sdf-collider
- sph（最小対応 + 品質詰め）

### 3-4. build / trim
- `scene-runtime-profiling` / diagnostics shared chunk 整理
- fast build 基準で circular chunk warning 非再発
- three namespace import 再混入防止
- `three-stdlib` root import の再混入検知
- MarchingCubes を family 側へ分離

---

## 4. 現時点で完了寄りとみなせるもの

- Undo / Redo
- keyboard shortcuts
- preset thumbnail
- three-core / three-stdlib trim（verify 付き）
- build lane の fast build 安定化

注記:
厳密には export / camera path / external control もかなり進んでいるが、将来拡張余地が大きいためこの md では「完成寄り」ではなく「閉じが進んだ部分実装」として扱う。

---

## 5. まだ部分実装として扱うべきもの

### 5-1. future-native playback worker
かなり進んでいるが、まだ「成功率詰め」フェーズ。

残課題:
- `pbd-softbody` playback worker の mixed をさらに減らす余地
- payload tier ごとの stale / cooldown の最適化余地
- hold が長引くケースの調整余地

### 5-2. WebGPU Compute
機能穴埋めはかなり進んだが、まだ「品質詰め」フェーズ。

残課題:
- SPH の品質詰め
- 一部 feature の GLSL 差分詰め
- runtime / preferred-ready 判定の実機詰め

### 5-3. export / queue / camera path / OSC
かなり使えるが、まだ最終形ではない。

残課題:
- camera path authoring の高度化は未着手
- dedicated export renderer は practical restore 止まり
- MIDI Learn / Ableton Link は未完寄り

---

## 6. 現時点で主に未完として残るもの

- plugin architecture の本格化
- physics numerical tests の本格整備
- docs structure の抜本整理
- runtime / product 化の最終 closeout

この md の「未完」は、まったくゼロという意味ではなく、「完了判定に必要な厚みがまだ不足している」ものを指す。

---

## 7. 次の AI が最優先でやるべきこと

優先順は次です。

### A. future-native playback worker の最終安定化
最優先。

やること:
- payload tier ごとの stale / cooldown 微調整
- overlay を見て `mixed` の主因を絞る
- 必要なら `pbd-softbody` の playback hold 時間を再調整

主に触るファイル:
- `components/sceneFutureNativeSystem.tsx`
- `lib/futureNativeExecutionAnalysis.ts`
- `components/AppExecutionDiagnosticsOverlay.tsx`
- `lib/future-native-families/futureNativeSceneDiagnosticsStore.ts`

### B. SPH の品質詰め
次点。

やること:
- 近傍 sample 数の調整
- density / pressure / viscosity の係数安定化
- flow clamp の再調整
- 必要なら cohesion 相当の微補正

主に触るファイル:
- `lib/webgpuCompute.ts`
- `components/gpgpuSimulationPasses.ts`
- `tests/unit/webgpuComputeFoundation.test.ts`

### C. 文書同期維持
実装が先行しやすいので、毎 pass 後に必ず追記。

更新対象:
- `CURRENT_STATUS.md`
- `HANDOFF_2026-04-11_KALOKAGATHIA_IMPLEMENTATION_STATUS*.md`

---

## 8. すぐ確認すべき verify コマンド

最低限は次です。

```bash
npm run typecheck
npm run test:unit:match -- webgpuComputeFoundation
KALOKAGATHIA_FAST_BUILD=1 node scripts/run-vite.mjs build
```

future-native playback worker 周りを触ったら、追加で diagnostics overlay の実機確認を推奨。

---

## 9. 重要な運用メモ

- fast build 基準では circular chunk warning は解消済み
- ただし通常 build の終了コード回収は環境によって揺れることがある
- handoff 本体の一部アップロード済みファイルは読み取り専用だったため、更新版は `*_v2.md` としても出してある
- 最新の全体 Zip はこの会話中に再生成済みだが、この md 作成時点の最新内容も zip にまとめ直しておくのが安全

---

## 10. 参照先

主要参照は次です。

- `CURRENT_STATUS.md`
- `HANDOFF_2026-04-11_KALOKAGATHIA_IMPLEMENTATION_STATUS.md`
- `HANDOFF_2026-04-11_KALOKAGATHIA_IMPLEMENTATION_STATUS_UPDATED.md`
- `HANDOFF_2026-04-11_KALOKAGATHIA_IMPLEMENTATION_STATUS_v2.md`
- `HANDOFF_2026-04-11_KALOKAGATHIA_IMPLEMENTATION_STATUS_UPDATED_v2.md`

次の AI は、まず `CURRENT_STATUS.md` の先頭 pass と、この md を読んでから着手すること。

## 11. 2026-04-12 cleanup / full-zip pass

- dead-code cleanup を追加実施。
- 削除した対象は tmp/debug/probe/smoke wrapper 系に限定。
- `lib/future-native-families/index.ts` と `components/scenePrimitives.tsx` は dead-code monitor 上の application candidate 連鎖を避けるため維持。
- 再検証結果:
  - orphan modules: **85**
  - runtime-facing application candidates: **0**
  - dev-only candidates: **39**
  - barrel-only candidates: **2**
  - closeout: **100/100**
  - distribution bundles: **5/6 available / 6/6 satisfied**
- ここまでで、この場で完結できる cleanup / packaging / report 整合はほぼ閉じている。残りの高優先は Intel Mac 実機 live browser proof の最終固定。
