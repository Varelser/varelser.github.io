# Intel Mac Live Browser Proof Finalize (2026-04-06)

## 目的
- Intel Mac 実機で採取した browser proof を、drop 検査 -> ingest -> readiness 再生成 -> handoff doctor 更新まで一発で通す。
- 実機証跡の取り込み漏れや手順漏れを減らす。

## 追加コマンド
- `npm run verify:intel-mac-live-browser-proof-drop`
- `npm run finalize:intel-mac-live-browser-proof -- --browser-executable-path <actual path>`

## finalize が実行するもの
1. drop 先の事前検査
2. real-export fixture / proof input の ingest
3. Intel Mac target live browser readiness 再生成
4. package handoff doctor 再生成
5. `docs/archive/intel-mac-live-browser-proof-finalize.json` 出力

## 実行例
```bash
npm run scaffold:intel-mac-live-browser-proof-drop
npm run verify:intel-mac-live-browser-proof-drop
npm run finalize:intel-mac-live-browser-proof -- \
  --browser-executable-path "$HOME/Library/Caches/ms-playwright/chromium-1208/chrome-mac-x64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing"
```

## 完了条件
- drop check が **5 / 5 ok**
- target Intel Mac live browser readiness が **6 / 6 ok**
- `docs/archive/package-handoff-doctor.json` の Intel Mac live browser readiness が ready
