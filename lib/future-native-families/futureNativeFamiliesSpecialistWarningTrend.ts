import {
  buildFutureNativeSpecialistReleaseHandoffArtifact,
  type FutureNativeSpecialistReleaseHandoffArtifact,
} from './futureNativeFamiliesSpecialistReleaseHandoff';

export const FUTURE_NATIVE_SPECIALIST_HANDOFF_DATE_LABEL = '2026-04-05';

export interface FutureNativeSpecialistWarningTrendSnapshot {
  dateLabel: string;
  generatedAt: string;
  specialistFamilyCount: number;
  routeCount: number;
  averageProgressPercent: number;
  baselineWarningRouteCount: number;
  fixtureChangedRouteCount: number;
  fixtureWarningRouteCount: number;
  exportImportWarningRouteCount: number;
  manifestRoundtripStableCount: number;
  serializationRoundtripStableCount: number;
  controlRoundtripStableCount: number;
  familyProgress: Array<{
    familyId: string;
    progressPercent: number;
    nextTargetCount: number;
  }>;
}

export interface FutureNativeSpecialistWarningTrendFamilyDelta {
  familyId: string;
  currentProgressPercent: number;
  previousProgressPercent: number | null;
  deltaProgressPercent: number;
  currentNextTargetCount: number;
  previousNextTargetCount: number | null;
  deltaNextTargetCount: number;
}

export interface FutureNativeSpecialistWarningTrendComparisonArtifact {
  generatedAt: string;
  historyDepth: number;
  current: FutureNativeSpecialistWarningTrendSnapshot;
  previous: FutureNativeSpecialistWarningTrendSnapshot | null;
  deltas: {
    specialistFamilyCount: number;
    routeCount: number;
    averageProgressPercent: number;
    baselineWarningRouteCount: number;
    fixtureChangedRouteCount: number;
    fixtureWarningRouteCount: number;
    exportImportWarningRouteCount: number;
    manifestRoundtripStableCount: number;
    serializationRoundtripStableCount: number;
    controlRoundtripStableCount: number;
  };
  stableMetrics: string[];
  improvedMetrics: string[];
  regressedMetrics: string[];
  familyDeltas: FutureNativeSpecialistWarningTrendFamilyDelta[];
  recentHistory: Array<{
    dateLabel: string;
    generatedAt: string;
    averageProgressPercent: number;
    fixtureWarningRouteCount: number;
    exportImportWarningRouteCount: number;
  }>;
}

export function buildFutureNativeSpecialistWarningTrendSnapshot(
  artifact: FutureNativeSpecialistReleaseHandoffArtifact = buildFutureNativeSpecialistReleaseHandoffArtifact(),
  dateLabel = FUTURE_NATIVE_SPECIALIST_HANDOFF_DATE_LABEL,
): FutureNativeSpecialistWarningTrendSnapshot {
  return {
    dateLabel,
    generatedAt: artifact.generatedAt,
    specialistFamilyCount: artifact.summary.specialistFamilyCount,
    routeCount: artifact.routes.length,
    averageProgressPercent: artifact.summary.averageProgressPercent,
    baselineWarningRouteCount: artifact.summary.baselineWarningRouteCount,
    fixtureChangedRouteCount: artifact.summary.fixtureChangedRouteCount,
    fixtureWarningRouteCount: artifact.summary.fixtureWarningRouteCount,
    exportImportWarningRouteCount: artifact.summary.exportImportWarningRouteCount,
    manifestRoundtripStableCount: artifact.summary.manifestRoundtripStableCount,
    serializationRoundtripStableCount: artifact.summary.serializationRoundtripStableCount,
    controlRoundtripStableCount: artifact.summary.controlRoundtripStableCount,
    familyProgress: artifact.families.map((family) => ({
      familyId: family.familyId,
      progressPercent: family.progressPercent,
      nextTargetCount: family.nextTargets.length,
    })),
  };
}

function compareMetric(current: number, previous: number | undefined, preferHigher: boolean): 'stable' | 'improved' | 'regressed' {
  if (previous === undefined || current === previous) return 'stable';
  if (preferHigher) return current > previous ? 'improved' : 'regressed';
  return current < previous ? 'improved' : 'regressed';
}

function normalizeFutureNativeSpecialistWarningTrendSnapshot(
  snapshot: FutureNativeSpecialistWarningTrendSnapshot,
): FutureNativeSpecialistWarningTrendSnapshot {
  return {
    ...snapshot,
    familyProgress: snapshot.familyProgress ?? [],
  };
}

function buildFamilyDeltas(
  current: FutureNativeSpecialistWarningTrendSnapshot,
  previous: FutureNativeSpecialistWarningTrendSnapshot | null,
): FutureNativeSpecialistWarningTrendFamilyDelta[] {
  const previousById = new Map((previous?.familyProgress ?? []).map((family) => [family.familyId, family]));
  return current.familyProgress
    .map((family) => {
      const previousFamily = previousById.get(family.familyId);
      return {
        familyId: family.familyId,
        currentProgressPercent: family.progressPercent,
        previousProgressPercent: previousFamily?.progressPercent ?? null,
        deltaProgressPercent: family.progressPercent - (previousFamily?.progressPercent ?? family.progressPercent),
        currentNextTargetCount: family.nextTargetCount,
        previousNextTargetCount: previousFamily?.nextTargetCount ?? null,
        deltaNextTargetCount: family.nextTargetCount - (previousFamily?.nextTargetCount ?? family.nextTargetCount),
      };
    })
    .sort((left, right) => Math.abs(right.deltaProgressPercent) - Math.abs(left.deltaProgressPercent) || left.familyId.localeCompare(right.familyId));
}

export function buildFutureNativeSpecialistWarningTrendComparisonArtifact(
  history: FutureNativeSpecialistWarningTrendSnapshot[],
): FutureNativeSpecialistWarningTrendComparisonArtifact {
  const normalizedHistory = [...history]
    .map((snapshot) => normalizeFutureNativeSpecialistWarningTrendSnapshot(snapshot))
    .sort((left, right) => left.generatedAt.localeCompare(right.generatedAt) || left.dateLabel.localeCompare(right.dateLabel));
  if (normalizedHistory.length === 0) {
    normalizedHistory.push(buildFutureNativeSpecialistWarningTrendSnapshot());
  }
  const current = normalizedHistory[normalizedHistory.length - 1];
  const previous = normalizedHistory.length >= 2 ? normalizedHistory[normalizedHistory.length - 2] : null;
  const deltas = {
    specialistFamilyCount: current.specialistFamilyCount - (previous?.specialistFamilyCount ?? current.specialistFamilyCount),
    routeCount: current.routeCount - (previous?.routeCount ?? current.routeCount),
    averageProgressPercent: current.averageProgressPercent - (previous?.averageProgressPercent ?? current.averageProgressPercent),
    baselineWarningRouteCount: current.baselineWarningRouteCount - (previous?.baselineWarningRouteCount ?? current.baselineWarningRouteCount),
    fixtureChangedRouteCount: current.fixtureChangedRouteCount - (previous?.fixtureChangedRouteCount ?? current.fixtureChangedRouteCount),
    fixtureWarningRouteCount: current.fixtureWarningRouteCount - (previous?.fixtureWarningRouteCount ?? current.fixtureWarningRouteCount),
    exportImportWarningRouteCount:
      current.exportImportWarningRouteCount - (previous?.exportImportWarningRouteCount ?? current.exportImportWarningRouteCount),
    manifestRoundtripStableCount:
      current.manifestRoundtripStableCount - (previous?.manifestRoundtripStableCount ?? current.manifestRoundtripStableCount),
    serializationRoundtripStableCount:
      current.serializationRoundtripStableCount -
      (previous?.serializationRoundtripStableCount ?? current.serializationRoundtripStableCount),
    controlRoundtripStableCount:
      current.controlRoundtripStableCount - (previous?.controlRoundtripStableCount ?? current.controlRoundtripStableCount),
  };
  const metricDefinitions: Array<[string, number, number | undefined, boolean]> = [
    ['specialistFamilyCount', current.specialistFamilyCount, previous?.specialistFamilyCount, true],
    ['routeCount', current.routeCount, previous?.routeCount, true],
    ['averageProgressPercent', current.averageProgressPercent, previous?.averageProgressPercent, true],
    ['baselineWarningRouteCount', current.baselineWarningRouteCount, previous?.baselineWarningRouteCount, false],
    ['fixtureChangedRouteCount', current.fixtureChangedRouteCount, previous?.fixtureChangedRouteCount, true],
    ['fixtureWarningRouteCount', current.fixtureWarningRouteCount, previous?.fixtureWarningRouteCount, false],
    ['exportImportWarningRouteCount', current.exportImportWarningRouteCount, previous?.exportImportWarningRouteCount, false],
    ['manifestRoundtripStableCount', current.manifestRoundtripStableCount, previous?.manifestRoundtripStableCount, true],
    ['serializationRoundtripStableCount', current.serializationRoundtripStableCount, previous?.serializationRoundtripStableCount, true],
    ['controlRoundtripStableCount', current.controlRoundtripStableCount, previous?.controlRoundtripStableCount, true],
  ];
  const stableMetrics: string[] = [];
  const improvedMetrics: string[] = [];
  const regressedMetrics: string[] = [];
  for (const [name, currentValue, previousValue, preferHigher] of metricDefinitions) {
    const status = compareMetric(currentValue, previousValue, preferHigher);
    if (status === 'stable') stableMetrics.push(name);
    else if (status === 'improved') improvedMetrics.push(name);
    else regressedMetrics.push(name);
  }
  return {
    generatedAt: new Date().toISOString(),
    historyDepth: normalizedHistory.length,
    current,
    previous,
    deltas,
    stableMetrics,
    improvedMetrics,
    regressedMetrics,
    familyDeltas: buildFamilyDeltas(current, previous),
    recentHistory: normalizedHistory.slice(-5).map((snapshot) => ({
      dateLabel: snapshot.dateLabel,
      generatedAt: snapshot.generatedAt,
      averageProgressPercent: snapshot.averageProgressPercent,
      fixtureWarningRouteCount: snapshot.fixtureWarningRouteCount,
      exportImportWarningRouteCount: snapshot.exportImportWarningRouteCount,
    })),
  };
}

export function renderFutureNativeSpecialistWarningTrendComparisonMarkdown(
  artifact: FutureNativeSpecialistWarningTrendComparisonArtifact,
): string {
  const lines = [
    `# FUTURE_NATIVE_SPECIALIST_ROUTE_WARNING_TREND_${artifact.current.dateLabel}`,
    '',
    `- generatedAt: ${artifact.generatedAt}`,
    `- historyDepth: ${artifact.historyDepth}`,
    `- currentCheckpoint: ${artifact.current.dateLabel} @ ${artifact.current.generatedAt}`,
    `- previousCheckpoint: ${artifact.previous ? `${artifact.previous.dateLabel} @ ${artifact.previous.generatedAt}` : 'none'}`,
    '',
    '## Current snapshot',
    `- specialistFamilyCount: ${artifact.current.specialistFamilyCount}`,
    `- routeCount: ${artifact.current.routeCount}`,
    `- averageProgressPercent: ${artifact.current.averageProgressPercent.toFixed(2)}`,
    `- baselineWarningRouteCount: ${artifact.current.baselineWarningRouteCount}`,
    `- fixtureChangedRouteCount: ${artifact.current.fixtureChangedRouteCount}`,
    `- fixtureWarningRouteCount: ${artifact.current.fixtureWarningRouteCount}`,
    `- exportImportWarningRouteCount: ${artifact.current.exportImportWarningRouteCount}`,
    `- manifestRoundtripStableCount: ${artifact.current.manifestRoundtripStableCount}`,
    `- serializationRoundtripStableCount: ${artifact.current.serializationRoundtripStableCount}`,
    `- controlRoundtripStableCount: ${artifact.current.controlRoundtripStableCount}`,
    '',
    '## Delta vs previous checkpoint',
    `- specialistFamilyCount: ${artifact.deltas.specialistFamilyCount}`,
    `- routeCount: ${artifact.deltas.routeCount}`,
    `- averageProgressPercent: ${artifact.deltas.averageProgressPercent.toFixed(2)}`,
    `- baselineWarningRouteCount: ${artifact.deltas.baselineWarningRouteCount}`,
    `- fixtureChangedRouteCount: ${artifact.deltas.fixtureChangedRouteCount}`,
    `- fixtureWarningRouteCount: ${artifact.deltas.fixtureWarningRouteCount}`,
    `- exportImportWarningRouteCount: ${artifact.deltas.exportImportWarningRouteCount}`,
    `- manifestRoundtripStableCount: ${artifact.deltas.manifestRoundtripStableCount}`,
    `- serializationRoundtripStableCount: ${artifact.deltas.serializationRoundtripStableCount}`,
    `- controlRoundtripStableCount: ${artifact.deltas.controlRoundtripStableCount}`,
    '',
    '## Metric status',
    `- improvedMetrics: ${artifact.improvedMetrics.join(', ') || 'none'}`,
    `- regressedMetrics: ${artifact.regressedMetrics.join(', ') || 'none'}`,
    `- stableMetrics: ${artifact.stableMetrics.join(', ') || 'none'}`,
    '',
    '## Family delta detail',
  ];
  for (const family of artifact.familyDeltas) {
    lines.push(
      `- ${family.familyId}: progress=${family.currentProgressPercent}% previous=${family.previousProgressPercent ?? 'none'} delta=${family.deltaProgressPercent.toFixed(2)} nextTargets=${family.currentNextTargetCount} deltaNextTargets=${family.deltaNextTargetCount}`,
    );
  }
  lines.push('', '## Recent history');
  for (const entry of artifact.recentHistory) {
    lines.push(
      `- ${entry.dateLabel} @ ${entry.generatedAt}: averageProgressPercent=${entry.averageProgressPercent.toFixed(2)} fixtureWarningRouteCount=${entry.fixtureWarningRouteCount} exportImportWarningRouteCount=${entry.exportImportWarningRouteCount}`,
    );
  }
  return lines.join('\n');
}
