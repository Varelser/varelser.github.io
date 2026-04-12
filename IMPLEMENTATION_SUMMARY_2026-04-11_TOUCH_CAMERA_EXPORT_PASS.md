# Kalokagathia 実装サマリー 2026-04-11 Touch / Camera / Export Pass

## 今回の実装

### 1. モバイル / タッチ補助の強化（部分実装）
- タッチ viewport 検出時に `Touch Viewport Assist` セクションを表示
- `Mobile Safe Mode` ボタンを追加
- coarse pointer / 狭幅 viewport を想定した軽量 runtime 設定をワンクリック適用
- `Restore Balanced` で通常運用に戻せる導線を追加

### 2. カメラアニメーション補助（部分実装）
- `Camera Motion Presets` を追加
- 追加プリセット
  - `Locked Studio`
  - `Slow Orbit`
  - `Dolly Pulse`
  - `Beat Drift`
- 既存の cameraControl / rotation / impulse 系パラメータを束ねて即時適用

### 3. 書き出しループ補助（部分実装）
- `Capture Helpers` セクションを追加
- 追加操作
  - 3 / 6 / 12 sec の長さプリセット
  - 24 fps への即時切り替え
  - `Use 1-pass Sequence Loop`
  - `Current = Pass Length`
- シーケンス 1 周の長さに合わせた書き出しを設定しやすくした

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
- 部分実装: 3 / 15
  - モバイル / タッチ対応
  - シーン録画 / ループ補助
  - カメラアニメーション補助
- 未着手: 8 / 15
  - Worker 移植
  - WebGPU compute 優先化
  - three-core トリム
  - 力学モデル追加
  - plugin 化
  - 数値テスト
  - docs 整理
  - MIDI / OSC 強化

## 有効対応率
- 完了 + 既存 + 部分 = 7 / 15 = 46.7%

## 次に効率が高い候補
1. GIF export の代わりにまず animated image export か GIF encoder を追加
2. camera path を独立状態として保存 / 再生可能にする
3. mobile-safe を自動適用する opt-in トグルを追加
4. Worker 化の前段として export / sim の重い処理の profiler 記録を追加
