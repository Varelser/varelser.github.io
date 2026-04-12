import { buildFutureNativeAcceptanceChecklist } from './futureNativeFamiliesAcceptance';
import { getFutureNativeVerificationScenario } from './futureNativeFamiliesVerificationScenarios';
import { getFutureNativeFamilySpecById } from './futureNativeFamiliesLookup';
import type { FutureNativeFamilyId } from './futureNativeFamiliesTypes';

export interface FutureNativeBacklogPacket {
  familyId: FutureNativeFamilyId;
  implementationOrder: readonly string[];
  acceptance: readonly string[];
  verificationChecks: readonly string[];
}

export function buildFutureNativeBacklogPacket(familyId: FutureNativeFamilyId): FutureNativeBacklogPacket {
  const spec = getFutureNativeFamilySpecById(familyId);
  const acceptance = buildFutureNativeAcceptanceChecklist(familyId);
  const scenario = getFutureNativeVerificationScenario(familyId);
  return {
    familyId,
    implementationOrder: [
      `Add ${spec.serializerBlockKey} schema/default block.`,
      'Add serialization + migration hook.',
      'Add runtime adapter stub.',
      'Expose manifest / diagnostics route.',
      `Add verifier scenario: ${scenario.id}.`,
      'Document control-panel / renderer bridge assumptions.',
    ],
    acceptance: [...acceptance.mustPass],
    verificationChecks: [...scenario.checks],
  };
}
