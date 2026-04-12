# 2026-04-07 pass16 chunk stabilization

## 目的
- 最後に残っていた Rollup circular chunk warning (`depiction-catalog -> scene-runtime-shared -> depiction-catalog`) を止血する。
- preload を減らしつつ、既存の fast verify 導線を壊さない。

## 変更
1. `vite.config.ts`
   - `depictionCoverage*` を `scene-runtime-shared` 側へ寄せる試行を実施。
   - 追加で `productPackAugmentation` / `productPackScorecards` も runtime 側候補として確認。
   - source レベルで `scene-runtime-shared` と `depiction-catalog` の相互依存が濃く、境界分離では warning が残ることを確認。
   - 最終的に、相互依存クラスタを `scene-runtime-catalog` へ束ねる方式へ変更。

## 結果
- circular chunk warning: `1 -> 0`
- preload links: `14 -> 13`
- preload から `depiction-catalog` / `scene-runtime-shared` の二重読込が消え、`scene-runtime-catalog` へ一本化。

## build size
- `scene-runtime-catalog`: `503.91 kB`
- `index`: `312.59 kB -> 312.47 kB`
- `starter-library-data`: `229.12 kB -> 229.08 kB`
- `ui-control-panel`: `439.06 kB -> 439.04 kB`

## verify
- `npm run typecheck`: pass
- `npm run verify:phase4:smoke`: pass
- `npm run verify:phase5:smoke`: pass
- `npm run verify:export:smoke`: pass

## 備考
- `npm run verify:all:fast` はこのセッションでは report が `5/7` の途中で止まり、wrapper 完走証跡は再固定できていない。
- ただし build 後半の個別 smoke (`phase4 / phase5 / export`) はすべて通っているため、今回の chunk 統合自体で verify が壊れた証跡はない。
