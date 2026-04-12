# Packaging Integrity — 2026-04-05

## 目的

`full-local-dev` zip / `platform-specific-runtime-bundled` zip / `source-only` zip を出すたびに、
- zip 自体が壊れていないか
- root files と critical node_modules が揃っているか
- incomplete な配布物を complete 扱いで出していないか

を機械検査できるようにする。

## 追加・更新したもの

- `scripts/verify-package-integrity.mjs`
  - repo 現物の root files / critical node_modules を確認
  - zip 指定時は `unzip -t` と entry 走査で構造確認
  - `--strict` 指定で欠損時に fail
- `scripts/package-full-zip.mjs`
  - packaging 前に repo integrity を確認
  - critical 欠損がある場合は通常 package を停止
  - `--allow-partial` 指定時のみ `platform-specific-runtime-bundled` を生成
  - `.artifacts/*.manifest.json` と `docs/archive/package-integrity-report.json` を更新
- `scripts/package-source-zip.sh`
  - source-only zip と source-only manifest を同時生成
- `scripts/doctor-package-handoff.mjs`
  - 現在の report / manifest から package class と recovery plan を提示
- `scripts/write-package-manifest.mjs`
  - canonical package class で manifest を共通形式出力し、旧 alias も読み取り互換で扱う

## package class

- `full-local-dev`
  - critical 欠損なし
  - 通常の local-dev complete zip
- `platform-specific-runtime-bundled`
  - zip 構造は正常だが、critical node_modules が欠ける、または host 依存 runtime を含みうる
  - `--allow-partial` 指定時のみ生成
- `source-only`
  - node_modules を含まない source-only 配布

## 現時点で検出される critical 欠損

- `skia-canvas` は optional-native dependency として扱う。strict package integrity の必須集合からは外し、native path が無い host では export verifier が `pngjs-harness` fallback を使う。
- 受領 zip ごとに欠損集合は変わりうるため、最終判断は `docs/archive/package-integrity-report.json` を正本とする

このため、現行受領物だけを前提にすると `npm run typecheck` / Vite build の完全再現性は保証できない。

## 運用

### レポートだけ更新

```bash
node scripts/verify-package-integrity.mjs --write docs/archive/package-integrity-report.json
```

### strict check

```bash
node scripts/verify-package-integrity.mjs --strict
```

### full-local-dev のみ許可する zip

```bash
node scripts/package-full-zip.mjs
```

### incomplete を明示した platform-specific-runtime-bundled zip

```bash
node scripts/package-full-zip.mjs --allow-partial
```

### source-only zip

```bash
bash scripts/package-source-zip.sh
```

## 今回の確認結果

- `node scripts/package-full-zip.mjs` は exit 2 で停止
- `node scripts/package-full-zip.mjs --allow-partial` は成功
- `bash scripts/package-source-zip.sh` は成功
- `platform-specific-runtime-bundled` manifest には missing critical deps が明示される

## 位置づけ

これは機能追加ではなく、配布物の class と不完全性を隠さず固定するための release safety である。

## manifest の新仕様

manifest には以下を固定で持たせる。

- `packageClass`
- `packageClassAliases`
- `packageClassDescription`
- `repoSummary`
- `zipSummary`
- `recoveryPlan.requiresBootstrap`
- `recoveryPlan.recommendedNextCommand`

これにより、受け手は zip 名だけでなく manifest を見ても次の行動を判断できる。

## doctor

```bash
node scripts/doctor-package-handoff.mjs
```

manifest を明示する場合:

```bash
node scripts/doctor-package-handoff.mjs --manifest .artifacts/kalokagathia_platform-specific-runtime-bundled_2026-04-06.manifest.json
```

- 2026-04-05 追記: source packaging でも manifest 直前に report を再採取するよう修正し、stale report を拾わないようにした。
- 2026-04-06 追記: canonical 名は `source-only` / `full-local-dev` / `platform-specific-runtime-bundled` に固定し、旧 `source` / `full` / `partial-full` は alias 読み取りのみ維持する。
