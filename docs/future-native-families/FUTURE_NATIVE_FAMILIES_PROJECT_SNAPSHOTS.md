# Future Native Families Project Snapshots

Project export/import now has a dedicated future-native project snapshot report.

## Commands

```bash
npm run verify:future-native-project-snapshots
npm run emit:future-native-project-snapshots
```

## Output

- `tmp/future-native-project-snapshot-report/future-native-project-snapshot-report.json`
- `tmp/future-native-project-snapshot-report/future-native-project-snapshot-report.md`

## What it checks

- baseline shared integration verification passes
- project JSON scenarios keep all 7 integrated families (first wave + PBD surface starters)
- runtimeConfig / runtimeState / statsKeys are present for every family
- scenario-level totals stay above minimum coverage thresholds

- integrated set now covers `pbd-rope`, `mpm-granular`, `fracture-lattice`, `volumetric-density-transport`, `pbd-cloth`, `pbd-membrane`, `pbd-softbody`
