# Intel Mac Proof Final Execution Card — 2026-04-09

## 現在位置
- Phase A truth sync: 100%
- Phase B future-native product化: 92%
- Phase C Intel Mac proof固定: 80%
- Phase D UX closeout: 85%
- Phase E 重い基盤改修: 74%
- 全体: 約99.0%

## 現在の自動判定
- verdict: ready-for-real-capture
- 意味: 実機採取前の準備は完了。残る本体は Intel Mac 実機での証跡採取のみ。

## ここからの最短手順

### Intel Mac 側
1. `exports/intel-mac-live-browser-proof-drop-transfer.zip` を Intel Mac に渡す
2. 展開する
3. `RUN_CAPTURE_ON_INTEL_MAC.command` を実行
4. 必要なら `RUN_PACKAGE_BUNDLE_ON_INTEL_MAC.command` を実行
5. 生成された以下を host 側へ戻す
   - `real-export/*.json`
   - `phase5-proof-input/logs/*`
   - `phase5-proof-input/screenshots/*`
   - bundle zip

### Host 側
1. 戻したファイルを `exports/intel-mac-live-browser-proof-drop/incoming/` に置く
2. `RUN_INCOMING_ONE_SHOT_ON_HOST.command` を実行
3. 生成物を確認する
   - `docs/archive/intel-mac-live-browser-proof-readiness-audit.md`
   - `docs/archive/intel-mac-live-browser-proof-closeout-verdict.md`
   - `docs/archive/intel-mac-live-browser-proof-status.md`
   - `docs/archive/intel-mac-live-browser-proof-remediation.md`

## 完了条件
以下を満たしたら Phase C を close 扱いにしてよい
- closeout verdict が `closeout-complete`
- real-export fixture が valid
- `real-export-proof.json` が captured
- artifact path が実在
- structured proof log が実在
- target browser executable 実在確認が通る

## 実行コマンド
- host 再生成一式:
  - `npm run run:intel-mac-live-browser-proof:refresh-all`
- host 取り込み一発:
  - `npm run run:intel-mac-live-browser-proof:incoming-one-shot`

## 注意
- 現時点でこちらから Intel Mac 実機ブラウザを操作して証跡採取することはできない
- したがって、残タスクの中心は「実機採取」そのもの
- 実機採取後は host 側で one-shot 取り込みを回せば、判定まで自動化されている
