import { listFutureNativeFamilyIdsByGroup, getFutureNativeFamilySpec } from './futureNativeFamiliesRegistry';
import { getFutureNativeFamilyDefaultConfig } from './futureNativeFamiliesDefaults';
import type { FutureNativeFamilyId, FutureNativeFamilyStubConfig } from './futureNativeFamiliesTypes';

const PBD_FAMILY_IDS = listFutureNativeFamilyIdsByGroup('pbd');

export interface FutureNativePbdRuntimeStub {
  id: FutureNativeFamilyId;
  config: FutureNativeFamilyStubConfig;
  topologyHint: 'grid' | 'chain' | 'tet-cluster';
  collisionHint: 'none-yet' | 'sphere-only' | 'surface-needed';
  nextImplementationStep: string;
}

export function buildFutureNativePbdRuntimeStubs(): FutureNativePbdRuntimeStub[] {
  return PBD_FAMILY_IDS.map((id) => {
    const spec = getFutureNativeFamilySpec(id);
    const config = getFutureNativeFamilyDefaultConfig(id);
    const topologyHint = id === 'pbd-rope' ? 'chain' : id === 'pbd-softbody' ? 'tet-cluster' : 'grid';
    return {
      id,
      config,
      topologyHint,
      collisionHint: id === 'pbd-rope' ? 'sphere-only' : 'surface-needed',
      nextImplementationStep: spec.implementationNotes[0] ?? 'Define constraint set.',
    };
  });
}
