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
];

export const PHASE5_PROFILE_STEP_IDS = {
  full: PHASE5_VERIFICATION_STEP_IDS.filter((stepId) => stepId !== 'strict-leaf-archive-evidence'),
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

export const PHASE5_STEP_ENTRYPOINTS = {
  'fixture-files-synced': { type: 'node', entry: 'scripts/verifyPhase5StepFixtureFilesSynced.mjs' },
  'sparse-serialization-recovery': { type: 'node', entry: 'scripts/verifyPhase5StepSparseSerializationRecovery.mjs' },
  'legacy-migration-rebuild': { type: 'node', entry: 'scripts/verifyPhase5StepLegacyMigrationRebuild.mjs' },
  'fixture-file-parsing': { type: 'ts', entry: 'scripts/verify-phase5-step-fixture-parsing-entry.ts' },
  'replace-mode-preserves-stable-ids': { type: 'ts', entry: 'scripts/verify-phase5-step-replace-mode-entry.ts' },
  'optional-real-export-fixtures': { type: 'ts', entry: 'scripts/verify-phase5-step-optional-real-export-entry.ts' },
  'import-inspection-diagnostics': { type: 'node', entry: 'scripts/verifyPhase5StepImportInspectionDiagnostics.mjs' },
  'file-roundtrip-import-preparation': { type: 'ts', entry: 'scripts/verify-phase5-step-file-roundtrip-entry.ts' },
  'duplicate-import-recovery': { type: 'ts', entry: 'scripts/verify-phase5-step-duplicate-import-entry.ts' },
  'orphan-sequence-recovery': { type: 'ts', entry: 'scripts/verify-phase5-step-orphan-sequence-entry.ts' },
  'roundtrip-stability': { type: 'ts', entry: 'scripts/verify-phase5-step-roundtrip-entry.ts' },
  'strict-leaf-archive-evidence': { type: 'node', entry: 'scripts/verifyPhase5StrictLeafArchiveEvidence.mjs' },
};

export function normalizePhase5VerificationProfile(value) {
  const normalized = String(value || 'full').trim().toLowerCase();
  return Object.prototype.hasOwnProperty.call(PHASE5_PROFILE_STEP_IDS, normalized) ? normalized : 'full';
}

export function resolvePhase5VerificationStepIds(profileValue, stepIdValue = '') {
  const requestedStepId = String(stepIdValue || '').trim().toLowerCase();
  if (requestedStepId) {
    if (!PHASE5_VERIFICATION_STEP_IDS.includes(requestedStepId)) {
      throw new Error(`[verify-phase5] unknown VERIFY_PHASE5_STEP=${JSON.stringify(stepIdValue)}`);
    }
    return [requestedStepId];
  }
  const profile = normalizePhase5VerificationProfile(profileValue);
  return [...PHASE5_PROFILE_STEP_IDS[profile]];
}
