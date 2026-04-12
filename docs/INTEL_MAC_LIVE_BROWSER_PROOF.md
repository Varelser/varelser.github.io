# Intel Mac live-browser proof

## 目的
Intel Mac 実機で取得した live-browser 証跡を、repo に安全に取り込み、readiness / doctor / handoff を再生成するための単一導線です。

## 現在値
- Intel Mac target runtime readiness: 2 / 2 = 100.00%
- Intel Mac target live browser readiness: 2 / 6 = 33.33%
- Intel Mac live-proof drop check: 4 / 11 = 36.36%
- mainline runtime migration: 6 / 6 = 100.00%
- large implementation files unresolved: 0 / 0 = 100.00%

## 実機で必要な証跡
1. `exports/intel-mac-live-browser-proof-drop/incoming/kalokagathia-intel-mac-live-browser-proof-<slug>.zip`
   または個別 drop:
2. `exports/intel-mac-live-browser-proof-drop/real-export/kalokagathia-project-<slug>.json`
3. `exports/intel-mac-live-browser-proof-drop/phase5-proof-input/screenshots/*`
4. `exports/intel-mac-live-browser-proof-drop/phase5-proof-input/logs/*`
5. `exports/intel-mac-live-browser-proof-drop/phase5-proof-input/real-export-capture-notes.md`
6. `exports/intel-mac-live-browser-proof-drop/phase5-proof-input/real-export-proof.json`

## 実行順
### 一発実行
```bash
npm run run:intel-mac-live-browser-proof-pipeline
```

### 手動で分ける場合
```bash
npm run scaffold:intel-mac-live-browser-proof-drop
npm run draft:intel-mac-live-browser-proof-summary
npm run verify:intel-mac-live-browser-proof-bundle
npm run verify:intel-mac-live-browser-proof-drop
npm run finalize:intel-mac-live-browser-proof
npm run doctor:intel-mac-live-browser-proof:refresh
```

## 生成される主ファイル
- `docs/archive/intel-mac-live-browser-proof-doctor.json`
- `docs/archive/intel-mac-live-browser-proof-status.json`
- `docs/archive/intel-mac-live-browser-proof-remediation.json`
- `docs/archive/intel-mac-live-browser-proof-blockers.json`
- `docs/archive/target-live-browser-readiness-intel-mac.json`
- `docs/archive/package-handoff-doctor.json`

## 現在の blocker
- incoming bundle または valid real-export fixture JSON が未投入
- browser executable 実体が未確認
- structured proof artifact が未投入
- manifest / readiness report は actual ingest 後に再生成される

## 補足
日付付きの途中経過文書は `docs/archive/intel-mac-live-browser-proof-history/` へ退避済みです。
