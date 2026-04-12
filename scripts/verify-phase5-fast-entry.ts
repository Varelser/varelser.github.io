import {
  verifyFixtureFilesAreSynced,
  verifyFixtureFileParsingFast,
  verifyLegacyMigrationRebuild,
  verifySparseSerializationRecovery,
} from './verifyPhase5FixtureScenarios';
import { verifyImportInspectionDiagnostics } from './verifyPhase5ImportScenarios';
import { runVerificationSteps } from './verifyPhase5Runtime';

type VerificationResult = ReturnType<typeof verifyFixtureFilesAreSynced>;
type VerificationStep = { id: string; run: () => VerificationResult };

const STEPS: VerificationStep[] = [
  { id: 'fixture-files-synced', run: verifyFixtureFilesAreSynced },
  { id: 'sparse-serialization-recovery', run: verifySparseSerializationRecovery },
  { id: 'legacy-migration-rebuild', run: verifyLegacyMigrationRebuild },
  { id: 'fixture-file-parsing-fast', run: verifyFixtureFileParsingFast },
  { id: 'import-inspection-diagnostics', run: verifyImportInspectionDiagnostics },
];

export async function main() {
  const result = runVerificationSteps('fast', 'verify-phase5', STEPS);
  console.log(JSON.stringify(result, null, 2));
}
