import { DEFAULT_VERIFY_SUITE_FAST_TAIL_STAGES, runVerifySuiteFast } from './verifySuiteFastShared.mjs';

await runVerifySuiteFast({
  stages: DEFAULT_VERIFY_SUITE_FAST_TAIL_STAGES,
  reportBaseName: 'verification-suite-fast-tail-smoke',
  reportTitle: 'Verification Suite Fast Tail Smoke Report',
});
