# Future Native Families Masterplan

## Purpose
This document is a forward-implementation scaffold for families that are not yet fully native in the runtime.
It is written so a later AI or a later human pass can read the intent, map the work area, and generate code incrementally without first reconstructing the taxonomy.

## Scope
The target families covered here are:

1. MPM family
   - granular
   - viscoplastic
   - snow
   - mud
   - paste
2. PBD / cloth / softbody family
   - cloth
   - membrane
   - rope
   - softbody
3. fracture / destruction family
   - lattice fracture
   - voxel fracture
   - crack propagation
   - debris generation
4. advanced volumetric solver family
   - smoke
   - density transport
   - advection
   - pressure-like projection
   - volumetric lighting / shadow coupling
5. specialist-native family
   - Houdini-like node / solver / renderer bundles
   - Niagara-like emitter / event / solver bundles
   - TouchDesigner-like field / TOP-CHOP / instancing bundles
   - Unity VFX-like graph / output bundles

## What this pass adds
This pass does **not** claim the solvers are fully implemented.
It adds:

- canonical IDs and family metadata
- implementation-phase checkpoints
- execution capability defaults
- serialization placeholder schema
- AI-targeted implementation notes
- prompts and handoff text blocks for future code generation
- TypeScript stub modules that can be extended in-place

## Recommended build order

### Block A — groundwork first
1. shared solver state schema
2. family registry
3. per-family config block schema
4. serializer/import migration hooks
5. debug / manifest exposure

### Block B — lowest-risk native family starts
1. rope / membrane PBD-lite
2. granular MPM-lite
3. voxel fracture-lite
4. smoke-lite advection field

### Block C — deeper solver expansion
1. viscoplastic MPM
2. cloth + softbody constraints
3. crack propagation + debris lifecycle
4. pressure-coupled volumetrics
5. specialist-native node graph execution

## Expected implementation style
Each future native family should be added in the same shape:

- `types` or `schema`
- `registry` entry
- `default config`
- `runtime snapshot helper`
- `scene/runtime stub`
- `serializer block`
- `manifest exposure`
- `starter/preset placeholder`
- `verification scenario`

## Minimum done definition per native family
A family is only considered natively implemented when all of the following are true:

- there is a dedicated family ID in registry
- there is a dedicated config block in project serialization
- runtime path can instantiate the family without falling back to generic particles only
- at least one verification scenario round-trips through export/import
- debug/manifest can report family and capability routing

## Current non-goals
This scaffold does not yet promise:

- numerically stable physically-correct MPM
- production-grade cloth collision
- robust fracture remeshing
- full smoke pressure solver
- full node-graph editor UI for specialist-native families

It only sets the repository up so those can be added in controlled passes.
