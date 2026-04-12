import assert from 'node:assert/strict';
import { getFutureNativePlaybackWorkerStrategy, getFutureNativePlaybackWorkerTiming } from '../../lib/futureNativePlaybackWorkerPolicy';

export async function main() {
  const steady = getFutureNativePlaybackWorkerTiming({
    estimatedBytes: 230 * 1024,
    heldRecentlyActive: false,
    telemetryEntry: {
      id: 'worker:future-native-packet-layer2:pbd-softbody:playback',
      averageDurationMs: 1.4,
      worstDurationMs: 2.1,
      sampleCount: 4,
      workerSuccessCount: 4,
      fallbackCount: 0,
      activeRequestCount: 0,
      averagePayloadBytes: 230 * 1024,
      largestPayloadBytes: 236 * 1024,
      lastRoute: 'worker',
      readiness: 'worker-active',
      lastUpdatedAtMs: 1000,
    },
  });
  assert.equal(steady.payloadTier, 'heavy');
  assert.equal(steady.cooldownMs, 70);
  assert.equal(steady.staleMs, 220);
  assert.equal(steady.backoffMs, 0);

  const mixed = getFutureNativePlaybackWorkerTiming({
    estimatedBytes: 230 * 1024,
    heldRecentlyActive: true,
    telemetryEntry: {
      id: 'worker:future-native-packet-layer2:pbd-softbody:playback',
      averageDurationMs: 1.9,
      worstDurationMs: 3.2,
      sampleCount: 4,
      workerSuccessCount: 1,
      fallbackCount: 2,
      activeRequestCount: 1,
      averagePayloadBytes: 230 * 1024,
      largestPayloadBytes: 236 * 1024,
      lastRoute: 'fallback',
      readiness: 'mixed',
      lastUpdatedAtMs: 1000,
    },
  });
  assert.equal(mixed.payloadTier, 'heavy');
  assert.equal(mixed.cooldownMs, 81);
  assert.equal(mixed.staleMs, 254);
  assert.equal(mixed.backoffMs, 26);

  const fallbackOnly = getFutureNativePlaybackWorkerTiming({
    estimatedBytes: 300 * 1024,
    heldRecentlyActive: false,
    telemetryEntry: {
      id: 'worker:future-native-packet-layer2:pbd-softbody:playback',
      averageDurationMs: 2.3,
      worstDurationMs: 3.8,
      sampleCount: 3,
      workerSuccessCount: 0,
      fallbackCount: 3,
      activeRequestCount: 0,
      averagePayloadBytes: 300 * 1024,
      largestPayloadBytes: 312 * 1024,
      lastRoute: 'fallback',
      readiness: 'fallback-only',
      lastUpdatedAtMs: 1000,
    },
  });
  assert.equal(fallbackOnly.payloadTier, 'very-heavy');
  assert.equal(fallbackOnly.cooldownMs, 86);
  assert.equal(fallbackOnly.staleMs, 306);
  assert.equal(fallbackOnly.backoffMs, 26);

  const directBypass = getFutureNativePlaybackWorkerStrategy({
    estimatedBytes: 140 * 1024,
    heldRecentlyActive: false,
    telemetryEntry: {
      id: 'worker:future-native-packet-layer2:pbd-softbody:playback',
      averageDurationMs: 2.0,
      worstDurationMs: 3.2,
      sampleCount: 3,
      workerSuccessCount: 1,
      fallbackCount: 2,
      activeRequestCount: 1,
      averagePayloadBytes: 140 * 1024,
      largestPayloadBytes: 152 * 1024,
      lastRoute: 'fallback',
      readiness: 'mixed',
      lastUpdatedAtMs: 1000,
    },
  });
  assert.equal(directBypass.preferDirectPlayback, true);
  assert.equal(directBypass.bypassReason, 'pending-medium');

  const heavyKeepsWorker = getFutureNativePlaybackWorkerStrategy({
    estimatedBytes: 300 * 1024,
    heldRecentlyActive: false,
    telemetryEntry: {
      id: 'worker:future-native-packet-layer2:pbd-softbody:playback',
      averageDurationMs: 2.3,
      worstDurationMs: 3.8,
      sampleCount: 3,
      workerSuccessCount: 0,
      fallbackCount: 3,
      activeRequestCount: 0,
      averagePayloadBytes: 300 * 1024,
      largestPayloadBytes: 312 * 1024,
      lastRoute: 'fallback',
      readiness: 'fallback-only',
      lastUpdatedAtMs: 1000,
    },
  });
  assert.equal(heavyKeepsWorker.preferDirectPlayback, false);
  assert.equal(heavyKeepsWorker.bypassReason, 'none');

  const veryHeavySlow = getFutureNativePlaybackWorkerTiming({
    estimatedBytes: 300 * 1024,
    heldRecentlyActive: false,
    telemetryEntry: {
      id: 'worker:future-native-packet-layer2:pbd-softbody:playback',
      averageDurationMs: 4.0,
      worstDurationMs: 5.4,
      sampleCount: 5,
      workerSuccessCount: 2,
      fallbackCount: 1,
      activeRequestCount: 0,
      averagePayloadBytes: 300 * 1024,
      largestPayloadBytes: 320 * 1024,
      lastRoute: 'worker',
      readiness: 'worker-active',
      lastUpdatedAtMs: 1000,
    },
  });
  assert.equal(veryHeavySlow.payloadTier, 'very-heavy');
  assert.equal(veryHeavySlow.cooldownMs, 76);
  assert.equal(veryHeavySlow.staleMs, 286);
  assert.equal(veryHeavySlow.backoffMs, 16);
}
