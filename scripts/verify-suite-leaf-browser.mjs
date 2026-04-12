import { runVerifyLeafSuite, BROWSER_STEPS } from './verify-suite-leaf-shared.mjs';

runVerifyLeafSuite({
  title: 'verify-suite-leaf-browser',
  timeoutMs: Number(process.env.VERIFY_LEAF_TIMEOUT_MS || 0),
  inheritStdio: true,
  steps: BROWSER_STEPS,
});
