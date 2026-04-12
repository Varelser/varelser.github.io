import assert from 'node:assert/strict';
import {
  beginWorkerExecutionRequest,
  clearWorkerExecutionTelemetry,
  completeWorkerExecutionRequest,
  readWorkerExecutionTelemetry,
} from '../../lib/workerExecutionTelemetry';

export async function main() {
  clearWorkerExecutionTelemetry();

  beginWorkerExecutionRequest('worker:particle-data-layer2-core', { points: 1000 }, 0);
  completeWorkerExecutionRequest({
    id: 'worker:particle-data-layer2-core',
    durationMs: 6,
    route: 'worker',
    atMs: 10,
  });

  beginWorkerExecutionRequest('worker:particle-data-layer2-core', { points: 1000 }, 20);
  completeWorkerExecutionRequest({
    id: 'worker:particle-data-layer2-core',
    durationMs: 12,
    route: 'fallback',
    atMs: 40,
  });

  const entries = readWorkerExecutionTelemetry(100);
  assert.equal(entries.length, 1);
  assert.equal(entries[0]?.id, 'worker:particle-data-layer2-core');
  assert.equal(entries[0]?.sampleCount, 2);
  assert.equal(entries[0]?.workerSuccessCount, 1);
  assert.equal(entries[0]?.fallbackCount, 1);
  assert.equal(entries[0]?.readiness, 'mixed');
  assert.equal(entries[0]?.averageDurationMs, 9);
  assert.ok((entries[0]?.averagePayloadBytes ?? 0) > 0);

  const staleEntries = readWorkerExecutionTelemetry(20000);
  assert.equal(staleEntries.length, 0);

  clearWorkerExecutionTelemetry();
}
