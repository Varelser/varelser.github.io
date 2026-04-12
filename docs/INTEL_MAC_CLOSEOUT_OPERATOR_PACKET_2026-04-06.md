# Intel Mac Closeout Operator Packet (2026-04-06)

## 現在位置
- portable / Linux 側の確認済み pass:
  - `verify:host-runtime`
  - `build`
  - `verify:project-state`
  - `verify:export`
  - `verify:phase4`
  - `verify:phase5`
- したがって、現時点の主残件は **Intel Mac 実機での target-host closeout と live browser proof** です。
- 現在の Intel Mac live-browser proof blocker 数は **11** です。
- 実機投入後に埋めるべき中心は次の 4 項目です。
  1. browser executable 実体
  2. real browser export JSON
  3. screenshots / structured logs
  4. finalize 後に生成される manifest / readiness report

## 実機で最初にやること
リポジトリ直下で次を実行します。

```bash
./RUN_TARGET_HOST_INTEL_MAC_CLOSEOUT.command
```

このコマンドは次をまとめて行います。
- optional native package 補充
- Playwright Chromium 導入
- Intel Mac runtime readiness 確認
- Intel Mac live browser readiness 確認
- `build`
- `verify:phase4`
- `verify:phase5`
- live browser verify
- Intel Mac live-browser proof pipeline
- package doctor 再生成

## そのあとに確認するファイル
closeout 実行後、次の 3 ファイルを確認します。

- `docs/archive/target-host-intel-mac-closeout.json`
- `docs/archive/target-host-intel-mac-closeout.md`
- `docs/archive/target-host-intel-mac-closeout-logs/vite-live-server.log`

期待値は次です。
- `build`: passed
- `verify-phase4`: passed
- `verify-phase5`: passed
- `verify-all-browser-live`: passed または blocker reason が明示されている
- `intel-mac-live-browser-proof-pipeline`: passed か、drop 欠損が明示されている

## 実機で最終的に揃えるべき drop
次のどちらかで構いません。
- `exports/intel-mac-live-browser-proof-drop/incoming/kalokagathia-intel-mac-live-browser-proof-<slug>.zip`
- または個別ファイル一式

個別ファイルで揃える場合の最低ラインは次です。
- `exports/intel-mac-live-browser-proof-drop/real-export/kalokagathia-project-<slug>.json`
- `exports/intel-mac-live-browser-proof-drop/phase5-proof-input/real-export-proof.json`
- `exports/intel-mac-live-browser-proof-drop/phase5-proof-input/real-export-capture-notes.md`
- `exports/intel-mac-live-browser-proof-drop/phase5-proof-input/screenshots/*.png`
- `exports/intel-mac-live-browser-proof-drop/phase5-proof-input/logs/*.log`

## 仕上げコマンド
real browser export JSON と証跡を入れたあと、次を実行します。

```bash
npm run verify:intel-mac-live-browser-proof-drop
npm run finalize:intel-mac-live-browser-proof
npm run doctor:intel-mac-live-browser-proof:refresh
npm run report:intel-mac-live-browser-proof-status
npm run report:intel-mac-live-browser-proof-blockers
npm run report:intel-mac-live-browser-proof-remediation
```

## 完了条件
完了とみなす条件は次です。
- `docs/archive/target-host-intel-mac-closeout.json` の主要 step が passed
- `docs/archive/intel-mac-live-browser-proof-status.json` の blocker 数が 0
- `fixtures/project-state/real-export/manifest.json` が存在
- `docs/archive/phase5-real-export-readiness-report.json` が存在
- `docs/archive/package-handoff-doctor.json` が refresh 済み

## 詰まったときの優先順位
1. browser executable path を確定する
2. `real-export` JSON を 1 本でも置く
3. `real-export-proof.json` を captured にする
4. screenshot と structured log を 1 本ずつ置く
5. finalize / doctor / report を再実行する
