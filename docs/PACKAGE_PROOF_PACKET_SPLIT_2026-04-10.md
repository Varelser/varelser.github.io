# Package Proof Packet Split — 2026-04-10

## 目的
- `proof-packet` を用途別に細分化し、必要な証跡だけを軽量に受け渡せるようにする。
- 既存の `proof-packet` は維持しつつ、`verify/status` と `Intel Mac closeout` を個別 bundle として追加する。
- quick advice の語彙は distribution index / proof manifest / package manifest と共通化する。

## bundle 定義
- `proof-packet`
  - 従来どおりの統合証跡 bundle
- `proof-packet-verify-status`
  - `CURRENT_STATUS` / `VERIFY_STATUS` / verify leaf suite / package / readiness / repo status を同梱
  - Intel Mac closeout 証跡は含まない
- `proof-packet-intel-mac-closeout`
  - Intel Mac target-host closeout / live-browser proof / readiness / closeout operator packet を同梱
  - verify/status 全体は含まない

## quick advice
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
- `npm run package:proof-packet`
- `npm run package:proof-packet:verify-status`
- `npm run package:proof-packet:intel-mac-closeout`
- `npm run package:proof-packet:split`

## 出力先
- `.artifacts/`
  - `*_proof-packet_YYYY-MM-DD.zip`
  - `*_proof-packet-verify-status_YYYY-MM-DD.zip`
  - `*_proof-packet-intel-mac-closeout_YYYY-MM-DD.zip`
  - `proof-packet-split_YYYY-MM-DD.json`
  - `proof-packet-split_YYYY-MM-DD.md`

## 運用メモ
- 監査・全体判断は `proof-packet` を使う。
- verify / status 共有だけなら `proof-packet-verify-status` を使う。
- Intel Mac 実機 closeout の採取・引き継ぎだけなら `proof-packet-intel-mac-closeout` を使う。
