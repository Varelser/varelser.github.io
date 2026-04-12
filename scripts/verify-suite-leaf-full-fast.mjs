import { runVerifyLeafSuite, CORE_STEPS_FAST, BROWSER_STEPS } from './verify-suite-leaf-shared.mjs';

runVerifyLeafSuite({
  title: 'verify-suite-leaf-full-fast',
  timeoutMs: Number(process.env.VERIFY_LEAF_TIMEOUT_MS || 0),
  inheritStdio: true,
  steps: [...CORE_STEPS_FAST, ...BROWSER_STEPS],
});
