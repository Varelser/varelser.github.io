import { buildFutureNativeMilestonePlan } from './futureNativeFamiliesMilestones';
import { getFutureNativeFamilySpecById } from './futureNativeFamiliesLookup';
import type { FutureNativeFamilyId } from './futureNativeFamiliesTypes';

export interface FutureNativeAcceptanceChecklist {
  familyId: FutureNativeFamilyId;
  mustPass: readonly string[];
  shouldPass: readonly string[];
  niceToHave: readonly string[];
}

const GROUP_SHOULD_PASS: Record<string, readonly string[]> = {
  mpm: ['source injection remains bounded', 'frame-to-frame settling is visually continuous'],
  pbd: ['constraint stretch stays bounded', 'collision fallback degrades gracefully'],
  fracture: ['break trigger is deterministic for fixed seed', 'debris count stays within budget'],
  volumetric: ['density transport remains bounded', 'renderer fallback still displays field state'],
  'specialist-native': ['graph stage can serialize independently', 'native graph does not depend on reference pack runtime'],
};

export function buildFutureNativeAcceptanceChecklist(familyId: FutureNativeFamilyId): FutureNativeAcceptanceChecklist {
  const spec = getFutureNativeFamilySpecById(familyId);
  const milestonePlan = buildFutureNativeMilestonePlan(spec.id, spec.group);
  return {
    familyId,
    mustPass: milestonePlan.milestones.map((milestone) => milestone.doneWhen),
    shouldPass: GROUP_SHOULD_PASS[spec.group] ?? [],
    niceToHave: [
      'Export/import round-trip preserves family-specific config.',
      'Diagnostics overlay can explain why the native path was or was not chosen.',
    ],
  };
}
