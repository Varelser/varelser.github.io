# PUBLIC_LIBRARY_PIPELINE

## 目的
- `public-library.json` を直接編集せず、生成・検証・読込の経路を明示する。
- canonical source の repo 内固定位置を決め、次の作業者が迷わないようにする。
- canonical source 実データの commit 方針も repo 内で読めるようにする。
- source export 側に provenance を埋める場合の reserved key と扱いを固定する。

## 固定位置
- bundled target: `public-library.json`
- canonical source: `exports/public-library/latest-export.json`
- provenance: `public-library.provenance.json`
- source embedded provenance key: `_publicLibrarySourceMeta`

## commit / provenance policy
- canonical source policy: `repo-relative`
- canonical source commit policy: `ignored-local-default`
- canonical source bootstrap policy: `bootstrap-from-bundled-target`
- source embedded provenance policy: `allowed-and-copied-to-last-sync`

## source export provenance
- `_publicLibrarySourceMeta` は **source JSON 専用** の reserved key。
- 許可場所:
  - `exports/public-library/latest-export.json`
  - ad hoc に渡す private export JSON
- 不許可場所:
  - `public-library.json`
- sync 時の扱い:
  1. source JSON に `_publicLibrarySourceMeta` があれば読む
  2. target の `public-library.json` には書かない
  3. `public-library.provenance.json` の `lastSync.sourceEmbeddedProvenance` に転記する

## 現在の経路
1. private 側で export した preset library JSON を `exports/public-library/latest-export.json` へ置く。
2. 必要なら source JSON に `_publicLibrarySourceMeta` を埋める。
3. `npm run sync:public-library` を実行する。
4. 正規化済みの出力が `public-library.json` に書かれる。
5. `public-library.provenance.json` に lastSync と source provenance 要約が記録される。
6. `npm run verify:public-library` で整形・整合性を確認する。
7. runtime 側では `lib/appStateLibrary.ts` が `public-library.json` を import する。
8. build 時は `vite.config.ts` が `public-library.json` を `starter-library-data` chunk に寄せる。

## canonical source が無い場合
- `npm run inspect:public-library-source` で状態確認する。
- canonical source を bundled target から起こしたい場合は:
  - `npm run bootstrap:public-library-source`
- private export を直接使うなら:
  - `npm run sync:public-library -- ./path/to/export.json`

## source meta の最低例
```json
{
  "version": 1,
  "exportedAt": "2026-04-01T00:00:00.000Z",
  "presets": [],
  "presetSequence": [],
  "_publicLibrarySourceMeta": {
    "version": 1,
    "sourceKind": "private-export",
    "exportOrigin": "private-build-export",
    "exportTool": "manual-export",
    "exportedAt": "2026-04-01T00:00:00.000Z",
    "notes": ["optional metadata for sync provenance"]
  }
}
```

## 関連ファイル
- `public-library.json`
- `public-library.provenance.json`
- `exports/public-library/README.md`
- `scripts/public-library-shared.mjs`
- `scripts/sync-public-library.mjs`
- `scripts/bootstrap-public-library-source.mjs`
- `scripts/verify-public-library.mjs`
- `scripts/inspect-public-library.mjs`
- `scripts/inspect-public-library-source.mjs`
- `lib/appStateLibrary.ts`
- `vite.config.ts`

## コマンド
- inspect bundled target:
  - `npm run inspect:public-library`
- inspect canonical source policy:
  - `npm run inspect:public-library-source`
- bootstrap canonical source from bundled target:
  - `npm run bootstrap:public-library-source`
- verify target:
  - `npm run verify:public-library`
- sync from canonical source:
  - `npm run sync:public-library`
- sync from ad hoc source:
  - `npm run sync:public-library -- ./exports/example.json`

## 運用ルール
- `public-library.json` は成果物として扱い、手編集しない。
- canonical source は `exports/public-library/latest-export.json` に固定する。
- canonical source 実データは通常 commit しない。
- source provenance を持たせたい場合は `_publicLibrarySourceMeta` を使う。
- schema 変更が必要な場合は、`scripts/public-library-shared.mjs` と `lib/appStateLibrary.ts` をセットで見る。
- 読込経路の変更が必要な場合は、`vite.config.ts` の `starter-library-data` chunk も確認する。
