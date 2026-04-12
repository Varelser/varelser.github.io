import type { WorkerExecutionEntry } from './workerExecutionTelemetry';

export type PlaybackPayloadTier = 'very-heavy' | 'heavy' | 'medium' | 'light';

export interface FutureNativePlaybackWorkerTiming {
  payloadTier: PlaybackPayloadTier;
  cooldownMs: number;
  staleMs: number;
  backoffMs: number;
  holdExtensionMs: number;
}

export interface FutureNativePlaybackWorkerStrategy {
  timing: FutureNativePlaybackWorkerTiming;
  preferDirectPlayback: boolean;
  bypassReason: 'none' | 'fallback-pressure' | 'mixed-light' | 'pending-medium';
}

export function getPlaybackPayloadTier(estimatedBytes: number): PlaybackPayloadTier {
  if (estimatedBytes >= 256 * 1024) return 'very-heavy';
  if (estimatedBytes >= 192 * 1024) return 'heavy';
  if (estimatedBytes >= 128 * 1024) return 'medium';
  return 'light';
}

export function getFutureNativePlaybackWorkerTiming(args: {
  estimatedBytes: number;
  heldRecentlyActive: boolean;
  telemetryEntry?: WorkerExecutionEntry | null;
}): FutureNativePlaybackWorkerTiming {
  const { estimatedBytes, heldRecentlyActive, telemetryEntry } = args;
  const payloadTier = getPlaybackPayloadTier(estimatedBytes);
  const baseCooldownMs = payloadTier === 'very-heavy'
    ? (heldRecentlyActive ? 45 : 60)
    : payloadTier === 'heavy'
      ? (heldRecentlyActive ? 55 : 70)
      : payloadTier === 'medium'
        ? (heldRecentlyActive ? 68 : 82)
        : (heldRecentlyActive ? 75 : 90);
  const baseStaleMs = payloadTier === 'very-heavy'
    ? 260
    : estimatedBytes >= 224 * 1024
      ? 220
      : payloadTier === 'medium'
        ? 195
        : 180;

  let backoffMs = 0;
  let holdExtensionMs = 0;
  if (telemetryEntry?.readiness === 'mixed') {
    backoffMs += 12;
    holdExtensionMs += 18;
  } else if (telemetryEntry?.readiness === 'fallback-only') {
    backoffMs += 18;
    holdExtensionMs += 30;
  }
  if ((telemetryEntry?.sampleCount ?? 0) >= 2 && (telemetryEntry?.fallbackCount ?? 0) > (telemetryEntry?.workerSuccessCount ?? 0)) {
    backoffMs += 8;
    holdExtensionMs += 16;
  }
  if ((telemetryEntry?.activeRequestCount ?? 0) > 0) {
    backoffMs += 6;
  }
  if ((payloadTier === 'heavy' || payloadTier === 'very-heavy') && telemetryEntry) {
    if (telemetryEntry.averageDurationMs >= 2.4) {
      backoffMs += Math.min(16, Math.round((telemetryEntry.averageDurationMs - 2.4) * 6));
      holdExtensionMs += Math.min(24, Math.round((telemetryEntry.averageDurationMs - 2.4) * 10));
    }
    if (telemetryEntry.worstDurationMs >= 4.8) {
      backoffMs += 6;
      holdExtensionMs += 10;
    }
  }

  return {
    payloadTier,
    cooldownMs: baseCooldownMs + backoffMs,
    staleMs: baseStaleMs + holdExtensionMs,
    backoffMs,
    holdExtensionMs,
  };
}

export function getFutureNativePlaybackWorkerStrategy(args: {
  estimatedBytes: number;
  heldRecentlyActive: boolean;
  telemetryEntry?: WorkerExecutionEntry | null;
}): FutureNativePlaybackWorkerStrategy {
  const timing = getFutureNativePlaybackWorkerTiming(args);
  const telemetryEntry = args.telemetryEntry;
  const fallbackDominant = (telemetryEntry?.fallbackCount ?? 0) >= Math.max(1, telemetryEntry?.workerSuccessCount ?? 0);
  const payloadTier = timing.payloadTier;

  if ((payloadTier === 'light' || payloadTier === 'medium')
    && telemetryEntry?.readiness === 'fallback-only'
    && fallbackDominant) {
    return {
      timing,
      preferDirectPlayback: true,
      bypassReason: 'fallback-pressure',
    };
  }

  if (payloadTier === 'light'
    && telemetryEntry?.readiness === 'mixed'
    && fallbackDominant) {
    return {
      timing,
      preferDirectPlayback: true,
      bypassReason: 'mixed-light',
    };
  }

  if (payloadTier === 'medium'
    && (telemetryEntry?.activeRequestCount ?? 0) > 0
    && fallbackDominant) {
    return {
      timing,
      preferDirectPlayback: true,
      bypassReason: 'pending-medium',
    };
  }

  return {
    timing,
    preferDirectPlayback: false,
    bypassReason: 'none',
  };
}
