# Package Handoff Doctor — 2026-04-05

## 目的

配布物を受け取った側が、
- それが `full-local-dev` / `platform-specific-runtime-bundled` / `source-only` のどれか
- bootstrap が必要か
- 次に何を実行すべきか

を即座に判断できるようにする。

旧 `full` / `partial-full` / `source` manifest を受け取った場合でも、doctor は alias として読み取る。

## 追加したもの

- `scripts/doctor-package-handoff.mjs`
- `scripts/write-package-manifest.mjs`

## 使い方

### 現在の repo/report を診断

```bash
node scripts/doctor-package-handoff.mjs
```

### 特定 manifest を診断

```bash
node scripts/doctor-package-handoff.mjs --manifest .artifacts/kalokagathia_source-only_2026-04-06.manifest.json
```

### JSON 出力

```bash
node scripts/doctor-package-handoff.mjs --write docs/archive/package-handoff-doctor.json
```

## 現在の判定

- 現 repo: `platform-specific-runtime-bundled`
- source-only zip: `source-only`
- 推奨次コマンド: `npm run verify:package-integrity:strict`
- `skia-canvas` は optional-native dependency。strict package integrity の不足対象ではなく、export verification は host 上で `pngjs-harness` fallback を取れる。

## 意味

これは build 機能の追加ではなく、handoff の曖昧さを減らし、受け手が「何からやればいいか分からない」状態を防ぐための固定化である。
