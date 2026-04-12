# Verify Leaf Suites 2026-04-10

## Purpose

`verify:all:*` の重い aggregate 実行を置き換えるのではなく、leaf verifier を直列実行しながら途中経過を JSON / Markdown / latest pointer へ書き出す実行経路を追加した。

## Added scripts

- `verify:all:leaf`
- `verify:all:leaf:resume`
- `verify:all:leaf:fast`
- `verify:all:leaf:fast:resume`
- `verify:all:leaf:core`
- `verify:all:leaf:core:resume`
- `verify:all:leaf:core:fast`
- `verify:all:leaf:core:fast:resume`
- `verify:all:leaf:browser`
- `verify:all:leaf:browser:resume`

## Output paths

出力先は `docs/archive/verification-leaf-suites/`。

各 suite は以下を残す。

- `<title>.json` : 実行中も更新される summary
- `<title>.md` : 人間が追いやすい Markdown summary
- `<title>-latest.json` : latest pointer

## Resume

`STEP_SUITE_RESUME=1` で、先頭から連続して pass している step を読み取り、次の未完 step から再開する。

## Notes

- 既存の `verify:all:*` は温存。
- `run-step-suite.mjs` は step ごとの `env` 注入、Markdown summary 出力、latest pointer 出力に対応。

## 2026-04-10 completion addendum

- `verify-suite-leaf-browser` is now complete: 9/9 pass.
- `verify-suite-leaf-core-fast` is now complete: 7/7 pass.
- `verify-suite-leaf-full-fast` is now fixed from completed leaf proofs: 16/16 pass.
- Browser leaf retained the expected sandbox limitation on `verify:public-ui` inline runtime (`inlineRuntimePassed: false`) while the verifier itself still passed.

- `verify-suite-leaf-core` is now complete: 8/8 pass.
- `verify-suite-leaf-full` is now complete: 17/17 pass.
- Core/full leaf summaries were assembled from completed leaf proofs plus the finalized `verify:phase4` / `verify:phase5` / `verify:export` evidence to avoid rerunning the long aggregate lane.
