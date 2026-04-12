# Volumetric Density Transport Native Starter

Status: native starter implemented.

Implemented in this stage:
- deterministic 2D density + velocity field runtime
- semi-Lagrangian-style backtrace advection
- continuous injector with buoyancy and swirl bias
- lightweight divergence damping / pressure relaxation
- boundary fade and edge leakage checks
- debug render payload with sampled field points
- dedicated verifier

Verified checks:
- deterministic seed
- deterministic stepping
- density accumulation over time
- upward center-of-mass transport
- top band density increase
- bounded edge leakage
- bounded divergence mean
- render payload reflects runtime frame

Next natural extensions:
- multi-emitter support
- obstacle mask / collider voxels
- light absorption / shadow coupling
- temperature field and density-temperature coupling
- 3D volume slice representation
