import { createMpmGranularRuntimeFromInput } from '../lib/future-native-families/starter-runtime/mpm_granularAdapter';
import { buildMpmGranularDebugRenderPayload } from '../lib/future-native-families/starter-runtime/mpm_granularRenderer';
import { getMpmGranularStats, stepMpmGranularRuntime } from '../lib/future-native-families/starter-runtime/mpm_granularSolver';

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

function runMaterialScenario(materialKind: 'sand' | 'snow' | 'mud' | 'paste', overrides: Record<string, number | string>) {
  let runtime = createMpmGranularRuntimeFromInput({
    particleCount: 144,
    particleRadius: 0.018,
    spawnWidth: 0.44,
    spawnHeight: 0.34,
    wallHalfWidth: 0.62,
    floorY: -0.5,
    gravity: 10.2,
    materialKind,
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
    ...(overrides as any),
  });
  const initialStats = getMpmGranularStats(runtime);
  for (let frame = 0; frame < 120; frame += 1) runtime = stepMpmGranularRuntime(runtime, { substeps: 4 });
  return { initialStats, runtime, stats: getMpmGranularStats(runtime), render: buildMpmGranularDebugRenderPayload(runtime) };
}

const sand = runMaterialScenario('sand', {});
assert(sand.stats.particles === 144, 'mpm-granular particle count mismatch');
assert(sand.stats.centerOfMassY < sand.initialStats.centerOfMassY - 0.4, 'mpm-granular center of mass should fall');
assert(sand.stats.floorContacts >= 8, 'mpm-granular sand should accumulate on floor');
assert(sand.stats.pairContacts >= 40, 'mpm-granular pair contacts too low');
assert(sand.stats.spillCount === 0, 'mpm-granular should stay inside bounds');
assert(sand.stats.pileHeight > 0.18, 'mpm-granular pile height too small');
assert(sand.stats.meanSpeed < 0.08, 'mpm-granular should settle');
assert(sand.stats.occupiedCells >= 10, 'mpm-granular should occupy multiple transfer cells');
assert(Math.abs(sand.stats.gridTotalMass - sand.stats.particles) < 1e-6, 'mpm-granular grid mass should match particle mass');
assert(sand.stats.maxCellMass >= 2, 'mpm-granular grid should accumulate cell mass');
assert(sand.stats.transferResidual < 1e-6, 'mpm-granular grid transfer residual too high');
assert(sand.stats.meanPlasticStrain > 0.01, 'mpm-granular plastic strain should accumulate');
assert(sand.stats.meanCompactness > 0.12, 'mpm-granular compactness should increase');
assert(sand.stats.denseCells >= 4, 'mpm-granular dense cells too low');
assert(sand.stats.meanStress > 0.01, 'mpm-granular stress should accumulate');
assert(sand.stats.maxStress >= sand.stats.meanStress, 'mpm-granular max stress invalid');
assert(sand.stats.meanShearStress > 0.001, 'mpm-granular shear stress too low');
assert(sand.stats.apicEnergy > 0.0001, 'mpm-granular APIC energy too low');
assert(sand.render.stats.frame === 120, 'mpm-granular render frame mismatch');
assert((sand.render.points?.length ?? 0) >= 180, 'mpm-granular render points too few');
assert((sand.render.lines?.length ?? 0) >= 80, 'mpm-granular overlay lines too few');
assert((sand.render.stats.overlayCellCount ?? 0) >= 24, 'mpm-granular overlay cell count too low');
assert((sand.render.stats.stressedCellCount ?? 0) >= 8, 'mpm-granular stressed cell count too low');
assert((sand.render.stats.stressLineCount ?? 0) >= 24, 'mpm-granular stress line stats too low');
assert((sand.render.stats.constitutiveOverlayCellCount ?? 0) >= 24, 'mpm-granular constitutive overlay cells missing');
assert((sand.render.stats.constitutiveLineCount ?? 0) >= 24, 'mpm-granular constitutive overlay lines missing');
assert((sand.render.stats.materialSpecificStressFieldCount ?? 0) >= 24, 'mpm-granular material stress field missing');
assert((sand.render.stats.constitutiveShellCellCount ?? 0) >= 24, 'mpm-granular constitutive shell cells missing');
assert((sand.render.stats.constitutiveShellSegmentCount ?? 0) >= 24, 'mpm-granular constitutive shell segments too low');
assert((sand.render.stats.packedRegionRemeshLineCount ?? 0) >= 24, 'mpm-granular packed remesh too weak');
assert((sand.render.stats.maxOverlayStress ?? 0) >= sand.stats.meanStress, 'mpm-granular overlay stress too low');
assert(Array.isArray(sand.render.scalarSamples) && sand.render.scalarSamples.length === 8, 'mpm-granular scalar samples missing');

const snow = runMaterialScenario('snow', {});
assert(snow.stats.meanHardeningState > 0.5, 'mpm-granular snow hardening too weak');
assert(snow.stats.meanStress > 0.1, 'mpm-granular snow stress too low');
assert((snow.render.stats.hardeningOverlayCellCount ?? 0) >= 24, 'mpm-granular snow hardening overlay too weak');
assert((snow.render.stats.hardeningShellSegmentCount ?? 0) >= 24, 'mpm-granular snow hardening shell too weak');

const mud = runMaterialScenario('mud', { floorY: -1.02 });
assert(mud.stats.meanViscosityState > 0.5, 'mpm-granular mud viscosity branch too weak');
assert(mud.stats.meanYieldMemory > 0.1, 'mpm-granular mud yield memory too weak');
assert(mud.stats.materialBranchScore > 1.5, 'mpm-granular mud branch score too low');
assert((mud.render.stats.viscosityOverlayCellCount ?? 0) >= 24, 'mpm-granular mud viscosity overlay too weak');
assert((mud.render.stats.viscosityShellSegmentCount ?? 0) >= 24, 'mpm-granular mud viscosity shell too weak');

const paste = runMaterialScenario('paste', { floorY: -1.02 });
assert(paste.stats.meanYieldMemory > mud.stats.meanYieldMemory, 'mpm-granular paste should retain more yield memory than mud');
assert(paste.stats.meanStress > mud.stats.meanStress, 'mpm-granular paste should retain more stress than mud');
assert(paste.stats.materialBranchScore > mud.stats.materialBranchScore, 'mpm-granular paste branch score should exceed mud');
assert((paste.render.stats.hardeningOverlayCellCount ?? 0) >= 24, 'mpm-granular paste hardening overlay too weak');
assert((paste.render.stats.viscosityOverlayCellCount ?? 0) >= 24, 'mpm-granular paste viscosity overlay too weak');
assert((paste.render.stats.yieldOverlayCellCount ?? 0) >= 24, 'mpm-granular paste yield overlay too weak');
assert((paste.render.stats.yieldDominantOverlayCellCount ?? 0) >= 24, 'mpm-granular paste yield dominant overlay too weak');
assert((paste.render.stats.yieldDominantLineCount ?? 0) >= 12, 'mpm-granular paste yield dominant ridge too weak');
assert((paste.render.stats.yieldDominantCentroidCount ?? 0) >= 1, 'mpm-granular paste yield dominant centroid missing');
assert((paste.render.stats.jammedMaterialSplitModeCount ?? 0) >= 3, 'mpm-granular paste jammed material split missing modes');
assert((paste.render.stats.jammedPasteCoreCellCount ?? 0) >= 8, 'mpm-granular paste core split too weak');
assert((paste.render.stats.jammedMudShearCellCount ?? 0) >= 8, 'mpm-granular paste mud shear split too weak');
assert((paste.render.stats.jammedSnowCrustCellCount ?? 0) >= 8, 'mpm-granular paste snow crust split too weak');
assert((paste.render.stats.jammedSplitLineCount ?? 0) >= 18, 'mpm-granular paste jammed split lines too weak');
assert((paste.render.stats.jammedSplitCentroidCount ?? 0) >= 3, 'mpm-granular paste jammed split centroids missing');
assert((paste.render.stats.constitutiveShellModeCount ?? 0) >= 3, 'mpm-granular paste constitutive shell modes too weak');
assert((paste.render.stats.packedRegionCellCount ?? 0) >= 24, 'mpm-granular paste packed region too small');
assert((paste.render.stats.packedRegionRemeshLineCount ?? 0) >= 48, 'mpm-granular paste packed remesh too weak');
assert((paste.render.stats.packedRegionShellSegmentCount ?? 0) >= 24, 'mpm-granular paste packed shell too weak');
assert((paste.render.stats.packedRegionBandCount ?? 0) >= 4, 'mpm-granular paste packed bands too few');

console.log('PASS mpm-granular-native-starter');
console.log(JSON.stringify({ sand: sand.stats, snow: snow.stats, mud: mud.stats, paste: paste.stats, summary: sand.render.summary }, null, 2));
