# Future Native Families First-Wave Verification

First-wave families now have starter verification coverage for:

- `pbd-rope`
- `mpm-granular`
- `fracture-lattice`
- `volumetric-density-transport`

Checks currently cover:

- starter implementation packet presence
- serialized block generation
- deterministic seed / initial state generation
- debug render payload generation
- UI section presence

Commands:

```bash
npm run verify:future-family -- pbd-rope
npm run verify:future-family -- mpm-granular
npm run verify:future-family -- fracture-lattice
npm run verify:future-family -- volumetric-density-transport
npm run verify:future-first-wave
```

These are starter verifiers, not full solver correctness proofs.
They exist so later AI handoff can confirm that schema/adapter/solver/renderer/UI scaffolds stay connected while deeper native work is added.

- `mpm-granular` now has a native starter verifier (`npm run verify:mpm-granular`) covering settling, bounded pile formation, pair contacts, and render payload sync.
