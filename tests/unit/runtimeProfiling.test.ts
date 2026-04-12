import assert from 'node:assert/strict';
import {
  clearRuntimeProfiling,
  profileRuntimeTask,
  readRuntimeProfilingSnapshot,
  recordRuntimeProfilingDuration,
} from '../../lib/runtimeProfiling';

export async function main() {
  clearRuntimeProfiling();

  recordRuntimeProfilingDuration('scene:particles-layer2', 'simulation', 2, 0);
  recordRuntimeProfilingDuration('scene:particles-layer2', 'simulation', 4, 100);
  recordRuntimeProfilingDuration('export:video-webm', 'export', 1800, 200);

  const beforeCommit = readRuntimeProfilingSnapshot(500);
  assert.equal(beforeCommit.simulation.length, 1);
  assert.equal(beforeCommit.simulation[0]?.averageDurationMs, 0);

  const afterCommit = readRuntimeProfilingSnapshot(1200);
  assert.equal(afterCommit.simulation[0]?.id, 'scene:particles-layer2');
  assert.equal(afterCommit.simulation[0]?.averageDurationMs, 3);
  assert.equal(afterCommit.simulation[0]?.worstDurationMs, 4);
  assert.equal(afterCommit.simulation[0]?.sampleCount, 2);
  assert.equal(afterCommit.export[0]?.id, 'export:video-webm');
  assert.equal(afterCommit.export[0]?.averageDurationMs, 1800);
  assert.equal(afterCommit.export[0]?.sampleCount, 1);

  const staleSnapshot = readRuntimeProfilingSnapshot(7000);
  assert.equal(staleSnapshot.simulation.length, 0);
  assert.equal(staleSnapshot.export.length, 0);

  let profiledCallCount = 0;
  const profiledValue = profileRuntimeTask('scene:future-native-step', 'simulation', () => {
    profiledCallCount += 1;
    return 42;
  });
  assert.equal(profiledValue, 42);
  assert.equal(profiledCallCount, 1);

  clearRuntimeProfiling();
}
