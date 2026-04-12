import React from 'react';
import { useFrame, type RootState } from '@react-three/fiber';

export type RuntimeProfilingCategory = 'simulation' | 'export';

export interface RuntimeProfilingEntry {
  id: string;
  category: RuntimeProfilingCategory;
  averageDurationMs: number;
  worstDurationMs: number;
  sampleCount: number;
  lastDurationMs: number;
  lastUpdatedAtMs: number;
}

export interface RuntimeProfilingSnapshot {
  simulation: RuntimeProfilingEntry[];
  export: RuntimeProfilingEntry[];
}

type RuntimeProfilingBucket = {
  id: string;
  category: RuntimeProfilingCategory;
  windowStartedAtMs: number;
  windowTotalDurationMs: number;
  windowWorstDurationMs: number;
  windowSampleCount: number;
  committedAverageDurationMs: number;
  committedWorstDurationMs: number;
  committedSampleCount: number;
  lastDurationMs: number;
  lastUpdatedAtMs: number;
  lastCommittedAtMs: number;
};

const WINDOW_MS = 1000;
const STALE_MS = 5000;
const DEFAULT_RUNTIME_PROFILING_SNAPSHOT: RuntimeProfilingSnapshot = {
  simulation: [],
  export: [],
};

const runtimeProfilingBuckets = new Map<string, RuntimeProfilingBucket>();

export function getRuntimeProfilingNow() {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    return performance.now();
  }
  return Date.now();
}

function getBucketKey(id: string, category: RuntimeProfilingCategory) {
  return `${category}:${id}`;
}

function commitRuntimeProfilingBucket(bucket: RuntimeProfilingBucket, nowMs: number) {
  if (bucket.windowSampleCount > 0) {
    bucket.committedAverageDurationMs = bucket.windowTotalDurationMs / bucket.windowSampleCount;
    bucket.committedWorstDurationMs = bucket.windowWorstDurationMs;
    bucket.committedSampleCount = bucket.windowSampleCount;
    bucket.lastCommittedAtMs = nowMs;
  }
  bucket.windowStartedAtMs = nowMs;
  bucket.windowTotalDurationMs = 0;
  bucket.windowWorstDurationMs = 0;
  bucket.windowSampleCount = 0;
}

function rollRuntimeProfilingBucket(bucket: RuntimeProfilingBucket, nowMs: number) {
  if (nowMs - bucket.windowStartedAtMs < WINDOW_MS) {
    return;
  }
  commitRuntimeProfilingBucket(bucket, nowMs);
}

export function clearRuntimeProfiling() {
  runtimeProfilingBuckets.clear();
}

export function recordRuntimeProfilingDuration(
  id: string,
  category: RuntimeProfilingCategory,
  durationMs: number,
  nowMs = getRuntimeProfilingNow(),
) {
  if (!id || !Number.isFinite(durationMs) || durationMs < 0) {
    return;
  }

  const key = getBucketKey(id, category);
  let bucket = runtimeProfilingBuckets.get(key);
  if (!bucket) {
    bucket = {
      id,
      category,
      windowStartedAtMs: nowMs,
      windowTotalDurationMs: 0,
      windowWorstDurationMs: 0,
      windowSampleCount: 0,
      committedAverageDurationMs: 0,
      committedWorstDurationMs: 0,
      committedSampleCount: 0,
      lastDurationMs: 0,
      lastUpdatedAtMs: nowMs,
      lastCommittedAtMs: 0,
    };
    runtimeProfilingBuckets.set(key, bucket);
  }

  rollRuntimeProfilingBucket(bucket, nowMs);
  bucket.windowTotalDurationMs += durationMs;
  bucket.windowWorstDurationMs = Math.max(bucket.windowWorstDurationMs, durationMs);
  bucket.windowSampleCount += 1;
  bucket.lastDurationMs = durationMs;
  bucket.lastUpdatedAtMs = nowMs;
}

export function profileRuntimeTask<T>(
  id: string,
  category: RuntimeProfilingCategory,
  task: () => T,
) {
  const startedAtMs = getRuntimeProfilingNow();
  const result = task();
  recordRuntimeProfilingDuration(id, category, getRuntimeProfilingNow() - startedAtMs);
  return result;
}

export function readRuntimeProfilingSnapshot(nowMs = getRuntimeProfilingNow()): RuntimeProfilingSnapshot {
  const simulation: RuntimeProfilingEntry[] = [];
  const exportTimings: RuntimeProfilingEntry[] = [];

  for (const bucket of runtimeProfilingBuckets.values()) {
    rollRuntimeProfilingBucket(bucket, nowMs);
    if (nowMs - bucket.lastUpdatedAtMs > STALE_MS) {
      continue;
    }

    const entry: RuntimeProfilingEntry = {
      id: bucket.id,
      category: bucket.category,
      averageDurationMs: Math.round(bucket.committedAverageDurationMs * 100) / 100,
      worstDurationMs: Math.round(bucket.committedWorstDurationMs * 100) / 100,
      sampleCount: bucket.committedSampleCount,
      lastDurationMs: Math.round(bucket.lastDurationMs * 100) / 100,
      lastUpdatedAtMs: bucket.lastUpdatedAtMs,
    };

    if (bucket.category === 'simulation') {
      simulation.push(entry);
    } else {
      exportTimings.push(entry);
    }
  }

  const sortEntries = (entries: RuntimeProfilingEntry[]) => entries.sort((left, right) => (
    right.averageDurationMs - left.averageDurationMs
    || right.worstDurationMs - left.worstDurationMs
    || right.lastDurationMs - left.lastDurationMs
    || left.id.localeCompare(right.id)
  ));

  return {
    simulation: sortEntries(simulation),
    export: sortEntries(exportTimings),
  };
}

export function useRuntimeProfilingTelemetry(enabled: boolean) {
  const [snapshot, setSnapshot] = React.useState<RuntimeProfilingSnapshot>(DEFAULT_RUNTIME_PROFILING_SNAPSHOT);

  React.useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      setSnapshot(DEFAULT_RUNTIME_PROFILING_SNAPSHOT);
      return;
    }

    setSnapshot(readRuntimeProfilingSnapshot());
    const intervalId = window.setInterval(() => {
      setSnapshot(readRuntimeProfilingSnapshot());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [enabled]);

  return snapshot;
}

export function useProfiledFrame(
  id: string,
  enabled: boolean,
  callback: (state: RootState, delta: number) => void,
  renderPriority?: number,
) {
  useFrame((state, delta) => {
    if (!enabled) {
      callback(state, delta);
      return;
    }

    const startedAtMs = getRuntimeProfilingNow();
    callback(state, delta);
    recordRuntimeProfilingDuration(id, 'simulation', getRuntimeProfilingNow() - startedAtMs);
  }, renderPriority);
}
