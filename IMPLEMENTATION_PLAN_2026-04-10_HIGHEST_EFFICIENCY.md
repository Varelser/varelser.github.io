# Highest-Efficiency Implementation Plan (2026-04-10)

## Goal
- 工数が小さく、体感改善と handoff 改善が同時に伸びるものを優先して実装する。
- 「新 family を増やす」よりも、「既存 future-native を使いやすくし、specialist をそのまま packet/export に渡せる状態へ上げる」ことを先に行う。

## Selection Policy
1. 既存コードの再利用率が高い
2. UI と handoff の両方に効く
3. typecheck / unit / build まで短時間で確認できる
4. Intel Mac 実機依存や外部 proof を必要としない

## Execution List

### Phase A — future-native overview usability pass
- Status: implemented
- Why:
  - 22 family が揃っていても、一覧性と絞り込みが弱いと実運用で遅い。
  - 既存 catalog を使えば低リスクで検索 / exposure filter を追加できる。
- Tasks:
  - detailed family catalog に search を追加
  - exposure filter を追加
  - filtered count を追加
  - specialist rail も同じ検索条件で絞り込めるようにする
- Expected effect:
  - family 探索速度の改善
  - scene-bound / preset-only / specialist の切り分けが速くなる

### Phase B — specialist packet surface upgrade
- Status: implemented
- Why:
  - specialist 4 family は preview 表示まではあるが、UI からそのまま operator / adapter / comparison packet を取り出しにくい。
  - 既存の route snapshot / metadata / export-import comparison を再利用すれば低工数で handoff 密度を上げられる。
- Tasks:
  - operator packet builder を追加
  - adapter packet builder を追加
  - comparison packet builder を追加
  - global future-native overview の specialist rail に copy action を追加
- Expected effect:
  - specialist 系の handoff が UI から即時取得可能
  - adapter 選択、handshake、roundtrip stability の確認が早くなる

### Phase C — verification and closeout
- Status: implemented
- Tasks:
  - typecheck
  - unit test 追加 + 実行
  - build 実行
- Acceptance:
  - typecheck pass
  - unit pass
  - build pass

### Phase D — Project IO specialist packet bridge
- Status: implemented
- Why:
  - overview 側だけでなく Project IO capability matrix 側からも specialist packet を取得できると、manifest/handoff と往復しやすい。
- Tasks:
  - Project IO capability matrix に specialist operator / adapter / comparison copy を追加
  - row wrapper を追加
- Expected effect:
  - Project IO から specialist handoff packet を直接取得可能

### Phase E — specialist route control direct-edit pass
- Status: implemented
- Why:
  - packet をコピーできても、selected adapter / target switch / override を UI から直接触れないと運用密度が上がり切らない。
  - 軽い UI state と manifest 同期で、保存・再読込を含めて改善できる。
- Tasks:
  - specialist 4 family の route control editor を Project IO に追加
  - auto/manual, adapter, target switch, override candidate, override disposition を直接編集可能化
  - project export / import / manifest hydration に specialist route control state を接続
  - control packet builder と unit test を追加
- Expected effect:
  - specialist route 設計を UI 上で即時編集可能
  - export/import 後も route control が残る
  - copy control / adapter / compare の往復が速くなる

### Phase F — specialist current control diff visibility
- Status: implemented
- Why:
  - specialist route controls を直接編集できても、capability matrix 側で default との差分が見えないと現在値の意味が追いにくい。
- Tasks:
  - default-aligned との差分抽出 helper を追加
  - Specialist route controls card に current control diff badge を追加
  - capability matrix の specialist row に current control diff badge を追加
  - unit / typecheck / build で固定
- Expected effect:
  - 既定経路から何を変えたかが Project IO から即時に分かる
  - specialist compare / adapter packet を取る前の確認が速くなる

### Phase G — specialist manifest snapshot diff visibility
- Status: implemented
- Why:
  - default との差分だけでは、保存済み manifest snapshot と現在の route control がズレているかは分からない。
  - save/load 前後のズレを Project IO 上で見えるようにすると、handoff 前の確認が速い。
- Tasks:
  - manifest specialist route snapshot map を追加
  - current route と manifest route の control 値差分 helper を追加
  - Manifest snapshot セクションに specialist snapshot diff card を追加
  - unit / typecheck / build で固定
- Expected effect:
  - 保存済み snapshot と現在値の drift を即時確認可能
  - export 前に specialist route の未保存変更を見落としにくくなる

### Phase H — WebGPU capability surface pass
- Status: implemented
- Why:
  - WebGPU direct coverage 自体の昇格は runtime / target-host 依存が強く、repo 内で無理に広げると壊しやすい。
  - 先に current direct / limited / fallback-only を Project IO から見える化し、operator packet へそのまま落とせるようにする方が効率が高い。
- Tasks:
  - current WebGPU capability helper を追加
  - Project IO に WebGPU current execution surface section を追加
  - direct / limited / fallback-only filter と copy packet を追加
  - unit / typecheck / build で固定
- Expected effect:
  - repo 内で閉じている WebGPU 範囲と target-host blocker が即時に分かる
  - Intel Mac 実機 proof に進む前の operator packet が速く取れる

### Phase I — Intel Mac proof current surface pass
- Status: implemented
- Why:
  - Intel Mac 実機 proof 自体は外部依存だが、repo 内で current/drop/target の状態を operator/intake packet として即時取得できるようにする価値は高い。
  - 既存の current/status/operator packet の内容を UI surface に束ねるだけで、実機担当への handoff が速くなる。
- Tasks:
  - current Intel Mac proof helper を追加
  - Project IO に Intel Mac proof current surface section を追加
  - drop / target blocker filter と operator / intake copy を追加
  - unit / typecheck / build で固定
- Expected effect:
  - Intel Mac 実機担当へ operator packet と intake packet を UI から即時に渡せる
  - drop intake と target blocker の切り分けが速くなる

## Deferred Next Candidates
- WebGPU direct coverage を増やすための family 別 capability 昇格
- Intel Mac 実機 proof 固定

## Decision Log
- 2026-04-10: 今回は「新 solver 追加」ではなく「future-native の運用面の密度向上」を優先。
- 2026-04-10: specialist family は runtime 深掘りより先に packet/export surface を強化。
- 2026-04-10: 実機依存タスクは外し、現ホストで完結する範囲を優先。
- 2026-04-10: Project IO に specialist route control editor を追加し、packet 取得だけでなく route 自体を UI から編集可能にした。

- 2026-04-10: specialist current control diff を matrix / control card の両方で可視化し、default-aligned との差分を即時確認できるようにした。

- 2026-04-10: manifest snapshot セクションにも specialist route diff を追加し、default 差分だけでなく save-state drift も可視化した。

- 2026-04-10: WebGPU については direct coverage 自体を無理に広げず、まず Project IO から current capability と blocker を見える化して operator packet 化した。

- 2026-04-10: Intel Mac proof は実機依存のままだが、Project IO から current surface / blockers / prioritized actions を operator/intake packet として直接取得できるようにした。

### Phase J — distribution / proof bundle current surface
- 目的:
  - `full-local-dev / source-only-clean / proof-packet / proof-packet-verify-status / proof-packet-intel-mac-closeout / platform-specific-runtime-bundled` の current summary を Project IO から直接見て copy できるようにする。
- 実装:
  - `lib/projectDistributionProofBundleCurrent.ts` を追加し、bundle quick advice / command / archive pattern / bootstrap 要否を current report と packet builder に集約する。
  - `components/controlPanelProjectIOFutureNativeSection.tsx` に distribution / proof bundle current surface を追加し、resume / proof filter と Copy bundles を提供する。
  - unit test を追加し、proof filter と current packet を固定する。
- 完了条件:
  - Project IO から bundle の使い分けを見て、そのまま handoff packet をコピーできる。
  - typecheck / unit / build が通る。


### Phase K — distribution manifest snapshot drift pass
目的
- Manifest snapshot 上で distribution / proof bundle の保存状態と current summary のズレを見える化
- quick advice / bundle inventory / output dir の差を保存前後で即確認できるようにする

実装
- `ProjectManifest` に distribution / proof bundle summary snapshot を追加
- builder / normalizer / export-import に bundle summary snapshot を接続
- Project IO future-native section の Manifest snapshot に bundle drift card を追加
- unit test を追加


### Phase L — export handoff snapshot drift pass
目的
- Manifest snapshot 上で export / handoff current packet の保存状態との差を見える化
- routes / warnings / specialist drift / WebGPU / Intel Mac / bundle advice の current-vs-saved 差を 1 枚で確認できるようにする

実装
- `ProjectManifest` に export handoff summary snapshot を追加
- builder / normalizer に export handoff snapshot を接続
- Project IO future-native section の Manifest snapshot に export / handoff snapshot diff card を追加
- `Copy handoff` で current handoff packet をその場で取得できるように固定
- unit test を追加

### Phase N — Closeout current packet pass
- WebGPU / Intel Mac / distribution advice / export handoff を 1 本の closeout packet に集約
- Project IO future-native section に closeout current packet card を追加
- Copy closeout で current closeout packet を直接 handoff 可能化
- unit / typecheck / build まで通す
