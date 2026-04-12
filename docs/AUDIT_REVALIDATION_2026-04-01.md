# AUDIT_REVALIDATION_2026-04-01

最終更新: 2026-04-01
対象: `kalokagathia_merged_suite_named_cleaned_2026-04-01.zip`

## 目的

この文書は、配布 ZIP の現物再検証結果を、後続 AI / 作業者向けに短く固定するための監査メモです。
文書上の主張だけでなく、実際に実行したコマンド結果を基準に記載します。

## 結論

- `typecheck` は通過
- `build` は通過
- `verify-project-state` は通過
- `verify-export` は通過
- `verify-phase5` は通過
- browser 系 verifier は、この監査実行環境ではプロセス待機層が不安定なため、ここでは未固定

したがって、この ZIP は**少なくとも core 帯域では再現可能**です。
以前の「build が再現しない」評価は、この監査で**訂正**します。

## 実行コマンドと結果

### 1. TypeScript

実行:

```bash
node ./node_modules/typescript/lib/_tsc.js --noEmit
```

結果:

- exit code: `0`
- 型エラー再現なし

### 2. Build

実行:

```bash
node ./node_modules/vite/bin/vite.js build --debug
```

結果:

- exit code: `0`
- `2593 modules transformed`
- `✓ built in 13.25s`
- `dist/` 再生成を確認

主要 chunk:

- `assets/three-core-CqZRyaZy.js` — 675.03 kB
- `assets/index-BPc3enfS.js` — 570.07 kB
- `assets/scene-families-BSzYgA3w.js` — 370.54 kB
- `assets/depiction-catalog-Di5fLqEZ.js` — 369.42 kB
- `assets/particleDataWorker-HbHBfwD5.js` — 380.37 kB

### 3. Project state

実行:

```bash
node scripts/verify-project-state.mjs
```

結果:

- exit code: `0`
- verified scenario count: `3`
- 確認済み scenario:
  - `baseline`
  - `hybrid-video`
  - `text-fiber-webgpu`

### 4. Export

実行:

```bash
node scripts/verify-export.mjs
```

結果:

- exit code: `0`
- mode: `pngjs-harness`
- verdict:
  - `opaqueIsSolid: true`
  - `hasTransparentBackground: true`
  - `passed: true`

補足:

- Playwright の `http://127.0.0.1:*` は監査環境側で `ERR_BLOCKED_BY_ADMINISTRATOR`
- `file://` 直開きも環境依存で abort
- `skia-canvas` は native binding 未解決
- ただし最終 verdict 自体は `passed: true`

### 5. Phase 5

実行:

```bash
node scripts/verify-phase5.mjs
```

結果:

- exit code: `0`
- verified scenario count: `11`
- 主要確認点:
  - sparse serialization recovery
  - legacy migration rebuild
  - duplicate import recovery
  - orphan sequence recovery
  - roundtrip stability

## 現時点で残る注意点

### 1. browser 系 verifier の完全固定は未確認

`verify-public-ui` などの browser 系は、この監査コンテナ側で待機層が不安定でした。
そのため、**未通過ではなく、この監査環境では安定取得できなかった**という扱いにします。
ローカル実機または通常 shell での再実行で固定するのが安全です。

### 2. まだ大きいファイルが残っています

非 `node_modules` / 非 `dist` で特に大きいもの:

- `components/controlPanelTabsAudio.tsx` — 5297行 / 208.8KB
- `CURRENT_STATUS.md` — 1018行 / 63.0KB
- `public-library.json` — 1029行 / 33.0KB
- `lib/projectStateManifestNormalize.ts` — 239行 / 31.1KB
- `lib/audioReactiveValidation.ts` — 774行 / 27.6KB

最優先の分割候補は `components/controlPanelTabsAudio.tsx` です。
UI の責務集中が大きく、今後の差分衝突点になりやすい状態です。

## 次に進める優先順

1. `components/controlPanelTabsAudio.tsx` の責務分割
2. browser 系 verifier のローカル固定
3. `CURRENT_STATUS.md` と `REVIEW.md` に、この再検証結果を反映
4. 必要なら `verify:all:core` を通常 shell で再採取して suite レポートを更新

## 判断

この ZIP は「壊れている package」ではありません。
少なくとも core 帯域では、**実用再開できる状態**です。
次のボトルネックは build ではなく、**巨大 UI ファイルの分割と browser 帯域の固定**です。
