import { futureNativeFamilySpecs } from './futureNativeFamiliesRegistry';
import { futureNativeFamilyDefaultConfigs } from './futureNativeFamiliesDefaults';
import type { FutureNativeFamilyId, FutureNativeFamilyStubConfig } from './futureNativeFamiliesTypes';

export interface FutureNativeFamilySerializedBlock {
  familyId: FutureNativeFamilyId;
  serializerBlockKey: string;
  enabled: boolean;
  solverDepth: string;
  iterations: number;
  damping: number;
  coupling: number;
  stage: string;
  notes: string[];
}

export type FutureNativeFamilySerializedMap = Record<FutureNativeFamilyId, FutureNativeFamilySerializedBlock>;

export function buildFutureNativeFamilySerializedMap(): FutureNativeFamilySerializedMap {
  return Object.fromEntries(
    futureNativeFamilySpecs.map((spec) => {
      const defaults = futureNativeFamilyDefaultConfigs[spec.id];
      const block: FutureNativeFamilySerializedBlock = {
        familyId: spec.id,
        serializerBlockKey: spec.serializerBlockKey,
        enabled: defaults.enabled,
        solverDepth: defaults.solverDepth,
        iterations: defaults.iterations,
        damping: defaults.damping,
        coupling: defaults.coupling,
        stage: spec.stage,
        notes: [...spec.implementationNotes],
      };
      return [spec.id, block];
    }),
  ) as FutureNativeFamilySerializedMap;
}

export function mergeFutureNativeFamilySerializedBlock(
  familyId: FutureNativeFamilyId,
  incoming?: Partial<FutureNativeFamilyStubConfig>,
): FutureNativeFamilySerializedBlock {
  const spec = futureNativeFamilySpecs.find((entry) => entry.id === familyId);
  const defaults = futureNativeFamilyDefaultConfigs[familyId];
  if (!spec) {
    throw new Error(`Unknown future native family: ${familyId}`);
  }

  return {
    familyId,
    serializerBlockKey: spec.serializerBlockKey,
    enabled: incoming?.enabled ?? defaults.enabled,
    solverDepth: incoming?.solverDepth ?? defaults.solverDepth,
    iterations: incoming?.iterations ?? defaults.iterations,
    damping: incoming?.damping ?? defaults.damping,
    coupling: incoming?.coupling ?? defaults.coupling,
    stage: spec.stage,
    notes: [...spec.implementationNotes],
  };
}
