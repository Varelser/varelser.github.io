import type { FutureNativeFamilyId } from './futureNativeFamiliesTypes';
import { getFutureNativeFamilySpec } from './futureNativeFamiliesRegistry';

export function buildFutureNativeFamilyImplementationPrompt(id: FutureNativeFamilyId): string {
  const spec = getFutureNativeFamilySpec(id);
  return [
    `Implement the native family: ${spec.title} (${spec.id}).`,
    `Group: ${spec.group}`,
    `Target behaviors: ${spec.targetBehaviors.join(', ')}`,
    `Recommended solver depth: ${spec.recommendedDepth}`,
    `Serializer block key: ${spec.serializerBlockKey}`,
    `Verification scenario id: ${spec.verificationScenarioId}`,
    'Work in this exact order:',
    '1. schema/default block',
    '2. serialization + migration placeholder',
    '3. runtime adapter stub',
    '4. diagnostics / manifest exposure',
    '5. one verification fixture',
    '6. docs sync',
    'Do not broaden scope to other families in the same pass.',
    `Implementation notes: ${spec.implementationNotes.join(' | ')}`,
  ].join('\n');
}
