export const PHASE5_VERIFICATION_STEP_IDS = [
  'fixture-files-synced',
  'sparse-serialization-recovery',
  'legacy-migration-rebuild',
  'fixture-file-parsing',
  'replace-mode-preserves-stable-ids',
  'optional-real-export-fixtures',
  'import-inspection-diagnostics',
  'file-roundtrip-import-preparation',
  'duplicate-import-recovery',
  'orphan-sequence-recovery',
  'roundtrip-stability',
  'strict-leaf-archive-evidence',
] as const;

export type Phase5VerificationStepId = typeof PHASE5_VERIFICATION_STEP_IDS[number];
export type Phase5VerificationProfile = 'full' | 'fast' | 'operational' | 'smoke' | 'fixtures' | 'imports' | 'recovery';

const PHASE5_PROFILE_STEP_IDS: Record<Phase5VerificationProfile, Phase5VerificationStepId[]> = {
  full: [...PHASE5_VERIFICATION_STEP_IDS].filter((stepId) => stepId !== 'strict-leaf-archive-evidence'),
  fast: [
    'fixture-files-synced',
    'sparse-serialization-recovery',
    'legacy-migration-rebuild',
    'import-inspection-diagnostics',
    'strict-leaf-archive-evidence',
  ],
  operational: [
    'fixture-files-synced',
    'sparse-serialization-recovery',
    'legacy-migration-rebuild',
    'import-inspection-diagnostics',
    'strict-leaf-archive-evidence',
  ],
  smoke: [
    'fixture-files-synced',
    'sparse-serialization-recovery',
    'legacy-migration-rebuild',
    'import-inspection-diagnostics',
  ],
  fixtures: [
    'fixture-files-synced',
    'sparse-serialization-recovery',
    'legacy-migration-rebuild',
    'fixture-file-parsing',
    'optional-real-export-fixtures',
    'roundtrip-stability',
  ],
  imports: [
    'replace-mode-preserves-stable-ids',
    'import-inspection-diagnostics',
    'file-roundtrip-import-preparation',
    'duplicate-import-recovery',
    'orphan-sequence-recovery',
  ],
  recovery: [
    'sparse-serialization-recovery',
    'legacy-migration-rebuild',
    'replace-mode-preserves-stable-ids',
    'duplicate-import-recovery',
    'orphan-sequence-recovery',
    'roundtrip-stability',
  ],
};

export function normalizePhase5VerificationProfile(value: string | undefined): Phase5VerificationProfile {
  const normalized = String(value || 'full').trim().toLowerCase();
  return (normalized in PHASE5_PROFILE_STEP_IDS ? normalized : 'full') as Phase5VerificationProfile;
}

export function resolvePhase5VerificationStepIds(
  profileValue: string | undefined,
  stepIdValue?: string | undefined,
): Phase5VerificationStepId[] {
  const requestedStepId = String(stepIdValue || '').trim().toLowerCase();
  if (requestedStepId) {
    if (!PHASE5_VERIFICATION_STEP_IDS.includes(requestedStepId as Phase5VerificationStepId)) {
      throw new Error(`[verify-phase5] unknown VERIFY_PHASE5_STEP=${JSON.stringify(stepIdValue)}`);
    }
    return [requestedStepId as Phase5VerificationStepId];
  }

  const profile = normalizePhase5VerificationProfile(profileValue);
  return [...PHASE5_PROFILE_STEP_IDS[profile]];
}
