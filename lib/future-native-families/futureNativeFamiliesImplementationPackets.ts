import { buildFutureNativeAcceptanceChecklist } from './futureNativeFamiliesAcceptance';
import { buildFutureNativeFamilyAiPacket } from './futureNativeFamiliesAiPackets';
import { buildFutureNativeBacklogPacket } from './futureNativeFamiliesBacklog';
import { getFutureNativeFamilySpecById } from './futureNativeFamiliesLookup';
import { buildFutureNativeFamilyStarterRuntimePacket } from './futureNativeFamiliesStarterRuntime';
import { getFutureNativeVerificationScenario } from './futureNativeFamiliesVerificationScenarios';
import type { FutureNativeFamilyId, FutureNativeFamilySpec } from './futureNativeFamiliesTypes';

export interface FutureNativeFamilyImplementationPacket {
  entry: FutureNativeFamilySpec;
  acceptance: ReturnType<typeof buildFutureNativeAcceptanceChecklist>;
  backlog: ReturnType<typeof buildFutureNativeBacklogPacket>;
  verification: ReturnType<typeof getFutureNativeVerificationScenario>;
  starterRuntime: ReturnType<typeof buildFutureNativeFamilyStarterRuntimePacket>;
  aiPacket: string;
}

export function buildFutureNativeFamilyImplementationPacket(id: FutureNativeFamilyId): FutureNativeFamilyImplementationPacket {
  const entry = getFutureNativeFamilySpecById(id);
  return {
    entry,
    acceptance: buildFutureNativeAcceptanceChecklist(id),
    backlog: buildFutureNativeBacklogPacket(id),
    verification: getFutureNativeVerificationScenario(id),
    starterRuntime: buildFutureNativeFamilyStarterRuntimePacket(entry),
    aiPacket: buildFutureNativeFamilyAiPacket(id),
  };
}
