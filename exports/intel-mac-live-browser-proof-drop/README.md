# Intel Mac Live Browser Proof Drop

このフォルダは Intel Mac 実機で採取した browser proof を、repo 本体へ取り込む前の一時受け渡し用です。

## 同梱スクリプト
- `capture-on-intel-mac.sh` — Intel Mac 実機で pipeline / readiness を先に走らせる
- `stage-artifacts-on-intel-mac.sh` — real-export JSON / screenshots / logs を drop へ正規配置し、summary を captured 状態まで組み立てる
- `package-proof-bundle.sh` — drop 内容を bundle zip へ固める
- `finalize-on-host.sh` — host 側で bundle extract / finalize / doctor / status を 1 回で再生成する

## Intel Mac 実機での最短手順
1. このフォルダごと Intel Mac 実機へ渡す
2. Intel Mac 実機で pipeline / readiness を先に走らせる
   - `./capture-on-intel-mac.sh /path/to/repo <slug> /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome $PWD`
3. 実ブラウザ UI から project export を保存し、screenshots / logs のパスが揃ったら staging を実行
   - `./stage-artifacts-on-intel-mac.sh /path/to/repo $PWD --slug <slug> --browser-executable-path /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --real-export ~/Downloads/kalokagathia-project-<slug>.json --screenshot ~/Desktop/export-overview.png --log $PWD/phase5-proof-input/logs/pipeline.log`
4. 問題なければ bundle を作る
   - `./package-proof-bundle.sh $PWD <slug>`
5. host 側 repo に戻して 1 回で ingest + finalize
   - `./finalize-on-host.sh /path/to/repo exports/intel-mac-live-browser-proof-drop /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome`

## 必須成果物
- `real-export/kalokagathia-project-<slug>.json`
- `phase5-proof-input/real-export-proof.json`
- `phase5-proof-input/real-export-capture-notes.md`
- `phase5-proof-input/logs/<build|verify|console>.log`
- `phase5-proof-input/evidence-manifest.json`
- 任意だが推奨: `phase5-proof-input/screenshots/export-overview.png`

## bundle 代替
個別ファイルの代わりに、`incoming/kalokagathia-intel-mac-live-browser-proof-<slug>.zip` を 1 本置いて ingest できます。
