import { runVerifyLeafSuite, CORE_STEPS_FAST } from './verify-suite-leaf-shared.mjs';

runVerifyLeafSuite({
  title: 'verify-suite-leaf-core-fast',
  timeoutMs: Number(process.env.VERIFY_LEAF_TIMEOUT_MS || 0),
  inheritStdio: true,
  steps: CORE_STEPS_FAST,
});
