import type { FutureNativeFamilyGroup, FutureNativeFamilyId } from './futureNativeFamiliesTypes';

export type FutureNativeMilestoneId =
  | 'schema-block'
  | 'migration-hook'
  | 'runtime-stub'
  | 'diagnostics-surface'
  | 'ui-surface'
  | 'verification-fixture'
  | 'renderer-bridge'
  | 'native-solver-core';

export interface FutureNativeMilestone {
  id: FutureNativeMilestoneId;
  title: string;
  doneWhen: string;
}

export interface FutureNativeMilestonePlan {
  familyId: FutureNativeFamilyId;
  group: FutureNativeFamilyGroup;
  milestones: readonly FutureNativeMilestone[];
}

const BASE_MILESTONES: readonly FutureNativeMilestone[] = [
  { id: 'schema-block', title: 'Schema block', doneWhen: 'Family config block exists in project schema with defaults and serializer key.' },
  { id: 'migration-hook', title: 'Migration hook', doneWhen: 'Older project payloads can load with safe fallback defaults for this family.' },
  { id: 'runtime-stub', title: 'Runtime stub', doneWhen: 'A family-specific runtime adapter can be toggled on without crashing.' },
  { id: 'diagnostics-surface', title: 'Diagnostics surface', doneWhen: 'Manifest or diagnostics view exposes the family id, stage, and active route.' },
  { id: 'verification-fixture', title: 'Verification fixture', doneWhen: 'At least one family-specific verification scenario runs in CI or local verify script.' },
];

const GROUP_MILESTONES: Record<FutureNativeFamilyGroup, readonly FutureNativeMilestone[]> = {
  mpm: [
    { id: 'renderer-bridge', title: 'Renderer bridge', doneWhen: 'Material-point output can bridge to particles or surfaces.' },
    { id: 'native-solver-core', title: 'Native solver core', doneWhen: 'Grid-particle-grid transfer and stress update steps run in a stable loop.' },
  ],
  pbd: [
    { id: 'ui-surface', title: 'UI surface', doneWhen: 'Constraint presets and collision toggles are editable from the control panel.' },
    { id: 'native-solver-core', title: 'Native solver core', doneWhen: 'Constraint projection loop runs with stable topology updates.' },
  ],
  fracture: [
    { id: 'renderer-bridge', title: 'Renderer bridge', doneWhen: 'Fractured shards or debris can bridge to existing particle or mesh outputs.' },
    { id: 'native-solver-core', title: 'Native solver core', doneWhen: 'Substrate breakage state updates and emits debris/shards deterministically.' },
  ],
  volumetric: [
    { id: 'renderer-bridge', title: 'Renderer bridge', doneWhen: 'Density field can feed fog/volume renderer with stable stepping.' },
    { id: 'native-solver-core', title: 'Native solver core', doneWhen: 'Field stepping supports advection and stable source injection.' },
  ],
  'specialist-native': [
    { id: 'ui-surface', title: 'UI surface', doneWhen: 'Graph/operator stage is represented in the UI without collapsing into preset-only mode.' },
    { id: 'native-solver-core', title: 'Native solver core', doneWhen: 'At least one engine-native graph stage runs independently of reference packs.' },
  ],
};

export function buildFutureNativeMilestonePlan(familyId: FutureNativeFamilyId, group: FutureNativeFamilyGroup): FutureNativeMilestonePlan {
  return {
    familyId,
    group,
    milestones: [...BASE_MILESTONES, ...GROUP_MILESTONES[group]],
  };
}
