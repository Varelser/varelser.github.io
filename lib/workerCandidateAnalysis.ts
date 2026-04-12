import type { RuntimeProfilingEntry } from './runtimeProfiling';
import type { WorkerExecutionEntry } from './workerExecutionTelemetry';

export interface WorkerCandidateSummary {
  id: string;
  kind: 'particle-data' | 'future-native' | 'gpgpu' | 'export' | 'unknown';
  averageDurationMs: number;
  worstDurationMs: number;
  sampleCount: number;
  route: 'worker' | 'direct' | 'mixed' | 'unknown';
  readiness: WorkerExecutionEntry['readiness'] | 'not-applicable';
  rationale: string;
}

function inferCandidateKind(id: string): WorkerCandidateSummary['kind'] {
  if (id.includes('particle-data')) return 'particle-data';
  if (id.startsWith('scene:future-native')) return 'future-native';
  if (id.includes('gpgpu')) return 'gpgpu';
  if (id.startsWith('export:')) return 'export';
  return 'unknown';
}

function scoreCandidate(entry: RuntimeProfilingEntry, workerEntry?: WorkerExecutionEntry) {
  let score = entry.averageDurationMs * 10 + entry.worstDurationMs * 2 + Math.min(entry.sampleCount, 20);
  if (workerEntry) {
    if (workerEntry.readiness === 'fallback-only') score += 30;
    if (workerEntry.readiness === 'mixed') score += 18;
    if (workerEntry.readiness === 'worker-active') score -= 12;
    score += workerEntry.fallbackCount * 3;
  }
  return score;
}

function getRationale(entry: RuntimeProfilingEntry, workerEntry: WorkerExecutionEntry | undefined, kind: WorkerCandidateSummary['kind']) {
  if (workerEntry?.readiness === 'fallback-only') {
    return 'Worker path is requested but only fallback is completing.';
  }
  if (workerEntry?.readiness === 'mixed') {
    return 'Worker path is active but fallback still appears during some requests.';
  }
  if (kind === 'future-native') {
    return 'Future-native layer timing is consistently visible in simulation hotspots.';
  }
  if (kind === 'gpgpu') {
    return 'GPGPU simulation remains a visible runtime hotspot and is a plausible second worker candidate.';
  }
  if (kind === 'particle-data') {
    return 'Particle data generation is heavy enough to justify route tuning and fallback reduction.';
  }
  return 'Average and worst timings indicate a good next worker investigation target.';
}

export function getWorkerCandidateSummaries(
  simulationEntries: RuntimeProfilingEntry[],
  workerEntries: WorkerExecutionEntry[],
  limit = 4,
): WorkerCandidateSummary[] {
  const workerMap = new Map(workerEntries.map((entry) => [entry.id, entry]));
  const candidates: WorkerCandidateSummary[] = [];

  for (const entry of simulationEntries) {
    if (entry.averageDurationMs <= 0) continue;
    if (
      !entry.id.includes('particle-data')
      && !entry.id.startsWith('scene:future-native')
      && !entry.id.includes('gpgpu')
    ) {
      continue;
    }

    const workerEntry = workerMap.get(entry.id);
    const kind = inferCandidateKind(entry.id);
    let route: WorkerCandidateSummary['route'] = 'unknown';
    let readiness: WorkerCandidateSummary['readiness'] = 'not-applicable';
    if (entry.id.startsWith('direct:')) {
      route = 'direct';
    } else if (workerEntry) {
      readiness = workerEntry.readiness;
      if (workerEntry.readiness === 'worker-active') route = 'worker';
      else if (workerEntry.readiness === 'fallback-only') route = 'direct';
      else if (workerEntry.readiness === 'mixed') route = 'mixed';
    }

    candidates.push({
      id: entry.id,
      kind,
      averageDurationMs: entry.averageDurationMs,
      worstDurationMs: entry.worstDurationMs,
      sampleCount: entry.sampleCount,
      route,
      readiness,
      rationale: getRationale(entry, workerEntry, kind),
    });
  }

  return candidates
    .sort((left, right) => {
      const leftWorker = workerMap.get(left.id);
      const rightWorker = workerMap.get(right.id);
      return scoreCandidate({
        id: left.id,
        category: 'simulation',
        averageDurationMs: left.averageDurationMs,
        worstDurationMs: left.worstDurationMs,
        sampleCount: left.sampleCount,
        lastDurationMs: left.averageDurationMs,
        lastUpdatedAtMs: 0,
      }, leftWorker) - scoreCandidate({
        id: right.id,
        category: 'simulation',
        averageDurationMs: right.averageDurationMs,
        worstDurationMs: right.worstDurationMs,
        sampleCount: right.sampleCount,
        lastDurationMs: right.averageDurationMs,
        lastUpdatedAtMs: 0,
      }, rightWorker);
    })
    .reverse()
    .slice(0, Math.max(1, limit));
}

export function getDirectVsWorkerComparison(
  simulationEntries: RuntimeProfilingEntry[],
  workerEntries: WorkerExecutionEntry[],
  prefix = 'particle-data-layer',
) {
  const workerByKey = new Map<string, WorkerExecutionEntry>();
  for (const entry of workerEntries) {
    const normalized = entry.id.replace(/^worker:/, '');
    workerByKey.set(normalized, entry);
  }

  const directEntries = simulationEntries.filter((entry) => entry.id.startsWith('direct:'));
  return directEntries
    .map((entry) => {
      const normalized = entry.id.replace(/^direct:/, '');
      if (!normalized.startsWith(prefix)) return null;
      const workerEntry = workerByKey.get(normalized);
      return {
        id: normalized,
        directAverageDurationMs: entry.averageDurationMs,
        directWorstDurationMs: entry.worstDurationMs,
        workerAverageDurationMs: workerEntry?.averageDurationMs ?? 0,
        workerWorstDurationMs: workerEntry?.worstDurationMs ?? 0,
        workerReadiness: workerEntry?.readiness ?? 'idle',
        fallbackCount: workerEntry?.fallbackCount ?? 0,
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
    .sort((left, right) => (
      Math.max(right.directAverageDurationMs, right.workerAverageDurationMs)
      - Math.max(left.directAverageDurationMs, left.workerAverageDurationMs)
      || left.id.localeCompare(right.id)
    ));
}
