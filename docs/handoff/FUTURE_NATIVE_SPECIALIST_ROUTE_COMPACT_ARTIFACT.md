# FUTURE_NATIVE_SPECIALIST_ROUTE_COMPACT_ARTIFACT

## 目的
- specialist 4 family の route 差分を handoff / release で短く追える compact artifact を出す。
- baseline warning rollup / manual override fixture diff / export-import roundtrip stable count を同じ出力へ揃える。

## 生成コマンド
- `npm run verify:future-native-specialist-routes`
- `npm run emit:future-native-specialist-compact-artifact`
- `npm run emit:future-native-specialist-handoff`

## 出力先
- `docs/handoff/SESSION_CHECKPOINT_2026-04-05.md`
- `docs/handoff/archive/FUTURE_NATIVE_SPECIALIST_ROUTE_WARNING_SUMMARY_2026-04-05.md`
- `docs/handoff/archive/generated/future-native-specialist-handoff/future-native-specialist-handoff.json`
- `docs/handoff/archive/generated/future-native-specialist-handoff/future-native-specialist-handoff.md`
- `docs/handoff/archive/generated/future-native-specialist-handoff/future-native-specialist-warning-trend-history.json`
- `docs/handoff/archive/generated/future-native-specialist-handoff/future-native-specialist-warning-trend-comparison.json`
- `docs/handoff/archive/generated/future-native-specialist-handoff/future-native-specialist-warning-trend-comparison.md`
- `docs/handoff/archive/FUTURE_NATIVE_SPECIALIST_ROUTE_WARNING_TREND_2026-04-05.md`
- `docs/handoff/archive/INDEX.md`
- `docs/handoff/FUTURE_NATIVE_RELEASE_CHECKLIST.md`

## 見る指標
- `baselineWarningRouteCount`
- `fixtureChangedRouteCount`
- `fixtureWarningRouteCount`
- `exportImportWarningRouteCount`
- `manifestRoundtripStableCount`
- `serializationRoundtripStableCount`
- `controlRoundtripStableCount`

## 判定の意味
- `fixtureChangedRouteCount = 4`
  - manual override fixture が 4 family すべてで差分を持つ。
- `fixtureWarningRouteCount = 4`
  - warning rollup が 4 family すべてで立つ。
- `manifestRoundtripStableCount = 4`
  - export/import 後も manifest route が崩れていない。
- `serializationRoundtripStableCount = 4`
  - serialization snapshot 側でも route surface が崩れていない。
- `controlRoundtripStableCount = 4`
  - UI の route control state が roundtrip 後も崩れていない。
