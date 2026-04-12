# IMPLEMENTATION SUMMARY — 2026-04-11 — CAMERA PATH EXPORT QUEUE PASS

## Scope
- camera path を current-mode export に接続
- export queue job に camera path snapshot を保持
- queue UI に camera path job 情報を表示
- camera path duration を current export duration へコピーする操作を追加

## Implemented
1. Current-mode WebM / PNG / GIF export 時に、camera path export が有効で 2 slot 以上ある場合、camera slots を export duration に合わせて自動再生
2. Export queue job が camera path enable state と slot snapshot を保持
3. Queue 実行時に、job snapshot に含まれる camera path を使って export を再生
4. Camera Path UI に `Path Export: On/Off` と `Copy Path → Export` を追加
5. Export queue card に `camera path N slots` 表示を追加
6. exportBatchQueue unit test を更新して通過確認

## Verification
- npm run typecheck
- npm run build
- npm run test:unit:match -- exportBatchQueue

## Notes
- camera path export は `videoExportMode === "current"` の時だけ有効
- sequence export では既存の preset sequence playback を優先
- export duration と camera path duration は独立。必要なら `Copy Path → Export` で同期可能
- queue job は camera path の pose snapshot を保持するため、後から UI 上の slot を変えても queued job は当時の状態で再生される
