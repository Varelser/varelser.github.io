import {
  verifyDuplicateImportRecovery,
  verifyFileRoundTripAndImportPreparation,
  verifyImportInspectionDiagnostics,
  verifyOrphanSequenceRecovery,
  verifyReplaceModePreservesStableIds,
} from './verifyPhase5ImportScenarios';
import { runVerificationSteps } from './verifyPhase5Runtime';

type VerificationResult = ReturnType<typeof verifyImportInspectionDiagnostics>;
type VerificationStep = { id: string; run: () => VerificationResult };

const STEPS: VerificationStep[] = [
  { id: 'replace-mode-preserves-stable-ids', run: verifyReplaceModePreservesStableIds },
  { id: 'import-inspection-diagnostics', run: verifyImportInspectionDiagnostics },
  { id: 'file-roundtrip-import-preparation', run: verifyFileRoundTripAndImportPreparation },
  { id: 'duplicate-import-recovery', run: verifyDuplicateImportRecovery },
  { id: 'orphan-sequence-recovery', run: verifyOrphanSequenceRecovery },
];

export async function main() {
  const result = runVerificationSteps('imports', 'verify-phase5', STEPS);
  console.log(JSON.stringify(result, null, 2));
}
