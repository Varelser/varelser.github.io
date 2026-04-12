import { futureNativeFamilySpecs } from './futureNativeFamiliesRegistry';
import type { FutureNativeFamilyId, FutureNativeFamilyStage } from './futureNativeFamiliesTypes';

export interface FutureNativeFamilyProgressEntry {
  id: FutureNativeFamilyId;
  progressPercent: number;
  currentStage: FutureNativeFamilyStage;
  starterImplemented: boolean;
  verifierImplemented: boolean;
  integrationReady: boolean;
  nextTargets: readonly string[];
  notes: readonly string[];
}

export interface FutureNativeFamilyProgressSummary {
  totalFamilies: number;
  nativeStarterFamilies: number;
  verificationReadyFamilies: number;
  averageProgressPercent: number;
  byGroupAverage: Record<string, number>;
  firstWaveAverage: number;
}

interface FutureNativeFamilyProgressSourceEntry {
  progressPercent: number;
  currentStage: FutureNativeFamilyStage;
  nextTargets: readonly string[];
  notes: readonly string[];
}

const stagesWithStarterImplementation = new Set<FutureNativeFamilyStage>([
  'runtime-stub',
  'verification-ready',
  'native-integration',
  'project-integrated',
]);

const stagesWithVerificationCoverage = new Set<FutureNativeFamilyStage>([
  'verification-ready',
  'native-integration',
  'project-integrated',
]);

function buildFutureNativeFamilyProgressEntry(
  id: FutureNativeFamilyId,
  source: FutureNativeFamilyProgressSourceEntry,
): FutureNativeFamilyProgressEntry {
  return {
    id,
    progressPercent: source.progressPercent,
    currentStage: source.currentStage,
    starterImplemented: stagesWithStarterImplementation.has(source.currentStage),
    verifierImplemented: stagesWithVerificationCoverage.has(source.currentStage),
    integrationReady: stagesWithVerificationCoverage.has(source.currentStage),
    nextTargets: source.nextTargets,
    notes: source.notes,
  };
}

const futureNativeFamilyProgressSources: Record<FutureNativeFamilyId, FutureNativeFamilyProgressSourceEntry> = {
  'pbd-rope': {
    progressPercent: 98,
    currentStage: 'project-integrated',
    nextTargets: [],
    notes: ['Native starter includes bend, circle/capsule collision, and spacing-based self-collision guard; shared PBD surface layers now extend into cloth/membrane. Scene binding, render handoff, shared integration snapshot, project snapshot coverage, non-volumetric route reports, and Project IO authoring inspection are now wired through the project-integrated path. Rope preset bundles, dedicated route preview signatures, and family-level preview surfaces now live in rope-specific files outside the shared non-volumetric authoring catalog.'],
  },
  'mpm-granular': {
    progressPercent: 98,
    currentStage: 'project-integrated',
    nextTargets: [],
    notes: ['Grid-aware transfer and plasticity-aware particle state are in place. Scene binding, render handoff, shared integration snapshot, project snapshot coverage, non-volumetric route reports, and Project IO authoring inspection are now wired through the project-integrated path. Granular runtime helpers, preset bundles, dedicated route preview signatures, and family-level preview surfaces now live in dedicated granular-specific files instead of the shared non-volumetric catalog.'],
  },
  'fracture-lattice': {
    progressPercent: 98,
    currentStage: 'project-integrated',
    nextTargets: [],
    notes: ['Directional crack propagation and detached fragment grouping are in place. Scene binding, render handoff, shared integration snapshot, project snapshot coverage, non-volumetric route reports, and Project IO authoring inspection are now wired through the project-integrated path. Dedicated voxel/crack/debris helper extraction now lives outside the shared fracture substrate. Generated route delta snapshots now carry voxel-specific helper/bundle coverage lines, and lattice-collapse report preview coverage now lives in a dedicated lattice preview helper.'],
  },
  'volumetric-density-transport': {
    progressPercent: 98,
    currentStage: 'project-integrated',
    nextTargets: [],
    notes: ['Starter now carries pressure, lighting, shadow coupling, plume anisotropy branches, richer obstacle wake, multi-injector coupling, layered wake turbulence, vorticity confinement, wake recirculation shell, shear-layer rollup pocket descriptors, plus triple-light interference and vortex packet splits. Scene binding, render handoff, shared integration snapshot, project snapshot coverage, and volumetric route trend reporting are now wired through the project-integrated path. Density-transport helper extraction, preset bundle coverage, derived transport diagnostics, preview authoring signatures, and family-level preview surfaces now live in dedicated density/pressure helper files instead of the shared generic volumetric substrate.'],
  },
  'mpm-viscoplastic': {
    progressPercent: 98,
    currentStage: 'project-integrated',
    nextTargets: [],
    notes: ['viscous_flow / melt_front / evaporative_sheet are now bound as a dedicated MPM sibling on top of the granular substrate, with project-integrated fixture/project snapshot coverage, render handoff coverage, generic family verification, a dedicated viscoplastic verifier, non-volumetric route reports, and Project IO preset inspection. Dedicated viscoplastic helper extraction, preset bundle coverage, generated route delta snapshot coverage, dedicated route preview signatures, and family-level preview surfaces now live in snow/viscoplastic-specific files.'],
  },
  'mpm-snow': {
    progressPercent: 98,
    currentStage: 'project-integrated',
    nextTargets: [],
    notes: ['ashfall / frost_lattice / avalanche_field are now bound as a dedicated snow sibling on top of the granular substrate, with hardening-biased bridge input, scene binding, render handoff, integrated fixture/project snapshot coverage, generic family verification, a dedicated snow verifier, non-volumetric route reports, and Project IO authoring inspection. Dedicated snow helper extraction, preset bundle coverage, generated route delta snapshot coverage, dedicated route preview signatures, and family-level preview surfaces now live in snow/viscoplastic-specific files.'],
  },
  'mpm-mud': {
    progressPercent: 98,
    currentStage: 'project-integrated',
    nextTargets: [],
    notes: ['sediment_stack / talus_heap / liquid_smear are now bound as a dedicated mud sibling on top of the granular substrate, with mud-biased bridge input, scene binding, render handoff, integrated fixture/project snapshot coverage, generic family verification, a dedicated mud verifier, non-volumetric route reports, and Project IO authoring inspection. Mud input helpers, preset bundles, generated route delta snapshots, dedicated route preview signatures, and family-level preview surfaces now live in dedicated helper files instead of the shared non-volumetric catalog.'],
  },
  'mpm-paste': {
    progressPercent: 98,
    currentStage: 'project-integrated',
    nextTargets: [],
    notes: ['capillary_sheet / percolation_sheet / crawl_seep are now bound as a dedicated paste sibling on top of the granular substrate, with paste-biased bridge input, scene binding, render handoff, integrated fixture/project snapshot coverage, generic family verification, a dedicated paste verifier, non-volumetric route reports, and Project IO authoring inspection. Paste input helpers, preset bundles, generated route delta snapshots, dedicated route preview signatures, and family-level preview surfaces now live in dedicated helper files instead of the shared non-volumetric catalog.'],
  },
  'pbd-cloth': {
    progressPercent: 98,
    currentStage: 'project-integrated',
    nextTargets: [],
    notes: ['Uses shared PBD constraint helpers, shared surface forces, multi-pin groups, obstacle fields, directional tear weighting, choreography presets, tear-bias texture presets, project snapshot/export integration blocks, non-volumetric route reports, and Project IO preset inspection. Cloth helpers, preset bundles, dedicated route preview signatures, and family-level preview surfaces now live in dedicated cloth/softbody files instead of the shared non-volumetric catalog.'],
  },
  'pbd-membrane': {
    progressPercent: 98,
    currentStage: 'project-integrated',
    nextTargets: [],
    notes: ['Native starter now uses shared PBD constraints, shared surface forces, collider coupling, multi-pin groups, obstacle fields, directional tear weighting, choreography presets, tear-bias texture presets, project snapshot/export integration blocks, non-volumetric route reports, and Project IO preset inspection. Membrane input helpers, preset bundles, dedicated route preview signatures, and family-level preview surfaces now live in membrane-specific files instead of the shared non-volumetric authoring catalog.'],
  },
  'pbd-softbody': {
    progressPercent: 98,
    currentStage: 'project-integrated',
    nextTargets: [],
    notes: ['Starter now includes area-based volume preservation, cluster shape matching, collider coupling, obstacle fields, a dedicated softbody verifier, project snapshot/export integration blocks, non-volumetric route reports, and Project IO preset inspection. Softbody helpers, preset bundles, dedicated route preview signatures, and family-level preview surfaces now live in dedicated cloth/softbody files instead of the shared non-volumetric catalog.'],
  },
  'fracture-voxel': {
    progressPercent: 98,
    currentStage: 'project-integrated',
    nextTargets: [],
    notes: ['voxel_lattice is now bound as a dedicated fracture sibling on top of the fracture-lattice substrate, with scene binding, render handoff, integrated fixture/project snapshot coverage, a dedicated voxel-family verifier, non-volumetric route reports, and Project IO preset inspection. Voxel runtime helpers, preset bundles, generated route delta snapshots, dedicated report preview signatures, and family-level preview surfaces now live outside the shared fracture substrate.'],
  },
  'fracture-crack-propagation': {
    progressPercent: 98,
    currentStage: 'project-integrated',
    nextTargets: [],
    notes: ['seep_fracture is now bound as a dedicated crack-front sibling on top of the fracture-lattice substrate, with directional crack-front-biased bridge input, scene binding, render handoff, integrated fixture/project snapshot coverage, generic family verification, a dedicated crack-propagation verifier, non-volumetric route reports, and Project IO authoring inspection. Crack-specific family preview surfaces now accompany the dedicated preview helper split. Crack-specific helper extraction, generated route delta snapshots, and dedicated report preview signatures now live outside the shared fracture substrate.'],
  },
  'fracture-debris-generation': {
    progressPercent: 98,
    currentStage: 'project-integrated',
    nextTargets: [],
    notes: ['shard_debris / orbit_fracture / fracture_pollen are now bound as a dedicated debris-generation sibling on top of the fracture-lattice substrate, with debris-biased bridge input, scene binding, render handoff, integrated fixture/project snapshot coverage, generic family verification, a dedicated debris-generation verifier, non-volumetric route reports, and Project IO preset inspection. Debris runtime helpers, preset bundles, generated route delta snapshots, and dedicated report preview signatures now live outside the shared fracture substrate.'],
  },
  'volumetric-smoke': {
    progressPercent: 100,
    currentStage: 'project-integrated',
    nextTargets: ['fork the next volumetric family from smoke-grade preset/diagnostics authoring surfaces', 'reuse smoke override persistence patterns for volumetric-advection', 'lift route-aware preset preview flows into the next native-volume family'],
    notes: ['Density-transport substrate is promoted into a smoke-specific native volume family with prism/static bindings, dedicated verification, injector ribbon descriptors, prism refraction lines, settled slab persistence bands, smoke-specific control/snapshot surfaces, route-delta material tuning/reporting, authoring preset bundles for light/obstacle variants, execution-routing preset recommendations, editable runtime config helpers, smoke-specific light-scatter tuning, expanded volumetric bridge stats retention, editor-facing recommended bundle controls, persisted smoke authoring session snapshots, diagnostics/preset-preview smoke tuning surfaces, Project IO smoke authoring inspection, explicit runtime override editing wired into the live runtime/export path, and smoke authoring preset coverage now lives in dedicated smoke-specific preset/authoring files.'],
  },
  'volumetric-advection': {
    progressPercent: 98,
    currentStage: 'project-integrated',
    nextTargets: [],
    notes: ['condense_field / sublimate_cloud are now bound as a dedicated native-volume family, with integrated fixture/snapshot coverage, route-aware authoring bundle recommendations, preset previews, diagnostics overlay reporting, Project IO inspection, explicit runtime override editing wired into the live runtime/export path, project snapshot route-delta reporting, and a dedicated advection verifier running on top of the density-transport substrate. Advection helper extraction, preset bundle coverage, preview-signature authoring helpers, and family-level preview surfaces now live in dedicated advection/light-shadow files.'],
  },
  'volumetric-pressure-coupling': {
    progressPercent: 98,
    currentStage: 'project-integrated',
    nextTargets: [],
    notes: ['vortex_transport / pressure_cells are now promoted into a dedicated native-volume family with scene binding, route-aware preset bundles, editable runtime overrides, Project IO authoring state, diagnostics overlay reporting, project snapshot route highlights, integrated fixture/snapshot coverage, render-handoff coverage, a dedicated volumetric-pressure verifier, and volumetric route trend summaries for low-band review. Pressure-specific helper extraction, preset bundle coverage, explicit pressure residual / divergence diagnostics, preview authoring signatures, and family-level preview surfaces now live in dedicated density/pressure helper files instead of the shared generic volumetric substrate.'],
  },
  'volumetric-light-shadow-coupling': {
    progressPercent: 98,
    currentStage: 'project-integrated',
    nextTargets: [],
    notes: ['charge_veil / velvet_ash are now promoted into a dedicated native-volume family with scene binding, route-aware preset bundles, editable runtime overrides, Project IO authoring state, diagnostics overlay reporting, project snapshot route highlights, integrated fixture/snapshot coverage, render-handoff coverage, a dedicated volumetric-light-shadow verifier, dedicated light-shadow helper extraction, explicit light extinction / occlusion diagnostics, volumetric route trend summaries, dedicated preview-signature authoring helpers, and family-level preview surfaces.'],
  },
  'specialist-houdini-native': {
    progressPercent: 98,
    currentStage: 'project-integrated',
    nextTargets: [],
    notes: ['Runtime stub, implementation packet, starter runtime packet, graph-stage packet serialization, adapter mapping table, generic family verification, dedicated specialist-houdini verifier, Project IO specialist packet surface, diagnostics overlay packet summary, project snapshot specialist packet coverage, manifest/serialization specialist route surfaces, export/import roundtrip verification, adapter handshake payloads, external adapter bridge schema snapshots, selected adapter summaries, target-switch payloads, route-target deltas, override-state snapshots, explicit override change history, adapter fallback history, and capability trend delta logs are now wired so graph-hint / hybrid target / output bridge expectations can be inspected at project-integrated depth. Route fixture diff summaries, registry rollups, warning surfaces, source-only manifest/generated-artifact inventory stability verification, and family-level preview/comparison surfaces are now shared across Project IO, diagnostics overlay, project snapshot reporting, handoff artifacts, and the dedicated source-only artifact verifier.'],
  },
  'specialist-niagara-native': {
    progressPercent: 98,
    currentStage: 'project-integrated',
    nextTargets: [],
    notes: ['Runtime stub, implementation packet, starter runtime packet, pack-independent emitter/update/output graph-stage packet, adapter mapping table, generic family verification, dedicated specialist-niagara verifier, Project IO specialist packet surface, diagnostics overlay packet summary, project snapshot specialist packet coverage, manifest/serialization specialist route surfaces, export/import roundtrip verification, adapter handshake payloads, external adapter bridge schema snapshots, selected adapter summaries, target-switch payloads, route-target deltas, override-state snapshots, explicit override change history, adapter fallback history, and capability trend delta logs are now wired so graph-hint / hybrid target / output bridge expectations can be inspected at project-integrated depth. Route fixture diff summaries, registry rollups, warning surfaces, source-only manifest/generated-artifact inventory stability verification, and family-level preview/comparison surfaces are now shared across Project IO, diagnostics overlay, project snapshot reporting, handoff artifacts, and the dedicated source-only artifact verifier.'],
  },
  'specialist-touchdesigner-native': {
    progressPercent: 98,
    currentStage: 'project-integrated',
    nextTargets: [],
    notes: ['Runtime stub, implementation packet, starter runtime packet, pack-independent input/process/output operator-pipe packet, adapter mapping table, generic family verification, dedicated specialist-touchdesigner verifier, Project IO specialist packet surface, diagnostics overlay packet summary, project snapshot specialist packet coverage, manifest/serialization specialist route surfaces, export/import roundtrip verification, adapter handshake payloads, external adapter bridge schema snapshots, selected adapter summaries, target-switch payloads, route-target deltas, override-state snapshots, explicit override change history, adapter fallback history, and capability trend delta logs are now wired so graph-hint / hybrid target / output bridge expectations can be inspected at project-integrated depth. Route fixture diff summaries, registry rollups, warning surfaces, source-only manifest/generated-artifact inventory stability verification, and family-level preview/comparison surfaces are now shared across Project IO, diagnostics overlay, project snapshot reporting, handoff artifacts, and the dedicated source-only artifact verifier.'],
  },
  'specialist-unity-vfx-native': {
    progressPercent: 98,
    currentStage: 'project-integrated',
    nextTargets: [],
    notes: ['Runtime stub, implementation packet, starter runtime packet, pack-independent spawn/update/output graph packet, adapter mapping table, generic family verification, dedicated specialist-unity-vfx verifier, Project IO specialist packet surface, diagnostics overlay packet summary, project snapshot specialist packet coverage, manifest/serialization specialist route surfaces, export/import roundtrip verification, adapter handshake payloads, external adapter bridge schema snapshots, selected adapter summaries, target-switch payloads, route-target deltas, override-state snapshots, explicit override change history, adapter fallback history, and capability trend delta logs are now wired so graph-hint / hybrid target / output bridge expectations can be inspected at project-integrated depth. Route fixture diff summaries, registry rollups, warning surfaces, source-only manifest/generated-artifact inventory stability verification, and family-level preview/comparison surfaces are now shared across Project IO, diagnostics overlay, project snapshot reporting, handoff artifacts, and the dedicated source-only artifact verifier.'],
  },
};

export const futureNativeFamilyProgressRegistry: Record<FutureNativeFamilyId, FutureNativeFamilyProgressEntry> = Object.fromEntries(
  Object.entries(futureNativeFamilyProgressSources).map(([id, source]) => [
    id,
    buildFutureNativeFamilyProgressEntry(id as FutureNativeFamilyId, source),
  ]),
) as Record<FutureNativeFamilyId, FutureNativeFamilyProgressEntry>;

const firstWaveIds: readonly FutureNativeFamilyId[] = ['pbd-rope', 'mpm-granular', 'fracture-lattice', 'volumetric-density-transport'];

export function getFutureNativeFamilyProgress(id: FutureNativeFamilyId): FutureNativeFamilyProgressEntry {
  return futureNativeFamilyProgressRegistry[id];
}

export function summarizeFutureNativeFamilyProgress(): FutureNativeFamilyProgressSummary {
  let nativeStarterFamilies = 0;
  let verificationReadyFamilies = 0;
  let total = 0;
  const byGroupAccumulator: Record<string, { total: number; count: number }> = {};
  let firstWaveTotal = 0;

  for (const family of futureNativeFamilySpecs) {
    const progress = futureNativeFamilyProgressRegistry[family.id];
    total += progress.progressPercent;
    if (progress.starterImplemented) nativeStarterFamilies += 1;
    if (progress.verifierImplemented) verificationReadyFamilies += 1;
    byGroupAccumulator[family.group] ??= { total: 0, count: 0 };
    byGroupAccumulator[family.group].total += progress.progressPercent;
    byGroupAccumulator[family.group].count += 1;
    if (firstWaveIds.includes(family.id)) firstWaveTotal += progress.progressPercent;
  }

  const byGroupAverage = Object.fromEntries(
    Object.entries(byGroupAccumulator).map(([group, value]) => [group, value.total / Math.max(1, value.count)]),
  );

  return {
    totalFamilies: futureNativeFamilySpecs.length,
    nativeStarterFamilies,
    verificationReadyFamilies,
    averageProgressPercent: total / Math.max(1, futureNativeFamilySpecs.length),
    byGroupAverage,
    firstWaveAverage: firstWaveTotal / Math.max(1, firstWaveIds.length),
  };
}

export function listFutureNativeFamiliesByProgress(): FutureNativeFamilyProgressEntry[] {
  return [...futureNativeFamilySpecs]
    .map((family) => futureNativeFamilyProgressRegistry[family.id])
    .sort((a, b) => b.progressPercent - a.progressPercent || a.id.localeCompare(b.id));
}

export function listFutureNativeIntegrationReadyCandidates(): FutureNativeFamilyProgressEntry[] {
  return listFutureNativeFamiliesByProgress().filter(
    (entry) => entry.progressPercent >= 50 && entry.verifierImplemented && entry.currentStage !== 'project-integrated',
  );
}
