# Naming / Archive Cleanup Report — 2026-04-01

## 実施内容

- ソフトウェアの現行名を **Kalokagathia** に統一
- project export format / file name / storage key の現行値を `kalokagathia-*` 系へ更新
- import / localStorage 読み込みでは `monosphere-*` 系 legacy 値も継続受理
- root 文書の製品名表記を Kalokagathia に修正
- 配布 zip のルートフォルダ名を `kalokagathia/` に変更
- archive から旧 `verify_export` と一時 `tmp-build` / `tmp-typecheck` を除去

## 互換ポリシー

- **新規保存 / 新規 export** は `kalokagathia-*` を使用
- **既存 import / 既存 localStorage** は `monosphere-*` も読めるよう維持
- `docs/archive/` の履歴文書は原則保存し、現在判断を誤らせる失敗ログのみ除去
