# Kalokagathia 実装サマリー 2026-04-11 Export / Budget Pass

## 今回の実装

### 1. 書き出しアスペクト比プリセット追加（部分実装 → 強化）
- `exportAspectPreset` を追加
- 対応プリセット
  - `current`
  - `square`
  - `portrait-4-5`
  - `story-9-16`
  - `widescreen-16-9`
- Export タブとフッターの両方から切替可能
- manifest に `exportAspectPreset` を記録

### 2. 書き出し寸法の実出力反映を修正
- これまで `exportScale` はスクリーンショット以外では manifest 上のみで、動画 / PNG 連番の実寸へ十分反映されていなかった
- 今回の修正で:
  - **Screenshot**: renderer を一時リサイズして再描画し、実解像度で保存
  - **PNG frame ZIP**: export target canvas へミラーし、選択したアスペクト比 / 出力寸法で保存
  - **WebM**: export target canvas を録画対象にし、選択したアスペクト比 / 出力寸法で録画
- これにより「現在キャンバス比率固定」の状態を解消

### 3. パフォーマンス予算表示の強化（部分実装 → 強化）
- `getPerformanceBudgetEstimate()` を追加
- 新規表示項目
  - 推定 FPS レンジ
  - headroom
  - export risk
  - hotspots
- 表示先
  - Display タブの `Performance Budget`
  - 実行診断オーバーレイ

## 実装上の注意
- Screenshot は再描画ベースのため、`exportScale` が実質的に高解像度出力として効く
- WebM / PNG ZIP は live canvas のミラー方式のため、**出力寸法と比率は正しく反映**されるが、超高解像度向けの再シミュレーションではない
- つまり、今回の pass は「出力寸法整合」と「比率制御」の改善が主目的

## 検証
- `npm run typecheck` 通過
- `node ./node_modules/vite/bin/vite.js build --configLoader runner` 通過

## 進捗整理（md 15項目基準）
- 新規完了: 3 / 15
  - Undo / Redo
  - キーボードショートカット
  - プリセットサムネイル
- 既存実装確認: 1 / 15
  - リアルタイム性能表示
- 部分実装: 5 / 15
  - モバイル / タッチ対応
  - シーン録画 / ループ補助
  - カメラアニメーション補助
  - 解像度 / アスペクト書き出し補助
  - パフォーマンス予算表示
- 未着手: 6 / 15
  - Worker 移植
  - WebGPU compute 優先化
  - three-core トリム
  - 力学モデル追加
  - plugin 化
  - 数値テスト

## 有効対応率
- 完了 + 既存 + 部分 = 9 / 15 = 60.0%

## 次に効率が高い候補
1. WebM / PNG ZIP を live mirror ではなく export-only render path へ昇格
2. camera path の保存 / 再生を sequence と分離して追加
3. mobile-safe の自動適用条件と capability flag 制御を接続
4. Worker 化の前段として重い solver の計測フックを先に固定
