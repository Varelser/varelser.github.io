# Closeout repair lane pass8 — portable unit test base

## Goal
Add a dependency-light unit test base that can run in CI without introducing a new test runner dependency.

## Added
- `scripts/run-unit-tests.mjs`
- `tests/unit/audioReactiveIO.test.ts`
- `tests/unit/appStateConfigNormalization.test.ts`
- `tests/unit/sceneRenderRoutingBranchBuilders.test.ts`
- `package.json` scripts: `test:unit`, `test:unit:match`
- GitHub Pages workflow step: `npm run test:unit`

## Covered
- audio route bundle serialization / parsing / legacy normalization
- config normalization / synth pattern clamp / sequence multiplier clamp
- layer / gpgpu scene branch builders introduced during routing cycle fixes

## Notes
- Uses the existing `scripts/run-ts-entry.mjs` transpile path.
- Avoids adding `vitest` while preserving CI portability in the current offline/container workflow.
