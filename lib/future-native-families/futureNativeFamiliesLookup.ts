import { futureNativeFamilySpecs } from './futureNativeFamiliesRegistry';
import type { FutureNativeFamilyId, FutureNativeFamilySpec } from './futureNativeFamiliesTypes';
import { futureNativeVerificationScenarios, type FutureNativeVerificationScenario } from './futureNativeFamiliesVerificationScenarios';

export function getFutureNativeFamilySpecById(id: FutureNativeFamilyId): FutureNativeFamilySpec {
  for (const spec of futureNativeFamilySpecs) {
    if (spec.id === id) return spec;
  }
  throw new Error(`Unknown future native family: ${id}`);
}

export function getFutureNativeVerificationScenarioByFamilyId(id: FutureNativeFamilyId): FutureNativeVerificationScenario {
  for (const scenario of futureNativeVerificationScenarios) {
    if (scenario.familyId === id) return scenario;
  }
  throw new Error(`Unknown future native family verification scenario: ${id}`);
}
