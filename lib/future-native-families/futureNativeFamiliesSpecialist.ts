import { listFutureNativeFamilyIdsByGroup, getFutureNativeFamilySpec } from './futureNativeFamiliesRegistry';
import { getFutureNativeFamilyDefaultConfig } from './futureNativeFamiliesDefaults';
import type { FutureNativeFamilyId, FutureNativeFamilyStubConfig } from './futureNativeFamiliesTypes';

const SPECIALIST_NATIVE_FAMILY_IDS = listFutureNativeFamilyIdsByGroup('specialist-native');

export interface FutureNativeSpecialistRuntimeStub {
  id: FutureNativeFamilyId;
  config: FutureNativeFamilyStubConfig;
  graphHint: 'node-chain' | 'emitter-stack' | 'operator-pipe' | 'graph-stage';
  outputHint: 'multi-output';
  nextImplementationStep: string;
}

function buildFutureNativeSpecialistRuntimeStub(id: FutureNativeFamilyId): FutureNativeSpecialistRuntimeStub {
  const spec = getFutureNativeFamilySpec(id);
  const config = getFutureNativeFamilyDefaultConfig(id);
  const graphHint =
    id === 'specialist-houdini-native'
      ? 'node-chain'
      : id === 'specialist-niagara-native'
        ? 'emitter-stack'
        : id === 'specialist-touchdesigner-native'
          ? 'operator-pipe'
          : 'graph-stage';
  return {
    id,
    config,
    graphHint,
    outputHint: 'multi-output',
    nextImplementationStep: spec.implementationNotes[0] ?? 'Define native graph block schema.',
  };
}

export function getFutureNativeSpecialistRuntimeStub(id: FutureNativeFamilyId): FutureNativeSpecialistRuntimeStub {
  return buildFutureNativeSpecialistRuntimeStub(id);
}

export function buildFutureNativeSpecialistRuntimeStubs(): FutureNativeSpecialistRuntimeStub[] {
  return SPECIALIST_NATIVE_FAMILY_IDS.map((id) => buildFutureNativeSpecialistRuntimeStub(id));
}
