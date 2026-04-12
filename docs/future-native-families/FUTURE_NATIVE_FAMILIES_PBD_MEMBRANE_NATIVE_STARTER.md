# PBD Membrane Native Starter

- Shared constraint base: `pbd_sharedConstraints.ts`
- Native starter files:
  - `pbd_membraneSchema.ts`
  - `pbd_membraneAdapter.ts`
  - `pbd_membraneSolver.ts`
  - `pbd_membraneRenderer.ts`
  - `pbd_membraneUi.ts`
- Dedicated verifier:
  - `scripts/verify-pbd-membrane-entry.ts`
  - `scripts/verify-pbd-membrane.mjs`

Current starter behavior:
- structural / shear / bend constraints
- inflation lift
- boundary tension
- pulse response
- floor + circle collision
- spacing-based self collision
