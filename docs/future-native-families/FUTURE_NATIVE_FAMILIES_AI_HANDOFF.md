# Future Native Families AI Handoff

Use this file when another AI needs to continue implementation.

## Read order
1. `CURRENT_STATUS.md`
2. `UPGRADE_ROADMAP.md`
3. `docs/future-native-families/FUTURE_NATIVE_FAMILIES_MASTERPLAN.md`
4. `lib/future-native-families/futureNativeFamiliesRegistry.ts`
5. matching family stub file

## Hard rules
- Do not rename canonical family IDs once introduced.
- Add one solver family at a time.
- For each family, first extend schema and verification, then runtime.
- Keep execution capability metadata explicit: webgl / webgpu / export / mobile.
- Do not claim completion until runtime + serialization + verification all exist.

## Per-family order of work
1. add or refine the family spec in registry
2. add config block defaults
3. add serializer tokens and migration path
4. add runtime adapter stub or real solver
5. expose diagnostics / manifest
6. add at least one verification fixture
7. only then wire preset / UI surfaces

## Prompt template for a future AI
Implement the next family from `futureNativeFamiliesRegistry.ts`.
Do not widen scope beyond the chosen family.
Work in this order:
1. schema
2. defaults
3. serialization
4. runtime stub
5. diagnostics
6. verification
7. docs sync
Return changed files with line counts and KB sizes.
