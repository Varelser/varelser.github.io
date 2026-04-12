import { DEFAULT_VERIFY_SUITE_FAST_SMOKE_STAGES, runVerifySuiteFast } from './verifySuiteFastShared.mjs';

await runVerifySuiteFast({
  stages: DEFAULT_VERIFY_SUITE_FAST_SMOKE_STAGES,
  reportBaseName: 'verification-suite-fast-smoke',
  reportTitle: 'Verification Suite Fast Smoke Report',
});
