import {
  verifyLegacyMigrationRebuild,
  verifyRoundTripStability,
  verifySparseSerializationRecovery,
} from './verifyPhase5FixtureScenarios';
import {
  verifyDuplicateImportRecovery,
  verifyOrphanSequenceRecovery,
  verifyReplaceModePreservesStableIds,
} from './verifyPhase5ImportScenarios';
import { runVerificationSteps } from './verifyPhase5Runtime';

type VerificationResult = ReturnType<typeof verifySparseSerializationRecovery>;
type VerificationStep = { id: string; run: () => VerificationResult };

const STEPS: VerificationStep[] = [
  { id: 'sparse-serialization-recovery', run: verifySparseSerializationRecovery },
  { id: 'legacy-migration-rebuild', run: verifyLegacyMigrationRebuild },
  { id: 'replace-mode-preserves-stable-ids', run: verifyReplaceModePreservesStableIds },
  { id: 'duplicate-import-recovery', run: verifyDuplicateImportRecovery },
  { id: 'orphan-sequence-recovery', run: verifyOrphanSequenceRecovery },
  { id: 'roundtrip-stability', run: verifyRoundTripStability },
];

export async function main() {
  const result = runVerificationSteps('recovery', 'verify-phase5', STEPS);
  console.log(JSON.stringify(result, null, 2));
}
