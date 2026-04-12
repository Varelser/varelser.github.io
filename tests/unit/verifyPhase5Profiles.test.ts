import assert from 'node:assert/strict';
import {
  normalizePhase5VerificationProfile,
  resolvePhase5VerificationStepIds,
} from '../../scripts/verifyPhase5Profiles';

assert.equal(normalizePhase5VerificationProfile('FAST'), 'fast', 'profile normalization should be case-insensitive');
assert.equal(normalizePhase5VerificationProfile('OPERATIONAL'), 'operational', 'operational profile should normalize');
assert.equal(normalizePhase5VerificationProfile('unknown'), 'full', 'unknown profiles should fall back to full');

assert.deepEqual(
  resolvePhase5VerificationStepIds('imports'),
  [
    'replace-mode-preserves-stable-ids',
    'import-inspection-diagnostics',
    'file-roundtrip-import-preparation',
    'duplicate-import-recovery',
    'orphan-sequence-recovery',
  ],
  'imports profile should isolate import-oriented steps',
);

assert.deepEqual(
  resolvePhase5VerificationStepIds('fixtures'),
  [
    'fixture-files-synced',
    'sparse-serialization-recovery',
    'legacy-migration-rebuild',
    'fixture-file-parsing',
    'optional-real-export-fixtures',
    'roundtrip-stability',
  ],
  'fixtures profile should isolate fixture-oriented steps',
);

assert.deepEqual(
  resolvePhase5VerificationStepIds('fast'),
  [
    'fixture-files-synced',
    'sparse-serialization-recovery',
    'legacy-migration-rebuild',
    'import-inspection-diagnostics',
    'strict-leaf-archive-evidence',
  ],
  'fast profile should stay operational by relying on smoke plus archived strict-leaf evidence',
);

assert.deepEqual(
  resolvePhase5VerificationStepIds('full', 'import-inspection-diagnostics'),
  ['import-inspection-diagnostics'],
  'single-step override should win over profile selection',
);

assert.throws(
  () => resolvePhase5VerificationStepIds('full', 'unknown-step'),
  /unknown VERIFY_PHASE5_STEP/,
  'unknown single-step selection should fail loudly',
);

console.log('verifyPhase5Profiles ok');
