import { runStepSuite } from './run-step-suite.mjs';

const node = process.execPath;

runStepSuite({
  title: 'verify-future-native-safe-pipeline-core',
  timeoutMs: Number(process.env.FUTURE_NATIVE_VERIFY_TIMEOUT_MS || 0),
  inheritStdio: false,
  steps: [
    { label: 'verify:future-native-guardrails', cmd: node, args: ['scripts/verify-future-native-guardrails.mjs'] },
    { label: 'verify:future-native-scene-bindings', cmd: node, args: ['scripts/verify-future-native-scene-bindings.mjs'] },
    { label: 'verify:future-native-volumetric-routes', cmd: node, args: ['scripts/verify-future-native-volumetric-routes.mjs'] },
    { label: 'verify:future-native-nonvolumetric-routes', cmd: node, args: ['scripts/verify-future-native-nonvolumetric-routes.mjs'] },
  ],
});
