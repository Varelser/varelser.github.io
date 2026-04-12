# Future-Native Source-Only Distribution

## 目的
- 統合前追加パックを `source-only` で渡しても、受け取り側が `npm run bootstrap` 後に same-path verify / emit を再実行できる状態を保つ。
- OS 依存の `node_modules` 同梱や、古い `dist` を正本扱いしない。

## 同梱するもの
- `components/`
- `lib/`
- `scripts/`
- `docs/`
- `package.json`
- `package-lock.json`
- `tsconfig*.json`
- `vite.config.*`
- 必須の static asset / fixture / export source

## 同梱しないもの
- `node_modules/`
- `dist/`
- `tmp/`
- `.tmp-*`
- OS 固有の build cache / generated bundle

## 復旧手順
1. `npm run bootstrap`
2. `npm run doctor:tooling`
3. `npm run emit:future-native-artifact-suite`
4. `npm run verify:future-native-safe-pipeline:fast`
5. `npm run verify:future-native-safe-pipeline:full`
6. `npm run verify:future-native-artifact-suite`

## 実行メモ
- safe pipeline は `fast` / `full` に分割し、重い verifier の詰まり方は `npm run verify:future-native-safe-pipeline-breakdown` で確認する。
- specialist verifier / report / handoff / compact artifact は `scripts/run-ts-entry.mjs` 経由で動かし、`esbuild` 固有バイナリに直接依存しない。
- ただし `typescript` package 自体は必要なため、source-only 配布では `bootstrap` 実行を前提とする。
- `emit:future-native-specialist-compact-artifact` の既定出力先は `docs/handoff/archive/generated/future-native-specialist-compact-artifact/`。
- release / handoff の generated artifact は `docs/handoff/archive/generated/` 以下を正本とし、`tmp/` へは出さない。

## official archive path
- source-only manifest と generated artifact inventory の整合は `npm run verify:future-native-source-only-artifacts` を正本 verifier とする.
- zip: `docs/handoff/archive/generated/future-native-source-only-package/future-native-source-only.zip`
- manifest JSON: `docs/handoff/archive/generated/future-native-source-only-package/future-native-source-only-manifest.json`
- manifest Markdown: `docs/handoff/archive/generated/future-native-source-only-package/future-native-source-only-manifest.md`
- generated artifact inventory: `docs/handoff/archive/generated/future-native-release-report/future-native-generated-artifact-inventory.json` / `.md`

## clean-host 検証
- 2026-04-05 時点で、source-only zip を isolated directory へ新規展開し、`npm ci --no-audit --no-fund` を実行して依存を再構成できることを確認済み。
- 同じ isolated tree で `typecheck` / `inspect:project-health` / `verify:future-native-project-state-fast` / `verify:future-native-specialist-routes` / `verify:future-native-specialist-runtime-export-regression` / `package:future-native-source-only` / `emit:future-native-generated-artifact-inventory` / `verify:future-native-source-only-artifacts` を通過確認済み。
- 前提として `package-lock.json` の `resolved` URL は public npm registry (`registry.npmjs.org`) へ正規化済み。
- 記録: `docs/handoff/archive/generated/future-native-source-only-package/future-native-source-only-rehydration-report.md`

- suite 実行の途中経過と最終結果は `generated/future-native-suite-status/` の JSON summary（emit core / emit tail / emit suite を含む） を参照する。

- source-only manifest の critical path には `scripts/emit-future-native-suite-status-report.mjs` を含め、generated artifact inventory には suite status summary JSON/Markdown を含める。

- `emit:future-native-artifact-suite` は `emit:future-native-artifact-core` と `emit:future-native-artifact-tail` を段階 child-process で束ねる。

- `emit:future-native-family-previews` は `docs/handoff/archive/generated/future-native-specialist-handoff/future-native-specialist-family-previews.json` があればそれを再利用し、specialist preview の重複再計算を避ける。

- `emit:future-native-specialist-family-previews` は `docs/handoff/archive/generated/future-native-specialist-handoff/future-native-specialist-handoff.json` があれば route stability / warning 情報を再利用し、specialist preview の重複比較計算を避ける。

- `emit:future-native-artifact-suite` は `emit:future-native-suite-status-report` の後に `package:future-native-source-only` と `emit:future-native-generated-artifact-inventory` を再実行し、suite status summary を含んだ最新 source-only package / inventory を一発で揃える。
