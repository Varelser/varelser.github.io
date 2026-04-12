import { normalizeConfig } from '../lib/appStateConfig';
import { buildFutureNativeSceneBridgeDescriptor, createFutureNativeSceneBridgeRuntime } from '../lib/future-native-families/futureNativeSceneRendererBridge';
import { buildFutureNativeScenePresetPatch, getFutureNativeSceneBinding } from '../lib/future-native-families/futureNativeSceneBindings';
import { getLayerSceneRenderPlan } from '../lib/sceneRenderRouting';
import type { Layer2Type } from '../types';

declare const process: { env: Record<string, string | undefined> };

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const allCases: Array<{ mode: Layer2Type; familyId: string }> = [
  { mode: 'cloth_membrane', familyId: 'pbd-cloth' },
  { mode: 'elastic_sheet', familyId: 'pbd-membrane' },
  { mode: 'viscoelastic_membrane', familyId: 'pbd-membrane' },
  { mode: 'surface_shell', familyId: 'pbd-softbody' },
  { mode: 'elastic_lattice', familyId: 'pbd-softbody' },
  { mode: 'plasma_thread', familyId: 'pbd-rope' },
  { mode: 'signal_braid', familyId: 'pbd-rope' },
  { mode: 'aurora_threads', familyId: 'pbd-rope' },
  { mode: 'granular_fall', familyId: 'mpm-granular' },
  { mode: 'jammed_pack', familyId: 'mpm-granular' },
  { mode: 'viscous_flow', familyId: 'mpm-viscoplastic' },
  { mode: 'melt_front', familyId: 'mpm-viscoplastic' },
  { mode: 'evaporative_sheet', familyId: 'mpm-viscoplastic' },
  { mode: 'ashfall', familyId: 'mpm-snow' },
  { mode: 'sediment_stack', familyId: 'mpm-mud' },
  { mode: 'talus_heap', familyId: 'mpm-mud' },
  { mode: 'liquid_smear', familyId: 'mpm-mud' },
  { mode: 'capillary_sheet', familyId: 'mpm-paste' },
  { mode: 'percolation_sheet', familyId: 'mpm-paste' },
  { mode: 'crawl_seep', familyId: 'mpm-paste' },
  { mode: 'frost_lattice', familyId: 'mpm-snow' },
  { mode: 'avalanche_field', familyId: 'mpm-snow' },
  { mode: 'fracture_grammar', familyId: 'fracture-lattice' },
  { mode: 'collapse_fracture', familyId: 'fracture-lattice' },
  { mode: 'voxel_lattice', familyId: 'fracture-voxel' },
  { mode: 'seep_fracture', familyId: 'fracture-crack-propagation' },
  { mode: 'shard_debris', familyId: 'fracture-debris-generation' },
  { mode: 'orbit_fracture', familyId: 'fracture-debris-generation' },
  { mode: 'fracture_pollen', familyId: 'fracture-debris-generation' },
  { mode: 'prism_smoke', familyId: 'volumetric-smoke' },
  { mode: 'static_smoke', familyId: 'volumetric-smoke' },
  { mode: 'condense_field', familyId: 'volumetric-advection' },
  { mode: 'sublimate_cloud', familyId: 'volumetric-advection' },
  { mode: 'vortex_transport', familyId: 'volumetric-pressure-coupling' },
  { mode: 'pressure_cells', familyId: 'volumetric-pressure-coupling' },
  { mode: 'charge_veil', familyId: 'volumetric-light-shadow-coupling' },
  { mode: 'velvet_ash', familyId: 'volumetric-light-shadow-coupling' },
];


const representativeModes = new Set<Layer2Type>([
  'cloth_membrane',
  'elastic_sheet',
  'surface_shell',
  'signal_braid',
  'granular_fall',
  'viscous_flow',
  'ashfall',
  'sediment_stack',
  'capillary_sheet',
  'fracture_grammar',
  'voxel_lattice',
  'seep_fracture',
  'shard_debris',
  'prism_smoke',
  'condense_field',
  'vortex_transport',
  'charge_veil',
]);

const scope = process.env.FUTURE_NATIVE_RENDER_HANDOFF_SCOPE === 'full' ? 'full' : 'representative';
const cases = scope === 'full' ? allCases : allCases.filter(({ mode }) => representativeModes.has(mode));

function sourceForMode(mode: Layer2Type) {
  switch (mode) {
    case 'surface_shell':
      return 'sphere';
    case 'elastic_lattice':
    case 'jammed_pack':
      return 'cube';
    case 'plasma_thread':
      return 'cylinder';
    case 'signal_braid':
      return 'text';
    case 'aurora_threads':
      return 'ring';
    case 'fracture_grammar':
      return 'grid';
    case 'voxel_lattice':
      return 'cube';
    case 'seep_fracture':
      return 'image';
    case 'shard_debris':
      return 'sphere';
    case 'orbit_fracture':
      return 'ring';
    case 'fracture_pollen':
      return 'text';
    case 'viscous_flow':
      return 'plane';
    case 'melt_front':
      return 'sphere';
    case 'evaporative_sheet':
      return 'plane';
    case 'ashfall':
      return 'video';
    case 'sediment_stack':
      return 'plane';
    case 'talus_heap':
      return 'sphere';
    case 'liquid_smear':
      return 'plane';
    case 'capillary_sheet':
      return 'text';
    case 'percolation_sheet':
      return 'image';
    case 'crawl_seep':
      return 'plane';
    case 'frost_lattice':
      return 'cube';
    case 'avalanche_field':
      return 'plane';
    case 'granular_fall':
    case 'collapse_fracture':
      return 'sphere';
    case 'sublimate_cloud':
      return 'ring';
    case 'prism_smoke':
      return 'video';
    case 'static_smoke':
      return 'grid';
    case 'charge_veil':
      return 'video';
    case 'velvet_ash':
      return 'plane';
    default:
      return 'plane';
  }
}

const report = cases.map(({ mode, familyId }) => {
  const binding = getFutureNativeSceneBinding(mode);
  const presetPatch = binding ? buildFutureNativeScenePresetPatch(binding.primaryPresetId, 2) : null;
  const config = normalizeConfig({
    ...(presetPatch ?? {}),
    layer2Enabled: true,
    layer2Type: mode,
    layer2Source: sourceForMode(mode),
    layer2Count: mode === 'surface_shell' ? 3600 : mode === 'granular_fall' ? 3400 : mode === 'jammed_pack' ? 3200 : mode === 'viscous_flow' ? 3300 : mode === 'melt_front' ? 3000 : mode === 'evaporative_sheet' ? 2800 : mode === 'ashfall' ? 3200 : mode === 'sediment_stack' ? 3350 : mode === 'talus_heap' ? 3200 : mode === 'liquid_smear' ? 3000 : mode === 'capillary_sheet' ? 9800 : mode === 'percolation_sheet' ? 9600 : mode === 'crawl_seep' ? 9200 : mode === 'frost_lattice' ? 2800 : mode === 'avalanche_field' ? 3500 : mode === 'seep_fracture' ? 2800 : mode === 'shard_debris' ? 3100 : mode === 'orbit_fracture' ? 3000 : mode === 'fracture_pollen' ? 2800 : 3100,
    layer2RadiusScale: mode === 'cloth_membrane' ? 1.12 : mode === 'sublimate_cloud' ? 1.04 : mode === 'sediment_stack' ? 1.02 : mode === 'talus_heap' ? 1.08 : mode === 'liquid_smear' ? 1.06 : mode === 'capillary_sheet' ? 1.04 : mode === 'percolation_sheet' ? 1.08 : mode === 'crawl_seep' ? 1.06 : mode === 'frost_lattice' ? 1.02 : mode === 'avalanche_field' ? 1.1 : mode === 'fracture_pollen' ? 0.96 : 1.08,
    layer2BaseSize: mode === 'surface_shell' ? 0.88 : mode === 'granular_fall' ? 0.74 : mode === 'jammed_pack' ? 0.78 : mode === 'viscous_flow' ? 0.88 : mode === 'melt_front' ? 0.92 : mode === 'evaporative_sheet' ? 1.02 : mode === 'ashfall' ? 0.78 : mode === 'sediment_stack' ? 0.82 : mode === 'talus_heap' ? 0.76 : mode === 'liquid_smear' ? 0.96 : mode === 'capillary_sheet' ? 0.9 : mode === 'percolation_sheet' ? 0.94 : mode === 'crawl_seep' ? 1.02 : mode === 'frost_lattice' ? 0.84 : mode === 'avalanche_field' ? 0.72 : mode === 'seep_fracture' ? 0.8 : mode === 'shard_debris' ? 0.78 : mode === 'orbit_fracture' ? 0.76 : mode === 'fracture_pollen' ? 0.86 : mode === 'condense_field' ? 1.06 : mode === 'sublimate_cloud' ? 1.12 : 0.96,
    layer2TemporalStrength: mode === 'capillary_sheet' ? 0.3 : 0.24,
    layer2TemporalSpeed: mode === 'crawl_seep' ? 0.24 : 0.18,
    layer2WindX: 0.18,
    layer2WindY: 0.06,
    layer2ConnectionEnabled: true,
    layer2GlyphOutlineEnabled: true,
    layer2AuxEnabled: true,
    layer2SparkEnabled: true,
  });

  const runtime = createFutureNativeSceneBridgeRuntime(config, 2);
  assert(runtime, `${mode}: future-native runtime missing`);
  const descriptor = buildFutureNativeSceneBridgeDescriptor(runtime, config, 2);
  const plan = getLayerSceneRenderPlan(config, 2);

  assert(descriptor.familyId === familyId, `${mode}: descriptor family mismatch`);
  assert(descriptor.sceneScale >= 120, `${mode}: scene scale too small`);
  if (familyId === 'fracture-lattice') {
    assert(descriptor.lineCount > 24, `${mode}: fracture line count too small`);
    assert(descriptor.pointCount >= 4, `${mode}: fracture point count too small`);
    assert(descriptor.bindingMode === 'native-structure', `${mode}: fracture binding mode should be native-structure`);
    assert((descriptor.stats.breakProgress ?? 0) > 0.02, `${mode}: fracture break progress missing`);
    assert((descriptor.stats.crackFrontCount ?? 0) >= 1, `${mode}: fracture crack front missing`);
    assert((descriptor.stats.collapseRingSegmentCount ?? 0) >= 12, `${mode}: fracture collapse ring missing`);
    assert((descriptor.stats.collapseEnvelopeRadius ?? 0) >= (descriptor.stats.fractureRadius ?? 0), `${mode}: fracture collapse envelope too small`);
    assert((descriptor.stats.debrisTrailLineCount ?? 0) >= 2, `${mode}: fracture debris trails missing`);
    assert((descriptor.stats.fragmentLinkLineCount ?? 0) >= 1, `${mode}: fracture fragment links missing`);
    assert((descriptor.stats.remeshChordCount ?? 0) >= 1, `${mode}: fracture remesh chords missing`);
    assert((descriptor.stats.voxelCellCount ?? 0) >= 8, `${mode}: fracture voxel cells missing`);
    assert((descriptor.stats.voxelShellSegmentCount ?? 0) >= 12, `${mode}: fracture voxel shell too small`);
    assert((descriptor.stats.detachedVoxelCellCount ?? 0) >= 12, `${mode}: fracture detached voxel cells missing`);
    assert((descriptor.stats.detachedVoxelShellSegmentCount ?? 0) >= 16, `${mode}: fracture detached voxel shell too small`);
    assert((descriptor.stats.detachedRemeshBondCount ?? 0) >= 4, `${mode}: fracture detached remesh bonds missing`);
    assert((descriptor.stats.detachedChordCount ?? 0) >= 4, `${mode}: fracture detached remesh chords missing`);
    assert((descriptor.stats.dustDebrisCount ?? 0) >= 1, `${mode}: fracture dust debris branch missing`);
    assert((descriptor.stats.shardDebrisCount ?? 0) >= 1, `${mode}: fracture shard debris branch missing`);
    assert((descriptor.stats.splinterDebrisCount ?? 0) >= 1, `${mode}: fracture splinter debris branch missing`);
    assert((descriptor.stats.dustCloudPointCount ?? 0) >= 2, `${mode}: fracture dust cloud points missing`);
    assert((descriptor.stats.shardFacetLineCount ?? 0) >= 1, `${mode}: fracture shard facet lines missing`);
    assert((descriptor.stats.splinterBranchLineCount ?? 0) >= 3, `${mode}: fracture splinter branch lines missing`);
    assert((descriptor.stats.brittleBreakCount ?? 0) >= 1, `${mode}: fracture brittle break grammar missing`);
    assert((descriptor.stats.shearBreakCount ?? 0) >= 1, `${mode}: fracture shear break grammar missing`);
    assert((descriptor.stats.ductileBreakCount ?? 0) >= 1, `${mode}: fracture ductile break grammar missing`);
    assert((descriptor.stats.breakGrammarMaterialModes ?? 0) >= 3, `${mode}: fracture break grammar modes too low`);
    assert((descriptor.stats.brittleFacetLineCount ?? 0) >= 2, `${mode}: fracture brittle facet lines missing`);
    assert((descriptor.stats.shearSlipLineCount ?? 0) >= 2, `${mode}: fracture shear slip lines missing`);
    assert((descriptor.stats.ductileBridgeLineCount ?? 0) >= 2, `${mode}: fracture ductile bridge lines missing`);
    assert((descriptor.stats.siblingDensityCellCount ?? 0) >= 8, `${mode}: fracture sibling density cells missing`);
    assert((descriptor.stats.siblingDensityLineCount ?? 0) >= 16, `${mode}: fracture sibling density lines too low`);
    assert((descriptor.stats.siblingFractureBandCount ?? 0) >= 2, `${mode}: fracture sibling bands too low`);
    assert((descriptor.stats.siblingCoreCellCount ?? 0) >= 1, `${mode}: fracture sibling core cells missing`);
    assert((descriptor.stats.siblingHaloCellCount ?? 0) >= 1, `${mode}: fracture sibling halo cells missing`);
    assert((descriptor.stats.siblingWakeCellCount ?? 0) >= 1, `${mode}: fracture sibling wake cells missing`);
    assert((descriptor.stats.siblingDensityPeak ?? 0) > 0.5, `${mode}: fracture sibling density peak too low`);
    assert((descriptor.stats.siblingCentroidCount ?? 0) >= 2, `${mode}: fracture sibling centroids missing`);
    assert((descriptor.stats.siblingBridgeLineCount ?? 0) >= 4, `${mode}: fracture sibling bridge lines missing`);
  } else if (familyId === 'fracture-voxel') {
    assert(descriptor.lineCount > 24, `${mode}: voxel fracture line count too small`);
    assert(descriptor.pointCount >= 8, `${mode}: voxel fracture point count too small`);
    assert(descriptor.bindingMode === 'native-structure', `${mode}: voxel fracture binding mode should be native-structure`);
    assert((descriptor.stats.breakProgress ?? 0) > 0.02, `${mode}: voxel fracture break progress missing`);
    assert((descriptor.stats.crackFrontCount ?? 0) >= 1, `${mode}: voxel fracture crack front missing`);
    assert((descriptor.stats.voxelCellCount ?? 0) >= 12, `${mode}: voxel fracture cell count too low`);
    assert((descriptor.stats.voxelShellSegmentCount ?? 0) >= 12, `${mode}: voxel fracture shell too small`);
    assert((descriptor.stats.detachedVoxelCellCount ?? 0) >= 12, `${mode}: voxel fracture detached cell count too low`);
    assert((descriptor.stats.detachedVoxelShellSegmentCount ?? 0) >= 16, `${mode}: voxel fracture detached shell too small`);
    assert((descriptor.stats.breakGrammarMaterialModes ?? 0) >= 3, `${mode}: voxel fracture grammar modes too low`);
    assert((descriptor.stats.siblingFractureBandCount ?? 0) >= 2, `${mode}: voxel fracture sibling bands too low`);
  } else if (familyId === 'fracture-crack-propagation') {
    assert(descriptor.lineCount > 24, `${mode}: crack propagation line count too small`);
    assert(descriptor.pointCount >= 6, `${mode}: crack propagation point count too small`);
    assert(descriptor.bindingMode === 'native-structure', `${mode}: crack propagation binding mode should be native-structure`);
    assert((descriptor.stats.breakProgress ?? 0) > 0.03, `${mode}: crack propagation break progress missing`);
    assert((descriptor.stats.crackFrontCount ?? 0) >= 2, `${mode}: crack propagation crack front missing`);
    assert((descriptor.stats.crackFrontLineCount ?? 0) >= 2, `${mode}: crack propagation crack front lines missing`);
    assert((descriptor.stats.crackFrontRadius ?? 0) > 0.08, `${mode}: crack propagation radius too small`);
    assert((descriptor.stats.propagationAdvance ?? 0) > 0.04, `${mode}: crack propagation advance too small`);
    assert((descriptor.stats.breakGrammarMaterialModes ?? 0) >= 3, `${mode}: crack propagation grammar modes too low`);
    assert((descriptor.stats.siblingFractureBandCount ?? 0) >= 2, `${mode}: crack propagation sibling bands too low`);
    assert((descriptor.stats.detachedFragments ?? 0) >= 1, `${mode}: crack propagation detached fragments missing`);
  } else if (familyId === 'fracture-debris-generation') {
    assert(descriptor.lineCount > 32, `${mode}: debris-generation line count too small`);
    assert(descriptor.pointCount >= 12, `${mode}: debris-generation point count too small`);
    assert(descriptor.bindingMode === 'native-structure', `${mode}: debris-generation binding mode should be native-structure`);
    assert((descriptor.stats.breakProgress ?? 0) > 0.03, `${mode}: debris-generation break progress missing`);
    assert((descriptor.stats.debris ?? 0) >= 2, `${mode}: debris-generation debris count too low`);
    assert((descriptor.stats.debrisTrailLineCount ?? 0) >= 4, `${mode}: debris-generation trail lines missing`);
    assert((descriptor.stats.dustDebrisCount ?? 0) >= 1, `${mode}: debris-generation dust branch missing`);
    assert((descriptor.stats.shardDebrisCount ?? 0) >= 1, `${mode}: debris-generation shard branch missing`);
    assert((descriptor.stats.splinterDebrisCount ?? 0) >= 1, `${mode}: debris-generation splinter branch missing`);
    assert((descriptor.stats.dustCloudPointCount ?? 0) >= 2, `${mode}: debris-generation dust cloud missing`);
    assert((descriptor.stats.shardFacetLineCount ?? 0) >= 1, `${mode}: debris-generation shard facets missing`);
    assert((descriptor.stats.splinterBranchLineCount ?? 0) >= 3, `${mode}: debris-generation splinter branches missing`);
    assert((descriptor.stats.fragmentLinkLineCount ?? 0) >= 1, `${mode}: debris-generation fragment links missing`);
    assert((descriptor.stats.detachedFragments ?? 0) >= 1, `${mode}: debris-generation detached fragments missing`);
    assert((descriptor.stats.breakGrammarMaterialModes ?? 0) >= 1, `${mode}: debris-generation grammar modes missing`);
    assert((descriptor.stats.siblingFractureBandCount ?? 0) >= 2, `${mode}: debris-generation sibling bands too low`);
  } else if (familyId === 'pbd-rope') {
    assert(descriptor.pointCount > 12, `${mode}: rope point count too small`);
    assert(descriptor.lineCount > 12, `${mode}: rope line count too small`);
    assert(descriptor.bindingMode === 'native-structure', `${mode}: rope binding mode should be native-structure`);
    assert((descriptor.stats.segmentCount ?? 0) >= 16, `${mode}: rope segment count too small`);
    assert((descriptor.stats.anchorCount ?? 0) >= 1, `${mode}: rope anchor count missing`);
    assert((descriptor.stats.averageBendDeviation ?? 1) < 0.2, `${mode}: rope bend deviation too high`);
    assert((descriptor.stats.strandCount ?? 0) >= 1, `${mode}: rope strand count missing`);
    assert((descriptor.stats.bundlePointCount ?? 0) >= descriptor.pointCount, `${mode}: rope bundle point count mismatch`);
    assert((descriptor.stats.bundleLineCount ?? 0) >= descriptor.lineCount, `${mode}: rope bundle line count mismatch`);
    if (mode === 'signal_braid') {
      assert((descriptor.stats.strandCount ?? 0) >= 2, `${mode}: braid strand count too small`);
      assert(descriptor.pointCount >= 96, `${mode}: braid point count too small`);
      assert(descriptor.lineCount >= 120, `${mode}: braid line count too small`);
      assert((descriptor.stats.braidCrossLinks ?? 0) >= 10, `${mode}: braid cross links missing`);
      assert((descriptor.stats.knotLoopCount ?? 0) >= 2, `${mode}: braid knot loops missing`);
      assert((descriptor.stats.tangleLinkCount ?? 0) >= 4, `${mode}: braid tangle links missing`);
      assert((descriptor.stats.tensionBandCount ?? 0) >= 2, `${mode}: braid tension bands missing`);
      assert((descriptor.stats.tensionStrandCount ?? 0) >= 4, `${mode}: braid tension strands missing`);
      assert((descriptor.stats.sagArcCount ?? 0) >= 2, `${mode}: braid sag arcs missing`);
      assert((descriptor.stats.snapMarkerCount ?? 0) >= 2, `${mode}: braid snap markers missing`);
      assert((descriptor.stats.tensionFieldLayerCount ?? 0) >= 6, `${mode}: braid tension field layers missing`);
      assert((descriptor.stats.snapStateClusterCount ?? 0) >= 2, `${mode}: braid snap state clusters missing`);
      assert((descriptor.stats.breakClusterLayerCount ?? 0) >= 4, `${mode}: braid break cluster layers missing`);
      assert((descriptor.stats.looseEndFieldSplitCount ?? 0) >= 4, `${mode}: braid loose-end field split missing`);
      assert((descriptor.stats.shellFieldCouplingCount ?? 0) >= 2, `${mode}: braid shell-field coupling missing`);
      assert((descriptor.stats.looseEndWakeSplitCount ?? 0) >= 2, `${mode}: braid loose-end wake split missing`);
      assert((descriptor.stats.knotWakeClusterCount ?? 0) >= 2, `${mode}: braid knot-wake clustering missing`);
      assert((descriptor.stats.breakShellFieldSplitCount ?? 0) >= 2, `${mode}: braid break-shell field split missing`);
      assert((descriptor.stats.shellWakeBraidRefinementCount ?? 0) >= 2, `${mode}: braid shell-wake braid refinement missing`);
      assert((descriptor.stats.breakFieldTurbulenceClusterCount ?? 0) >= 2, `${mode}: braid break-field turbulence clustering missing`);
      assert((descriptor.stats.shellWakeFieldRefinementCount ?? 0) >= 2, `${mode}: braid shell-wake field refinement missing`);
      assert((descriptor.stats.breakFieldWakeShellClusterCount ?? 0) >= 2, `${mode}: braid break-field wake shell clustering missing`);
      assert((descriptor.stats.shellWakeFieldBraidTurbulenceRefinementCount ?? 0) >= 2, `${mode}: braid shell-wake field braid turbulence refinement missing`);
      assert((descriptor.stats.breakFieldWakeShellFieldTurbulenceSplitCount ?? 0) >= 2, `${mode}: braid break-field wake shell field turbulence split missing`);
    }
    if (mode === 'aurora_threads') {
      assert((descriptor.stats.strandCount ?? 0) >= 4, `${mode}: canopy strand count too small`);
      assert(descriptor.pointCount >= 200, `${mode}: canopy point count too small`);
      assert(descriptor.lineCount >= 210, `${mode}: canopy line count too small`);
      assert((descriptor.stats.canopyBridgeCount ?? 0) >= 20, `${mode}: canopy bridge count too small`);
      assert((descriptor.stats.bundleSpread ?? 0) > 0, `${mode}: canopy spread missing`);
      assert((descriptor.stats.hierarchyBundleCount ?? 0) >= 2, `${mode}: canopy hierarchy bundles missing`);
      assert((descriptor.stats.hierarchyLinkCount ?? 0) >= 8, `${mode}: canopy hierarchy links missing`);
      assert((descriptor.stats.curtainRibCount ?? 0) >= 6, `${mode}: canopy curtain ribs missing`);
      assert((descriptor.stats.tensionStrandCount ?? 0) >= 4, `${mode}: canopy tension strands missing`);
      assert((descriptor.stats.sagArcCount ?? 0) >= 2, `${mode}: canopy sag arcs missing`);
      assert((descriptor.stats.snapMarkerCount ?? 0) >= 2, `${mode}: canopy snap markers missing`);
      assert((descriptor.stats.tensionFieldLayerCount ?? 0) >= 6, `${mode}: canopy tension field layers missing`);
      assert((descriptor.stats.snapStateClusterCount ?? 0) >= 2, `${mode}: canopy snap state clusters missing`);
      assert((descriptor.stats.breakClusterLayerCount ?? 0) >= 4, `${mode}: canopy break cluster layers missing`);
      assert((descriptor.stats.looseEndFieldSplitCount ?? 0) >= 4, `${mode}: canopy loose-end field split missing`);
      assert((descriptor.stats.shellFieldCouplingCount ?? 0) >= 2, `${mode}: canopy shell-field coupling missing`);
      assert((descriptor.stats.looseEndWakeSplitCount ?? 0) >= 2, `${mode}: canopy loose-end wake split missing`);
      assert((descriptor.stats.knotWakeClusterCount ?? 0) >= 2, `${mode}: canopy knot-wake clustering missing`);
      assert((descriptor.stats.breakShellFieldSplitCount ?? 0) >= 2, `${mode}: canopy break-shell field split missing`);
      assert((descriptor.stats.shellWakeBraidRefinementCount ?? 0) >= 2, `${mode}: canopy shell-wake braid refinement missing`);
      assert((descriptor.stats.breakFieldTurbulenceClusterCount ?? 0) >= 2, `${mode}: canopy break-field turbulence clustering missing`);
      assert((descriptor.stats.shellWakeFieldRefinementCount ?? 0) >= 2, `${mode}: canopy shell-wake field refinement missing`);
      assert((descriptor.stats.breakFieldWakeShellClusterCount ?? 0) >= 2, `${mode}: canopy break-field wake shell clustering missing`);
      assert((descriptor.stats.shellWakeFieldBraidTurbulenceRefinementCount ?? 0) >= 2, `${mode}: canopy shell-wake field braid turbulence refinement missing`);
      assert((descriptor.stats.breakFieldWakeShellFieldTurbulenceSplitCount ?? 0) >= 2, `${mode}: canopy break-field wake shell field turbulence split missing`);
    }
  } else if (familyId === 'mpm-granular') {
    assert(descriptor.pointCount > 24, `${mode}: granular point count too small`);
    assert(descriptor.lineCount >= 32, `${mode}: granular overlay lines missing`);
    assert(descriptor.bindingMode === 'native-particles', `${mode}: granular binding mode should be native-particles`);
    assert((descriptor.stats.occupiedCells ?? 0) > 8, `${mode}: granular occupied cells missing`);
    assert((descriptor.stats.overlayCellCount ?? 0) >= 16, `${mode}: granular overlay cell count too low`);
    assert((descriptor.stats.stressLineCount ?? 0) >= 24, `${mode}: granular stress line stats missing`);
    assert((descriptor.stats.constitutiveOverlayCellCount ?? 0) >= 16, `${mode}: granular constitutive overlay cells missing`);
    assert((descriptor.stats.constitutiveLineCount ?? 0) >= 16, `${mode}: granular constitutive overlay lines missing`);
    assert((descriptor.stats.materialSpecificStressFieldCount ?? 0) >= 16, `${mode}: granular material stress field missing`);
    assert((descriptor.stats.constitutiveShellCellCount ?? 0) >= 16, `${mode}: granular constitutive shell cells missing`);
    assert((descriptor.stats.constitutiveShellSegmentCount ?? 0) >= 12, `${mode}: granular constitutive shell too weak`);
    assert((descriptor.stats.packedRegionRemeshLineCount ?? 0) >= 12, `${mode}: granular packed remesh missing`);
    assert((descriptor.stats.maxOverlayStress ?? 0) >= (descriptor.stats.meanStress ?? 0), `${mode}: granular overlay stress too low`);
    if (mode === 'granular_fall') {
      assert((descriptor.stats.hardeningOverlayCellCount ?? 0) >= 16, `${mode}: granular hardening overlay missing`);
      assert((descriptor.stats.hardeningCentroidCount ?? 0) >= 1, `${mode}: granular hardening centroid missing`);
    }
    if (mode === 'jammed_pack') {
      assert((descriptor.stats.viscosityOverlayCellCount ?? 0) >= 16, `${mode}: granular viscosity overlay missing`);
      assert((descriptor.stats.hardeningOverlayCellCount ?? 0) >= 8, `${mode}: granular hardening overlay too low`);
      assert((descriptor.stats.viscosityCentroidCount ?? 0) >= 1, `${mode}: granular viscosity centroid missing`);
      assert((descriptor.stats.yieldDominantOverlayCellCount ?? 0) >= 6, `${mode}: granular yield dominant overlay missing`);
      assert((descriptor.stats.yieldDominantCentroidCount ?? 0) >= 1, `${mode}: granular yield dominant centroid missing`);
      assert((descriptor.stats.jammedMaterialSplitModeCount ?? 0) >= 3, `${mode}: granular jammed split modes missing`);
      assert((descriptor.stats.jammedPasteCoreCellCount ?? 0) >= 12, `${mode}: granular paste core split too weak`);
      assert((descriptor.stats.jammedMudShearCellCount ?? 0) >= 3, `${mode}: granular mud shear split too weak`);
      assert((descriptor.stats.jammedSnowCrustCellCount ?? 0) >= 24, `${mode}: granular snow crust split too weak`);
      assert((descriptor.stats.jammedSplitCentroidCount ?? 0) >= 3, `${mode}: granular jammed split centroid missing`);
      assert((descriptor.stats.hardeningShellSegmentCount ?? 0) >= 24, `${mode}: granular hardening shell too weak`);
      assert((descriptor.stats.viscosityShellSegmentCount ?? 0) >= 24, `${mode}: granular viscosity shell too weak`);
      assert((descriptor.stats.packedRegionCellCount ?? 0) >= 24, `${mode}: granular packed region too small`);
      assert((descriptor.stats.packedRegionShellSegmentCount ?? 0) >= 24, `${mode}: granular packed shell too weak`);
      assert((descriptor.stats.packedRegionBandCount ?? 0) >= 4, `${mode}: granular packed bands too few`);
    }
  } else if (familyId === 'mpm-viscoplastic') {
    assert(descriptor.pointCount > 24, `${mode}: viscoplastic point count too small`);
    assert(descriptor.lineCount >= 32, `${mode}: viscoplastic overlay lines missing`);
    assert(descriptor.bindingMode === 'native-particles', `${mode}: viscoplastic binding mode should be native-particles`);
    assert((descriptor.stats.occupiedCells ?? 0) > 8, `${mode}: viscoplastic occupied cells missing`);
    assert((descriptor.stats.overlayCellCount ?? 0) >= 16, `${mode}: viscoplastic overlay cell count too low`);
    assert((descriptor.stats.stressLineCount ?? 0) >= 24, `${mode}: viscoplastic stress line stats missing`);
    assert((descriptor.stats.constitutiveOverlayCellCount ?? 0) >= 16, `${mode}: viscoplastic constitutive overlay cells missing`);
    assert((descriptor.stats.constitutiveLineCount ?? 0) >= 16, `${mode}: viscoplastic constitutive overlay lines missing`);
    assert((descriptor.stats.materialSpecificStressFieldCount ?? 0) >= 16, `${mode}: viscoplastic material stress field missing`);
    assert((descriptor.stats.constitutiveShellCellCount ?? 0) >= 16, `${mode}: viscoplastic constitutive shell cells missing`);
    assert((descriptor.stats.constitutiveShellSegmentCount ?? 0) >= 12, `${mode}: viscoplastic constitutive shell too weak`);
    assert((descriptor.stats.maxOverlayStress ?? 0) >= (descriptor.stats.meanStress ?? 0), `${mode}: viscoplastic overlay stress too low`);
    assert((descriptor.stats.viscosityOverlayCellCount ?? 0) >= 16, `${mode}: viscoplastic viscosity overlay missing`);
    assert((descriptor.stats.viscosityShellSegmentCount ?? 0) >= 12, `${mode}: viscoplastic viscosity shell too weak`);
    if (mode === 'melt_front') {
      assert((descriptor.stats.yieldOverlayCellCount ?? 0) >= 16, `${mode}: viscoplastic yield overlay missing`);
      assert((descriptor.stats.yieldDominantOverlayCellCount ?? 0) >= 8, `${mode}: viscoplastic yield dominant overlay missing`);
      assert((descriptor.stats.packedRegionCellCount ?? 0) >= 16, `${mode}: viscoplastic packed region too small`);
      assert((descriptor.stats.jammedMaterialSplitModeCount ?? 0) >= 1, `${mode}: viscoplastic split modes missing`);
    }
  } else if (familyId === 'mpm-snow') {
    assert(descriptor.pointCount > 24, `${mode}: snow point count too small`);
    assert(descriptor.lineCount >= 32, `${mode}: snow overlay lines missing`);
    assert(descriptor.bindingMode === 'native-particles', `${mode}: snow binding mode should be native-particles`);
    assert((descriptor.stats.occupiedCells ?? 0) > 8, `${mode}: snow occupied cells missing`);
    assert((descriptor.stats.overlayCellCount ?? 0) >= 16, `${mode}: snow overlay cell count too low`);
    assert((descriptor.stats.stressLineCount ?? 0) >= 24, `${mode}: snow stress line stats missing`);
    assert((descriptor.stats.constitutiveOverlayCellCount ?? 0) >= 16, `${mode}: snow constitutive overlay cells missing`);
    assert((descriptor.stats.constitutiveLineCount ?? 0) >= 16, `${mode}: snow constitutive overlay lines missing`);
    assert((descriptor.stats.materialSpecificStressFieldCount ?? 0) >= 16, `${mode}: snow material stress field missing`);
    assert((descriptor.stats.constitutiveShellCellCount ?? 0) >= 16, `${mode}: snow constitutive shell cells missing`);
    assert((descriptor.stats.constitutiveShellSegmentCount ?? 0) >= 12, `${mode}: snow constitutive shell too weak`);
    assert((descriptor.stats.meanHardeningState ?? 0) > 0.42, `${mode}: snow hardening state too low`);
    assert((descriptor.stats.hardeningOverlayCellCount ?? 0) >= 16, `${mode}: snow hardening overlay missing`);
    assert((descriptor.stats.hardeningShellSegmentCount ?? 0) >= 12, `${mode}: snow hardening shell too weak`);
    assert((descriptor.stats.maxOverlayStress ?? 0) >= (descriptor.stats.meanStress ?? 0), `${mode}: snow overlay stress too low`);
    if (mode === 'frost_lattice') {
      assert((descriptor.stats.packedRegionCellCount ?? 0) >= 12, `${mode}: frost packed region too small`);
    }
    if (mode === 'avalanche_field') {
      assert((descriptor.stats.packedRegionRemeshLineCount ?? 0) >= 16, `${mode}: avalanche remesh too weak`);
      assert((descriptor.stats.packedRegionBandCount ?? 0) >= 2, `${mode}: avalanche packed bands too few`);
    }
  } else if (familyId === 'mpm-mud') {
    assert(descriptor.pointCount > 24, `${mode}: mud point count too small`);
    assert(descriptor.lineCount >= 32, `${mode}: mud overlay lines missing`);
    assert(descriptor.bindingMode === 'native-particles', `${mode}: mud binding mode should be native-particles`);
    assert((descriptor.stats.occupiedCells ?? 0) > 8, `${mode}: mud occupied cells missing`);
    assert((descriptor.stats.overlayCellCount ?? 0) >= 16, `${mode}: mud overlay cell count too low`);
    assert((descriptor.stats.stressLineCount ?? 0) >= 24, `${mode}: mud stress line stats missing`);
    assert((descriptor.stats.constitutiveOverlayCellCount ?? 0) >= 16, `${mode}: mud constitutive overlay cells missing`);
    assert((descriptor.stats.constitutiveLineCount ?? 0) >= 16, `${mode}: mud constitutive overlay lines missing`);
    assert((descriptor.stats.materialSpecificStressFieldCount ?? 0) >= 16, `${mode}: mud material stress field missing`);
    assert((descriptor.stats.constitutiveShellCellCount ?? 0) >= 16, `${mode}: mud constitutive shell cells missing`);
    assert((descriptor.stats.constitutiveShellSegmentCount ?? 0) >= 12, `${mode}: mud constitutive shell too weak`);
    assert((descriptor.stats.meanViscosityState ?? 0) > 0.42, `${mode}: mud viscosity state too low`);
    assert((descriptor.stats.viscosityOverlayCellCount ?? 0) >= 16, `${mode}: mud viscosity overlay missing`);
    assert((descriptor.stats.viscosityShellSegmentCount ?? 0) >= 12, `${mode}: mud viscosity shell too weak`);
    assert((descriptor.stats.maxOverlayStress ?? 0) >= (descriptor.stats.meanStress ?? 0), `${mode}: mud overlay stress too low`);
    if (mode === 'talus_heap') {
      assert((descriptor.stats.packedRegionRemeshLineCount ?? 0) >= 12, `${mode}: talus remesh too weak`);
      assert((descriptor.stats.packedRegionBandCount ?? 0) >= 2, `${mode}: talus packed bands too few`);
    }
    if (mode === 'liquid_smear') {
      assert((descriptor.stats.meanYieldMemory ?? 0) > 0.1, `${mode}: smear yield memory too low`);
    }
  } else if (familyId === 'mpm-paste') {
    assert(descriptor.pointCount > 24, `${mode}: paste point count too small`);
    assert(descriptor.lineCount >= 32, `${mode}: paste overlay lines missing`);
    assert(descriptor.bindingMode === 'native-particles', `${mode}: paste binding mode should be native-particles`);
    assert((descriptor.stats.occupiedCells ?? 0) > 8, `${mode}: paste occupied cells missing`);
    assert((descriptor.stats.overlayCellCount ?? 0) >= 16, `${mode}: paste overlay cell count too low`);
    assert((descriptor.stats.stressLineCount ?? 0) >= 24, `${mode}: paste stress line stats missing`);
    assert((descriptor.stats.constitutiveOverlayCellCount ?? 0) >= 16, `${mode}: paste constitutive overlay cells missing`);
    assert((descriptor.stats.constitutiveLineCount ?? 0) >= 16, `${mode}: paste constitutive overlay lines missing`);
    assert((descriptor.stats.materialSpecificStressFieldCount ?? 0) >= 16, `${mode}: paste material stress field missing`);
    assert((descriptor.stats.constitutiveShellCellCount ?? 0) >= 16, `${mode}: paste constitutive shell cells missing`);
    assert((descriptor.stats.constitutiveShellSegmentCount ?? 0) >= 12, `${mode}: paste constitutive shell too weak`);
    assert((descriptor.stats.meanViscosityState ?? 0) > 0.48, `${mode}: paste viscosity state too low`);
    assert((descriptor.stats.meanYieldMemory ?? 0) > 0.12, `${mode}: paste yield memory too low`);
    assert((descriptor.stats.viscosityOverlayCellCount ?? 0) >= 16, `${mode}: paste viscosity overlay missing`);
    assert((descriptor.stats.yieldOverlayCellCount ?? 0) >= 16, `${mode}: paste yield overlay missing`);
    if (mode === 'crawl_seep') {
      assert((descriptor.stats.yieldDominantOverlayCellCount ?? 0) >= 8, `${mode}: paste yield-dominant overlay missing`);
    }
    assert((descriptor.stats.packedRegionCellCount ?? 0) >= 16, `${mode}: paste packed region too small`);
    assert((descriptor.stats.packedRegionRemeshLineCount ?? 0) >= 12, `${mode}: paste remesh too weak`);
    assert((descriptor.stats.maxOverlayStress ?? 0) >= (descriptor.stats.meanStress ?? 0), `${mode}: paste overlay stress too low`);
    if (mode === 'crawl_seep') {
      assert((descriptor.stats.viscosityShellSegmentCount ?? 0) >= 16, `${mode}: paste viscosity shell too weak`);
      assert((descriptor.stats.yieldDominantLineCount ?? 0) >= 8, `${mode}: paste yield-dominant lines too weak`);
    }
  } else if (familyId === 'volumetric-density-transport' || familyId === 'volumetric-smoke' || familyId === 'volumetric-advection' || familyId === 'volumetric-pressure-coupling' || familyId === 'volumetric-light-shadow-coupling') {
    assert(descriptor.pointCount > 12, `${mode}: volumetric point count too small`);
    assert(descriptor.lineCount >= 6, `${mode}: volumetric slice lines missing`);
    assert(descriptor.bindingMode === 'native-volume', `${mode}: volumetric binding mode should be native-volume`);
    assert((descriptor.stats.cells ?? 0) > 100, `${mode}: volumetric cells too small`);
    assert((descriptor.stats.meanLighting ?? 0) > 0, `${mode}: volumetric lighting missing`);
    assert((descriptor.stats.sliceLineCount ?? 0) >= 2, `${mode}: volumetric slice stats missing`);
    assert((descriptor.stats.billowContourPoints ?? 0) >= 4, `${mode}: volumetric billow contour missing`);
    assert((descriptor.stats.meshRowCount ?? 0) >= 3, `${mode}: volumetric mesh rows missing`);
    assert((descriptor.stats.meshLineCount ?? 0) >= 20, `${mode}: volumetric mesh lines too low`);
    assert((descriptor.stats.meshTriangleEstimate ?? 0) >= 8, `${mode}: volumetric mesh estimate too low`);
    assert((descriptor.stats.obstacleMaskCellCount ?? 0) >= 8, `${mode}: volumetric obstacle mask missing`);
    assert((descriptor.stats.obstacleBoundaryLineCount ?? 0) >= 4, `${mode}: volumetric obstacle boundary missing`);
    assert((descriptor.stats.secondaryObstacleMaskCellCount ?? 0) >= 4, `${mode}: volumetric secondary obstacle mask missing`);
    assert((descriptor.stats.secondaryObstacleBoundaryLineCount ?? 0) >= 4, `${mode}: volumetric secondary obstacle boundary missing`);
    assert((descriptor.stats.obstacleBridgeLineCount ?? 0) >= 2, `${mode}: volumetric obstacle bridge missing`);
    assert((descriptor.stats.multiObstacleModeCount ?? 0) >= 2, `${mode}: volumetric multi-obstacle modes missing`);
    assert((descriptor.stats.lightMarchLineCount ?? 0) >= 2, `${mode}: volumetric light march missing`);
    assert((descriptor.stats.secondaryLightMarchLineCount ?? 0) >= 2, `${mode}: volumetric secondary light march missing`);
    assert((descriptor.stats.multiLightBridgeLineCount ?? 0) >= 2, `${mode}: volumetric multi-light bridge missing`);
    assert((descriptor.stats.lightSplitModeCount ?? 0) >= 2, `${mode}: volumetric light split modes missing`);
assert((descriptor.stats.tripleLightInterferenceMean ?? 0) > 0.001, `${mode}: volumetric triple-light interference missing`);
    assert((descriptor.stats.tripleLightInterferenceCells ?? 0) >= 1, `${mode}: volumetric triple-light activity too low`);
    assert((descriptor.stats.tripleLightInterferenceLineCount ?? 0) >= (mode === 'condense_field' ? 1 : 2), `${mode}: volumetric triple-light lines missing`);
    assert((descriptor.stats.tripleLightModeCount ?? 0) >= (mode === 'condense_field' ? 1 : 2), `${mode}: volumetric triple-light modes missing`);
    assert((descriptor.stats.plumeAnisotropyMean ?? 0) > 0.004, `${mode}: volumetric plume anisotropy missing`);
    assert((descriptor.stats.plumeBranchActiveCells ?? 0) >= 4, `${mode}: volumetric plume branch activity too low`);
    assert((descriptor.stats.anisotropicPlumeLineCount ?? 0) >= 1, `${mode}: volumetric anisotropic plume lines missing`);
    assert((descriptor.stats.plumeBranchBridgeLineCount ?? 0) >= 1, `${mode}: volumetric plume branch bridge missing`);
    assert((descriptor.stats.anisotropicPlumeModeCount ?? 0) >= 2, `${mode}: volumetric plume modes missing`);
    assert((descriptor.stats.obstacleWakeMean ?? 0) > 0.0004, `${mode}: volumetric obstacle wake missing`);
    assert((descriptor.stats.obstacleWakeCells ?? 0) >= 2, `${mode}: volumetric obstacle wake too weak`);
    assert((descriptor.stats.obstacleWakeLineCount ?? 0) >= 4, `${mode}: volumetric obstacle wake lines missing`);
    assert((descriptor.stats.obstacleWakeBridgeLineCount ?? 0) >= 1, `${mode}: volumetric obstacle wake bridge missing`);
    assert((descriptor.stats.obstacleWakeModeCount ?? 0) >= 2, `${mode}: volumetric obstacle wake modes missing`);
    assert((descriptor.stats.injectorCouplingMean ?? 0) > 0.002, `${mode}: volumetric injector coupling missing`);
    assert((descriptor.stats.injectorCoupledCells ?? 0) >= 2, `${mode}: volumetric injector coupling too weak`);
    assert((descriptor.stats.injectorCouplingLineCount ?? 0) >= 2, `${mode}: volumetric injector coupling lines missing`);
    assert((descriptor.stats.injectorBridgeLineCount ?? 0) >= 2, `${mode}: volumetric injector bridge missing`);
    assert((descriptor.stats.injectorModeCount ?? 0) >= 2, `${mode}: volumetric injector modes missing`);
    assert((descriptor.stats.wakeTurbulenceMean ?? 0) > 0.001, `${mode}: volumetric wake turbulence missing`);
    assert((descriptor.stats.layeredWakeActiveCells ?? 0) >= 2, `${mode}: volumetric layered wake activity too low`);
    assert((descriptor.stats.layeredWakeLineCount ?? 0) >= 2, `${mode}: volumetric layered wake lines missing`);
    assert((descriptor.stats.layeredWakeBridgeLineCount ?? 0) >= (mode === 'condense_field' ? 0 : 1), `${mode}: volumetric layered wake bridge missing`);
    assert((descriptor.stats.layeredWakeModeCount ?? 0) >= (mode === 'condense_field' ? 1 : 2), `${mode}: volumetric layered wake modes missing`);
    assert((descriptor.stats.volumeLayerPointCount ?? 0) >= 12, `${mode}: volumetric volume layer points missing`);
    assert((descriptor.stats.volumeLayerLineCount ?? 0) >= 12, `${mode}: volumetric volume layer lines missing`);
    assert((descriptor.stats.volumeDepthLayerCount ?? 0) >= 3, `${mode}: volumetric depth layers missing`);
    assert(((descriptor.stats.volumeDepthRange ?? 0) > 0) || ((descriptor.stats.volumeLayerPointCount ?? 0) >= 12), `${mode}: volumetric depth range missing`);
    if (familyId === 'volumetric-smoke') {
      assert((descriptor.stats.smokeInjectorRibbonLineCount ?? 0) >= 2, `${mode}: smoke injector ribbon missing`);
      assert((descriptor.stats.smokeInjectorBridgeLineCount ?? 0) >= 2, `${mode}: smoke injector bridges missing`);
      assert((descriptor.stats.smokeInjectorModeCount ?? 0) >= 2, `${mode}: smoke injector modes missing`);
      if (mode === 'prism_smoke') {
        assert((descriptor.stats.prismRefractionLineCount ?? 0) >= 3, `${mode}: prism refraction lines missing`);
        assert((descriptor.stats.prismRefractionModeCount ?? 0) >= 2, `${mode}: prism refraction modes missing`);
      }
      if (mode === 'static_smoke') {
        assert((descriptor.stats.settledSlabBandCount ?? 0) >= 2, `${mode}: static slab bands missing`);
        assert((descriptor.stats.settledSlabPersistenceLineCount ?? 0) >= 4, `${mode}: static slab persistence missing`);
        assert((descriptor.stats.settledShadowShelfCount ?? 0) >= 1, `${mode}: static shadow shelf missing`);
      }
    }
    if (familyId === 'volumetric-advection') {
      assert((descriptor.stats.vortexPacketModeCount ?? 0) >= 1, `${mode}: advection vortex packet modes missing`);
      assert((descriptor.stats.anisotropicPlumeModeCount ?? 0) >= 2, `${mode}: advection plume modes missing`);
    }
    if (familyId === 'volumetric-pressure-coupling') {
      assert((descriptor.stats.vortexPacketModeCount ?? 0) >= (mode === 'vortex_transport' ? 1 : 0), `${mode}: pressure vortex packet modes missing`);
      assert((descriptor.stats.obstacleWakeModeCount ?? 0) >= 2, `${mode}: pressure obstacle wake modes missing`);
    }
    if (familyId === 'volumetric-light-shadow-coupling') {
      assert((descriptor.stats.lightMarchLineCount ?? 0) >= 3, `${mode}: light-shadow light march lines missing`);
      assert((descriptor.stats.multiLightBridgeLineCount ?? 0) >= 2, `${mode}: light-shadow bridge lines missing`);
      assert((descriptor.stats.obstacleWakeModeCount ?? 0) >= 2, `${mode}: light-shadow obstacle wake modes missing`);
    }
  } else {
    assert(descriptor.pointCount > 12, `${mode}: point count too small`);
    assert(descriptor.lineCount > 12, `${mode}: point/line payload too small`);
    assert(descriptor.bindingMode === 'native-surface', `${mode}: ${familyId} binding mode should be native-surface`);
    assert((descriptor.surfaceMesh?.triangleCount ?? 0) > 0, `${mode}: ${familyId} surface mesh missing`);
    assert((descriptor.surfaceMesh?.hullSegmentCount ?? 0) > 0, `${mode}: ${familyId} hull segments missing`);
    assert((descriptor.stats.surfaceDepthRange ?? 0) > 0, `${mode}: ${familyId} surface depth range missing`);
  }
  assert(plan.futureNativeRenderer, `${mode}: plan did not activate future-native renderer`);
  assert(plan.futureNativeFamilyId === familyId, `${mode}: plan future native family mismatch`);
  assert(plan.proceduralSystemId === null, `${mode}: procedural system should be suppressed when future-native renderer is active`);
  assert(plan.hybridSystemId === null, `${mode}: hybrid system should be suppressed when future-native renderer is active`);
  assert(plan.particleCore === false, `${mode}: particle core should be suppressed when future-native renderer is active`);
  assert(plan.sceneBranches.includes(`future-native-renderer:${familyId}`), `${mode}: scene branch missing future-native renderer tag`);

  return {
    mode,
    familyId,
    summary: descriptor.summary,
    pointCount: descriptor.pointCount,
    lineCount: descriptor.lineCount,
    sceneScale: descriptor.sceneScale,
    bindingMode: descriptor.bindingMode,
  };
});

console.log('PASS future-native-render-handoff');
console.log(JSON.stringify({ ok: true, scope, verifiedCases: report.length, report }, null, 2));
