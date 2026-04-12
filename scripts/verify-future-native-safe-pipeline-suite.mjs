import { runStepSuite } from './run-step-suite.mjs';
import { createRegisteredVerifyStep } from './verify-entry-registry.mjs';

const node = process.execPath;

runStepSuite({
  title: 'verify-future-native-safe-pipeline-suite',
  timeoutMs: Number(process.env.FUTURE_NATIVE_VERIFY_TIMEOUT_MS || 0),
  inheritStdio: true,
  steps: [
    { label: 'verify:future-native-safe-pipeline-core', cmd: node, args: ['scripts/verify-future-native-safe-pipeline-core.mjs'] },
    createRegisteredVerifyStep('verify-future-native-project-state-fast'),
    createRegisteredVerifyStep('verify-future-native-specialist-routes'),
    createRegisteredVerifyStep('verify-future-native-specialist-runtime-export-regression'),
  ],
});
