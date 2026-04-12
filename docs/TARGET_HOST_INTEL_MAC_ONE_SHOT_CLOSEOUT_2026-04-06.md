# Target Host Intel Mac One-shot Closeout (2026-04-06)

## 目的
- Intel Mac 実機で `build` / `verify:phase4` / `verify:phase5` / live browser verify を**一括実行**し、結果を repo 内へ残す。
- 途中で何が pass / fail / blocked だったかを `docs/archive/target-host-intel-mac-closeout.{json,md}` に固定する。

## 追加したもの
- `scripts/run-target-host-intel-mac-closeout.mjs`
- `RUN_TARGET_HOST_INTEL_MAC_CLOSEOUT.command`
- `package.json`
  - `run:target-host:intel-mac:closeout`
  - `run:target-host:intel-mac:closeout:refresh`

## このランナーが行うこと
1. 必要なら `npm install --include=optional`
2. 必要なら `npx playwright install chromium`
3. `inspect:intel-mac-runtime`
4. `inspect:intel-mac-live-browser-readiness`
5. `build`
6. `verify:phase4`
7. `verify:phase5`
8. Vite dev server 起動
9. browser verify 9 本を `VERIFY_RUNTIME_MODE=live` で実行
10. Intel Mac live-browser proof pipeline 実行
11. `doctor-package-handoff` 再生成

## 実行方法
### Finder / Terminal どちらでもよい
```bash
./RUN_TARGET_HOST_INTEL_MAC_CLOSEOUT.command
```

### npm script から実行する場合
```bash
npm run run:target-host:intel-mac:closeout:refresh
```

## 出力
- `docs/archive/target-host-intel-mac-closeout.json`
- `docs/archive/target-host-intel-mac-closeout.md`
- `docs/archive/target-host-intel-mac-closeout-logs/vite-live-server.log`

## 重要
- このランナーは **Intel Mac 実機** を対象とする。
- Linux sandbox では real execution を証明しない。こちらでは `--dry-run` か `--allow-non-target-host` で構文確認だけ行う。
