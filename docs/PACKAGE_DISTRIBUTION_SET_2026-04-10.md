# Package Distribution Set — 2026-04-10

## 目的
- 配布用途を `full-local-dev` / `source-only-clean` / `proof-packet` に分離し、再開用・引き継ぎ用・証跡用を混ぜない。
- `package class` の判定と、実際に渡す bundle の用途を切り分ける。
- quick advice の語彙は `scripts/package-bundle-advice.mjs` を正本として統一する。

## bundle 定義
- `full-local-dev`
  - `node_modules` 同梱
  - 同一 host 系でそのまま作業再開する用途
- `source-only-clean`
  - `node_modules` 非同梱
  - clean host / AI handoff / 軽量受け渡し用途
- `proof-packet`
  - status / verify / readiness / closeout / Intel Mac proof まわりの証跡のみ
  - 実装再開用ではなく、監査・共有・判断材料用
- split proof bundles（追加）
  - `proof-packet-verify-status`: verify / status / readiness に限定した軽量 bundle
  - `proof-packet-intel-mac-closeout`: Intel Mac target-host closeout / live-browser proof に限定した軽量 bundle

## quick advice
- `full-local-dev`
  - audience: すぐにローカル開発を再開したい人
  - chooseThisWhen: 依存込みの完全な作業環境をそのまま引き継ぎたいとき
  - preferInstead: 軽量引き継ぎだけなら source-only-clean、検証結果だけなら proof-packet-verify-status
- `source-only-clean`
  - audience: 軽量なソース引き継ぎをしたい人
  - chooseThisWhen: 容量を抑えてコードと文書を渡したいとき
  - preferInstead: 即再開したいなら full-local-dev、検証だけ見たいなら proof-packet-verify-status
- `proof-packet`
  - audience: status / verify / closeout をまとめて見たい人
  - chooseThisWhen: どの bundle を取るべきか未確定で、まず全体像を見たいとき
  - preferInstead: verify/status だけ見たいなら proof-packet-verify-status、Intel Mac 証跡だけなら proof-packet-intel-mac-closeout
- `proof-packet-verify-status`
  - audience: verify / status / readiness の確認だけしたい人
  - chooseThisWhen: コード本体ではなく、現在の検証結果と状態文書を確認したいとき
  - preferInstead: Intel Mac 証跡が必要なら proof-packet-intel-mac-closeout、全体監査なら proof-packet
- `proof-packet-intel-mac-closeout`
  - audience: Intel Mac target-host closeout と live-browser proof の担当者
  - chooseThisWhen: Intel Mac 実機側の証跡確認と handoff だけを軽く渡したいとき
  - preferInstead: verify/status 全般を見るなら proof-packet-verify-status、全体監査なら proof-packet

## 実行コマンド
- `npm run package:full-zip`
- `npm run package:source-only-clean`
- `npm run package:proof-packet`
- `npm run package:proof-packet:verify-status`
- `npm run package:proof-packet:intel-mac-closeout`
- `npm run package:proof-packet:split`
- `npm run package:distribution-set`

## 出力先
- bundle stamp は `Asia/Tokyo` 基準で固定。
- `.artifacts/`
  - `*_full-local-dev_YYYY-MM-DD.zip`
  - `*_source-only_YYYY-MM-DD.zip`
  - `*_proof-packet_YYYY-MM-DD.zip`
  - `distribution-set_YYYY-MM-DD.json`
  - `distribution-set_YYYY-MM-DD.md`

## 運用メモ
- `proof-packet` と split proof bundles は source code / node_modules を含まない。
- 実装作業へ戻るときは `full-local-dev` または `source-only-clean` を使う。
- package class の canonical 判定は従来どおり `full-local-dev / platform-specific-runtime-bundled / source-only` を維持し、`proof-packet` は distribution bundle として扱う。
