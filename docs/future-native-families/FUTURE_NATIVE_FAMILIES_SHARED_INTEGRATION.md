# Future Native Families Shared Integration

## Added

- `lib/future-native-families/futureNativeFamiliesIntegration.ts`
- `scripts/verify-future-native-integration.mjs`
- `scripts/emit-future-native-integration.mjs`

## Purpose

Unify the first-wave native starters behind one shared integration layer so later AI can inspect progress, UI coverage, serialization keys, and runtime snapshot shape without re-reading the conversation.

## Verifiers

- `npm run verify:future-native-integration`
- `npm run emit:future-native-integration`

## Guarantees

- first-wave family count is fixed at 4
- each family yields a serializer block, UI sections, runtime stats, and scalar samples
- JSON and Markdown integration reports can be emitted under `tmp/future-native-integration-report/`
- the shared summary exposes average progress, total UI controls, and top-progress family
