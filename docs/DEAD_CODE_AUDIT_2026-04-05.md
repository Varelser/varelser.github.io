# Dead Code Audit 2026-04-05

## 目的
- dead code の検出を手作業ではなく再実行可能な形へ固定する。
- path alias (`@/`) と Vite worker query (`?worker`) を含む参照を解決し、誤検知を減らす。

## 追加
- `scripts/verify-dead-code.mjs`
- `npm run verify:dead-code`
- `docs/archive/dead-code-report.json`

## 今回の整理
- `components/useAudioRouteEditor.ts` を削除。
  - `useAudioRouteEditorCore` 導入後に参照がなく、旧 monolithic hook が残っていた。
- `components/sceneVolumeFogSystemShared.ts` を削除。
  - barrel re-export のみで、runtime / render 側は個別モジュール参照へ移行済み。
- `op_candidates.ts` を削除。
  - package script や runtime から参照されない ad-hoc utility だった。

## 検査結果
- orphan modules: 14
- application candidates: 0
- scripts 系 orphan は `package.json` script root 以外の単発 utility を含むため、即削除対象にはせず report 監視に残す。

## 注意
- この監査は import/export ベースの静的検査であり、文字列評価や外部ツールからの直接起動までは保証しない。
- そのため削除判断は report 単独ではなく、package script / Vite alias / worker query を加味して行う。
