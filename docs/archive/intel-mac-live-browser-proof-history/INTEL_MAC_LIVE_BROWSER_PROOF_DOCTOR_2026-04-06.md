# Intel Mac Live Browser Proof Doctor (2026-04-06)

## 目的

Intel Mac 実機で live browser proof を採取した後、または採取前の現状確認として、
次の状態を 1 つの JSON に集約する。

- drop 受け皿の状態
- target live browser readiness の状態
- ingest / finalize の実行有無
- package handoff doctor の effectiveStatus

## 追加 script

- `npm run doctor:intel-mac-live-browser-proof`
- `npm run doctor:intel-mac-live-browser-proof:refresh`

## 出力

- `docs/archive/intel-mac-live-browser-proof-doctor.json`

## 使い分け

### refresh なし
既存 archive を読むだけで、いま保存されている状態を集約する。

### refresh あり
次を先に再実行してから集約する。

- `verify-intel-mac-live-browser-proof-drop`
- `verify-target-live-browser-readiness`
- `doctor-package-handoff`

## 想定 next step

- fixture JSON が無い → Intel Mac 実機で real-export を 1 本採取
- browser executable が見つからない → `npx playwright install chromium`
- fixture はあるが manifest / readiness が無い → `npm run finalize:intel-mac-live-browser-proof`
