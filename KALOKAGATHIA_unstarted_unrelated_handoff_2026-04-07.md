# Kalokagathia 未着手・無関係タスク切り出し

基準は `貼り付けたマークダウン（1）.md` の B.1〜B.6 未実装一覧です。

## 全体進捗
- 母数: 28項目
- 完了: 11
- 部分完了: 4
- 未着手: 13
- 加重進捗: 46.4%

## 他AIへ回してよい未着手・無関係リスト

以下 13 項目は、現在こちらで進めている audio legacy / route retirement / focused conflict / handoff snapshot 系と依存が薄く、並列で回して衝突しにくいです。

### 基盤 / 描画
1. WebGPU compute 実装
2. strict TypeScript 段階導入
3. Instanced mesh batching

### UI / UX
4. Undo / Redo
5. モバイル最適化
6. キーボードショートカット
7. アクセシビリティ (a11y)
8. ControlPanel の prop drilling 解消

### エクスポート
9. GIF エクスポート
10. SVG エクスポート
11. glTF / USD エクスポート
12. Preset library 共有

### DCC / 長期
13. DCC specialist export 実体

## こちらで継続している系統
- legacy slider retirement preview
- focused conflict inspector
- current / preset / keyframe 横断の retirement impact 可視化
- handoff 用 clipboard snapshot

## 今回追加したもの
- `Copy Retirement Impact`
- `Copy Handoff Snapshot`
- formatter / portable verify

## 備考
- `22 future-native families の scene 統合` は完全未着手ではありません。bridge 側の入口は既に patch 済みのため、他AIに投げるなら「部分着手案件」として扱う方が安全です。
- `ユニットテスト` も portable verify は導入済みなので、vitest 導入だけを切り出すなら「部分着手案件」です。
- `Legacy slider 完全退役` は未完ですが、今こちらで継続中のため切り出し対象から外しています。
