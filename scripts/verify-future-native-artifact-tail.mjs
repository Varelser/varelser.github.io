import { runStepSuite } from './run-step-suite.mjs';
import { createRegisteredVerifyStep } from './verify-entry-registry.mjs';

const node = process.execPath;

runStepSuite({
  title: 'verify-future-native-artifact-tail',
  timeoutMs: Number(process.env.FUTURE_NATIVE_VERIFY_TIMEOUT_MS || 0),
  inheritStdio: false,
  steps: [
    createRegisteredVerifyStep('verify-future-native-project-snapshots'),
    createRegisteredVerifyStep('verify-future-native-family-preview-surfaces'),
    createRegisteredVerifyStep('verify-future-native-specialist-family-previews'),
    { label: 'verify:future-native-source-only-artifacts', cmd: node, args: ['scripts/verify-future-native-source-only-artifacts.mjs'] },
  ],
});
