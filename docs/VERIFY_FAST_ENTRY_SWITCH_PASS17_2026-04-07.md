# VERIFY FAST ENTRY SWITCH PASS17

- Date: 2026-04-07
- Change: `npm run verify:all:fast` を `node scripts/verify-suite-fast-smoke.mjs` に切替。
- Reason: generic suite fast wrapper の停止揺れを避け、既存の stable fast-smoke lane を正式入口にするため。
- Result: fast verify の実運用入口は stable lane に一本化。
