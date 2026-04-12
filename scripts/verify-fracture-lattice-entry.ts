import { buildFutureNativeFractureLatticeReportPreview } from '../lib/future-native-families/futureNativeFractureLatticeReportPreview';
import { normalizeFractureLatticeConfig } from '../lib/future-native-families/starter-runtime/fracture_latticeAdapter';
import { buildFractureLatticeDebugRenderPayload } from '../lib/future-native-families/starter-runtime/fracture_latticeRenderer';
import { createFractureLatticeRuntimeState, getFractureLatticeStats, simulateFractureLatticeRuntime } from '../lib/future-native-families/starter-runtime/fracture_latticeSolver';

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

const config = normalizeFractureLatticeConfig({
  width: 10,
  height: 8,
  bondStrength: 1,
  impulseThreshold: 0.72,
  debrisSpawnRate: 0.4,
  impactX: 0.48,
  impactY: 0.56,
  impactRadius: 0.24,
  impulseMagnitude: 1.85,
  propagationFalloff: 0.22,
  propagationDirectionX: 0.92,
  propagationDirectionY: -0.18,
  directionalBias: 0.44,
  debrisImpulseScale: 1.15,
  splitAffinity: 0.6,
  fragmentDetachThreshold: 0.08,
  seed: 11,
});
const stateA = createFractureLatticeRuntimeState(config);
const stateB = createFractureLatticeRuntimeState(config);
assert(JSON.stringify(stateA) === JSON.stringify(stateB), 'fracture-lattice seed must be deterministic');
const steppedA = simulateFractureLatticeRuntime(stateA, 5);
const steppedB = simulateFractureLatticeRuntime(stateB, 5);
assert(JSON.stringify(steppedA) === JSON.stringify(steppedB), 'fracture-lattice stepping must be deterministic');
const stats = getFractureLatticeStats(steppedA);
const render = buildFractureLatticeDebugRenderPayload(steppedA);
assert(stats.broken >= 8, 'fracture-lattice should break a meaningful cluster');
assert(stats.debris >= 2, 'fracture-lattice should spawn debris');
assert(stats.fractureRadius > 0.08, 'fracture-lattice fracture radius too small');
assert(stats.largestBrokenCluster >= 6, 'fracture-lattice cluster coherence too weak');
assert(stats.propagationAdvance > 0.04, 'fracture-lattice propagation advance too small');
assert(stats.detachedFragments >= 1, 'fracture-lattice detached fragments missing');
assert(stats.detachedFragmentNodes >= 2, 'fracture-lattice detached fragment nodes too low');
assert(Array.isArray(render.lines) && render.lines.length >= stats.intact + 12, 'fracture-lattice line payload too small');
assert(Array.isArray(render.points) && render.points.length >= stats.debris, 'fracture-lattice fragment point payload missing');
assert(Array.isArray(render.scalarSamples) && render.scalarSamples.length === 17, 'fracture-lattice scalar samples missing');
assert((stats.breakProgress ?? 0) > 0.06, 'fracture-lattice break progress too small');
assert((stats.recentBreaks ?? 0) >= 2, 'fracture-lattice recent break count too small');
assert((render.stats.crackFrontCount ?? 0) >= 2, 'fracture-lattice crack front count missing');
assert((render.stats.crackFrontLineCount ?? 0) >= 2, 'fracture-lattice crack front lines missing');
assert((render.stats.collapseRingSegmentCount ?? 0) >= 12, 'fracture-lattice collapse ring missing');
assert((render.stats.collapseEnvelopeRadius ?? 0) >= (stats.fractureRadius ?? 0), 'fracture-lattice collapse envelope too small');
assert((render.stats.debrisTrailLineCount ?? 0) >= stats.debris, 'fracture-lattice debris trail lines missing');
assert((render.stats.fragmentLinkLineCount ?? 0) >= 1, 'fracture-lattice fragment links missing');
assert((render.stats.remeshChordCount ?? 0) >= 1, 'fracture-lattice remesh chords missing');
assert((render.stats.voxelCellCount ?? 0) >= 8, 'fracture-lattice voxel cells too low');
assert((render.stats.voxelShellSegmentCount ?? 0) >= 12, 'fracture-lattice voxel shell too small');
assert((render.stats.detachedVoxelCellCount ?? 0) >= 12, 'fracture-lattice detached voxel cells too low');
assert((render.stats.detachedVoxelShellSegmentCount ?? 0) >= 16, 'fracture-lattice detached voxel shell too small');
assert((render.stats.detachedRemeshBondCount ?? 0) >= 4, 'fracture-lattice detached remesh bonds missing');
assert((render.stats.detachedChordCount ?? 0) >= 4, 'fracture-lattice detached remesh chords missing');
assert((render.stats.dustDebrisCount ?? 0) >= 1, 'fracture-lattice dust debris branch missing');
assert((render.stats.shardDebrisCount ?? 0) >= 1, 'fracture-lattice shard debris branch missing');
assert((render.stats.splinterDebrisCount ?? 0) >= 1, 'fracture-lattice splinter debris branch missing');
assert((render.stats.dustCloudPointCount ?? 0) >= 2, 'fracture-lattice dust cloud points missing');
assert((render.stats.shardFacetLineCount ?? 0) >= 1, 'fracture-lattice shard facet lines missing');
assert((render.stats.splinterBranchLineCount ?? 0) >= 3, 'fracture-lattice splinter branch lines missing');
assert((render.stats.brittleBreakCount ?? 0) >= 1, 'fracture-lattice brittle break grammar missing');
assert((render.stats.shearBreakCount ?? 0) >= 1, 'fracture-lattice shear break grammar missing');
assert((render.stats.ductileBreakCount ?? 0) >= 1, 'fracture-lattice ductile break grammar missing');
assert((render.stats.breakGrammarMaterialModes ?? 0) >= 3, 'fracture-lattice break grammar material modes too low');
assert((render.stats.brittleFacetLineCount ?? 0) >= 2, 'fracture-lattice brittle facet lines missing');
assert((render.stats.shearSlipLineCount ?? 0) >= 2, 'fracture-lattice shear slip lines missing');
assert((render.stats.ductileBridgeLineCount ?? 0) >= 2, 'fracture-lattice ductile bridge lines missing');
assert((render.stats.siblingDensityCellCount ?? 0) >= 12, 'fracture-lattice sibling density cells too low');
assert((render.stats.siblingDensityLineCount ?? 0) >= 24, 'fracture-lattice sibling density lines too low');
assert((render.stats.siblingFractureBandCount ?? 0) >= 2, 'fracture-lattice sibling fracture bands too low');
assert((render.stats.siblingCoreCellCount ?? 0) >= 1, 'fracture-lattice sibling core cells missing');
assert((render.stats.siblingHaloCellCount ?? 0) >= 1, 'fracture-lattice sibling halo cells missing');
assert((render.stats.siblingWakeCellCount ?? 0) >= 1, 'fracture-lattice sibling wake cells missing');
assert((render.stats.siblingDensityPeak ?? 0) > 0.5, 'fracture-lattice sibling density peak too low');
assert((render.stats.siblingCentroidCount ?? 0) >= 2, 'fracture-lattice sibling centroids missing');
assert((render.stats.siblingBridgeLineCount ?? 0) >= 4, 'fracture-lattice sibling bridge lines missing');
const preview = buildFutureNativeFractureLatticeReportPreview();
assert(preview.routeCount >= 2, 'fracture-lattice preview route count too small');
assert(preview.presetCount >= 2, 'fracture-lattice preview preset count too small');
assert(preview.previewSignature.includes('fracture'), 'fracture-lattice preview signature missing fracture label');
console.log('PASS fracture-lattice');
console.log(JSON.stringify({ stats, renderStats: render.stats, preview }, null, 2));
