# Future-Native Source-Only Rehydration Report

- generatedAt: 2026-04-08T12:13:51.089Z
- mode: workspace-packaged-source-only-baseline
- sourceOnlyZip: docs/handoff/archive/generated/future-native-source-only-package/future-native-source-only.zip
- sourceOnlyZipSha256: 115dfcb9d964793edb7ac42a22eb005c0a3526d6831ff31ae118267d272ba8a7
- excludedEntriesAbsent: node_modules, dist, tmp
- packageLockRegistryHosts: registry.npmjs.org
- packageLockUsesPublicRegistryOnly: true
- overallOk: true

## Planned commands
| Step | OK | Command |
| --- | --- | --- |
| bootstrap | pending | `npm ci --no-audit --no-fund` |
| emit:future-native-artifact-suite | pending | `npm run emit:future-native-artifact-suite` |
| verify:future-native-artifact-suite | pending | `npm run verify:future-native-artifact-suite` |

## Notes
- Baseline source-only packaging report. It confirms archive integrity, excluded directories, and lockfile registry normalization. Clean-host bootstrap/verify execution should overwrite this report with isolated-run results.
