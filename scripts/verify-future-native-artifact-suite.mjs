import { runStepSuite } from './run-step-suite.mjs';

const node = process.execPath;

runStepSuite({
  title: 'verify-future-native-artifact-suite',
  timeoutMs: Number(process.env.FUTURE_NATIVE_VERIFY_TIMEOUT_MS || 0),
  inheritStdio: true,
  steps: [
    'typecheck',
    'inspect:project-health',
    { label: 'verify:future-native-safe-pipeline:full', cmd: node, args: ['scripts/verify-future-native-safe-pipeline-suite.mjs'] },
    { label: 'verify:future-native-artifact-tail', cmd: node, args: ['scripts/verify-future-native-artifact-tail.mjs'] },
  ],
  finalizers: ['emit:future-native-suite-status-report'],
});
