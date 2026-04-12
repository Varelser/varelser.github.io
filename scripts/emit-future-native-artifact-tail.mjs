import { runStepSuite } from './run-step-suite.mjs';

const node = process.execPath;

runStepSuite({
  title: 'emit-future-native-artifact-tail',
  timeoutMs: Number(process.env.FUTURE_NATIVE_EMIT_TIMEOUT_MS || 0),
  inheritStdio: false,
  steps: [
    { label: 'emit:future-native-family-previews', cmd: node, args: ['scripts/emit-future-native-family-previews.mjs'] },
  ],
});
