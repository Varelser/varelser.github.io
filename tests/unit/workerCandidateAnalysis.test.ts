import assert from 'node:assert/strict';
import { getDirectVsWorkerComparison, getWorkerCandidateSummaries } from '../../lib/workerCandidateAnalysis';
import type { RuntimeProfilingEntry } from '../../lib/runtimeProfiling';
import type { WorkerExecutionEntry } from '../../lib/workerExecutionTelemetry';

export async function main() {
  const simulationEntries: RuntimeProfilingEntry[] = [
    {
      id: 'scene:future-native-layer2',
      category: 'simulation',
      averageDurationMs: 4.8,
      worstDurationMs: 7.2,
      sampleCount: 24,
      lastDurationMs: 4.6,
      lastUpdatedAtMs: 1000,
    },
    {
      id: 'direct:particle-data-layer2-core',
      category: 'simulation',
      averageDurationMs: 2.4,
      worstDurationMs: 3.1,
      sampleCount: 18,
      lastDurationMs: 2.5,
      lastUpdatedAtMs: 1000,
    },
    {
      id: 'worker:particle-data-layer3-core',
      category: 'simulation',
      averageDurationMs: 3.9,
      worstDurationMs: 6.3,
      sampleCount: 16,
      lastDurationMs: 4.1,
      lastUpdatedAtMs: 1000,
    },
    {
      id: 'scene:gpgpu-core',
      category: 'simulation',
      averageDurationMs: 3.3,
      worstDurationMs: 5.4,
      sampleCount: 20,
      lastDurationMs: 3.2,
      lastUpdatedAtMs: 1000,
    },
  ];

  const workerEntries: WorkerExecutionEntry[] = [
    {
      id: 'worker:particle-data-layer3-core',
      averageDurationMs: 3.9,
      worstDurationMs: 6.3,
      sampleCount: 16,
      workerSuccessCount: 14,
      fallbackCount: 2,
      activeRequestCount: 0,
      averagePayloadBytes: 4096,
      largestPayloadBytes: 8192,
      lastRoute: 'worker',
      readiness: 'mixed',
      lastUpdatedAtMs: 1000,
    },
    {
      id: 'worker:particle-data-layer2-core',
      averageDurationMs: 4.5,
      worstDurationMs: 5.8,
      sampleCount: 12,
      workerSuccessCount: 0,
      fallbackCount: 12,
      activeRequestCount: 0,
      averagePayloadBytes: 2048,
      largestPayloadBytes: 4096,
      lastRoute: 'fallback',
      readiness: 'fallback-only',
      lastUpdatedAtMs: 1000,
    },
  ];

  const summaries = getWorkerCandidateSummaries(simulationEntries, workerEntries, 3);
  assert.equal(summaries.length, 3);
  assert.equal(summaries[0]?.id, 'worker:particle-data-layer3-core');
  assert.ok(summaries.some((entry) => entry.id === 'scene:future-native-layer2'));
  assert.ok(summaries.some((entry) => entry.kind === 'gpgpu'));
  assert.ok(summaries.some((entry) => entry.readiness === 'mixed'));

  const comparison = getDirectVsWorkerComparison(simulationEntries, workerEntries);
  assert.equal(comparison.length, 1);
  assert.equal(comparison[0]?.id, 'particle-data-layer2-core');
  assert.equal(comparison[0]?.directAverageDurationMs, 2.4);
  assert.equal(comparison[0]?.workerAverageDurationMs, 4.5);
  assert.equal(comparison[0]?.workerReadiness, 'fallback-only');
  assert.equal(comparison[0]?.fallbackCount, 12);
}
