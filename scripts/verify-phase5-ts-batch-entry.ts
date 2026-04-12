import { verifyFixtureFileParsing, verifyOptionalRealExportFixtures, verifyRoundTripStability } from './verifyPhase5FixtureScenarios';
import {
  verifyDuplicateImportRecovery,
  verifyFileRoundTripAndImportPreparation,
  verifyOrphanSequenceRecovery,
  verifyReplaceModePreservesStableIds,
} from './verifyPhase5ImportScenarios';

const STEP_RUNNERS = {
  'fixture-file-parsing': verifyFixtureFileParsing,
  'replace-mode-preserves-stable-ids': verifyReplaceModePreservesStableIds,
  'optional-real-export-fixtures': verifyOptionalRealExportFixtures,
  'file-roundtrip-import-preparation': verifyFileRoundTripAndImportPreparation,
  'duplicate-import-recovery': verifyDuplicateImportRecovery,
  'orphan-sequence-recovery': verifyOrphanSequenceRecovery,
  'roundtrip-stability': verifyRoundTripStability,
} as const;

export async function main() {
  const requestedStepIds = process.argv.slice(2).map((value) => String(value).trim().toLowerCase()).filter(Boolean);
  if (requestedStepIds.length === 0) {
    throw new Error('[verify-phase5-ts-batch] expected at least one step id');
  }

  const scenarios = requestedStepIds.map((stepId) => {
    const runner = STEP_RUNNERS[stepId as keyof typeof STEP_RUNNERS];
    if (!runner) {
      throw new Error(`[verify-phase5-ts-batch] unsupported step id: ${stepId}`);
    }
    const startedAt = Date.now();
    const scenario = runner();
    return {
      ...scenario,
      requestedStepId: stepId,
      durationMs: Date.now() - startedAt,
    };
  });

  console.log(JSON.stringify({ scenarios }, null, 2));
}
