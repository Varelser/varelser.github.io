import { listFutureNativeFamilyIdsByGroup, getFutureNativeFamilySpec } from './futureNativeFamiliesRegistry';
import { getFutureNativeFamilyDefaultConfig } from './futureNativeFamiliesDefaults';
import type { FutureNativeFamilyId, FutureNativeFamilyStubConfig } from './futureNativeFamiliesTypes';

const FRACTURE_FAMILY_IDS = listFutureNativeFamilyIdsByGroup('fracture');

export interface FutureNativeFractureRuntimeStub {
  id: FutureNativeFamilyId;
  config: FutureNativeFamilyStubConfig;
  substrateHint: 'lattice' | 'voxel' | 'surface';
  debrisOutputHint: boolean;
  nextImplementationStep: string;
}

export function buildFutureNativeFractureRuntimeStubs(): FutureNativeFractureRuntimeStub[] {
  return FRACTURE_FAMILY_IDS.map((id) => {
    const spec = getFutureNativeFamilySpec(id);
    const config = getFutureNativeFamilyDefaultConfig(id);
    const substrateHint = id === 'fracture-voxel' ? 'voxel' : id === 'fracture-crack-propagation' ? 'surface' : 'lattice';
    return {
      id,
      config,
      substrateHint,
      debrisOutputHint: id !== 'fracture-crack-propagation',
      nextImplementationStep: spec.implementationNotes[0] ?? 'Define fracture substrate state.',
    };
  });
}
