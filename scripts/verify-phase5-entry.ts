import {
  verifyFixtureFilesAreSynced,
  verifyFixtureFileParsing,
  verifyFixtureFileParsingFast,
  verifyLegacyMigrationRebuild,
  verifyOptionalRealExportFixtures,
  verifyRoundTripStability,
  verifySparseSerializationRecovery,
} from './verifyPhase5FixtureScenarios';
import {
  verifyDuplicateImportRecovery,
  verifyFileRoundTripAndImportPreparation,
  verifyImportInspectionDiagnostics,
  verifyOrphanSequenceRecovery,
  verifyReplaceModePreservesStableIds,
} from './verifyPhase5ImportScenarios';

import { resolvePhase5VerificationStepIds } from './verifyPhase5Profiles';
import { runVerificationSteps } from './verifyPhase5Runtime';

const phase5Profile = String(process.env?.VERIFY_PHASE5_PROFILE || 'full').trim().toLowerCase();
const selectedStepId = String(process.env?.VERIFY_PHASE5_STEP || '').trim().toLowerCase();

type VerificationResult = ReturnType<typeof verifyFixtureFilesAreSynced>;
type VerificationStep = { id: string; run: () => VerificationResult };

const ALL_STEPS: VerificationStep[] = [
  { id: 'fixture-files-synced', run: verifyFixtureFilesAreSynced },
  { id: 'sparse-serialization-recovery', run: verifySparseSerializationRecovery },
  { id: 'legacy-migration-rebuild', run: verifyLegacyMigrationRebuild },
  { id: 'fixture-file-parsing', run: verifyFixtureFileParsing },
  { id: 'replace-mode-preserves-stable-ids', run: verifyReplaceModePreservesStableIds },
  { id: 'optional-real-export-fixtures', run: verifyOptionalRealExportFixtures },
  { id: 'import-inspection-diagnostics', run: verifyImportInspectionDiagnostics },
  { id: 'file-roundtrip-import-preparation', run: verifyFileRoundTripAndImportPreparation },
  { id: 'duplicate-import-recovery', run: verifyDuplicateImportRecovery },
  { id: 'orphan-sequence-recovery', run: verifyOrphanSequenceRecovery },
  { id: 'roundtrip-stability', run: verifyRoundTripStability },
];
const STEP_MAP = new Map(ALL_STEPS.map((step) => [step.id, step]));

function getSteps(): VerificationStep[] {
  const resolvedStepIds = resolvePhase5VerificationStepIds(phase5Profile, selectedStepId);
  return resolvedStepIds.map((stepId) => {
    if (stepId === 'fixture-file-parsing' && phase5Profile === 'fast' && !selectedStepId) {
      return { id: 'fixture-file-parsing-fast', run: verifyFixtureFileParsingFast };
    }
    const step = STEP_MAP.get(stepId);
    if (!step) throw new Error(`[verify-phase5] unresolved step ${stepId}`);
    return step;
  });
}

export async function main() {
  const result = runVerificationSteps(selectedStepId || phase5Profile, 'verify-phase5', getSteps());
  console.log(JSON.stringify(result, null, 2));
}
