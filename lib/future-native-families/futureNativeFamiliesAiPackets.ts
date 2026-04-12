import { buildFutureNativeFamilyImplementationPrompt } from './futureNativeFamiliesPrompts';
import { buildFutureNativeAcceptanceChecklist } from './futureNativeFamiliesAcceptance';
import { buildFutureNativeBacklogPacket } from './futureNativeFamiliesBacklog';
import { getFutureNativeVerificationScenario } from './futureNativeFamiliesVerificationScenarios';
import { getFutureNativeFamilySpecById } from './futureNativeFamiliesLookup';
import type { FutureNativeFamilyId } from './futureNativeFamiliesTypes';

export function buildFutureNativeFamilyAiPacket(id: FutureNativeFamilyId): string {
  const spec = getFutureNativeFamilySpecById(id);
  const acceptance = buildFutureNativeAcceptanceChecklist(id);
  const backlog = buildFutureNativeBacklogPacket(id);
  const scenario = getFutureNativeVerificationScenario(id);
  return [
    `# ${spec.title}`,
    '',
    `- id: ${spec.id}`,
    `- group: ${spec.group}`,
    `- serializerBlockKey: ${spec.serializerBlockKey}`,
    `- verificationScenarioId: ${spec.verificationScenarioId}`,
    '',
    '## Prompt',
    buildFutureNativeFamilyImplementationPrompt(id),
    '',
    '## Ordered tasks',
    ...backlog.implementationOrder.map((entry, index) => `${index + 1}. ${entry}`),
    '',
    '## Must pass',
    ...acceptance.mustPass.map((entry) => `- ${entry}`),
    '',
    '## Verification fixture',
    `- ${scenario.fixtureHint}`,
    ...scenario.checks.map((entry) => `- ${entry}`),
  ].join('\n');
}
