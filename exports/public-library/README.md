# PUBLIC_LIBRARY canonical source

## 目的
- private 側で export した library JSON の **repo 内 canonical source 置き場** を固定する。
- `npm run sync:public-library` を引数なしで使えるようにする。
- canonical source が無いときの bootstrap 手順も固定する。
- source export 側に provenance を埋める場合の reserved key を固定する。

## 固定パス
- `exports/public-library/latest-export.json`

## source provenance key
- reserved key: `_publicLibrarySourceMeta`
- このキーは **canonical source / private export JSON にだけ許可** する。
- `public-library.json` へ sync するときは **target 側へは書き出さない**。
- sync 時は `public-library.provenance.json` の `lastSync.sourceEmbeddedProvenance` へ転記する。

## commit policy
- canonical source 実データは **ignored-local-default** とする。
- つまり、`latest-export.json` は **通常は commit しない**。
- repo には **置き場・provenance・sync 導線だけを commit** する。
- bundled target の `public-library.json` は生成済み seed として repo に残す。

## 運用
1. private build から export した JSON をここへ置く。
2. provenance を埋めたい場合は `_publicLibrarySourceMeta` を付ける。
3. `npm run sync:public-library` を実行する。
4. `npm run verify:public-library` と `npm run inspect:public-library-source` で確認する。

## bootstrap
- canonical source が無いが、現在の bundled target を基準に作業を始めたい場合は:
  - `npm run bootstrap:public-library-source`
- これで `public-library.json` から `exports/public-library/latest-export.json` を作る。
- bootstrap で作られた canonical source には `_publicLibrarySourceMeta` が埋め込まれる。

## 注意
- `latest-export.json` 自体は repo に常時 commit する前提ではない。
- 正本位置だけ repo 内で固定し、実データは必要時に差し替える。
- 常時 commit 方針へ変えるなら、`.gitignore` と `public-library.provenance.json` を合わせて変更する。
