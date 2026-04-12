# FUTURE_NATIVE_EFFICIENCY_STRATEGY

## 目的
- 表現帯域の網羅を維持したまま、1回ごとの実装・検証・引き継ぎコストを下げる。
- 「多く書く」より「次回も速く増やせる構造」を優先する。

## 現在の判断
- 現時点で最も肥大化しているのは `volumetric-density-transport`。
- そのため、次の追加速度を上げるには **新規枝の追加より先に分割** を優先する。
- 分割後は、全体網羅率を高めるため **rope → fracture → granular** の順で薄い帯域を底上げする。

## 実装ルール
1. 新機能は必ず **feature pack** 単位で追加する。
   - derived field
   - renderer overlay
   - stats
   - summary
   - verify
2. verify は固定大数値ではなく、原則として **存在・mode 数・最低本数** を見る。
3. 1ジャンルが肥大化したら、次の枝追加前に **solver / renderer / verify** のどれかを分割する。
4. `CURRENT_STATUS.md` は summary のみ、詳細経過は `REVIEW.md` へ残す。

## 実行順
### Phase A: volumetric の分割
- A1. renderer helper 分割（完了）
- A2. solver helper 分割（完了）
- A3. volumetric verify を帯域別に分割（完了）

### Phase B: rope の底上げ
- B1. knot / tangle grammar
- B2. tension / sag state
- B3. snap / bundle hierarchy

### Phase C: fracture の再開
- C1. sibling density layering
- C2. remesh refinement
- C3. crack generation history

### Phase D: granular の再開
- D1. force chain
- D2. arch / collapse front
- D3. layered constitutive shell

## 今回の実施
- A1 を開始し、`volumetric_density_transportRenderer.ts` の shared helper を `volumetric_density_transportRendererShared.ts` へ分割した。
- A2 として `volumetric_density_transportSolver.ts` を shared / obstacle / lighting / injector / derived / stats へ分割し、solver 本体を 1305 行から 446 行へ圧縮した。
- A3 として `verify-volumetric-density-transport-entry.ts` を core / obstacle-light / plume-injector / wake-volume へ分割し、entry 本体を 153 行から 18 行へ圧縮した。
- `futureNativeSceneRendererBridge.ts` は runtime control / rope payload / bridge types へ、`mpm_granularRenderer.ts` は helper 帯へ再編済み。次回は Phase B の枝追加へ戻る前に、`fracture_latticeRenderer.ts` と `volumetric_density_transportRenderer.ts` の helper 分離を優先する。
