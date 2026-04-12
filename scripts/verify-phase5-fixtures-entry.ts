import {
  verifyFixtureFilesAreSynced,
  verifyFixtureFileParsing,
  verifyLegacyMigrationRebuild,
  verifyOptionalRealExportFixtures,
  verifyRoundTripStability,
  verifySparseSerializationRecovery,
} from './verifyPhase5FixtureScenarios';
import { runVerificationSteps } from './verifyPhase5Runtime';

type VerificationResult = ReturnType<typeof verifyFixtureFilesAreSynced>;
type VerificationStep = { id: string; run: () => VerificationResult };

const STEPS: VerificationStep[] = [
  { id: 'fixture-files-synced', run: verifyFixtureFilesAreSynced },
  { id: 'sparse-serialization-recovery', run: verifySparseSerializationRecovery },
  { id: 'legacy-migration-rebuild', run: verifyLegacyMigrationRebuild },
  { id: 'fixture-file-parsing', run: verifyFixtureFileParsing },
  { id: 'optional-real-export-fixtures', run: verifyOptionalRealExportFixtures },
  { id: 'roundtrip-stability', run: verifyRoundTripStability },
];

export async function main() {
  const result = runVerificationSteps('fixtures', 'verify-phase5', STEPS);
  console.log(JSON.stringify(result, null, 2));
}
