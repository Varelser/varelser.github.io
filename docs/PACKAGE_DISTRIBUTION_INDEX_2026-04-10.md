# Distribution Index — 2026-04-10

## 目的
- distribution-set 内の各 bundle manifest を横断して、用途・サイズ・bootstrap 要否・推奨用途を 1 枚で確認できるようにする。
- quick advice の語彙を distribution index / proof manifest / package manifest / package docs で一致させる。

## 出力
- `.artifacts/distribution-index_<date>.json`
- `.artifacts/distribution-index_<date>.md`

## 生成経路
- `npm run package:distribution-index`
- `npm run package:distribution-set`
- `npm run package:distribution-set:proof-split`

## quick advice
- `full-local-dev`
  - audience: すぐにローカル開発を再開したい人
  - chooseThisWhen: 依存込みの完全な作業環境をそのまま引き継ぎたいとき
  - preferInstead: 軽量引き継ぎだけなら source-only-clean、検証結果だけなら proof-packet-verify-status
- `source-only-clean`
  - audience: 軽量なソース引き継ぎをしたい人
  - chooseThisWhen: 容量を抑えてコードと文書を渡したいとき
  - preferInstead: 即再開したいなら full-local-dev、検証だけ見たいなら proof-packet-verify-status
- `proof-packet-verify-status`
  - audience: verify / status / readiness の確認だけしたい人
  - chooseThisWhen: コード本体ではなく、現在の検証結果と状態文書を確認したいとき
  - preferInstead: Intel Mac 証跡が必要なら proof-packet-intel-mac-closeout、全体監査なら proof-packet
- `proof-packet-intel-mac-closeout`
  - audience: Intel Mac target-host closeout と live-browser proof の担当者
  - chooseThisWhen: Intel Mac 実機側の証跡確認と handoff だけを軽く渡したいとき
  - preferInstead: verify/status 全般を見るなら proof-packet-verify-status、全体監査なら proof-packet

## 補足
- proof-packet 系 bundle は `distribution-index_YYYY-MM-DD.json` と `distribution-index_YYYY-MM-DD.md` を同梱し、proof packet 単体からも bundle 横断 index を参照できます。
