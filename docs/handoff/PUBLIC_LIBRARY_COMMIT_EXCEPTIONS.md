# PUBLIC_LIBRARY canonical source commit exceptions

## 目的
- `exports/public-library/latest-export.json` を通常は commit しない前提のまま、**例外的に commit してよい条件** を固定する。
- 次の作業者が「いつ ignore のままにするか / いつ commit してよいか」を迷わないようにする。

## 既定方針
- canonical source 実データは **ignored-local-default**。
- つまり通常は repo に commit しない。
- repo には bundled target (`public-library.json`) と provenance / pipeline / scripts だけを残す。

## commit を許可する例外条件
以下の **いずれか** を満たす場合のみ、`latest-export.json` を一時的に commit してよい。

1. **schema 変更のレビューが必要なとき**
   - `public-library-shared.mjs` の normalize / verify 仕様を変えた。
   - `lib/appStateLibrary.ts` の import 側仕様を変えた。
   - reviewer が canonical source 実例を同時に確認しないと差分を判断できない。

2. **bundled target 再生成の基準点を固定したいとき**
   - 大きい preset 再編や bulk rename を行った。
   - その時点の source-of-truth を repo 内に一時固定しないと、次の差分が追跡しにくい。

3. **障害解析で source provenance の実例が必要なとき**
   - `_publicLibrarySourceMeta` を含む source JSON を実例として残さないと、sync / provenance バグを再現できない。

## commit してはいけないケース
- 単に手元で export しただけ。
- bundled target に変化がない。
- provenance 追加だけが目的で、文書だけで十分説明できる。
- private 側の一時的な試験 export を残したいだけ。

## commit するときの条件
- commit は **短期** を前提にする。
- `public-library.provenance.json` の `lastSync` は試験値のまま残さない。
- PR / handoff / commit message のいずれかに、**なぜ例外 commit が必要か** を明記する。
- 作業が終わったら、通常運用へ戻す。

## 例外 commit 後に戻すこと
1. `latest-export.json` を削除または ignore 状態へ戻す。
2. `public-library.provenance.json` の試験値を掃除する。
3. `CURRENT_STATUS.md` に「例外 commit は終了し通常運用へ戻した」と残す。

## 判定に迷ったとき
- 迷ったら **commit しない** を既定とする。
- 先に bundled target / provenance / 文書だけで足りるかを確認する。
