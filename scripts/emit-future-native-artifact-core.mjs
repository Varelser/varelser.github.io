import { runStepSuite } from './run-step-suite.mjs';

const node = process.execPath;

runStepSuite({
  title: 'emit-future-native-artifact-core',
  timeoutMs: Number(process.env.FUTURE_NATIVE_EMIT_TIMEOUT_MS || 0),
  inheritStdio: false,
  steps: [
    { label: 'emit:future-native-report', cmd: node, args: ['scripts/emit-future-native-report.mjs'] },
    { label: 'emit:future-native-specialist-handoff', cmd: node, args: ['scripts/emit-future-native-specialist-handoff.mjs'] },
    { label: 'emit:future-native-specialist-family-previews', cmd: node, args: ['scripts/emit-future-native-specialist-family-previews.mjs'] },
  ],
});
