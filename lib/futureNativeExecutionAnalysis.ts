import type { RuntimeProfilingEntry } from './runtimeProfiling';
import type { WorkerExecutionEntry } from './workerExecutionTelemetry';
import type { FutureNativeSceneDiagnosticSnapshot } from './future-native-families/futureNativeSceneDiagnosticsStore';

export type FutureNativeLayerDiagnostic = FutureNativeSceneDiagnosticSnapshot | null;

export interface FutureNativeExecutionSummary {
  id: string;
  layerIndex: 2 | 3;
  familyId: string;
  bindingMode: string;
  pointCount: number;
  lineCount: number;
  averageDurationMs: number;
  worstDurationMs: number;
  geometryAverageDurationMs: number;
  packetAverageDurationMs: number;
  descriptorAverageDurationMs: number;
  stepAverageDurationMs: number;
  audioAverageDurationMs: number;
  publishAverageDurationMs: number;
  estimatedPayloadBytes: number;
  dominantPhase: 'geometry' | 'packet' | 'descriptor' | 'step' | 'audio' | 'publish' | 'frame';
  workerPotential: 'low' | 'medium' | 'high';
  rationale: string;
  packetWorkerReadiness: 'idle' | 'worker-active' | 'fallback-only' | 'mixed';
  packetWorkerAverageDurationMs: number;
  packetWorkerFallbackCount: number;
  packetWorkerSuccessCount: number;
  packetWorkerSampleCount: number;
  packetWorkerLastRoute: 'worker' | 'fallback' | 'idle' | 'none';
  packetPlaybackWorkerReadiness: 'idle' | 'worker-active' | 'fallback-only' | 'mixed';
  packetPlaybackWorkerAverageDurationMs: number;
  packetPlaybackWorkerFallbackCount: number;
  packetPlaybackWorkerSuccessCount: number;
  packetPlaybackWorkerSampleCount: number;
  packetPlaybackWorkerLastRoute: 'worker' | 'fallback' | 'idle' | 'none';
  packetPlaybackWorkerActiveRequestCount: number;
  packetPlaybackWorkerHeld: boolean;
  packetPlaybackWorkerHeldAgeMs: number;
  packetPlaybackWorkerPayloadTier: 'very-heavy' | 'heavy' | 'medium' | 'light';
  packetPlaybackWorkerEstimatedBytes: number;
  packetPlaybackWorkerCooldownMs: number;
  packetPlaybackWorkerStaleMs: number;
  packetPlaybackWorkerBackoffMs: number;
  packetPlaybackWorkerHealthScore: number;
  packetPlaybackWorkerPrimaryIssue: 'stable' | 'pending' | 'fallback-pressure' | 'hold-window' | 'adaptive-backoff' | 'cooldown-throttle' | 'idle';
  packetPlaybackWorkerBypassReason: 'none' | 'fallback-pressure' | 'mixed-light' | 'pending-medium';
  packetPlaybackWorkerCloseoutStatus: 'ready' | 'watch' | 'blocking';
  packetPlaybackWorkerNextAction: 'keep-current' | 'watch-overlay' | 'reduce-fallbacks' | 'retune-hold-window' | 'retune-heavy-retry';
  packetPlaybackWorkerSuggestedCooldownDeltaMs: number;
  packetPlaybackWorkerSuggestedStaleDeltaMs: number;
  packetPlaybackWorkerSuggestedCooldownTargetMs: number;
  packetPlaybackWorkerSuggestedStaleTargetMs: number;
  packetPlaybackWorkerSuggestedRoute: 'keep-worker' | 'prefer-direct' | 'keep-direct-bypass' | 'watch-current-route';
  packetPlaybackWorkerTuningPacket: string;
  packetPlaybackWorkerTuningHint: string;
}


export interface FutureNativeDiagnosticsSnapshot {
  layer2: FutureNativeLayerDiagnostic;
  layer3: FutureNativeLayerDiagnostic;
}

export interface FutureNativePlaybackCloseoutSummary {
  totalLanes: number;
  readyCount: number;
  watchCount: number;
  blockingCount: number;
  averageHealthScore: number;
  progressPercent: number;
  nextFocus: 'none' | 'watch-overlay' | 'reduce-fallbacks' | 'retune-hold-window' | 'retune-heavy-retry';
  focusLane: string;
  focusStatus: 'none' | 'ready' | 'watch' | 'blocking';
  focusIssue: FutureNativeExecutionSummary['packetPlaybackWorkerPrimaryIssue'] | 'none';
  focusAction: FutureNativeExecutionSummary['packetPlaybackWorkerNextAction'] | 'none';
  focusSuggestedCooldownDeltaMs: number;
  focusSuggestedStaleDeltaMs: number;
  focusSuggestedCooldownTargetMs: number;
  focusSuggestedStaleTargetMs: number;
  focusSuggestedRoute: FutureNativeExecutionSummary['packetPlaybackWorkerSuggestedRoute'] | 'none';
  focusTuningPacket: string;
  focusTuningHint: string;
}

export function getFutureNativePlaybackTuningPackets(
  summaries: FutureNativeExecutionSummary[],
  limit = 2,
) {
  return summaries
    .filter((summary) => summary.packetPlaybackWorkerCloseoutStatus !== 'ready')
    .sort(compareFutureNativeExecutionPriority)
    .slice(0, Math.max(1, limit))
    .map((summary) => summary.packetPlaybackWorkerTuningPacket);
}

export function getFutureNativePlaybackTuningBrief(
  summaries: FutureNativeExecutionSummary[],
  limit = 2,
) {
  const packets = getFutureNativePlaybackTuningPackets(summaries, limit);
  if (packets.length === 0) {
    return 'none';
  }
  return packets
    .map((packet, index) => `${index + 1}. ${packet}`)
    .join(' / ');
}

function getCloseoutPriority(status: FutureNativeExecutionSummary['packetPlaybackWorkerCloseoutStatus']) {
  if (status === 'blocking') return 0;
  if (status === 'watch') return 1;
  return 2;
}

function getSummaryPriorityScore(summary: Pick<FutureNativeExecutionSummary, 'packetPlaybackWorkerCloseoutStatus' | 'packetPlaybackWorkerHealthScore' | 'averageDurationMs' | 'geometryAverageDurationMs' | 'descriptorAverageDurationMs'>) {
  return (
    getCloseoutPriority(summary.packetPlaybackWorkerCloseoutStatus) * 1000
    + summary.packetPlaybackWorkerHealthScore * 10
    - (summary.averageDurationMs + summary.geometryAverageDurationMs + summary.descriptorAverageDurationMs)
  );
}

function compareFutureNativeExecutionPriority(a: FutureNativeExecutionSummary, b: FutureNativeExecutionSummary) {
  return (
    getCloseoutPriority(a.packetPlaybackWorkerCloseoutStatus) - getCloseoutPriority(b.packetPlaybackWorkerCloseoutStatus)
    || a.packetPlaybackWorkerHealthScore - b.packetPlaybackWorkerHealthScore
    || (b.averageDurationMs + b.geometryAverageDurationMs + b.descriptorAverageDurationMs) - (a.averageDurationMs + a.geometryAverageDurationMs + a.descriptorAverageDurationMs)
  );
}

function getFutureNativeLaneLabel(summary: Pick<FutureNativeExecutionSummary, 'layerIndex' | 'familyId'>) {
  return `L${summary.layerIndex}:${summary.familyId}`;
}

function getPlaybackWorkerTuningPacket(summary: Pick<
  FutureNativeExecutionSummary,
  | 'layerIndex'
  | 'familyId'
  | 'packetPlaybackWorkerCloseoutStatus'
  | 'packetPlaybackWorkerPrimaryIssue'
  | 'packetPlaybackWorkerNextAction'
  | 'packetPlaybackWorkerSuggestedRoute'
  | 'packetPlaybackWorkerSuggestedCooldownTargetMs'
  | 'packetPlaybackWorkerSuggestedStaleTargetMs'
>) {
  return [
    getFutureNativeLaneLabel(summary),
    summary.packetPlaybackWorkerCloseoutStatus,
    summary.packetPlaybackWorkerPrimaryIssue,
    summary.packetPlaybackWorkerNextAction,
    summary.packetPlaybackWorkerSuggestedRoute,
    `cd=${summary.packetPlaybackWorkerSuggestedCooldownTargetMs}ms`,
    `st=${summary.packetPlaybackWorkerSuggestedStaleTargetMs}ms`,
  ].join(' | ');
}

function findAverageDuration(entries: RuntimeProfilingEntry[], id: string) {
  return entries.find((entry) => entry.id === id)?.averageDurationMs ?? 0;
}

function estimatePayloadBytes(snapshot: FutureNativeSceneDiagnosticSnapshot) {
  const statTotal = Object.keys(snapshot.stats).length * 8;
  const pointBytes = snapshot.pointCount * 3 * 4;
  const lineBytes = snapshot.lineCount * 6 * 4;
  return pointBytes + lineBytes + statTotal;
}

function getDominantPhase(summary: Omit<FutureNativeExecutionSummary, 'dominantPhase' | 'workerPotential' | 'rationale'>): FutureNativeExecutionSummary['dominantPhase'] {
  const phasePairs: Array<[FutureNativeExecutionSummary['dominantPhase'], number]> = [
    ['geometry', summary.geometryAverageDurationMs],
    ['packet', summary.packetAverageDurationMs],
    ['descriptor', summary.descriptorAverageDurationMs],
    ['step', summary.stepAverageDurationMs],
    ['audio', summary.audioAverageDurationMs],
    ['publish', summary.publishAverageDurationMs],
    ['frame', summary.averageDurationMs],
  ];
  phasePairs.sort((a, b) => b[1] - a[1]);
  return phasePairs[0]?.[0] ?? 'frame';
}

function getWorkerPotential(summary: Omit<FutureNativeExecutionSummary, 'dominantPhase' | 'workerPotential' | 'rationale'>) {
  const payloadKb = summary.estimatedPayloadBytes / 1024;
  const heavyFrame = summary.averageDurationMs >= 3.5 || summary.worstDurationMs >= 6.5;
  const geometryHeavy = summary.geometryAverageDurationMs >= 1.2;
  const packetHeavy = summary.packetAverageDurationMs >= 0.8;
  const descriptorHeavy = summary.descriptorAverageDurationMs >= 1;
  if (heavyFrame && (geometryHeavy || packetHeavy || descriptorHeavy) && payloadKb >= 16) return 'high' as const;
  if (heavyFrame || geometryHeavy || packetHeavy || descriptorHeavy || payloadKb >= 8) return 'medium' as const;
  return 'low' as const;
}

function getRationale(summary: Omit<FutureNativeExecutionSummary, 'dominantPhase' | 'workerPotential' | 'rationale' | 'packetWorkerReadiness' | 'packetWorkerAverageDurationMs' | 'packetWorkerFallbackCount' | 'packetWorkerLastRoute' | 'packetPlaybackWorkerReadiness' | 'packetPlaybackWorkerAverageDurationMs' | 'packetPlaybackWorkerFallbackCount' | 'packetPlaybackWorkerSuccessCount' | 'packetPlaybackWorkerSampleCount' | 'packetPlaybackWorkerLastRoute'>, dominantPhase: FutureNativeExecutionSummary['dominantPhase'], workerPotential: FutureNativeExecutionSummary['workerPotential']) {
  const payloadKb = (summary.estimatedPayloadBytes / 1024).toFixed(1);
  if (workerPotential === 'high') {
    return `${dominantPhase} heavy · payload ${payloadKb}KB · route is a good worker-prep candidate`;
  }
  if (workerPotential === 'medium') {
    return `${dominantPhase} visible · payload ${payloadKb}KB · keep profiling before routing changes`;
  }
  return `${dominantPhase} light · payload ${payloadKb}KB · keep direct scene path for now`;
}

function getPlaybackWorkerPrimaryIssue(summary: Omit<FutureNativeExecutionSummary, 'dominantPhase' | 'workerPotential' | 'rationale'>): FutureNativeExecutionSummary['packetPlaybackWorkerPrimaryIssue'] {
  if (summary.packetPlaybackWorkerReadiness === 'idle' && summary.packetPlaybackWorkerSampleCount === 0) {
    return 'idle';
  }
  if (summary.packetPlaybackWorkerActiveRequestCount > 0) {
    return 'pending';
  }
  if (summary.packetPlaybackWorkerFallbackCount > summary.packetPlaybackWorkerSuccessCount) {
    return 'fallback-pressure';
  }
  if (summary.packetPlaybackWorkerHeld && summary.packetPlaybackWorkerHeldAgeMs >= Math.max(60, summary.packetPlaybackWorkerStaleMs * 0.45)) {
    return 'hold-window';
  }
  if (summary.packetPlaybackWorkerBackoffMs >= 18) {
    return 'adaptive-backoff';
  }
  if (summary.packetPlaybackWorkerCooldownMs >= 80) {
    return 'cooldown-throttle';
  }
  return 'stable';
}

function getPlaybackWorkerHealthScore(summary: Omit<FutureNativeExecutionSummary, 'dominantPhase' | 'workerPotential' | 'rationale'>) {
  if (summary.packetPlaybackWorkerReadiness === 'idle' && summary.packetPlaybackWorkerSampleCount === 0) {
    return 0;
  }
  const sampleCount = Math.max(1, summary.packetPlaybackWorkerSampleCount);
  const fallbackRatio = summary.packetPlaybackWorkerFallbackCount / sampleCount;
  const holdPenalty = summary.packetPlaybackWorkerHeld
    ? Math.min(20, (summary.packetPlaybackWorkerHeldAgeMs / Math.max(1, summary.packetPlaybackWorkerStaleMs || 1)) * 20)
    : 0;
  const backoffPenalty = Math.min(12, summary.packetPlaybackWorkerBackoffMs * 0.5);
  const pendingPenalty = summary.packetPlaybackWorkerActiveRequestCount > 0 ? Math.min(12, summary.packetPlaybackWorkerActiveRequestCount * 8) : 0;
  const cooldownPenalty = summary.packetPlaybackWorkerCooldownMs >= 80 ? Math.min(8, (summary.packetPlaybackWorkerCooldownMs - 80) * 0.25) : 0;
  const score = 100 - fallbackRatio * 45 - holdPenalty - backoffPenalty - pendingPenalty - cooldownPenalty;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function getPlaybackWorkerCloseout(summary: Omit<FutureNativeExecutionSummary, 'dominantPhase' | 'workerPotential' | 'rationale'>): Pick<FutureNativeExecutionSummary, 'packetPlaybackWorkerCloseoutStatus' | 'packetPlaybackWorkerNextAction'> {
  if (summary.packetPlaybackWorkerReadiness === 'idle' && summary.packetPlaybackWorkerSampleCount === 0) {
    return {
      packetPlaybackWorkerCloseoutStatus: 'watch',
      packetPlaybackWorkerNextAction: 'watch-overlay',
    };
  }
  if (summary.packetPlaybackWorkerPrimaryIssue === 'fallback-pressure') {
    return {
      packetPlaybackWorkerCloseoutStatus: summary.packetPlaybackWorkerBypassReason === 'none' ? 'blocking' : 'watch',
      packetPlaybackWorkerNextAction: 'reduce-fallbacks',
    };
  }
  if (summary.packetPlaybackWorkerPrimaryIssue === 'hold-window') {
    return {
      packetPlaybackWorkerCloseoutStatus: 'watch',
      packetPlaybackWorkerNextAction: 'retune-hold-window',
    };
  }
  if ((summary.packetPlaybackWorkerPayloadTier === 'heavy' || summary.packetPlaybackWorkerPayloadTier === 'very-heavy')
    && summary.packetPlaybackWorkerBackoffMs >= 16) {
    return {
      packetPlaybackWorkerCloseoutStatus: summary.packetPlaybackWorkerHealthScore >= 72 ? 'watch' : 'blocking',
      packetPlaybackWorkerNextAction: 'retune-heavy-retry',
    };
  }
  if (summary.packetPlaybackWorkerHealthScore >= 85
    && summary.packetPlaybackWorkerSampleCount >= 3
    && summary.packetPlaybackWorkerPrimaryIssue === 'stable') {
    return {
      packetPlaybackWorkerCloseoutStatus: 'ready',
      packetPlaybackWorkerNextAction: 'keep-current',
    };
  }
  return {
    packetPlaybackWorkerCloseoutStatus: summary.packetPlaybackWorkerHealthScore >= 65 ? 'watch' : 'blocking',
    packetPlaybackWorkerNextAction: 'watch-overlay',
  };
}

function getPlaybackWorkerTuningSuggestion(summary: Omit<FutureNativeExecutionSummary, 'dominantPhase' | 'workerPotential' | 'rationale'>): Pick<FutureNativeExecutionSummary, 'packetPlaybackWorkerSuggestedCooldownDeltaMs' | 'packetPlaybackWorkerSuggestedStaleDeltaMs' | 'packetPlaybackWorkerSuggestedCooldownTargetMs' | 'packetPlaybackWorkerSuggestedStaleTargetMs' | 'packetPlaybackWorkerSuggestedRoute' | 'packetPlaybackWorkerTuningPacket' | 'packetPlaybackWorkerTuningHint'> {
  const withTargets = (
    cooldownDeltaMs: number,
    staleDeltaMs: number,
    route: FutureNativeExecutionSummary['packetPlaybackWorkerSuggestedRoute'],
    hint: string,
  ) => {
    const packetPlaybackWorkerSuggestedCooldownTargetMs = Math.max(0, summary.packetPlaybackWorkerCooldownMs + cooldownDeltaMs);
    const packetPlaybackWorkerSuggestedStaleTargetMs = Math.max(0, summary.packetPlaybackWorkerStaleMs + staleDeltaMs);
    return {
      packetPlaybackWorkerSuggestedCooldownDeltaMs: cooldownDeltaMs,
      packetPlaybackWorkerSuggestedStaleDeltaMs: staleDeltaMs,
      packetPlaybackWorkerSuggestedCooldownTargetMs,
      packetPlaybackWorkerSuggestedStaleTargetMs,
      packetPlaybackWorkerSuggestedRoute: route,
      packetPlaybackWorkerTuningPacket: getPlaybackWorkerTuningPacket({
        layerIndex: summary.layerIndex,
        familyId: summary.familyId,
        packetPlaybackWorkerCloseoutStatus: summary.packetPlaybackWorkerCloseoutStatus,
        packetPlaybackWorkerPrimaryIssue: summary.packetPlaybackWorkerPrimaryIssue,
        packetPlaybackWorkerNextAction: summary.packetPlaybackWorkerNextAction,
        packetPlaybackWorkerSuggestedRoute: route,
        packetPlaybackWorkerSuggestedCooldownTargetMs,
        packetPlaybackWorkerSuggestedStaleTargetMs,
      }),
      packetPlaybackWorkerTuningHint: hint,
    };
  };
  if (summary.packetPlaybackWorkerNextAction === 'keep-current') {
    return withTargets(0, 0, 'keep-worker', 'hold current playback worker timing');
  }

  if (summary.packetPlaybackWorkerNextAction === 'reduce-fallbacks') {
    if (summary.packetPlaybackWorkerBypassReason !== 'none') {
      return withTargets(0, 0, 'keep-direct-bypass', 'keep direct-bypass path and watch fallback ratio');
    }
    return withTargets(
      12,
      18,
      summary.packetPlaybackWorkerPayloadTier === 'light' || summary.packetPlaybackWorkerPayloadTier === 'medium'
        ? 'prefer-direct'
        : 'keep-worker',
      'raise cooldown/stale or route medium-light playback direct',
    );
  }

  if (summary.packetPlaybackWorkerNextAction === 'retune-hold-window') {
    const holdRatio = summary.packetPlaybackWorkerHeldAgeMs / Math.max(1, summary.packetPlaybackWorkerStaleMs || 1);
    if (holdRatio >= 0.6) {
      return withTargets(0, -20, 'keep-worker', 'trim stale hold window to release older playback packets sooner');
    }
    return withTargets(0, 12, 'keep-worker', 'extend stale hold window slightly to smooth playback reuse');
  }

  if (summary.packetPlaybackWorkerNextAction === 'retune-heavy-retry') {
    return withTargets(
      summary.packetPlaybackWorkerBackoffMs >= 24 ? 14 : 8,
      summary.packetPlaybackWorkerBackoffMs >= 24 ? 22 : 12,
      'keep-worker',
      'slow heavy playback retry cadence to reduce worker oscillation',
    );
  }

  if (summary.packetPlaybackWorkerActiveRequestCount > 0) {
    return withTargets(6, 0, 'watch-current-route', 'pending playback request is active; recheck after queue settles');
  }

  if (summary.packetPlaybackWorkerCooldownMs >= 80) {
    return withTargets(-8, 0, 'keep-worker', 'cooldown is conservative; reduce slightly after a stable run');
  }

  return withTargets(0, 0, 'watch-current-route', 'watch overlay and confirm worker/fallback balance');
}

export function getFutureNativeExecutionSummaries(
  diagnostics: FutureNativeDiagnosticsSnapshot,
  simulationEntries: RuntimeProfilingEntry[],
  workerEntries: WorkerExecutionEntry[] = [],
  limit = 2,
): FutureNativeExecutionSummary[] {
  const snapshots = [diagnostics.layer2, diagnostics.layer3].filter((entry): entry is FutureNativeSceneDiagnosticSnapshot => Boolean(entry));
  const summaries = snapshots.map((snapshot) => {
    const layerIndex = snapshot.layerIndex;
    const workerEntry = workerEntries.find((entry) => entry.id === `worker:future-native-packet-layer${layerIndex}:${snapshot.familyId}`);
    const playbackWorkerEntry = workerEntries.find((entry) => entry.id === `worker:future-native-packet-layer${layerIndex}:${snapshot.familyId}:playback`);
    const base: Omit<FutureNativeExecutionSummary, 'dominantPhase' | 'workerPotential' | 'rationale'> = {
      id: `future-native-layer${layerIndex}:${snapshot.familyId}`,
      layerIndex,
      familyId: snapshot.familyId,
      bindingMode: snapshot.bindingMode,
      pointCount: snapshot.pointCount,
      lineCount: snapshot.lineCount,
      averageDurationMs: findAverageDuration(simulationEntries, `scene:future-native-layer${layerIndex}`),
      worstDurationMs: simulationEntries.find((entry) => entry.id === `scene:future-native-layer${layerIndex}`)?.worstDurationMs ?? 0,
      geometryAverageDurationMs: findAverageDuration(simulationEntries, `scene:future-native-geometry-layer${layerIndex}`),
      packetAverageDurationMs: findAverageDuration(simulationEntries, `scene:future-native-packet-layer${layerIndex}`),
      descriptorAverageDurationMs: findAverageDuration(simulationEntries, `scene:future-native-descriptor-layer${layerIndex}`),
      stepAverageDurationMs: findAverageDuration(simulationEntries, `scene:future-native-step-layer${layerIndex}`),
      audioAverageDurationMs: findAverageDuration(simulationEntries, `scene:future-native-audio-layer${layerIndex}`),
      publishAverageDurationMs: findAverageDuration(simulationEntries, `scene:future-native-diagnostic-publish-layer${layerIndex}`),
      estimatedPayloadBytes: estimatePayloadBytes(snapshot),
      packetWorkerReadiness: workerEntry?.readiness ?? 'idle',
      packetWorkerAverageDurationMs: workerEntry?.averageDurationMs ?? 0,
      packetWorkerFallbackCount: workerEntry?.fallbackCount ?? 0,
      packetWorkerSuccessCount: workerEntry?.workerSuccessCount ?? 0,
      packetWorkerSampleCount: workerEntry?.sampleCount ?? 0,
      packetWorkerLastRoute: workerEntry?.lastRoute ?? 'none',
      packetPlaybackWorkerReadiness: playbackWorkerEntry?.readiness ?? 'idle',
      packetPlaybackWorkerAverageDurationMs: playbackWorkerEntry?.averageDurationMs ?? 0,
      packetPlaybackWorkerFallbackCount: playbackWorkerEntry?.fallbackCount ?? 0,
      packetPlaybackWorkerSuccessCount: playbackWorkerEntry?.workerSuccessCount ?? 0,
      packetPlaybackWorkerSampleCount: playbackWorkerEntry?.sampleCount ?? 0,
      packetPlaybackWorkerLastRoute: playbackWorkerEntry?.lastRoute ?? 'none',
      packetPlaybackWorkerActiveRequestCount: playbackWorkerEntry?.activeRequestCount ?? 0,
      packetPlaybackWorkerHeld: snapshot.playbackWorkerHeld ?? false,
      packetPlaybackWorkerHeldAgeMs: snapshot.playbackWorkerHeldAgeMs ?? 0,
      packetPlaybackWorkerPayloadTier: snapshot.playbackWorkerPayloadTier ?? 'light',
      packetPlaybackWorkerEstimatedBytes: snapshot.playbackWorkerEstimatedBytes ?? 0,
      packetPlaybackWorkerCooldownMs: snapshot.playbackWorkerCooldownMs ?? 0,
      packetPlaybackWorkerStaleMs: snapshot.playbackWorkerStaleMs ?? 0,
      packetPlaybackWorkerBackoffMs: snapshot.playbackWorkerBackoffMs ?? 0,
      packetPlaybackWorkerHealthScore: 0,
      packetPlaybackWorkerPrimaryIssue: 'idle',
      packetPlaybackWorkerBypassReason: snapshot.playbackWorkerBypassReason ?? 'none',
      packetPlaybackWorkerCloseoutStatus: 'watch',
      packetPlaybackWorkerNextAction: 'watch-overlay',
      packetPlaybackWorkerSuggestedCooldownDeltaMs: 0,
      packetPlaybackWorkerSuggestedStaleDeltaMs: 0,
      packetPlaybackWorkerSuggestedCooldownTargetMs: snapshot.playbackWorkerCooldownMs ?? 0,
      packetPlaybackWorkerSuggestedStaleTargetMs: snapshot.playbackWorkerStaleMs ?? 0,
      packetPlaybackWorkerSuggestedRoute: 'watch-current-route',
      packetPlaybackWorkerTuningPacket: '',
      packetPlaybackWorkerTuningHint: '',
    };
    const dominantPhase = getDominantPhase(base);
    const workerPotential = getWorkerPotential(base);
    const packetPlaybackWorkerPrimaryIssue = getPlaybackWorkerPrimaryIssue(base);
    const packetPlaybackWorkerHealthScore = getPlaybackWorkerHealthScore(base);
    const closeout = getPlaybackWorkerCloseout({
      ...base,
      packetPlaybackWorkerPrimaryIssue,
      packetPlaybackWorkerHealthScore,
    });
    const tuning = getPlaybackWorkerTuningSuggestion({
      ...base,
      packetPlaybackWorkerPrimaryIssue,
      packetPlaybackWorkerHealthScore,
      ...closeout,
    });
    return {
      ...base,
      dominantPhase,
      workerPotential,
      packetPlaybackWorkerPrimaryIssue,
      packetPlaybackWorkerHealthScore,
      ...closeout,
      ...tuning,
      rationale: getRationale(base, dominantPhase, workerPotential),
    };
  });
  return summaries
    .sort(compareFutureNativeExecutionPriority)
    .slice(0, Math.max(1, limit));
}

export function getFutureNativePlaybackCloseoutSummary(summaries: FutureNativeExecutionSummary[]): FutureNativePlaybackCloseoutSummary {
  const totalLanes = summaries.length;
  if (totalLanes === 0) {
    return {
      totalLanes: 0,
      readyCount: 0,
      watchCount: 0,
      blockingCount: 0,
      averageHealthScore: 0,
      progressPercent: 0,
      nextFocus: 'none',
      focusLane: 'none',
      focusStatus: 'none',
      focusIssue: 'none',
      focusAction: 'none',
      focusSuggestedCooldownDeltaMs: 0,
      focusSuggestedStaleDeltaMs: 0,
      focusSuggestedCooldownTargetMs: 0,
      focusSuggestedStaleTargetMs: 0,
      focusSuggestedRoute: 'none',
      focusTuningPacket: 'none',
      focusTuningHint: 'no playback lanes',
    };
  }

  let readyCount = 0;
  let watchCount = 0;
  let blockingCount = 0;
  let healthSum = 0;
  const actionCounts = new Map<Exclude<FutureNativePlaybackCloseoutSummary['nextFocus'], 'none'>, number>([
    ['watch-overlay', 0],
    ['reduce-fallbacks', 0],
    ['retune-hold-window', 0],
    ['retune-heavy-retry', 0],
  ]);

  for (const summary of summaries) {
    healthSum += summary.packetPlaybackWorkerHealthScore;
    if (summary.packetPlaybackWorkerCloseoutStatus === 'ready') readyCount += 1;
    else if (summary.packetPlaybackWorkerCloseoutStatus === 'watch') watchCount += 1;
    else blockingCount += 1;

    if (summary.packetPlaybackWorkerNextAction !== 'keep-current') {
      const actionWeight = summary.packetPlaybackWorkerCloseoutStatus === 'blocking'
        ? 3
        : summary.packetPlaybackWorkerCloseoutStatus === 'watch'
          ? 1
          : 0;
      actionCounts.set(
        summary.packetPlaybackWorkerNextAction,
        (actionCounts.get(summary.packetPlaybackWorkerNextAction) ?? 0) + actionWeight,
      );
    }
  }

  const weightedProgress = (readyCount * 100 + watchCount * 65 + blockingCount * 25) / totalLanes;
  let nextFocus: FutureNativePlaybackCloseoutSummary['nextFocus'] = 'watch-overlay';
  let nextFocusCount = -1;
  for (const [action, count] of actionCounts.entries()) {
    if (count > nextFocusCount) {
      nextFocus = action;
      nextFocusCount = count;
    }
  }
  if (nextFocusCount <= 0) {
    nextFocus = 'none';
  }
  const focusLaneSummary = summaries
    .filter((summary) => summary.packetPlaybackWorkerCloseoutStatus !== 'ready')
    .sort((a, b) => getSummaryPriorityScore(a) - getSummaryPriorityScore(b))[0];

  return {
    totalLanes,
    readyCount,
    watchCount,
    blockingCount,
    averageHealthScore: Math.round(healthSum / totalLanes),
    progressPercent: Math.round(weightedProgress),
    nextFocus,
    focusLane: focusLaneSummary ? getFutureNativeLaneLabel(focusLaneSummary) : 'none',
    focusStatus: focusLaneSummary?.packetPlaybackWorkerCloseoutStatus ?? 'none',
    focusIssue: focusLaneSummary?.packetPlaybackWorkerPrimaryIssue ?? 'none',
    focusAction: focusLaneSummary?.packetPlaybackWorkerNextAction ?? 'none',
    focusSuggestedCooldownDeltaMs: focusLaneSummary?.packetPlaybackWorkerSuggestedCooldownDeltaMs ?? 0,
    focusSuggestedStaleDeltaMs: focusLaneSummary?.packetPlaybackWorkerSuggestedStaleDeltaMs ?? 0,
    focusSuggestedCooldownTargetMs: focusLaneSummary?.packetPlaybackWorkerSuggestedCooldownTargetMs ?? 0,
    focusSuggestedStaleTargetMs: focusLaneSummary?.packetPlaybackWorkerSuggestedStaleTargetMs ?? 0,
    focusSuggestedRoute: focusLaneSummary?.packetPlaybackWorkerSuggestedRoute ?? 'none',
    focusTuningPacket: focusLaneSummary?.packetPlaybackWorkerTuningPacket ?? 'none',
    focusTuningHint: focusLaneSummary?.packetPlaybackWorkerTuningHint ?? 'no playback lanes',
  };
}
