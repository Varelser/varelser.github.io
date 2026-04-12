import assert from 'node:assert/strict';
import { getFutureNativeExecutionSummaries, getFutureNativePlaybackCloseoutSummary, getFutureNativePlaybackTuningBrief, getFutureNativePlaybackTuningPackets } from '../../lib/futureNativeExecutionAnalysis';
import type { WorkerExecutionEntry } from '../../lib/workerExecutionTelemetry';
import type { RuntimeProfilingEntry } from '../../lib/runtimeProfiling';

export async function main() {
  const summaries = getFutureNativeExecutionSummaries(
    {
      layer2: {
        layerIndex: 2,
        familyId: 'pbd-cloth',
        bindingMode: 'scene-bound',
        summary: 'cloth',
        pointCount: 2048,
        lineCount: 1024,
        stats: { vertices: 2048, constraints: 1024 },
        playbackWorkerCooldownMs: 70,
        playbackWorkerStaleMs: 220,
        playbackWorkerBackoffMs: 12,
        playbackWorkerBypassReason: 'pending-medium',
      },
      layer3: {
        layerIndex: 3,
        familyId: 'volumetric-density-transport',
        bindingMode: 'proxy-preview',
        summary: 'smoke',
        pointCount: 256,
        lineCount: 128,
        stats: { cells: 4096 },
      },
    },
    [
      { id: 'scene:future-native-layer2', category: 'simulation', averageDurationMs: 5.2, worstDurationMs: 7.4, sampleCount: 20, lastDurationMs: 5.1, lastUpdatedAtMs: 1000 },
      { id: 'scene:future-native-geometry-layer2', category: 'simulation', averageDurationMs: 2.1, worstDurationMs: 3.6, sampleCount: 20, lastDurationMs: 2.0, lastUpdatedAtMs: 1000 },
      { id: 'scene:future-native-packet-layer2', category: 'simulation', averageDurationMs: 1.1, worstDurationMs: 1.8, sampleCount: 20, lastDurationMs: 1.0, lastUpdatedAtMs: 1000 },
      { id: 'scene:future-native-descriptor-layer2', category: 'simulation', averageDurationMs: 1.6, worstDurationMs: 2.7, sampleCount: 20, lastDurationMs: 1.5, lastUpdatedAtMs: 1000 },
      { id: 'scene:future-native-step-layer2', category: 'simulation', averageDurationMs: 0.8, worstDurationMs: 1.2, sampleCount: 20, lastDurationMs: 0.9, lastUpdatedAtMs: 1000 },
      { id: 'scene:future-native-layer3', category: 'simulation', averageDurationMs: 1.7, worstDurationMs: 2.6, sampleCount: 20, lastDurationMs: 1.8, lastUpdatedAtMs: 1000 },
      { id: 'scene:future-native-geometry-layer3', category: 'simulation', averageDurationMs: 0.4, worstDurationMs: 0.7, sampleCount: 20, lastDurationMs: 0.5, lastUpdatedAtMs: 1000 },
      { id: 'scene:future-native-packet-layer3', category: 'simulation', averageDurationMs: 0.2, worstDurationMs: 0.4, sampleCount: 20, lastDurationMs: 0.2, lastUpdatedAtMs: 1000 },
      { id: 'scene:future-native-descriptor-layer3', category: 'simulation', averageDurationMs: 0.3, worstDurationMs: 0.6, sampleCount: 20, lastDurationMs: 0.3, lastUpdatedAtMs: 1000 },
    ] satisfies RuntimeProfilingEntry[],
    [
      {
        id: 'worker:future-native-packet-layer2:pbd-cloth',
        averageDurationMs: 1.3,
        worstDurationMs: 2.2,
        sampleCount: 4,
        workerSuccessCount: 4,
        fallbackCount: 0,
        activeRequestCount: 0,
        averagePayloadBytes: 98304,
        largestPayloadBytes: 122880,
        lastRoute: 'worker',
        readiness: 'worker-active',
        lastUpdatedAtMs: 1000,
      },
      {
        id: 'worker:future-native-packet-layer2:pbd-cloth:playback',
        averageDurationMs: 1.8,
        worstDurationMs: 2.9,
        sampleCount: 2,
        workerSuccessCount: 1,
        fallbackCount: 1,
        averagePayloadBytes: 120000,
        largestPayloadBytes: 140000,
        lastRoute: 'fallback',
        readiness: 'mixed',
        lastUpdatedAtMs: 1000,
        activeRequestCount: 1,
      }
    ] satisfies WorkerExecutionEntry[],
    2,
  );

  assert.equal(summaries.length, 2);
  assert.equal(summaries[0]?.layerIndex, 2);
  assert.equal(summaries[0]?.dominantPhase, 'frame');
  assert.equal(summaries[0]?.packetAverageDurationMs, 1.1);
  assert.equal(summaries[0]?.workerPotential, 'high');
  assert.equal(summaries[0]?.packetWorkerReadiness, 'worker-active');
  assert.equal(summaries[0]?.packetWorkerLastRoute, 'worker');
  assert.equal(summaries[0]?.packetPlaybackWorkerReadiness, 'mixed');
  assert.equal(summaries[0]?.packetPlaybackWorkerSampleCount, 2);
  assert.equal(summaries[0]?.packetPlaybackWorkerActiveRequestCount, 1);
  assert.equal(summaries[0]?.packetPlaybackWorkerCooldownMs, 70);
  assert.equal(summaries[0]?.packetPlaybackWorkerStaleMs, 220);
  assert.equal(summaries[0]?.packetPlaybackWorkerBackoffMs, 12);
  assert.equal(summaries[0]?.packetPlaybackWorkerPrimaryIssue, 'pending');
  assert.equal(summaries[0]?.packetPlaybackWorkerHealthScore, 64);
  assert.equal(summaries[0]?.packetPlaybackWorkerBypassReason, 'pending-medium');
  assert.equal(summaries[0]?.packetPlaybackWorkerCloseoutStatus, 'blocking');
  assert.equal(summaries[0]?.packetPlaybackWorkerNextAction, 'watch-overlay');
  assert.equal(summaries[0]?.packetPlaybackWorkerSuggestedCooldownDeltaMs, 6);
  assert.equal(summaries[0]?.packetPlaybackWorkerSuggestedStaleDeltaMs, 0);
  assert.equal(summaries[0]?.packetPlaybackWorkerSuggestedCooldownTargetMs, 76);
  assert.equal(summaries[0]?.packetPlaybackWorkerSuggestedStaleTargetMs, 220);
  assert.equal(summaries[0]?.packetPlaybackWorkerSuggestedRoute, 'watch-current-route');
  assert.equal(summaries[0]?.packetPlaybackWorkerTuningPacket, 'L2:pbd-cloth | blocking | pending | watch-overlay | watch-current-route | cd=76ms | st=220ms');
  assert.equal(summaries[0]?.packetPlaybackWorkerTuningHint, 'pending playback request is active; recheck after queue settles');
  assert.ok(summaries[0]?.estimatedPayloadBytes && summaries[0].estimatedPayloadBytes > summaries[1]!.estimatedPayloadBytes);
  assert.equal(summaries[1]?.packetPlaybackWorkerPrimaryIssue, 'idle');
  assert.equal(summaries[1]?.packetPlaybackWorkerHealthScore, 0);
  assert.equal(summaries[1]?.packetPlaybackWorkerBypassReason, 'none');
  assert.equal(summaries[1]?.packetPlaybackWorkerCloseoutStatus, 'watch');
  assert.equal(summaries[1]?.packetPlaybackWorkerNextAction, 'watch-overlay');
  assert.equal(summaries[1]?.packetPlaybackWorkerSuggestedCooldownDeltaMs, 0);
  assert.equal(summaries[1]?.packetPlaybackWorkerSuggestedStaleDeltaMs, 0);
  assert.equal(summaries[1]?.packetPlaybackWorkerSuggestedCooldownTargetMs, 0);
  assert.equal(summaries[1]?.packetPlaybackWorkerSuggestedStaleTargetMs, 0);
  assert.equal(summaries[1]?.packetPlaybackWorkerSuggestedRoute, 'watch-current-route');
  assert.equal(summaries[1]?.packetPlaybackWorkerTuningPacket, 'L3:volumetric-density-transport | watch | idle | watch-overlay | watch-current-route | cd=0ms | st=0ms');
  assert.equal(summaries[1]?.packetPlaybackWorkerTuningHint, 'watch overlay and confirm worker/fallback balance');
  assert.equal(summaries[1]?.workerPotential, 'low');

  const closeout = getFutureNativePlaybackCloseoutSummary(summaries);
  assert.equal(closeout.totalLanes, 2);
  assert.equal(closeout.readyCount, 0);
  assert.equal(closeout.watchCount, 1);
  assert.equal(closeout.blockingCount, 1);
  assert.equal(closeout.averageHealthScore, 32);
  assert.equal(closeout.progressPercent, 45);
  assert.equal(closeout.nextFocus, 'watch-overlay');
  assert.equal(closeout.focusLane, 'L2:pbd-cloth');
  assert.equal(closeout.focusStatus, 'blocking');
  assert.equal(closeout.focusIssue, 'pending');
  assert.equal(closeout.focusAction, 'watch-overlay');
  assert.equal(closeout.focusSuggestedCooldownDeltaMs, 6);
  assert.equal(closeout.focusSuggestedStaleDeltaMs, 0);
  assert.equal(closeout.focusSuggestedCooldownTargetMs, 76);
  assert.equal(closeout.focusSuggestedStaleTargetMs, 220);
  assert.equal(closeout.focusSuggestedRoute, 'watch-current-route');
  assert.equal(closeout.focusTuningPacket, 'L2:pbd-cloth | blocking | pending | watch-overlay | watch-current-route | cd=76ms | st=220ms');
  assert.equal(closeout.focusTuningHint, 'pending playback request is active; recheck after queue settles');

  const weightedCloseout = getFutureNativePlaybackCloseoutSummary([
    {
      ...summaries[0]!,
      id: 'future-native-layer2:pbd-softbody',
      familyId: 'pbd-softbody',
      packetPlaybackWorkerPrimaryIssue: 'fallback-pressure',
      packetPlaybackWorkerNextAction: 'reduce-fallbacks',
      packetPlaybackWorkerSuggestedCooldownDeltaMs: 12,
      packetPlaybackWorkerSuggestedStaleDeltaMs: 18,
      packetPlaybackWorkerSuggestedCooldownTargetMs: 82,
      packetPlaybackWorkerSuggestedStaleTargetMs: 238,
      packetPlaybackWorkerSuggestedRoute: 'prefer-direct',
      packetPlaybackWorkerTuningPacket: 'L2:pbd-softbody | blocking | fallback-pressure | reduce-fallbacks | prefer-direct | cd=82ms | st=238ms',
      packetPlaybackWorkerTuningHint: 'raise cooldown/stale or route medium-light playback direct',
    },
    {
      ...summaries[1]!,
      id: 'future-native-layer3:volumetric-density-transport',
      familyId: 'volumetric-density-transport',
      packetPlaybackWorkerCloseoutStatus: 'watch',
      packetPlaybackWorkerPrimaryIssue: 'hold-window',
      packetPlaybackWorkerNextAction: 'retune-hold-window',
      packetPlaybackWorkerHealthScore: 62,
    },
  ]);
  assert.equal(weightedCloseout.nextFocus, 'reduce-fallbacks');
  assert.equal(weightedCloseout.focusLane, 'L2:pbd-softbody');
  assert.equal(weightedCloseout.focusStatus, 'blocking');
  assert.equal(weightedCloseout.focusIssue, 'fallback-pressure');
  assert.equal(weightedCloseout.focusAction, 'reduce-fallbacks');
  assert.equal(weightedCloseout.focusSuggestedCooldownDeltaMs, 12);
  assert.equal(weightedCloseout.focusSuggestedStaleDeltaMs, 18);
  assert.equal(weightedCloseout.focusSuggestedCooldownTargetMs, 82);
  assert.equal(weightedCloseout.focusSuggestedStaleTargetMs, 238);
  assert.equal(weightedCloseout.focusSuggestedRoute, 'prefer-direct');
  assert.equal(weightedCloseout.focusTuningPacket, 'L2:pbd-softbody | blocking | fallback-pressure | reduce-fallbacks | prefer-direct | cd=82ms | st=238ms');
  assert.equal(weightedCloseout.focusTuningHint, 'raise cooldown/stale or route medium-light playback direct');

  const tuningPackets = getFutureNativePlaybackTuningPackets([
    {
      ...summaries[0]!,
      id: 'future-native-layer2:pbd-softbody',
      familyId: 'pbd-softbody',
      packetPlaybackWorkerPrimaryIssue: 'fallback-pressure',
      packetPlaybackWorkerCloseoutStatus: 'blocking',
      packetPlaybackWorkerNextAction: 'reduce-fallbacks',
      packetPlaybackWorkerSuggestedRoute: 'prefer-direct',
      packetPlaybackWorkerSuggestedCooldownTargetMs: 82,
      packetPlaybackWorkerSuggestedStaleTargetMs: 238,
      packetPlaybackWorkerTuningPacket: 'L2:pbd-softbody | blocking | fallback-pressure | reduce-fallbacks | prefer-direct | cd=82ms | st=238ms',
      packetPlaybackWorkerHealthScore: 41,
    },
    {
      ...summaries[1]!,
      id: 'future-native-layer3:volumetric-density-transport',
      familyId: 'volumetric-density-transport',
      packetPlaybackWorkerPrimaryIssue: 'hold-window',
      packetPlaybackWorkerCloseoutStatus: 'watch',
      packetPlaybackWorkerNextAction: 'retune-hold-window',
      packetPlaybackWorkerSuggestedRoute: 'keep-worker',
      packetPlaybackWorkerSuggestedCooldownTargetMs: 0,
      packetPlaybackWorkerSuggestedStaleTargetMs: 12,
      packetPlaybackWorkerTuningPacket: 'L3:volumetric-density-transport | watch | hold-window | retune-hold-window | keep-worker | cd=0ms | st=12ms',
      packetPlaybackWorkerHealthScore: 62,
    },
    {
      ...summaries[1]!,
      id: 'future-native-layer3:surface-ribbon',
      familyId: 'surface-ribbon',
      packetPlaybackWorkerCloseoutStatus: 'ready',
      packetPlaybackWorkerTuningPacket: 'L3:surface-ribbon | ready | stable | keep-current | keep-worker | cd=0ms | st=0ms',
      packetPlaybackWorkerHealthScore: 92,
    },
  ], 2);
  assert.deepEqual(tuningPackets, [
    'L2:pbd-softbody | blocking | fallback-pressure | reduce-fallbacks | prefer-direct | cd=82ms | st=238ms',
    'L3:volumetric-density-transport | watch | hold-window | retune-hold-window | keep-worker | cd=0ms | st=12ms',
  ]);

  const tuningBrief = getFutureNativePlaybackTuningBrief([
    {
      ...summaries[0]!,
      id: 'future-native-layer2:pbd-softbody',
      familyId: 'pbd-softbody',
      packetPlaybackWorkerPrimaryIssue: 'fallback-pressure',
      packetPlaybackWorkerCloseoutStatus: 'blocking',
      packetPlaybackWorkerNextAction: 'reduce-fallbacks',
      packetPlaybackWorkerSuggestedRoute: 'prefer-direct',
      packetPlaybackWorkerSuggestedCooldownTargetMs: 82,
      packetPlaybackWorkerSuggestedStaleTargetMs: 238,
      packetPlaybackWorkerTuningPacket: 'L2:pbd-softbody | blocking | fallback-pressure | reduce-fallbacks | prefer-direct | cd=82ms | st=238ms',
      packetPlaybackWorkerHealthScore: 41,
    },
    {
      ...summaries[1]!,
      id: 'future-native-layer3:volumetric-density-transport',
      familyId: 'volumetric-density-transport',
      packetPlaybackWorkerPrimaryIssue: 'hold-window',
      packetPlaybackWorkerCloseoutStatus: 'watch',
      packetPlaybackWorkerNextAction: 'retune-hold-window',
      packetPlaybackWorkerSuggestedRoute: 'keep-worker',
      packetPlaybackWorkerSuggestedCooldownTargetMs: 0,
      packetPlaybackWorkerSuggestedStaleTargetMs: 12,
      packetPlaybackWorkerTuningPacket: 'L3:volumetric-density-transport | watch | hold-window | retune-hold-window | keep-worker | cd=0ms | st=12ms',
      packetPlaybackWorkerHealthScore: 62,
    },
  ], 2);
  assert.equal(
    tuningBrief,
    '1. L2:pbd-softbody | blocking | fallback-pressure | reduce-fallbacks | prefer-direct | cd=82ms | st=238ms / 2. L3:volumetric-density-transport | watch | hold-window | retune-hold-window | keep-worker | cd=0ms | st=12ms',
  );
}
