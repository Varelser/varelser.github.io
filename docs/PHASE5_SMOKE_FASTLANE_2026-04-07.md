# Phase5 smoke fastlane (2026-04-07)

## 目的
- `verify:all:fast` とは別に、Phase 5 を smoke 経路で扱う lightweight runner を固定する。
- `verify:phase5` 本体を壊さず、CI/ローカルの軽量確認を分離する。

## 追加物
- `scripts/verify-phase5-smoke-entry.ts`
- `scripts/verify-phase5-smoke.mjs`
- `scripts/verify-suite-fast-smoke.mjs`
- `npm run verify:phase5:smoke`
- `npm run verify:all:fast:smoke`

## smoke 対象
1. fixture files synced
2. sparse serialization recovery
3. legacy migration rebuild
4. fixture file parsing fast
5. import inspection diagnostics

## 意図
roundtrip / duplicate recovery / orphan recovery / file IO は full `verify:phase5` 側に残し、
fixture 同期・schema migration・parse hardening・import 前段 diagnostics を短時間で確認する。
