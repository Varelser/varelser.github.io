# Intel Mac Live Browser Proof Summary Schema

`exports/intel-mac-live-browser-proof-drop/phase5-proof-input/real-export-proof.json` は、単なるメモではなく structured proof summary として扱います。

## 必須方針
- `status` は `captured` であること
- `capture.hostPlatform` は `darwin`
- `capture.hostArch` は `x64`
- `capture.capturedAt` を埋めること
- `browser.name` と `browser.executablePath` を埋めること
- `artifacts.exports` / `artifacts.screenshots` / `artifacts.logs` を 1 件以上持つこと

## 目的
- drop 側で壊れた証跡を早期に落とす
- ingest 前に browser proof の最低構成を確認する
- status / doctor / blocker report が同じ情報源を見るようにする
