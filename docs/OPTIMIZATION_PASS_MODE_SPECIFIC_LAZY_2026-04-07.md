# Optimization Pass: Mode-specific Lazy Imports (2026-04-07)

- `components/AppModeGate.tsx`: `StandaloneSynthWindow` を `React.lazy` 化し、通常 app boot から切り離した。
- `index.tsx`: `AppInlineVerify` を static import から外し、`VITE_VERIFY_INLINE=1` のときだけ dynamic import するように変更した。
- 目的: 通常起動時に mode-specific / verify-only UI を先読みしないようにする。
