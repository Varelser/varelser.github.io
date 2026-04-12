# Future Native Families Progress Reports

## Added in this step

A shared progress/report layer now exists for the future native family scaffold.

### What it does

- Stores per-family progress estimates in code.
- Marks which families already have:
  - native starter runtime
  - dedicated verifier
  - integration-ready status
- Builds a combined report in JSON and Markdown.
- Bundles the AI handoff packet for every registered family into one report artifact.

### Command

```bash
npm run emit:future-native-report
```

### Output

The command writes these files:

- `docs/handoff/FUTURE_NATIVE_RELEASE_REPORT.md`
- `docs/handoff/archive/generated/future-native-release-report/future-native-release-report.json`
- `docs/handoff/archive/generated/future-native-release-report/future-native-release-report.md`

### Why this matters

This makes it easier for a later AI to:

- identify the most advanced families
- pick the next integration-ready candidate
- compare group averages
- avoid repeating scaffolding work
