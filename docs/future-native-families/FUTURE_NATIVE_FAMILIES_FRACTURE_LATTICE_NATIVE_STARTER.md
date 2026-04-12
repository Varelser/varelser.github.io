# Future Native Families — fracture-lattice native starter

`fracture-lattice` is now beyond scaffold-only status.

Current native starter includes:

- deterministic lattice node + bond generation
- radial impact damage accumulation
- bond break thresholding
- short-range propagation bias
- debris spawn from broken bonds
- debug render payload with intact lines and debris points
- dedicated verifier (`npm run verify:fracture-lattice`)

What is still missing:

- multi-step crack-front propagation from stress fields
- diagonal / anisotropic bond topologies
- rigid island extraction after fracture
- debris chunk aggregation
- renderer integration into scene family selection
- serialization block for fracture runtime snapshots

Acceptance currently covered by verifier:

- deterministic seed and step
- meaningful bond break cluster
- debris spawn
- non-zero fracture radius
- render payload reflects runtime state

## 2026-03-31 update

- Added detached fragment grouping and cluster-split handoff stats.
- `verify:fracture-lattice`, `verify:future-first-wave`, and `typecheck` pass after the update.
- Remaining main gaps: remesh handoff, voxel sibling, richer debris coupling.
