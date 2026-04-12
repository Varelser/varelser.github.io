import { listFutureNativeFamilyIdsByGroup, getFutureNativeFamilySpec } from './futureNativeFamiliesRegistry';
import { getFutureNativeFamilyDefaultConfig } from './futureNativeFamiliesDefaults';
import type { FutureNativeFamilyId, FutureNativeFamilyStubConfig } from './futureNativeFamiliesTypes';

const VOLUMETRIC_FAMILY_IDS = listFutureNativeFamilyIdsByGroup('volumetric');

export interface FutureNativeVolumetricRuntimeStub {
  id: FutureNativeFamilyId;
  config: FutureNativeFamilyStubConfig;
  fieldHint: 'scalar-density' | 'velocity-coupled' | 'lighting-coupled';
  outputHint: 'fog' | 'volume' | 'hybrid';
  nextImplementationStep: string;
}

export function buildFutureNativeVolumetricRuntimeStubs(): FutureNativeVolumetricRuntimeStub[] {
  return VOLUMETRIC_FAMILY_IDS.map((id) => {
    const spec = getFutureNativeFamilySpec(id);
    const config = getFutureNativeFamilyDefaultConfig(id);
    const fieldHint =
      id === 'volumetric-density-transport'
        ? 'scalar-density'
        : id === 'volumetric-light-shadow-coupling'
          ? 'lighting-coupled'
          : 'velocity-coupled';
    return {
      id,
      config,
      fieldHint,
      outputHint: id === 'volumetric-light-shadow-coupling' ? 'hybrid' : 'fog',
      nextImplementationStep: spec.implementationNotes[0] ?? 'Define field stepping and renderer bridge.',
    };
  });
}
