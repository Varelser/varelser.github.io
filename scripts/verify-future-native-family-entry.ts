declare const process: { argv: string[]; exitCode?: number };
import { buildFutureNativeFamilyImplementationPacket } from '../lib/future-native-families/futureNativeFamiliesImplementationPackets';
import { mergeFutureNativeFamilySerializedBlock } from '../lib/future-native-families/futureNativeFamiliesSerialization';
import { getFutureNativeSpecialistRuntimeStub } from '../lib/future-native-families/futureNativeFamiliesSpecialist';
import {
  buildFutureNativeHoudiniAdapterMappings,
  buildFutureNativeHoudiniGraphPacket,
  serializeFutureNativeHoudiniGraphPacket,
} from '../lib/future-native-families/futureNativeFamiliesSpecialistHoudini';
import {
  buildFutureNativeNiagaraAdapterMappings,
  buildFutureNativeNiagaraGraphPacket,
  serializeFutureNativeNiagaraGraphPacket,
} from '../lib/future-native-families/futureNativeFamiliesSpecialistNiagara';
import {
  buildFutureNativeTouchdesignerAdapterMappings,
  buildFutureNativeTouchdesignerGraphPacket,
  serializeFutureNativeTouchdesignerGraphPacket,
} from '../lib/future-native-families/futureNativeFamiliesSpecialistTouchdesigner';
import {
  buildFutureNativeUnityVfxAdapterMappings,
  buildFutureNativeUnityVfxGraphPacket,
  serializeFutureNativeUnityVfxGraphPacket,
} from '../lib/future-native-families/futureNativeFamiliesSpecialistUnityVfx';
import { normalizePbdRopeConfig } from '../lib/future-native-families/starter-runtime/pbd_ropeAdapter';
import { createPbdRopeRuntimeState, getPbdRopeStats, stepPbdRopeRuntime } from '../lib/future-native-families/starter-runtime/pbd_ropeSolver';
import { buildPbdRopeDebugRenderPayload } from '../lib/future-native-families/starter-runtime/pbd_ropeRenderer';
import { pbdRopeUiSections } from '../lib/future-native-families/starter-runtime/pbd_ropeUi';
import { createMpmGranularRuntimeFromInput } from '../lib/future-native-families/starter-runtime/mpm_granularAdapter';
import { buildMpmGranularDebugRenderPayload } from '../lib/future-native-families/starter-runtime/mpm_granularRenderer';
import { getMpmGranularStats, stepMpmGranularRuntime } from '../lib/future-native-families/starter-runtime/mpm_granularSolver';
import { mpmGranularUiSections } from '../lib/future-native-families/starter-runtime/mpm_granularUi';
import { normalizeFractureLatticeConfig } from '../lib/future-native-families/starter-runtime/fracture_latticeAdapter';
import { createFractureLatticeRuntimeState, getFractureLatticeStats, simulateFractureLatticeRuntime } from '../lib/future-native-families/starter-runtime/fracture_latticeSolver';
import { buildFractureLatticeDebugRenderPayload } from '../lib/future-native-families/starter-runtime/fracture_latticeRenderer';
import { fractureLatticeUiSections } from '../lib/future-native-families/starter-runtime/fracture_latticeUi';
import { createVolumetricDensityTransportRuntimeFromInput } from '../lib/future-native-families/starter-runtime/volumetric_density_transportAdapter';
import { buildVolumetricDensityTransportDebugRenderPayload } from '../lib/future-native-families/starter-runtime/volumetric_density_transportRenderer';
import { getVolumetricDensityTransportStats, simulateVolumetricDensityTransportRuntime } from '../lib/future-native-families/starter-runtime/volumetric_density_transportSolver';
import { volumetricDensityTransportUiSections } from '../lib/future-native-families/starter-runtime/volumetric_density_transportUi';
import type { FutureNativeFamilyId } from '../lib/future-native-families/futureNativeFamiliesTypes';

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

const familyId = process.argv[2] as FutureNativeFamilyId | undefined;
if (!familyId) throw new Error('Expected future native family id argument.');

function runPbdRope(): Record<string, number> {
  const config = normalizePbdRopeConfig({
    segments: 22,
    restLength: 0.05,
    stiffness: 0.96,
    bendStiffness: 0.22,
    damping: 0.03,
    gravity: 9.8,
    anchorMode: 'start',
    collisionRadius: 0.015,
    floorY: -0.9,
    circleColliderX: 0.08,
    circleColliderY: -0.8,
    circleColliderRadius: 0.18,
    capsuleColliderAx: -0.18,
    capsuleColliderAy: -0.56,
    capsuleColliderBx: 0.22,
    capsuleColliderBy: -0.92,
    capsuleColliderRadius: 0.075,
    selfCollisionStiffness: 0.72,
  });
  const runtimeA = createPbdRopeRuntimeState(config);
  const runtimeB = createPbdRopeRuntimeState(config);
  assert(JSON.stringify(runtimeA) === JSON.stringify(runtimeB), 'pbd-rope seed must be deterministic');
  let steppedA = runtimeA;
  let steppedB = runtimeB;
  for (let frame = 0; frame < 64; frame += 1) {
    steppedA = stepPbdRopeRuntime(steppedA, { iterations: 20 });
    steppedB = stepPbdRopeRuntime(steppedB, { iterations: 20 });
  }
  assert(JSON.stringify(steppedA) === JSON.stringify(steppedB), 'pbd-rope stepping must be deterministic');
  const stats = getPbdRopeStats(steppedA);
  const render = buildPbdRopeDebugRenderPayload(steppedA);
  assert(stats.segmentCount === 22, 'pbd-rope segment count mismatch');
  assert(stats.maxStretchRatio < 1.1, 'pbd-rope stretch too high');
  assert(stats.floorContacts >= 1, 'pbd-rope floor contact missing');
  assert(stats.circleContacts >= 1, 'pbd-rope circle contact missing');
  assert(stats.capsuleContacts >= 1, 'pbd-rope capsule contact missing');
  assert(stats.minNonAdjacentDistance >= config.collisionRadius * 2 - 5e-3, 'pbd-rope spacing guard too low');
  assert(Array.isArray(render.scalarSamples) && render.scalarSamples.length === 5, 'pbd-rope scalar samples missing');
  assert(pbdRopeUiSections.length >= 4, 'pbd-rope ui sections missing');
  return render.stats;
}

function runMpmGranular(): Record<string, number> {
  const runtimeA = createMpmGranularRuntimeFromInput({
    particleCount: 144,
    particleRadius: 0.018,
    spawnWidth: 0.44,
    spawnHeight: 0.34,
    wallHalfWidth: 0.62,
    floorY: -0.5,
    gravity: 10.2,
    materialKind: 'snow',
    cohesion: 0.12,
    friction: 0.7,
    damping: 0.05,
    plasticity: 0.58,
    yieldRate: 0.46,
    kernelRadius: 1.9,
    apicBlend: 0.62,
    stressGain: 0.58,
    hardening: 0.34,
    substeps: 4,
    cellResolution: 28,
  });
  const runtimeB = createMpmGranularRuntimeFromInput({
    particleCount: 144,
    particleRadius: 0.018,
    spawnWidth: 0.44,
    spawnHeight: 0.34,
    wallHalfWidth: 0.62,
    floorY: -0.5,
    gravity: 10.2,
    materialKind: 'snow',
    cohesion: 0.12,
    friction: 0.7,
    damping: 0.05,
    plasticity: 0.58,
    yieldRate: 0.46,
    kernelRadius: 1.9,
    apicBlend: 0.62,
    stressGain: 0.58,
    hardening: 0.34,
    substeps: 4,
    cellResolution: 28,
  });
  assert(JSON.stringify(runtimeA) === JSON.stringify(runtimeB), 'mpm-granular seed must be deterministic');
  let steppedA = runtimeA;
  let steppedB = runtimeB;
  for (let frame = 0; frame < 120; frame += 1) {
    steppedA = stepMpmGranularRuntime(steppedA, { substeps: 4 });
    steppedB = stepMpmGranularRuntime(steppedB, { substeps: 4 });
  }
  assert(JSON.stringify(steppedA) === JSON.stringify(steppedB), 'mpm-granular stepping must be deterministic');
  const stats = getMpmGranularStats(steppedA);
  const render = buildMpmGranularDebugRenderPayload(steppedA);
  assert(render.stats.particles === 144, 'mpm-granular particle count mismatch');
  assert(stats.floorContacts >= 20, 'mpm-granular floor contact missing');
  assert(stats.occupiedCells >= 10, 'mpm-granular occupied cells too low');
  assert(stats.transferResidual < 1e-6, 'mpm-granular transfer residual too high');
  assert(stats.meanStress > 0.05, 'mpm-granular stress too low');
  assert(stats.apicEnergy > 0.0001, 'mpm-granular APIC energy too low');
  assert(stats.meanHardeningState > 0.5, 'mpm-granular snow hardening too low');
  assert(stats.materialBranchScore > 1, 'mpm-granular material branch score too low');
  assert((render.lines?.length ?? 0) >= 80, 'mpm-granular overlay lines too few');
  assert((render.stats.overlayCellCount ?? 0) >= 24, 'mpm-granular overlay cell count too low');
  assert((render.stats.stressLineCount ?? 0) >= 24, 'mpm-granular stress line stats too low');
  assert((render.stats.constitutiveOverlayCellCount ?? 0) >= 24, 'mpm-granular constitutive overlay cells missing');
  assert((render.stats.constitutiveLineCount ?? 0) >= 24, 'mpm-granular constitutive overlay lines missing');
  assert((render.stats.hardeningOverlayCellCount ?? 0) >= 24, 'mpm-granular hardening overlay too weak');
  assert((render.stats.constitutiveShellCellCount ?? 0) >= 24, 'mpm-granular constitutive shell cells missing');
  assert((render.stats.constitutiveShellSegmentCount ?? 0) >= 24, 'mpm-granular constitutive shell segments too low');
  assert((render.stats.hardeningShellSegmentCount ?? 0) >= 24, 'mpm-granular hardening shell too weak');
  assert((render.stats.packedRegionRemeshLineCount ?? 0) >= 24, 'mpm-granular packed remesh too weak');
  assert(Array.isArray(render.scalarSamples) && render.scalarSamples.length === 8, 'mpm-granular scalar samples missing');
  assert(mpmGranularUiSections.length >= 3, 'mpm-granular ui sections missing');
  return render.stats;
}

function runMpmViscoplastic(): Record<string, number> {
  const runtimeA = createMpmGranularRuntimeFromInput({
    particleCount: 160,
    particleRadius: 0.018,
    spawnWidth: 0.52,
    spawnHeight: 0.22,
    wallHalfWidth: 0.68,
    floorY: -0.72,
    gravity: 7.1,
    materialKind: 'paste',
    cohesion: 0.24,
    friction: 0.48,
    damping: 0.08,
    plasticity: 0.72,
    yieldRate: 0.58,
    kernelRadius: 2.1,
    apicBlend: 0.66,
    stressGain: 0.56,
    hardening: 0.42,
    substeps: 5,
    cellResolution: 30,
  });
  const runtimeB = createMpmGranularRuntimeFromInput({
    particleCount: 160,
    particleRadius: 0.018,
    spawnWidth: 0.52,
    spawnHeight: 0.22,
    wallHalfWidth: 0.68,
    floorY: -0.72,
    gravity: 7.1,
    materialKind: 'paste',
    cohesion: 0.24,
    friction: 0.48,
    damping: 0.08,
    plasticity: 0.72,
    yieldRate: 0.58,
    kernelRadius: 2.1,
    apicBlend: 0.66,
    stressGain: 0.56,
    hardening: 0.42,
    substeps: 5,
    cellResolution: 30,
  });
  assert(JSON.stringify(runtimeA) === JSON.stringify(runtimeB), 'mpm-viscoplastic seed must be deterministic');
  let steppedA = runtimeA;
  let steppedB = runtimeB;
  for (let frame = 0; frame < 132; frame += 1) {
    steppedA = stepMpmGranularRuntime(steppedA, { substeps: 5 });
    steppedB = stepMpmGranularRuntime(steppedB, { substeps: 5 });
  }
  assert(JSON.stringify(steppedA) === JSON.stringify(steppedB), 'mpm-viscoplastic stepping must be deterministic');
  const stats = getMpmGranularStats(steppedA);
  const render = buildMpmGranularDebugRenderPayload(steppedA);
  assert(render.stats.particles === 160, 'mpm-viscoplastic particle count mismatch');
  assert(stats.occupiedCells >= 10, 'mpm-viscoplastic occupied cells too low');
  assert(stats.transferResidual < 1e-6, 'mpm-viscoplastic transfer residual too high');
  assert(stats.meanStress > 0.08, 'mpm-viscoplastic stress too low');
  assert(stats.meanViscosityState > 0.5, 'mpm-viscoplastic viscosity state too low');
  assert(stats.meanYieldMemory > 0.14, 'mpm-viscoplastic yield memory too low');
  assert(stats.materialBranchScore > 1.4, 'mpm-viscoplastic branch score too low');
  assert((render.lines?.length ?? 0) >= 80, 'mpm-viscoplastic overlay lines too few');
  assert((render.stats.overlayCellCount ?? 0) >= 24, 'mpm-viscoplastic overlay cell count too low');
  assert((render.stats.viscosityOverlayCellCount ?? 0) >= 24, 'mpm-viscoplastic viscosity overlay missing');
  assert((render.stats.yieldOverlayCellCount ?? 0) >= 24, 'mpm-viscoplastic yield overlay missing');
  assert((render.stats.yieldDominantOverlayCellCount ?? 0) >= 12, 'mpm-viscoplastic yield dominant overlay too weak');
  assert((render.stats.jammedMaterialSplitModeCount ?? 0) >= 3, 'mpm-viscoplastic split modes too low');
  assert((render.stats.packedRegionRemeshLineCount ?? 0) >= 24, 'mpm-viscoplastic packed remesh too weak');
  assert(Array.isArray(render.scalarSamples) && render.scalarSamples.length === 8, 'mpm-viscoplastic scalar samples missing');
  assert(mpmGranularUiSections.length >= 3, 'mpm-viscoplastic ui sections missing');
  return render.stats;
}

function runMpmSnow(): Record<string, number> {
  const runtimeA = createMpmGranularRuntimeFromInput({
    particleCount: 168,
    particleRadius: 0.017,
    spawnWidth: 0.54,
    spawnHeight: 0.24,
    wallHalfWidth: 0.72,
    floorY: -0.7,
    gravity: 9.8,
    materialKind: 'snow',
    cohesion: 0.14,
    friction: 0.76,
    damping: 0.058,
    plasticity: 0.62,
    yieldRate: 0.42,
    kernelRadius: 1.98,
    apicBlend: 0.64,
    stressGain: 0.6,
    hardening: 0.46,
    substeps: 5,
    cellResolution: 32,
  });
  const runtimeB = createMpmGranularRuntimeFromInput({
    particleCount: 168,
    particleRadius: 0.017,
    spawnWidth: 0.54,
    spawnHeight: 0.24,
    wallHalfWidth: 0.72,
    floorY: -0.7,
    gravity: 9.8,
    materialKind: 'snow',
    cohesion: 0.14,
    friction: 0.76,
    damping: 0.058,
    plasticity: 0.62,
    yieldRate: 0.42,
    kernelRadius: 1.98,
    apicBlend: 0.64,
    stressGain: 0.6,
    hardening: 0.46,
    substeps: 5,
    cellResolution: 32,
  });
  assert(JSON.stringify(runtimeA) === JSON.stringify(runtimeB), 'mpm-snow seed must be deterministic');
  let steppedA = runtimeA;
  let steppedB = runtimeB;
  for (let frame = 0; frame < 132; frame += 1) {
    steppedA = stepMpmGranularRuntime(steppedA, { substeps: 5 });
    steppedB = stepMpmGranularRuntime(steppedB, { substeps: 5 });
  }
  assert(JSON.stringify(steppedA) === JSON.stringify(steppedB), 'mpm-snow stepping must be deterministic');
  const stats = getMpmGranularStats(steppedA);
  const render = buildMpmGranularDebugRenderPayload(steppedA);
  assert(render.stats.particles === 168, 'mpm-snow particle count mismatch');
  assert(stats.occupiedCells >= 10, 'mpm-snow occupied cells too low');
  assert(stats.transferResidual < 1e-6, 'mpm-snow transfer residual too high');
  assert(stats.meanStress > 0.08, 'mpm-snow stress too low');
  assert(stats.meanHardeningState > 0.5, 'mpm-snow hardening state too low');
  assert(stats.materialBranchScore > 1.2, 'mpm-snow branch score too low');
  assert((render.lines?.length ?? 0) >= 80, 'mpm-snow overlay lines too few');
  assert((render.stats.overlayCellCount ?? 0) >= 24, 'mpm-snow overlay cell count too low');
  assert((render.stats.hardeningOverlayCellCount ?? 0) >= 24, 'mpm-snow hardening overlay missing');
  assert((render.stats.constitutiveOverlayCellCount ?? 0) >= 24, 'mpm-snow constitutive overlay missing');
  assert((render.stats.constitutiveLineCount ?? 0) >= 24, 'mpm-snow constitutive lines missing');
  assert((render.stats.constitutiveShellCellCount ?? 0) >= 24, 'mpm-snow constitutive shell cells missing');
  assert((render.stats.constitutiveShellSegmentCount ?? 0) >= 24, 'mpm-snow constitutive shell segments too low');
  assert((render.stats.hardeningShellSegmentCount ?? 0) >= 24, 'mpm-snow hardening shell too weak');
  assert((render.stats.packedRegionRemeshLineCount ?? 0) >= 24, 'mpm-snow packed remesh too weak');
  assert(Array.isArray(render.scalarSamples) && render.scalarSamples.length === 8, 'mpm-snow scalar samples missing');
  assert(mpmGranularUiSections.length >= 3, 'mpm-snow ui sections missing');
  return render.stats;
}

function runMpmMud(): Record<string, number> {
  const runtimeA = createMpmGranularRuntimeFromInput({
    particleCount: 156,
    particleRadius: 0.018,
    spawnWidth: 0.56,
    spawnHeight: 0.24,
    wallHalfWidth: 0.74,
    floorY: -0.76,
    gravity: 8.4,
    materialKind: 'mud',
    cohesion: 0.2,
    friction: 0.58,
    damping: 0.074,
    plasticity: 0.58,
    yieldRate: 0.46,
    kernelRadius: 1.96,
    apicBlend: 0.6,
    stressGain: 0.48,
    hardening: 0.3,
    substeps: 5,
    cellResolution: 30,
  });
  const runtimeB = createMpmGranularRuntimeFromInput({
    particleCount: 156,
    particleRadius: 0.018,
    spawnWidth: 0.56,
    spawnHeight: 0.24,
    wallHalfWidth: 0.74,
    floorY: -0.76,
    gravity: 8.4,
    materialKind: 'mud',
    cohesion: 0.2,
    friction: 0.58,
    damping: 0.074,
    plasticity: 0.58,
    yieldRate: 0.46,
    kernelRadius: 1.96,
    apicBlend: 0.6,
    stressGain: 0.48,
    hardening: 0.3,
    substeps: 5,
    cellResolution: 30,
  });
  assert(JSON.stringify(runtimeA) === JSON.stringify(runtimeB), 'mpm-mud seed must be deterministic');
  let steppedA = runtimeA;
  let steppedB = runtimeB;
  for (let frame = 0; frame < 128; frame += 1) {
    steppedA = stepMpmGranularRuntime(steppedA, { substeps: 5 });
    steppedB = stepMpmGranularRuntime(steppedB, { substeps: 5 });
  }
  assert(JSON.stringify(steppedA) === JSON.stringify(steppedB), 'mpm-mud stepping must be deterministic');
  const stats = getMpmGranularStats(steppedA);
  const render = buildMpmGranularDebugRenderPayload(steppedA);
  assert(render.stats.particles === 156, 'mpm-mud particle count mismatch');
  assert(stats.occupiedCells >= 10, 'mpm-mud occupied cells too low');
  assert(stats.transferResidual < 1e-6, 'mpm-mud transfer residual too high');
  assert(stats.meanViscosityState > 0.45, 'mpm-mud viscosity state too low');
  assert(stats.meanYieldMemory > 0.1, 'mpm-mud yield memory too low');
  assert(stats.materialBranchScore > 1.35, 'mpm-mud branch score too low');
  assert((render.lines?.length ?? 0) >= 80, 'mpm-mud overlay lines too few');
  assert((render.stats.overlayCellCount ?? 0) >= 24, 'mpm-mud overlay cell count too low');
  assert((render.stats.viscosityOverlayCellCount ?? 0) >= 24, 'mpm-mud viscosity overlay missing');
  assert((render.stats.viscosityShellSegmentCount ?? 0) >= 24, 'mpm-mud viscosity shell too weak');
  assert(Array.isArray(render.scalarSamples) && render.scalarSamples.length === 8, 'mpm-mud scalar samples missing');
  assert(mpmGranularUiSections.length >= 3, 'mpm-mud ui sections missing');
  return render.stats;
}

function runMpmPaste(): Record<string, number> {
  const runtimeA = createMpmGranularRuntimeFromInput({
    particleCount: 152,
    particleRadius: 0.019,
    spawnWidth: 0.58,
    spawnHeight: 0.18,
    wallHalfWidth: 0.78,
    floorY: -0.96,
    gravity: 6.3,
    materialKind: 'paste',
    cohesion: 0.27,
    friction: 0.46,
    damping: 0.098,
    plasticity: 0.74,
    yieldRate: 0.62,
    kernelRadius: 2.14,
    apicBlend: 0.68,
    stressGain: 0.56,
    hardening: 0.46,
    substeps: 6,
    cellResolution: 34,
  });
  const runtimeB = createMpmGranularRuntimeFromInput({
    particleCount: 152,
    particleRadius: 0.019,
    spawnWidth: 0.58,
    spawnHeight: 0.18,
    wallHalfWidth: 0.78,
    floorY: -0.96,
    gravity: 6.3,
    materialKind: 'paste',
    cohesion: 0.27,
    friction: 0.46,
    damping: 0.098,
    plasticity: 0.74,
    yieldRate: 0.62,
    kernelRadius: 2.14,
    apicBlend: 0.68,
    stressGain: 0.56,
    hardening: 0.46,
    substeps: 6,
    cellResolution: 34,
  });
  assert(JSON.stringify(runtimeA) === JSON.stringify(runtimeB), 'mpm-paste seed must be deterministic');
  let steppedA = runtimeA;
  let steppedB = runtimeB;
  for (let frame = 0; frame < 136; frame += 1) {
    steppedA = stepMpmGranularRuntime(steppedA, { substeps: 6 });
    steppedB = stepMpmGranularRuntime(steppedB, { substeps: 6 });
  }
  assert(JSON.stringify(steppedA) === JSON.stringify(steppedB), 'mpm-paste stepping must be deterministic');
  const stats = getMpmGranularStats(steppedA);
  const render = buildMpmGranularDebugRenderPayload(steppedA);
  assert(render.stats.particles === 152, 'mpm-paste particle count mismatch');
  assert(stats.occupiedCells >= 10, 'mpm-paste occupied cells too low');
  assert(stats.transferResidual < 1e-6, 'mpm-paste transfer residual too high');
  assert(stats.meanViscosityState > 0.52, 'mpm-paste viscosity state too low');
  assert(stats.meanYieldMemory > 0.14, 'mpm-paste yield memory too low');
  assert(stats.materialBranchScore > 1.55, 'mpm-paste branch score too low');
  assert((render.lines?.length ?? 0) >= 80, 'mpm-paste overlay lines too few');
  assert((render.stats.overlayCellCount ?? 0) >= 24, 'mpm-paste overlay cell count too low');
  assert((render.stats.viscosityOverlayCellCount ?? 0) >= 24, 'mpm-paste viscosity overlay missing');
  assert((render.stats.yieldOverlayCellCount ?? 0) >= 24, 'mpm-paste yield overlay missing');
  assert((render.stats.yieldDominantOverlayCellCount ?? 0) >= 12, 'mpm-paste yield-dominant overlay too weak');
  assert((render.stats.jammedPasteCoreCellCount ?? 0) >= 12, 'mpm-paste core split too weak');
  assert((render.stats.packedRegionRemeshLineCount ?? 0) >= 24, 'mpm-paste packed remesh too weak');
  assert(Array.isArray(render.scalarSamples) && render.scalarSamples.length === 8, 'mpm-paste scalar samples missing');
  assert(mpmGranularUiSections.length >= 3, 'mpm-paste ui sections missing');
  return render.stats;
}

function runFractureLattice(
  familyLabel: 'fracture-lattice' | 'fracture-voxel' | 'fracture-crack-propagation' | 'fracture-debris-generation' = 'fracture-lattice',
  overrides: Partial<ReturnType<typeof normalizeFractureLatticeConfig>> = {},
): Record<string, number> {
  const config = normalizeFractureLatticeConfig({
    width: 8,
    height: 5,
    impulseThreshold: 0.7,
    debrisSpawnRate: 0.4,
    impactRadius: 0.28,
    impulseMagnitude: 1.8,
    propagationFalloff: 0.2,
    propagationDirectionX: 0.9,
    propagationDirectionY: -0.12,
    directionalBias: 0.35,
    debrisImpulseScale: 1.1,
    splitAffinity: 0.56,
    fragmentDetachThreshold: 0.09,
    seed: 5,
    ...overrides,
  });
  const runtimeA = createFractureLatticeRuntimeState(config);
  const runtimeB = createFractureLatticeRuntimeState(config);
  assert(JSON.stringify(runtimeA) === JSON.stringify(runtimeB), `${familyLabel} seed must be deterministic`);
  const steppedA = simulateFractureLatticeRuntime(runtimeA, 5);
  const steppedB = simulateFractureLatticeRuntime(runtimeB, 5);
  assert(JSON.stringify(steppedA) === JSON.stringify(steppedB), `${familyLabel} stepping must be deterministic`);
  const stats = getFractureLatticeStats(steppedA);
  const render = buildFractureLatticeDebugRenderPayload(steppedA);
  assert(render.stats.bonds > 0, `${familyLabel} bonds missing`);
  assert(stats.broken >= 4, `${familyLabel} should break bonds`);
  assert(render.stats.debris >= 1, `${familyLabel} debris missing`);
  assert(stats.largestBrokenCluster >= 3, `${familyLabel} cluster too small`);
  assert(stats.propagationAdvance > 0.03, `${familyLabel} propagation advance too small`);
  assert(stats.detachedFragments >= 1, `${familyLabel} detached fragments missing`);
  assert(stats.detachedFragmentNodes >= 2, `${familyLabel} detached nodes too low`);
  assert((render.stats.brittleBreakCount ?? 0) >= 1, `${familyLabel} brittle break grammar missing`);
  assert((render.stats.shearBreakCount ?? 0) >= 1, `${familyLabel} shear break grammar missing`);
  assert((render.stats.ductileBreakCount ?? 0) >= 1, `${familyLabel} ductile break grammar missing`);
  assert((render.stats.breakGrammarMaterialModes ?? 0) >= 3, `${familyLabel} break grammar modes too low`);
  assert((render.stats.siblingDensityCellCount ?? 0) >= 8, `${familyLabel} sibling density cells too low`);
  assert((render.stats.siblingFractureBandCount ?? 0) >= 2, `${familyLabel} sibling fracture bands too low`);
  assert(Array.isArray(render.scalarSamples) && render.scalarSamples.length === 17, `${familyLabel} scalar samples missing`);
  assert(fractureLatticeUiSections.length >= 5, `${familyLabel} ui sections missing`);
  return render.stats;
}

function runVolumetricDensityTransport(): Record<string, number> {
  const runtimeA = createVolumetricDensityTransportRuntimeFromInput({
    resolutionX: 16,
    resolutionY: 18,
    injectionRate: 0.2,
    injectionRadius: 0.14,
    advectionStrength: 0.86,
    buoyancy: 0.18,
    swirlStrength: 0.4,
    pressureRelaxation: 0.25,
    pressureIterations: 5,
    boundaryFade: 0.1,
    dissipation: 0.018,
    lightAbsorption: 0.48,
    shadowStrength: 0.62,
    obstacleX: -0.04,
    obstacleY: -0.08,
    obstacleRadius: 0.16,
    obstacleStrength: 0.52,
    obstacleSoftness: 0.18,
    lightMarchSteps: 7,
    depthLayers: 4,
    volumeDepthScale: 0.72,
  });
  const runtimeB = createVolumetricDensityTransportRuntimeFromInput({
    resolutionX: 16,
    resolutionY: 18,
    injectionRate: 0.2,
    injectionRadius: 0.14,
    advectionStrength: 0.86,
    buoyancy: 0.18,
    swirlStrength: 0.4,
    pressureRelaxation: 0.25,
    pressureIterations: 5,
    boundaryFade: 0.1,
    dissipation: 0.018,
    lightAbsorption: 0.48,
    shadowStrength: 0.62,
    obstacleX: -0.04,
    obstacleY: -0.08,
    obstacleRadius: 0.16,
    obstacleStrength: 0.52,
    obstacleSoftness: 0.18,
    lightMarchSteps: 7,
    depthLayers: 4,
    volumeDepthScale: 0.72,
  });
  assert(JSON.stringify(Array.from(runtimeA.density)) === JSON.stringify(Array.from(runtimeB.density)), 'volumetric density seed must be deterministic');
  const initialStats = getVolumetricDensityTransportStats(runtimeA);
  const steppedA = simulateVolumetricDensityTransportRuntime(runtimeA, 80);
  const steppedB = simulateVolumetricDensityTransportRuntime(runtimeB, 80);
  assert(JSON.stringify(Array.from(steppedA.density)) === JSON.stringify(Array.from(steppedB.density)), 'volumetric stepping must be deterministic');
  const stats = getVolumetricDensityTransportStats(steppedA);
  const render = buildVolumetricDensityTransportDebugRenderPayload(steppedA);
  assert(render.stats.cells === 288, 'volumetric cell count mismatch');
  assert(stats.centerOfMassY > initialStats.centerOfMassY + 0.08, 'volumetric density should move upward');
  assert(stats.topBandDensity > 0.002, 'volumetric top band should remain present');
  assert(stats.divergenceMean < 0.05, 'volumetric divergence too high');
  assert(stats.maxPressure > 0.001, 'volumetric pressure field too weak');
  assert(stats.meanLighting > 0.2 && stats.meanLighting < 1, 'volumetric lighting mean out of range');
  assert(stats.shadowMean > 0.01, 'volumetric shadow coupling too weak');
  assert(stats.meanObstacleMask > 0.01, 'volumetric obstacle mask too weak');
  assert(stats.obstacleOccludedCells >= 8, 'volumetric obstacle occlusion missing');
  assert(stats.primaryObstacleOccludedCells >= 8, 'volumetric primary obstacle occlusion missing');
  assert(stats.secondaryObstacleOccludedCells >= 4, 'volumetric secondary obstacle occlusion missing');
  assert(stats.lightMarchMean > 0.15, 'volumetric light marching too weak');
  assert(stats.lightMarchSecondaryMean > 0.08, 'volumetric secondary light marching too weak');
  assert(stats.rimLightMean > 0.06, 'volumetric rim light too weak');
  assert(stats.plumeAnisotropyMean > 0.004, 'volumetric plume anisotropy too weak');
  assert(stats.plumeBranchActiveCells >= 4, 'volumetric plume branch activity too low');
  assert(stats.obstacleWakeMean > 0.0004, 'volumetric obstacle wake too weak');
  assert(stats.obstacleWakeCells >= 2, 'volumetric obstacle wake cells too low');
  assert(stats.volumeDepthMean > 0.015, 'volumetric volume depth too weak');
  assert((render.stats.meshRowCount ?? 0) >= 3, 'volumetric mesh rows missing');
  assert((render.stats.meshLineCount ?? 0) >= 20, 'volumetric mesh lines too low');
  assert((render.stats.obstacleMaskCellCount ?? 0) >= 8, 'volumetric obstacle mask cells missing');
  assert((render.stats.obstacleBoundaryLineCount ?? 0) >= 4, 'volumetric obstacle boundary missing');
  assert((render.stats.secondaryObstacleMaskCellCount ?? 0) >= 4, 'volumetric secondary obstacle mask cells missing');
  assert((render.stats.secondaryObstacleBoundaryLineCount ?? 0) >= 4, 'volumetric secondary obstacle boundary missing');
  assert((render.stats.obstacleBridgeLineCount ?? 0) >= 2, 'volumetric obstacle bridge missing');
  assert((render.stats.lightMarchLineCount ?? 0) >= 2, 'volumetric light march lines missing');
  assert((render.stats.secondaryLightMarchLineCount ?? 0) >= 2, 'volumetric secondary light march lines missing');
  assert((render.stats.multiLightBridgeLineCount ?? 0) >= 2, 'volumetric multi-light bridge missing');
assert((render.stats.tripleLightInterferenceLineCount ?? 0) >= 2, 'volumetric triple-light lines missing');
  assert((render.stats.tripleLightModeCount ?? 0) >= 2, 'volumetric triple-light modes missing');
  assert((render.stats.anisotropicPlumeLineCount ?? 0) >= 1, 'volumetric anisotropic plume missing');
  assert((render.stats.plumeBranchBridgeLineCount ?? 0) >= 1, 'volumetric plume branch bridge missing');
  assert((render.stats.anisotropicPlumeModeCount ?? 0) >= 2, 'volumetric plume modes missing');
  assert((render.stats.obstacleWakeLineCount ?? 0) >= 2, 'volumetric obstacle wake lines missing');
  assert((render.stats.obstacleWakeBridgeLineCount ?? 0) >= 1, 'volumetric obstacle wake bridge missing');
  assert((render.stats.obstacleWakeModeCount ?? 0) >= 2, 'volumetric obstacle wake modes missing');
assert((render.stats.vortexPacketLineCount ?? 0) >= 1, 'volumetric vortex packet lines missing');
  assert((render.stats.vortexPacketModeCount ?? 0) >= 1, 'volumetric vortex packet modes missing');
  assert((render.stats.volumeLayerPointCount ?? 0) >= 12, 'volumetric volume layer points missing');
  assert((render.stats.volumeLayerLineCount ?? 0) >= 12, 'volumetric volume layer lines missing');
  assert((render.stats.volumeDepthLayerCount ?? 0) >= 3, 'volumetric depth layers missing');
  assert(Array.isArray(render.scalarSamples) && render.scalarSamples.length === 21, 'volumetric scalar samples missing');
  assert(volumetricDensityTransportUiSections.length >= 6, 'volumetric ui sections missing');
  return render.stats;
}

function runSpecialistHoudini(): Record<string, number> {
  const stubA = getFutureNativeSpecialistRuntimeStub('specialist-houdini-native');
  const stubB = getFutureNativeSpecialistRuntimeStub('specialist-houdini-native');
  const packet = buildFutureNativeHoudiniGraphPacket();
  const mappings = buildFutureNativeHoudiniAdapterMappings();
  const serializedGraph = serializeFutureNativeHoudiniGraphPacket();
  assert(JSON.stringify(stubA) === JSON.stringify(stubB), 'specialist-houdini-native stub must be deterministic');
  assert(stubA.graphHint === 'node-chain', 'specialist-houdini-native graph hint mismatch');
  assert(stubA.outputHint === 'multi-output', 'specialist-houdini-native output hint mismatch');
  assert(stubA.config.familyId === 'specialist-houdini-native', 'specialist-houdini-native config family mismatch');
  assert(stubA.config.solverDepth === 'deep', 'specialist-houdini-native solver depth mismatch');
  assert(stubA.config.iterations === 1, 'specialist-houdini-native iterations mismatch');
  assert(stubA.nextImplementationStep.length > 0, 'specialist-houdini-native next step missing');
  assert(packet.familyId === 'specialist-houdini-native', 'specialist-houdini-native graph packet family mismatch');
  assert(packet.stages.length === 3, 'specialist-houdini-native graph stage count mismatch');
  assert(packet.stages.every((stage) => stage.nodes.length >= 1), 'specialist-houdini-native graph stage nodes missing');
  assert(packet.outputBridges.length >= 3, 'specialist-houdini-native output bridges too small');
  assert(mappings.length >= 6, 'specialist-houdini-native adapter mappings too small');
  assert(mappings.every((mapping) => !mapping.nativeNodeId.startsWith('product-pack-')), 'specialist-houdini-native native nodes should not depend on pack ids');
  assert(serializedGraph.values.some((value) => value.startsWith('stageCount:3')), 'specialist-houdini-native serialized graph stage count missing');
  return {
    graphHintNodeChain: stubA.graphHint === 'node-chain' ? 1 : 0,
    outputHintMulti: stubA.outputHint === 'multi-output' ? 1 : 0,
    coupling: stubA.config.coupling,
    iterations: stubA.config.iterations,
    graphStageCount: packet.stages.length,
    adapterMappingCount: mappings.length,
  };
}

function runSpecialistNiagara(): Record<string, number> {
  const stubA = getFutureNativeSpecialistRuntimeStub('specialist-niagara-native');
  const stubB = getFutureNativeSpecialistRuntimeStub('specialist-niagara-native');
  const packet = buildFutureNativeNiagaraGraphPacket();
  const mappings = buildFutureNativeNiagaraAdapterMappings();
  const serializedGraph = serializeFutureNativeNiagaraGraphPacket();
  assert(JSON.stringify(stubA) === JSON.stringify(stubB), 'specialist-niagara-native stub must be deterministic');
  assert(stubA.graphHint === 'emitter-stack', 'specialist-niagara-native graph hint mismatch');
  assert(stubA.outputHint === 'multi-output', 'specialist-niagara-native output hint mismatch');
  assert(stubA.config.familyId === 'specialist-niagara-native', 'specialist-niagara-native config family mismatch');
  assert(stubA.config.solverDepth === 'deep', 'specialist-niagara-native solver depth mismatch');
  assert(stubA.config.iterations === 1, 'specialist-niagara-native iterations mismatch');
  assert(packet.familyId === 'specialist-niagara-native', 'specialist-niagara-native graph packet family mismatch');
  assert(packet.stages.length === 3, 'specialist-niagara-native graph stage count mismatch');
  assert(packet.stages.every((stage) => stage.nodes.length >= 1), 'specialist-niagara-native graph stage nodes missing');
  assert(packet.outputBridges.length >= 3, 'specialist-niagara-native output bridges too small');
  assert(mappings.length >= 3, 'specialist-niagara-native adapter mappings too small');
  assert(mappings.every((mapping) => !mapping.nativeNodeId.startsWith('product-pack-')), 'specialist-niagara-native native nodes should not depend on pack ids');
  assert(serializedGraph.values.some((value) => value.startsWith('stageCount:3')), 'specialist-niagara-native serialized graph stage count missing');
  return {
    graphHintEmitterStack: stubA.graphHint === 'emitter-stack' ? 1 : 0,
    outputHintMulti: stubA.outputHint === 'multi-output' ? 1 : 0,
    coupling: stubA.config.coupling,
    iterations: stubA.config.iterations,
    graphStageCount: packet.stages.length,
    adapterMappingCount: mappings.length,
  };
}

function runSpecialistTouchdesigner(): Record<string, number> {
  const stubA = getFutureNativeSpecialistRuntimeStub('specialist-touchdesigner-native');
  const stubB = getFutureNativeSpecialistRuntimeStub('specialist-touchdesigner-native');
  const packet = buildFutureNativeTouchdesignerGraphPacket();
  const mappings = buildFutureNativeTouchdesignerAdapterMappings();
  const serializedGraph = serializeFutureNativeTouchdesignerGraphPacket();
  assert(JSON.stringify(stubA) === JSON.stringify(stubB), 'specialist-touchdesigner-native stub must be deterministic');
  assert(stubA.graphHint === 'operator-pipe', 'specialist-touchdesigner-native graph hint mismatch');
  assert(stubA.outputHint === 'multi-output', 'specialist-touchdesigner-native output hint mismatch');
  assert(stubA.config.familyId === 'specialist-touchdesigner-native', 'specialist-touchdesigner-native config family mismatch');
  assert(stubA.config.solverDepth === 'deep', 'specialist-touchdesigner-native solver depth mismatch');
  assert(stubA.config.iterations === 1, 'specialist-touchdesigner-native iterations mismatch');
  assert(packet.familyId === 'specialist-touchdesigner-native', 'specialist-touchdesigner-native graph packet family mismatch');
  assert(packet.stages.length === 3, 'specialist-touchdesigner-native graph stage count mismatch');
  assert(packet.stages.every((stage) => stage.nodes.length >= 1), 'specialist-touchdesigner-native graph stage nodes missing');
  assert(packet.outputBridges.length >= 3, 'specialist-touchdesigner-native output bridges too small');
  assert(mappings.length >= 4, 'specialist-touchdesigner-native adapter mappings too small');
  assert(mappings.every((mapping) => !mapping.nativeNodeId.startsWith('product-pack-')), 'specialist-touchdesigner-native native nodes should not depend on pack ids');
  assert(serializedGraph.values.some((value) => value.startsWith('stageCount:3')), 'specialist-touchdesigner-native serialized graph stage count missing');
  return {
    graphHintOperatorPipe: stubA.graphHint === 'operator-pipe' ? 1 : 0,
    outputHintMulti: stubA.outputHint === 'multi-output' ? 1 : 0,
    coupling: stubA.config.coupling,
    iterations: stubA.config.iterations,
    graphStageCount: packet.stages.length,
    adapterMappingCount: mappings.length,
  };
}

function runSpecialistUnityVfx(): Record<string, number> {
  const stubA = getFutureNativeSpecialistRuntimeStub('specialist-unity-vfx-native');
  const stubB = getFutureNativeSpecialistRuntimeStub('specialist-unity-vfx-native');
  const packet = buildFutureNativeUnityVfxGraphPacket();
  const mappings = buildFutureNativeUnityVfxAdapterMappings();
  const serializedGraph = serializeFutureNativeUnityVfxGraphPacket();
  assert(JSON.stringify(stubA) === JSON.stringify(stubB), 'specialist-unity-vfx-native stub must be deterministic');
  assert(stubA.graphHint === 'graph-stage', 'specialist-unity-vfx-native graph hint mismatch');
  assert(stubA.outputHint === 'multi-output', 'specialist-unity-vfx-native output hint mismatch');
  assert(stubA.config.familyId === 'specialist-unity-vfx-native', 'specialist-unity-vfx-native config family mismatch');
  assert(stubA.config.solverDepth === 'deep', 'specialist-unity-vfx-native solver depth mismatch');
  assert(stubA.config.iterations === 1, 'specialist-unity-vfx-native iterations mismatch');
  assert(packet.familyId === 'specialist-unity-vfx-native', 'specialist-unity-vfx-native graph packet family mismatch');
  assert(packet.stages.length === 3, 'specialist-unity-vfx-native graph stage count mismatch');
  assert(packet.stages.every((stage) => stage.nodes.length >= 1), 'specialist-unity-vfx-native graph stage nodes missing');
  assert(packet.outputBridges.length >= 3, 'specialist-unity-vfx-native output bridges too small');
  assert(mappings.length >= 3, 'specialist-unity-vfx-native adapter mappings too small');
  assert(mappings.every((mapping) => !mapping.nativeNodeId.startsWith('product-pack-')), 'specialist-unity-vfx-native native nodes should not depend on pack ids');
  assert(serializedGraph.values.some((value) => value.startsWith('stageCount:3')), 'specialist-unity-vfx-native serialized graph stage count missing');
  return {
    graphHintGraphStage: stubA.graphHint === 'graph-stage' ? 1 : 0,
    outputHintMulti: stubA.outputHint === 'multi-output' ? 1 : 0,
    coupling: stubA.config.coupling,
    iterations: stubA.config.iterations,
    graphStageCount: packet.stages.length,
    adapterMappingCount: mappings.length,
  };
}

const implementationPacket = buildFutureNativeFamilyImplementationPacket(familyId);
const serialized = mergeFutureNativeFamilySerializedBlock(familyId);
assert(implementationPacket.starterRuntime.files.length >= 6, 'starter runtime files missing');
assert(implementationPacket.acceptance.mustPass.length >= 3, 'acceptance checklist too small');
assert(serialized.familyId === familyId, 'serialized block family mismatch');

let stats: Record<string, number>;
switch (familyId) {
  case 'pbd-rope':
    stats = runPbdRope();
    break;
  case 'mpm-granular':
    stats = runMpmGranular();
    break;
  case 'mpm-viscoplastic':
    stats = runMpmViscoplastic();
    break;
  case 'mpm-snow':
    stats = runMpmSnow();
    break;
  case 'mpm-mud':
    stats = runMpmMud();
    break;
  case 'mpm-paste':
    stats = runMpmPaste();
    break;
  case 'fracture-lattice':
    stats = runFractureLattice();
    break;
  case 'fracture-voxel':
    stats = runFractureLattice('fracture-voxel', {
      width: 10,
      height: 6,
      impactRadius: 0.24,
      impulseMagnitude: 1.72,
      directionalBias: 0.58,
      splitAffinity: 0.62,
      fragmentDetachThreshold: 0.11,
      debrisSpawnRate: 0.44,
      seed: 11,
    });
    break;
  case 'fracture-crack-propagation':
    stats = runFractureLattice('fracture-crack-propagation', {
      width: 9,
      height: 5,
      impulseThreshold: 0.62,
      debrisSpawnRate: 0.16,
      impactRadius: 0.18,
      impulseMagnitude: 1.58,
      propagationFalloff: 0.12,
      propagationDirectionX: 0.96,
      propagationDirectionY: -0.22,
      directionalBias: 0.78,
      debrisImpulseScale: 0.88,
      splitAffinity: 0.68,
      fragmentDetachThreshold: 0.06,
      seed: 17,
    });
    break;
  case 'fracture-debris-generation':
    stats = runFractureLattice('fracture-debris-generation', {
      width: 9,
      height: 6,
      impulseThreshold: 0.58,
      debrisSpawnRate: 0.5,
      impactRadius: 0.22,
      impulseMagnitude: 1.68,
      propagationFalloff: 0.28,
      propagationDirectionX: 0.72,
      propagationDirectionY: -0.18,
      directionalBias: 0.42,
      debrisImpulseScale: 1.28,
      splitAffinity: 0.72,
      fragmentDetachThreshold: 0.06,
      seed: 23,
    });
    break;
  case 'volumetric-density-transport':
  case 'volumetric-advection':
    stats = runVolumetricDensityTransport();
    break;
  case 'specialist-houdini-native':
    stats = runSpecialistHoudini();
    break;
  case 'specialist-niagara-native':
    stats = runSpecialistNiagara();
    break;
  case 'specialist-touchdesigner-native':
    stats = runSpecialistTouchdesigner();
    break;
  case 'specialist-unity-vfx-native':
    stats = runSpecialistUnityVfx();
    break;
  default:
    throw new Error(`No first-wave verifier registered for ${familyId}`);
}

console.log(`PASS ${familyId}`);
console.log(JSON.stringify({ serialized, stats }, null, 2));
