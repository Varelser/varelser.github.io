# MEIKYOSHISUI

ブラウザで動くアンビエント／ドローン／サイケデリック向け生成 MIDI システム。
ビルドツール不要・外部依存ゼロで、`index.html` を開くだけで動作します。

*MEIKYOSHISUI — a browser-based generative MIDI system for ambient / drone music. No build step, no dependencies.*

## 起動方法

- ローカル: リポジトリを展開し、`index.html` をブラウザで開く
  （一部機能のため、簡易サーバ経由が確実です: `python3 -m http.server` など）
- 公開: GitHub Pages へのデプロイ手順は `GITHUB_PAGES_DEPLOY.md` を参照

## 主な機能

- レイヤー生成（Drone / Pad / Arp / Melody / Bass）＋ 20 種超の生成エンジン
  （篩理論、Boids、L システム、マルコフ、セル・オートマトン、Integral Serialism 他）
- 音楽理論の実装: 音階 73 種、純正律／古典調律群（Werckmeister III 等）、
  Scala (.scl/.kbm) インポート、適応型 JI、微分音
- Theory Pack: ティンティナブリ、フェイジング、イソリズム、シェパード・トーン、
  種対位法（第1〜5種＋カノン）、フーガ提示部、ソナタ形式、終止定型、
  クラーベ／ターラ、結合音、トータル・セリエリズム、クォータル 他
- コード進行: 定番 41 種のライブラリと予測変換式サジェスト
- 出力: MIDI（単体／ステム）、MusicXML、OSC、A/B バリアント比較
- 入力: WebMIDI（MIDI ラーン対応）、シード固定による再現生成
- UI: 階層ビュー（生成／レイヤー／実験室）、検索、マクロ、モダン／クラシック切替

## 構成

- `index.html` — 正式入口
- `js/00` 〜 `js/68` — 本体エンジンと初期化
- `js/69` 〜 `js/71` — UI 設定、Theory Pack、進行サジェスト
- `js/72` 〜 `js/83` — MIDI 捕捉、音律セクション、Scala、出力／OSC、エンジン UI、DOM 初期化、ホバーツールチップ、AI／VM 連携、DAW 連携、創作支援、描き出し、ショートカット／PWA
- `js/90` — PATCH コア（定数・ユーティリティ）。`js/91` / `js/92` は還元済みの経緯コメントのみ
- `docs/` — UI 計画、パッチ層対応表、理論監査、分散計画
- 詳細マニュアル: `MEIKYOSHISUI.md`／更新履歴: `UPDATE-2026-11-10.md`

## 創作・描き出し・PWA

おまかせ生成、生成ヒストリー、MIDI解析、WAV書き出し、バリエーション一括生成、
ピアノロール、キーボードショートカット、PWA（オフライン／インストール対応）。
詳細は `docs/FEATURES-2026-11-11.md` を参照してください。

## DAW 連携

仮想MIDIポート経由で主要 DAW へライブ送信（MIDIクロック同期つき）したり、
コードマーカー入りの MIDI を渡せます。DAW 別の手順は `docs/DAW.md` を参照してください。

## AI / VM 連携

AI API（OpenAI / Anthropic / Ollama / 互換）に進行とパラメータを相談したり、
VM 上のブリッジへ生成 MIDI を保存したり、状態を共有リンクで渡せます。
手順と設計は `docs/BRIDGE.md` を参照してください（ブリッジは `node scripts/vm-bridge.mjs`）。

## 検証

常設の自動検証が同梱されています（Node 18+ と Chromium 系ブラウザが必要）:

```
node scripts/verify_runtime.mjs
```

起動・生成・シード再現性・状態保存・MusicXML・UI を実ブラウザで確認し、
全項目合格で終了コード 0 を返します。

静的監査（CSS クラス衝突・読み込み順・Service Worker の整合）:

```
node scripts/audit_static.mjs
```

## リリース

配布物の作成は 1 コマンドに集約されています（版数の更新・検証・コミット・ZIP 作成を自動実行）:

```
node scripts/release.mjs            # --dry-run で検証のみ
```

## ライセンス

MIT License — `LICENSE` を参照してください。
生成された MIDI／音楽データの権利は利用者に帰属します。
