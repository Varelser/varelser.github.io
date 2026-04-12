import React from 'react';

export type WorkerExecutionRoute = 'worker' | 'fallback';

export interface WorkerExecutionEntry {
  id: string;
  averageDurationMs: number;
  worstDurationMs: number;
  sampleCount: number;
  workerSuccessCount: number;
  fallbackCount: number;
  activeRequestCount: number;
  averagePayloadBytes: number;
  largestPayloadBytes: number;
  lastRoute: WorkerExecutionRoute | 'idle';
  readiness: 'idle' | 'worker-active' | 'fallback-only' | 'mixed';
  lastUpdatedAtMs: number;
}

interface WorkerExecutionBucket {
  id: string;
  totalDurationMs: number;
  worstDurationMs: number;
  sampleCount: number;
  workerSuccessCount: number;
  fallbackCount: number;
  activeRequestCount: number;
  totalPayloadBytes: number;
  largestPayloadBytes: number;
  lastRoute: WorkerExecutionRoute | 'idle';
  lastUpdatedAtMs: number;
}

const STALE_MS = 10000;
const buckets = new Map<string, WorkerExecutionBucket>();

function nowMs() {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    return performance.now();
  }
  return Date.now();
}

function estimatePayloadBytes(value: unknown): number {
  try {
    const json = JSON.stringify(value);
    return typeof json === 'string' ? json.length * 2 : 0;
  } catch {
    return 0;
  }
}

function getBucket(id: string, atMs = nowMs()) {
  let bucket = buckets.get(id);
  if (!bucket) {
    bucket = {
      id,
      totalDurationMs: 0,
      worstDurationMs: 0,
      sampleCount: 0,
      workerSuccessCount: 0,
      fallbackCount: 0,
      activeRequestCount: 0,
      totalPayloadBytes: 0,
      largestPayloadBytes: 0,
      lastRoute: 'idle',
      lastUpdatedAtMs: atMs,
    };
    buckets.set(id, bucket);
  }
  return bucket;
}

export function clearWorkerExecutionTelemetry() {
  buckets.clear();
}

export function beginWorkerExecutionRequest(id: string, payload?: unknown, atMs = nowMs()) {
  if (!id) return;
  const bucket = getBucket(id, atMs);
  bucket.activeRequestCount += 1;
  const payloadBytes = estimatePayloadBytes(payload);
  if (payloadBytes > 0) {
    bucket.totalPayloadBytes += payloadBytes;
    bucket.largestPayloadBytes = Math.max(bucket.largestPayloadBytes, payloadBytes);
  }
  bucket.lastUpdatedAtMs = atMs;
}

export function completeWorkerExecutionRequest(args: {
  id: string;
  durationMs: number;
  route: WorkerExecutionRoute;
  atMs?: number;
}) {
  const { id, durationMs, route, atMs = nowMs() } = args;
  if (!id || !Number.isFinite(durationMs) || durationMs < 0) {
    return;
  }
  const bucket = getBucket(id, atMs);
  bucket.activeRequestCount = Math.max(0, bucket.activeRequestCount - 1);
  bucket.totalDurationMs += durationMs;
  bucket.worstDurationMs = Math.max(bucket.worstDurationMs, durationMs);
  bucket.sampleCount += 1;
  bucket.lastRoute = route;
  bucket.lastUpdatedAtMs = atMs;
  if (route === 'worker') {
    bucket.workerSuccessCount += 1;
  } else {
    bucket.fallbackCount += 1;
  }
}

export function failWorkerExecutionRequest(id: string, atMs = nowMs()) {
  if (!id) return;
  const bucket = getBucket(id, atMs);
  bucket.activeRequestCount = Math.max(0, bucket.activeRequestCount - 1);
  bucket.lastUpdatedAtMs = atMs;
}

function getReadiness(bucket: WorkerExecutionBucket): WorkerExecutionEntry['readiness'] {
  if (bucket.sampleCount === 0 && bucket.activeRequestCount === 0) {
    return 'idle';
  }
  if (bucket.workerSuccessCount > 0 && bucket.fallbackCount > 0) {
    return 'mixed';
  }
  if (bucket.workerSuccessCount > 0) {
    return 'worker-active';
  }
  if (bucket.fallbackCount > 0) {
    return 'fallback-only';
  }
  return 'idle';
}

export function getWorkerExecutionEntry(id: string, atMs = nowMs()): WorkerExecutionEntry | null {
  const bucket = buckets.get(id);
  if (!bucket || atMs - bucket.lastUpdatedAtMs > STALE_MS) {
    return null;
  }
  return {
    id: bucket.id,
    averageDurationMs: bucket.sampleCount > 0 ? Math.round((bucket.totalDurationMs / bucket.sampleCount) * 100) / 100 : 0,
    worstDurationMs: Math.round(bucket.worstDurationMs * 100) / 100,
    sampleCount: bucket.sampleCount,
    workerSuccessCount: bucket.workerSuccessCount,
    fallbackCount: bucket.fallbackCount,
    activeRequestCount: bucket.activeRequestCount,
    averagePayloadBytes: bucket.sampleCount > 0 ? Math.round(bucket.totalPayloadBytes / bucket.sampleCount) : 0,
    largestPayloadBytes: bucket.largestPayloadBytes,
    lastRoute: bucket.lastRoute,
    readiness: getReadiness(bucket),
    lastUpdatedAtMs: bucket.lastUpdatedAtMs,
  };
}

export function readWorkerExecutionTelemetry(atMs = nowMs()): WorkerExecutionEntry[] {
  const entries: WorkerExecutionEntry[] = [];
  for (const bucket of buckets.values()) {
    const entry = getWorkerExecutionEntry(bucket.id, atMs);
    if (entry) entries.push(entry);
  }

  return entries.sort((left, right) => (
    right.averageDurationMs - left.averageDurationMs
    || right.fallbackCount - left.fallbackCount
    || right.activeRequestCount - left.activeRequestCount
    || left.id.localeCompare(right.id)
  ));
}

export function useWorkerExecutionTelemetry(enabled: boolean) {
  const [snapshot, setSnapshot] = React.useState<WorkerExecutionEntry[]>([]);

  React.useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      setSnapshot([]);
      return;
    }

    setSnapshot(readWorkerExecutionTelemetry());
    const intervalId = window.setInterval(() => {
      setSnapshot(readWorkerExecutionTelemetry());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [enabled]);

  return snapshot;
}
