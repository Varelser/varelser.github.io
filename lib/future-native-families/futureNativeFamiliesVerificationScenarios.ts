import { futureNativeFamilySpecs } from './futureNativeFamiliesRegistry';
import type { FutureNativeFamilyGroup, FutureNativeFamilyId } from './futureNativeFamiliesTypes';

export interface FutureNativeVerificationScenario {
  id: string;
  familyId: FutureNativeFamilyId;
  group: FutureNativeFamilyGroup;
  title: string;
  fixtureHint: string;
  checks: readonly string[];
}

function getFixtureHint(group: FutureNativeFamilyGroup): string {
  switch (group) {
    case 'mpm':
      return 'Single source emitter above a receiving plane with medium particle budget.';
    case 'pbd':
      return 'Minimal topology fixture with one collision object and deterministic seed.';
    case 'fracture':
      return 'Single breakable substrate with one trigger impulse and fixed seed.';
    case 'volumetric':
      return 'Low-resolution scalar field with one injector and one renderer bridge.';
    case 'specialist-native':
      return 'One minimal graph/operator stage with one output bridge.';
  }
}

function getChecks(group: FutureNativeFamilyGroup): readonly string[] {
  switch (group) {
    case 'mpm':
      return ['config serializes', 'native path toggles on', 'bounded particle or surface output'];
    case 'pbd':
      return ['config serializes', 'constraint iterations apply', 'topology remains connected'];
    case 'fracture':
      return ['config serializes', 'break trigger applies', 'debris or shard output remains bounded'];
    case 'volumetric':
      return ['config serializes', 'field state steps', 'renderer bridge receives density'];
    case 'specialist-native':
      return ['config serializes', 'native graph stage instantiates', 'output bridge executes'];
  }
}

export const futureNativeVerificationScenarios: readonly FutureNativeVerificationScenario[] = futureNativeFamilySpecs.map((spec) => ({
  id: spec.verificationScenarioId,
  familyId: spec.id,
  group: spec.group,
  title: `${spec.title} verification`,
  fixtureHint: getFixtureHint(spec.group),
  checks: getChecks(spec.group),
}));

export function getFutureNativeVerificationScenario(id: FutureNativeFamilyId): FutureNativeVerificationScenario {
  for (const scenario of futureNativeVerificationScenarios) {
    if (scenario.familyId === id) {
      return scenario;
    }
  }
  throw new Error(`Unknown future native family verification scenario: ${id}`);
}
