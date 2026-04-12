# WebGPU Compute Mainline Integration — 2026-04-07

- Integrated patch rev3 into the 2026-04-07 mainline package.
- Kept current mainline position-pass SDF uniforms intact.
- Added WebGPU position+velocity readback and runtime init status tracking.
- Routed WebGPU output velocity texture into visual sync / trails / sorting usage.
- Preserved CPU readback path for metaball / smooth-tube when WebGPU is active.
- Repacked and verified as a valid ZIP after earlier packaging corruption.
