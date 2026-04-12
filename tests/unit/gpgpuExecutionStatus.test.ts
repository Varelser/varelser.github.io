import assert from 'node:assert/strict';
import { getGpgpuExecutionStatus } from '../../lib/gpgpuExecutionStatus';
import type { ExecutionDiagnosticEntry } from '../../lib/executionDiagnostics';
import type { RuntimeProfilingEntry } from '../../lib/runtimeProfiling';

function makeEntry(overrides: Partial<ExecutionDiagnosticEntry> = {}): ExecutionDiagnosticEntry {
  return {
    hybridKind: 'gpgpu',
    id: 'gpgpu',
    label: 'GPGPU',
    mode: 'swarm',
    engine: 'webgpu-compute',
    requestedEngine: 'webgpu-compute',
    overrideId: 'auto',
    path: 'points',
    proceduralSystemId: 'gpgpu',
    reason: 'test',
    capabilityFlags: [],
    notes: [],
    features: ['webgpu-compute'],
    supportedFeatures: ['webgpu-compute'],
    unsupportedFeatures: [],
    sceneBranches: ['gpgpu'],
    ...overrides,
  };
}

export async function main() {
  const direct = getGpgpuExecutionStatus(makeEntry(), [
    { id: 'scene:gpgpu-simulation-webgpu', category: 'simulation', averageDurationMs: 2.7, worstDurationMs: 4.9, sampleCount: 12, lastDurationMs: 2.6, lastUpdatedAtMs: 1000 },
  ] satisfies RuntimeProfilingEntry[]);
  assert.equal(direct.status, 'direct');
  assert.equal(direct.readiness, 'preferred-ready');
  assert.equal(direct.actualRoute, 'webgpu');
  assert.equal(direct.blockerSummary, 'preferred path healthy');
  assert.deepEqual(direct.blockerGroups, []);
  assert.deepEqual(direct.blockerDetails, []);
  assert.deepEqual(direct.nextBlockerFocus, []);

  const fallback = getGpgpuExecutionStatus(makeEntry({ engine: 'webgl-gpgpu' }), [
    { id: 'scene:gpgpu-simulation-webgl', category: 'simulation', averageDurationMs: 3.4, worstDurationMs: 6.1, sampleCount: 10, lastDurationMs: 3.5, lastUpdatedAtMs: 1000 },
  ] satisfies RuntimeProfilingEntry[]);
  assert.equal(fallback.status, 'fallback');
  assert.equal(fallback.readiness, 'fallback-active');
  assert.equal(fallback.actualRoute, 'webgl');
  assert.match(fallback.blockerSummary, /fallback/);
  assert.deepEqual(fallback.blockerGroups, ['runtime']);
  assert.deepEqual(fallback.blockerDetails, ['runtime:1']);
  assert.equal(fallback.nextBlockerFocus[0]?.id, 'runtime');

  const unavailable = getGpgpuExecutionStatus(makeEntry({ unsupportedFeatures: ['ribbon', 'boids', 'spring', 'sdf-collider', 'audio-reactive'] }), []);
  assert.equal(unavailable.status, 'unavailable');
  assert.equal(unavailable.readiness, 'unavailable');
  assert.match(unavailable.blockerSummary, /unsupported/);
  assert.deepEqual(unavailable.blockerGroups, ['rendering:1', 'dynamics:3', 'audio:1']);
  assert.deepEqual(unavailable.blockerDetails, ['rendering:1', 'dynamics-flocking:1', 'dynamics-constraints:1', 'dynamics-collision:1', 'audio:1']);
  assert.equal(unavailable.nextBlockerFocus[0]?.id, 'dynamics-flocking');
  assert.equal(unavailable.nextBlockerFocus[1]?.id, 'dynamics-constraints');

  const notRequested = getGpgpuExecutionStatus(makeEntry({ requestedEngine: 'webgl-gpgpu', engine: 'webgl-gpgpu' }), []);
  assert.equal(notRequested.status, 'not-requested');
  assert.equal(notRequested.readiness, 'not-requested');

  const warming = getGpgpuExecutionStatus(makeEntry(), []);
  assert.equal(warming.status, 'warming');
  assert.equal(warming.readiness, 'warming');
}
