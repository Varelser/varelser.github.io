import { listFutureNativeFamilyIdsByGroup, getFutureNativeFamilySpec } from './futureNativeFamiliesRegistry';
import { getFutureNativeFamilyDefaultConfig } from './futureNativeFamiliesDefaults';
import type { FutureNativeFamilyId, FutureNativeFamilyStubConfig } from './futureNativeFamiliesTypes';

const MPM_FAMILY_IDS = listFutureNativeFamilyIdsByGroup('mpm');

export interface FutureNativeMpmRuntimeStub {
  id: FutureNativeFamilyId;
  config: FutureNativeFamilyStubConfig;
  transferModel: 'particle-grid-particle' | 'particle-grid-lite';
  outputHint: 'particles' | 'surface' | 'volume';
  nextImplementationStep: string;
}

export function buildFutureNativeMpmRuntimeStubs(): FutureNativeMpmRuntimeStub[] {
  return MPM_FAMILY_IDS.map((id) => {
    const spec = getFutureNativeFamilySpec(id);
    const config = getFutureNativeFamilyDefaultConfig(id);
    return {
      id,
      config,
      transferModel: config.solverDepth === 'deep' ? 'particle-grid-particle' : 'particle-grid-lite',
      outputHint: id === 'mpm-granular' ? 'particles' : 'surface',
      nextImplementationStep: spec.implementationNotes[0] ?? 'Define transfer kernel split.',
    };
  });
}
