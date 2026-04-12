import type {
  FutureNativeCapabilityFlag,
  FutureNativeFamilyId,
  FutureNativeFamilySpec,
  FutureNativeFamilyGroup,
  FutureNativeFamilyStage,
  FutureNativeRegistrySummary,
  FutureNativeSolverDepth,
} from './futureNativeFamiliesTypes';

interface FutureNativeFamilySpecSource {
  id: FutureNativeFamilyId;
  group: FutureNativeFamilyGroup;
  title: string;
  summary: string;
  targetBehaviors: readonly string[];
  recommendedDepth: FutureNativeSolverDepth;
  stage?: FutureNativeFamilyStage;
  capabilityFlags?: readonly FutureNativeCapabilityFlag[];
  serializerBlockKey?: string;
  verificationScenarioId?: string;
  implementationNotes: readonly string[];
}

const defaultCapabilityFlagsByGroup: Record<FutureNativeFamilyGroup, readonly FutureNativeCapabilityFlag[]> = {
  mpm: ['webgpu-preferred', 'export-safe', 'mobile-risky'],
  pbd: ['webgl-experimental', 'webgpu-preferred', 'export-safe'],
  fracture: ['webgl-experimental', 'export-safe'],
  volumetric: ['webgpu-preferred', 'export-safe', 'mobile-risky'],
  'specialist-native': ['webgpu-preferred', 'export-safe', 'mobile-risky'],
};

const defaultVerificationScenarioIds: Partial<Record<FutureNativeFamilyId, string>> = {
  'specialist-houdini-native': 'future-native-specialist-houdini',
  'specialist-niagara-native': 'future-native-specialist-niagara',
  'specialist-touchdesigner-native': 'future-native-specialist-touchdesigner',
  'specialist-unity-vfx-native': 'future-native-specialist-unity-vfx',
};

function toSerializerBlockKey(id: FutureNativeFamilyId): string {
  return id.replace(/-([a-z])/g, (_match, char: string) => char.toUpperCase());
}

function getVerificationScenarioId(id: FutureNativeFamilyId): string {
  return defaultVerificationScenarioIds[id] ?? `future-native-${id}`;
}

function familySpec(source: FutureNativeFamilySpecSource): FutureNativeFamilySpec {
  return {
    id: source.id,
    group: source.group,
    title: source.title,
    summary: source.summary,
    targetBehaviors: source.targetBehaviors,
    recommendedDepth: source.recommendedDepth,
    stage: source.stage ?? 'research-scaffold',
    capabilityFlags: source.capabilityFlags ?? defaultCapabilityFlagsByGroup[source.group],
    serializerBlockKey: source.serializerBlockKey ?? toSerializerBlockKey(source.id),
    verificationScenarioId: source.verificationScenarioId ?? getVerificationScenarioId(source.id),
    implementationNotes: source.implementationNotes,
  };
}

export const futureNativeFamilySpecs: readonly FutureNativeFamilySpec[] = [
  familySpec({
    id: 'mpm-granular',
    group: 'mpm',
    title: 'MPM Granular',
    summary: 'Dry granular bulk behavior with source packing, settling, and frictional spread.',
    targetBehaviors: ['grain packing', 'settling', 'angle of repose', 'source-fed avalanching'],
    recommendedDepth: 'mid',
    stage: 'project-integrated',
    implementationNotes: ['Start with 2.5D packed particles before true grid-particle transfers.', 'Keep source layout bridge-compatible with existing particle sources.'],
  }),
  familySpec({
    id: 'mpm-viscoplastic',
    group: 'mpm',
    title: 'MPM Viscoplastic',
    summary: 'Sticky or plastically yielding material for mud / paste / heavy slurry motions.',
    targetBehaviors: ['yielding', 'creep', 'slump', 'plastic accumulation'],
    recommendedDepth: 'deep',
    stage: 'project-integrated',
    implementationNotes: ['Separate constitutive model tuning from source-driven emission.', 'Preserve render fallback through existing volumetric or particle outputs.', 'Current project-integrated path reuses the granular substrate while route-specific mud/paste tuning stays split at binding and bridge input level.'],
  }),
  familySpec({
    id: 'mpm-snow',
    group: 'mpm',
    title: 'MPM Snow',
    summary: 'Packed brittle-compressible snow-like material with clumping and break-up.',
    targetBehaviors: ['compaction', 'break-up', 'spray', 'soft accumulation'],
    recommendedDepth: 'deep',
    stage: 'project-integrated',
    implementationNotes: ['This can share a base transfer kernel with granular/viscoplastic if state blocks are split cleanly.', 'Current project-integrated path reuses the granular substrate while snow-specific hardening and compaction routing stay split at binding and bridge input level.'],
  }),
  familySpec({
    id: 'mpm-mud',
    group: 'mpm',
    title: 'MPM Mud',
    summary: 'Wet heavy sediment flow between granular and viscous phases.',
    targetBehaviors: ['sediment flow', 'clumping', 'drag', 'wet accumulation'],
    recommendedDepth: 'mid',
    stage: 'project-integrated',
    implementationNotes: ['Treat as a bridge family after granular + viscoplastic are stable.', 'Current project-integrated path reuses the granular substrate while wet sediment / heap / smear routing stays split at binding and bridge input level.'],
  }),
  familySpec({
    id: 'mpm-paste',
    group: 'mpm',
    title: 'MPM Paste',
    summary: 'Slow cohesive extrusion-like matter suitable for paste / cream / extrusion motifs.',
    targetBehaviors: ['cohesion', 'extrusion', 'slump', 'smear'],
    recommendedDepth: 'mid',
    stage: 'project-integrated',
    implementationNotes: ['Keep brush/input-driven deposition compatibility explicit.', 'Current project-integrated path reuses the granular substrate while capillary / percolation / creep routing stays split at binding and bridge input level.'],
  }),
  familySpec({
    id: 'pbd-cloth',
    group: 'pbd',
    title: 'PBD Cloth',
    summary: 'Constraint-driven cloth sheet for hanging, flutter, and drape.',
    targetBehaviors: ['drape', 'flutter', 'pin constraints', 'sheet collision'],
    recommendedDepth: 'mid',
    stage: 'project-integrated',
    serializerBlockKey: 'pbdCloth',
    implementationNotes: ['Begin with grid topology before arbitrary mesh cloth.'],
  }),
  familySpec({
    id: 'pbd-membrane',
    group: 'pbd',
    title: 'PBD Membrane',
    summary: 'Stretch-dominant membrane solver for skin-like and bubble-like behavior.',
    targetBehaviors: ['stretch', 'membrane tension', 'pulsing skin', 'ballooning'],
    recommendedDepth: 'mid',
    stage: 'project-integrated',
    serializerBlockKey: 'pbdMembrane',
    implementationNotes: ['Integrate with existing membrane render family first, then deepen solver fidelity.'],
  }),
  familySpec({
    id: 'pbd-rope',
    group: 'pbd',
    title: 'PBD Rope',
    summary: 'Segment-chain solver for ropes, tendrils, and tethered dynamics.',
    targetBehaviors: ['rope sag', 'tension', 'whip motion', 'anchored chains'],
    recommendedDepth: 'lite',
    stage: 'project-integrated',
    capabilityFlags: ['webgl-experimental', 'export-safe'],
    implementationNotes: ['This is the cheapest native solver family to start with.'],
  }),
  familySpec({
    id: 'pbd-softbody',
    group: 'pbd',
    title: 'PBD Softbody',
    summary: 'Volume-preserving or spring-cluster softbody behavior.',
    targetBehaviors: ['squash', 'jiggle', 'volume retention', 'impact wobble'],
    recommendedDepth: 'deep',
    stage: 'project-integrated',
    serializerBlockKey: 'pbdSoftbody',
    implementationNotes: ['Delay until rope and membrane scaffolds are stable.'],
  }),
  familySpec({
    id: 'fracture-lattice',
    group: 'fracture',
    title: 'Lattice Fracture',
    summary: 'Graph or lattice breakage with segment failure and detached pieces.',
    targetBehaviors: ['bond breaking', 'progressive failure', 'fragment chains'],
    recommendedDepth: 'mid',
    stage: 'project-integrated',
    implementationNotes: ['Can begin as a line/voxel hybrid before full remesh logic.'],
  }),
  familySpec({
    id: 'fracture-voxel',
    group: 'fracture',
    title: 'Voxel Fracture',
    summary: 'Chunked voxel break-up and debris shedding.',
    targetBehaviors: ['voxel chunking', 'impact break-up', 'debris emission'],
    recommendedDepth: 'mid',
    stage: 'project-integrated',
    implementationNotes: ['Use existing voxel lattice family as the first host path.', 'Keep chunk-shell routing aligned with fracture-lattice substrate until dedicated voxel runtime extraction is justified.'],
  }),
  familySpec({
    id: 'fracture-crack-propagation',
    group: 'fracture',
    title: 'Crack Propagation',
    summary: 'Directional crack front growth over surfaces or lattices.',
    targetBehaviors: ['crack fronts', 'surface splitting', 'branching fracture'],
    recommendedDepth: 'deep',
    stage: 'project-integrated',
    implementationNotes: ['Best added after lattice or voxel fracture produces detachable state.', 'Current project-integrated path reuses the fracture-lattice substrate while crack-front-biased surface routing stays split at binding and bridge input level.'],
  }),
  familySpec({
    id: 'fracture-debris-generation',
    group: 'fracture',
    title: 'Debris Generation',
    summary: 'Secondary fragment lifecycle for dust, chips, shards, and falling remains.',
    targetBehaviors: ['debris emission', 'shard lifetimes', 'secondary trails'],
    recommendedDepth: 'lite',
    stage: 'project-integrated',
    implementationNotes: ['Can first reuse existing particle outputs while the fracture core remains separate.', 'Current project-integrated path reuses the fracture-lattice substrate while debris-heavy shard/trail routing stays split at binding and bridge input level.'],
  }),
  familySpec({
    id: 'volumetric-smoke',
    group: 'volumetric',
    title: 'Volumetric Smoke',
    summary: 'Density field solver for smoke-like plume behavior.',
    targetBehaviors: ['plumes', 'swirls', 'dissipation', 'layered density'],
    recommendedDepth: 'mid',
    stage: 'project-integrated',
    implementationNotes: ['Start with low-resolution field stepping and couple to existing fog renderer.'],
  }),
  familySpec({
    id: 'volumetric-density-transport',
    group: 'volumetric',
    title: 'Density Transport',
    summary: 'Generic scalar transport for vapor, dye, and suspended density fields.',
    targetBehaviors: ['transport', 'dissipation', 'field injection', 'field coupling'],
    recommendedDepth: 'mid',
    stage: 'project-integrated',
    implementationNotes: ['Useful as a lower-level substrate for smoke and lighting coupling.'],
  }),
  familySpec({
    id: 'volumetric-advection',
    group: 'volumetric',
    title: 'Volumetric Advection',
    summary: 'Velocity-guided transport of scalar or vector field data.',
    targetBehaviors: ['advection', 'velocity coupling', 'trail transport'],
    recommendedDepth: 'mid',
    stage: 'project-integrated',
    implementationNotes: ['Keep this separate from full pressure solve so partial native integration is possible.'],
  }),
  familySpec({
    id: 'volumetric-pressure-coupling',
    group: 'volumetric',
    title: 'Volumetric Pressure Coupling',
    summary: 'Pressure-like projection to reduce divergence and keep coherent flow.',
    targetBehaviors: ['projection', 'flow coherence', 'reduced divergence'],
    recommendedDepth: 'deep',
    stage: 'project-integrated',
    implementationNotes: ['Dedicated native-volume route for vortex_transport / pressure_cells built on the shared density-transport substrate.'],
  }),
  familySpec({
    id: 'volumetric-light-shadow-coupling',
    group: 'volumetric',
    title: 'Volumetric Light/Shadow Coupling',
    summary: 'Field-aware lighting and shadow integration for denser volumetric scenes.',
    targetBehaviors: ['light extinction', 'shadowing', 'glow falloff', 'field-lit plumes'],
    recommendedDepth: 'deep',
    stage: 'project-integrated',
    implementationNotes: ['Dedicated native-volume route for charge_veil / velvet_ash built on the shared density-transport substrate.'],
  }),
  familySpec({
    id: 'specialist-houdini-native',
    group: 'specialist-native',
    title: 'Houdini-like Native Bundle',
    summary: 'Engine-native SOP/DOP-style family bridges instead of reference pack only.',
    targetBehaviors: ['node bundle translation', 'solver chaining', 'geometry-field coupling'],
    recommendedDepth: 'deep',
    stage: 'project-integrated',
    implementationNotes: ['Do not clone Houdini UI; define native runtime nodes and adapters.', 'Project-integrated path now carries a pack-independent graph-stage packet, serialize block, adapter mapping table, executable route summary, and project export/import routing surface derived from Houdini specialist bundles.'],
  }),
  familySpec({
    id: 'specialist-niagara-native',
    group: 'specialist-native',
    title: 'Niagara-like Native Bundle',
    summary: 'Engine-native emitter/event/update/output stacks rather than reference-only pack.',
    targetBehaviors: ['emit/update/output separation', 'event chains', 'multi-render outputs'],
    recommendedDepth: 'deep',
    stage: 'project-integrated',
    implementationNotes: ['Model runtime stages first; editor metaphors can wait.', 'Project-integrated path now carries a pack-independent graph-stage packet, serialize block, adapter mapping table, executable route summary, and project export/import routing surface derived from Niagara specialist bundles.'],
  }),
  familySpec({
    id: 'specialist-touchdesigner-native',
    group: 'specialist-native',
    title: 'TouchDesigner-like Native Bundle',
    summary: 'Field/texture/operator-native execution instead of reference pack only.',
    targetBehaviors: ['operator chains', 'TOP-like field pipes', 'instancing outputs'],
    recommendedDepth: 'deep',
    stage: 'project-integrated',
    implementationNotes: ['A compact operator-chain serializer is more important than UI mimicry.', 'Project-integrated path now carries a pack-independent operator-pipe packet, serialize block, adapter mapping table, executable route summary, and project export/import routing surface derived from TouchDesigner specialist bundles.'],
  }),
  familySpec({
    id: 'specialist-unity-vfx-native',
    group: 'specialist-native',
    title: 'Unity VFX-like Native Bundle',
    summary: 'Graph-style event/output family expressed as native engine nodes and outputs.',
    targetBehaviors: ['graph stages', 'spawn/update/output', 'GPU-oriented family bundling'],
    recommendedDepth: 'deep',
    stage: 'project-integrated',
    implementationNotes: ['This should share abstractions with Niagara-like native execution where possible.', 'Project-integrated path now carries a pack-independent spawn/update/output packet, serialize block, adapter mapping table, executable route summary, and project export/import routing surface derived from Unity VFX specialist bundles.'],
  }),
] as const;

export const futureNativeFamilySpecMap = Object.fromEntries(
  futureNativeFamilySpecs.map((spec) => [spec.id, spec]),
) as Record<FutureNativeFamilyId, FutureNativeFamilySpec>;

export function getFutureNativeFamilySpec(id: FutureNativeFamilyId): FutureNativeFamilySpec {
  return futureNativeFamilySpecMap[id];
}

export function listFutureNativeFamilyIdsByGroup(group: FutureNativeFamilyGroup): FutureNativeFamilyId[] {
  return futureNativeFamilySpecs.filter((spec) => spec.group === group).map((spec) => spec.id);
}

export function listFutureNativeFamilyIdsByStage(stage: FutureNativeFamilyStage): FutureNativeFamilyId[] {
  return futureNativeFamilySpecs.filter((spec) => spec.stage === stage).map((spec) => spec.id);
}

export function summarizeFutureNativeFamilies(): FutureNativeRegistrySummary {
  const byGroup = futureNativeFamilySpecs.reduce<Record<FutureNativeFamilyGroup, number>>(
    (acc, spec) => {
      acc[spec.group] += 1;
      return acc;
    },
    {
      mpm: 0,
      pbd: 0,
      fracture: 0,
      volumetric: 0,
      'specialist-native': 0,
    },
  );

  const byStage = futureNativeFamilySpecs.reduce<Record<FutureNativeFamilyStage, number>>(
    (acc, spec) => {
      acc[spec.stage] += 1;
      return acc;
    },
    {
      'research-scaffold': 0,
      'schema-ready': 0,
      'runtime-stub': 0,
      'verification-ready': 0,
      'native-integration': 0,
      'project-integrated': 0,
    },
  );

  return {
    totalFamilies: futureNativeFamilySpecs.length,
    byGroup,
    byStage,
  };
}
