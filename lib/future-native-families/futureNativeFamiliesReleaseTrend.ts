import {
  FUTURE_NATIVE_RELEASE_REPORT_DATE_LABEL,
  buildFutureNativeReleaseReportArtifact,
  type FutureNativeReleaseReportArtifact,
} from './futureNativeFamiliesReleaseReport';

export { FUTURE_NATIVE_RELEASE_REPORT_DATE_LABEL };

export interface FutureNativeReleaseTrendSnapshot {
  dateLabel: string;
  generatedAt: string;
  totalFamilies: number;
  projectIntegratedFamilies: number;
  averageProgressPercent: number;
  nativeStarterFamilies: number;
  verificationReadyFamilies: number;
  firstWaveAverage: number;
  averageNextTargetsPerFamily: number;
  specialistAverageProgressPercent: number;
  specialistFixtureWarningRouteCount: number;
  groupAverages: Record<string, number>;
  familyProgress: Array<{
    id: string;
    group: string;
    progressPercent: number;
    currentStage: string;
    nextTargetCount: number;
  }>;
}

export interface FutureNativeReleaseTrendGroupDelta {
  group: string;
  currentAverageProgressPercent: number;
  previousAverageProgressPercent: number | null;
  deltaAverageProgressPercent: number;
}

export interface FutureNativeReleaseTrendFamilyDelta {
  id: string;
  group: string;
  currentProgressPercent: number;
  previousProgressPercent: number | null;
  deltaProgressPercent: number;
  currentStage: string;
  previousStage: string | null;
  stageChanged: boolean;
  currentNextTargetCount: number;
  previousNextTargetCount: number | null;
  deltaNextTargetCount: number;
}

export interface FutureNativeReleaseTrendComparisonArtifact {
  generatedAt: string;
  historyDepth: number;
  current: FutureNativeReleaseTrendSnapshot;
  previous: FutureNativeReleaseTrendSnapshot | null;
  deltas: Record<string, number>;
  stableMetrics: string[];
  improvedMetrics: string[];
  regressedMetrics: string[];
  groupDeltas: FutureNativeReleaseTrendGroupDelta[];
  familyDeltas: FutureNativeReleaseTrendFamilyDelta[];
  recentHistory: Array<{
    dateLabel: string;
    generatedAt: string;
    averageProgressPercent: number;
    projectIntegratedFamilies: number;
  }>;
}

export function buildFutureNativeReleaseTrendSnapshot(
  artifact: FutureNativeReleaseReportArtifact = buildFutureNativeReleaseReportArtifact(),
  dateLabel = FUTURE_NATIVE_RELEASE_REPORT_DATE_LABEL,
): FutureNativeReleaseTrendSnapshot {
  return {
    dateLabel,
    generatedAt: artifact.generatedAt,
    totalFamilies: artifact.summary.totalFamilies,
    projectIntegratedFamilies: artifact.summary.projectIntegratedFamilies,
    averageProgressPercent: artifact.summary.averageProgressPercent,
    nativeStarterFamilies: artifact.summary.nativeStarterFamilies,
    verificationReadyFamilies: artifact.summary.verificationReadyFamilies,
    firstWaveAverage: artifact.summary.firstWaveAverage,
    averageNextTargetsPerFamily: artifact.summary.averageNextTargetsPerFamily,
    specialistAverageProgressPercent: artifact.specialistSummary.averageProgressPercent,
    specialistFixtureWarningRouteCount: artifact.specialistSummary.fixtureWarningRouteCount,
    groupAverages: Object.fromEntries(
      artifact.groupSummaries.map((group) => [group.group, Number(group.averageProgressPercent.toFixed(4))]),
    ),
    familyProgress: [
      ...artifact.lowestProgressFamilies.map((family) => ({
        id: family.id,
        group: family.group,
        progressPercent: family.progressPercent,
        currentStage: family.currentStage,
        nextTargetCount: family.nextTargets.length,
      })),
      ...artifact.highestProgressFamilies.map((family) => ({
        id: family.id,
        group: family.group,
        progressPercent: family.progressPercent,
        currentStage: family.currentStage,
        nextTargetCount: 0,
      })),
    ]
      .reduce<FutureNativeReleaseTrendSnapshot['familyProgress']>((acc, family) => {
        if (!acc.some((entry) => entry.id === family.id)) acc.push(family);
        return acc;
      }, [])
      .sort((left, right) => left.id.localeCompare(right.id)),
  };
}

function compareMetric(current: number, previous: number | undefined, preferHigher: boolean): 'stable' | 'improved' | 'regressed' {
  if (previous === undefined || current === previous) return 'stable';
  if (preferHigher) return current > previous ? 'improved' : 'regressed';
  return current < previous ? 'improved' : 'regressed';
}

function normalizeFutureNativeReleaseTrendSnapshot(snapshot: FutureNativeReleaseTrendSnapshot): FutureNativeReleaseTrendSnapshot {
  return {
    ...snapshot,
    groupAverages: snapshot.groupAverages ?? {},
    familyProgress: snapshot.familyProgress ?? [],
  };
}

function buildGroupDeltas(current: FutureNativeReleaseTrendSnapshot, previous: FutureNativeReleaseTrendSnapshot | null) {
  const allGroups = new Set([...Object.keys(current.groupAverages), ...Object.keys(previous?.groupAverages ?? {})]);
  return [...allGroups]
    .map<FutureNativeReleaseTrendGroupDelta>((group) => ({
      group,
      currentAverageProgressPercent: current.groupAverages[group] ?? 0,
      previousAverageProgressPercent: previous?.groupAverages[group] ?? null,
      deltaAverageProgressPercent:
        (current.groupAverages[group] ?? 0) - (previous?.groupAverages[group] ?? current.groupAverages[group] ?? 0),
    }))
    .sort((left, right) => right.deltaAverageProgressPercent - left.deltaAverageProgressPercent || left.group.localeCompare(right.group));
}

function buildFamilyDeltas(current: FutureNativeReleaseTrendSnapshot, previous: FutureNativeReleaseTrendSnapshot | null) {
  const previousById = new Map((previous?.familyProgress ?? []).map((family) => [family.id, family]));
  return current.familyProgress
    .map<FutureNativeReleaseTrendFamilyDelta>((family) => {
      const previousFamily = previousById.get(family.id);
      return {
        id: family.id,
        group: family.group,
        currentProgressPercent: family.progressPercent,
        previousProgressPercent: previousFamily?.progressPercent ?? null,
        deltaProgressPercent: family.progressPercent - (previousFamily?.progressPercent ?? family.progressPercent),
        currentStage: family.currentStage,
        previousStage: previousFamily?.currentStage ?? null,
        stageChanged: previousFamily !== undefined && previousFamily.currentStage !== family.currentStage,
        currentNextTargetCount: family.nextTargetCount,
        previousNextTargetCount: previousFamily?.nextTargetCount ?? null,
        deltaNextTargetCount: family.nextTargetCount - (previousFamily?.nextTargetCount ?? family.nextTargetCount),
      };
    })
    .sort((left, right) => {
      const deltaDiff = Math.abs(right.deltaProgressPercent) - Math.abs(left.deltaProgressPercent);
      if (deltaDiff !== 0) return deltaDiff;
      return left.id.localeCompare(right.id);
    });
}

export function buildFutureNativeReleaseTrendComparisonArtifact(
  history: FutureNativeReleaseTrendSnapshot[],
): FutureNativeReleaseTrendComparisonArtifact {
  const normalizedHistory = [...history]
    .map((snapshot) => normalizeFutureNativeReleaseTrendSnapshot(snapshot))
    .sort((left, right) => left.generatedAt.localeCompare(right.generatedAt) || left.dateLabel.localeCompare(right.dateLabel));
  if (normalizedHistory.length === 0) {
    normalizedHistory.push(buildFutureNativeReleaseTrendSnapshot());
  }
  const current = normalizedHistory[normalizedHistory.length - 1];
  const previous = normalizedHistory.length >= 2 ? normalizedHistory[normalizedHistory.length - 2] : null;
  const deltas: Record<string, number> = {
    totalFamilies: current.totalFamilies - (previous?.totalFamilies ?? current.totalFamilies),
    projectIntegratedFamilies: current.projectIntegratedFamilies - (previous?.projectIntegratedFamilies ?? current.projectIntegratedFamilies),
    averageProgressPercent: current.averageProgressPercent - (previous?.averageProgressPercent ?? current.averageProgressPercent),
    nativeStarterFamilies: current.nativeStarterFamilies - (previous?.nativeStarterFamilies ?? current.nativeStarterFamilies),
    verificationReadyFamilies: current.verificationReadyFamilies - (previous?.verificationReadyFamilies ?? current.verificationReadyFamilies),
    firstWaveAverage: current.firstWaveAverage - (previous?.firstWaveAverage ?? current.firstWaveAverage),
    averageNextTargetsPerFamily: current.averageNextTargetsPerFamily - (previous?.averageNextTargetsPerFamily ?? current.averageNextTargetsPerFamily),
    specialistAverageProgressPercent:
      current.specialistAverageProgressPercent -
      (previous?.specialistAverageProgressPercent ?? current.specialistAverageProgressPercent),
    specialistFixtureWarningRouteCount:
      current.specialistFixtureWarningRouteCount -
      (previous?.specialistFixtureWarningRouteCount ?? current.specialistFixtureWarningRouteCount),
  };
  const definitions: Array<[string, number, number | undefined, boolean]> = [
    ['totalFamilies', current.totalFamilies, previous?.totalFamilies, true],
    ['projectIntegratedFamilies', current.projectIntegratedFamilies, previous?.projectIntegratedFamilies, true],
    ['averageProgressPercent', current.averageProgressPercent, previous?.averageProgressPercent, true],
    ['nativeStarterFamilies', current.nativeStarterFamilies, previous?.nativeStarterFamilies, true],
    ['verificationReadyFamilies', current.verificationReadyFamilies, previous?.verificationReadyFamilies, true],
    ['firstWaveAverage', current.firstWaveAverage, previous?.firstWaveAverage, true],
    ['averageNextTargetsPerFamily', current.averageNextTargetsPerFamily, previous?.averageNextTargetsPerFamily, false],
    ['specialistAverageProgressPercent', current.specialistAverageProgressPercent, previous?.specialistAverageProgressPercent, true],
    ['specialistFixtureWarningRouteCount', current.specialistFixtureWarningRouteCount, previous?.specialistFixtureWarningRouteCount, false],
  ];
  const stableMetrics: string[] = [];
  const improvedMetrics: string[] = [];
  const regressedMetrics: string[] = [];
  for (const [name, currentValue, previousValue, preferHigher] of definitions) {
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
    groupDeltas: buildGroupDeltas(current, previous),
    familyDeltas: buildFamilyDeltas(current, previous),
    recentHistory: normalizedHistory.slice(-5).map((snapshot) => ({
      dateLabel: snapshot.dateLabel,
      generatedAt: snapshot.generatedAt,
      averageProgressPercent: snapshot.averageProgressPercent,
      projectIntegratedFamilies: snapshot.projectIntegratedFamilies,
    })),
  };
}

export function renderFutureNativeReleaseTrendComparisonMarkdown(
  artifact: FutureNativeReleaseTrendComparisonArtifact,
): string {
  const lines = [
    `# FUTURE_NATIVE_RELEASE_TREND_${artifact.current.dateLabel}`,
    '',
    `- generatedAt: ${artifact.generatedAt}`,
    `- historyDepth: ${artifact.historyDepth}`,
    `- currentCheckpoint: ${artifact.current.dateLabel} @ ${artifact.current.generatedAt}`,
    `- previousCheckpoint: ${artifact.previous ? `${artifact.previous.dateLabel} @ ${artifact.previous.generatedAt}` : 'none'}`,
    '',
    '## Current snapshot',
    `- totalFamilies: ${artifact.current.totalFamilies}`,
    `- projectIntegratedFamilies: ${artifact.current.projectIntegratedFamilies}`,
    `- averageProgressPercent: ${artifact.current.averageProgressPercent.toFixed(2)}`,
    `- nativeStarterFamilies: ${artifact.current.nativeStarterFamilies}`,
    `- verificationReadyFamilies: ${artifact.current.verificationReadyFamilies}`,
    `- firstWaveAverage: ${artifact.current.firstWaveAverage.toFixed(2)}`,
    `- averageNextTargetsPerFamily: ${artifact.current.averageNextTargetsPerFamily.toFixed(2)}`,
    `- specialistAverageProgressPercent: ${artifact.current.specialistAverageProgressPercent.toFixed(2)}`,
    `- specialistFixtureWarningRouteCount: ${artifact.current.specialistFixtureWarningRouteCount}`,
    '',
    '## Delta vs previous checkpoint',
    `- totalFamilies: ${artifact.deltas.totalFamilies}`,
    `- projectIntegratedFamilies: ${artifact.deltas.projectIntegratedFamilies}`,
    `- averageProgressPercent: ${artifact.deltas.averageProgressPercent.toFixed(2)}`,
    `- nativeStarterFamilies: ${artifact.deltas.nativeStarterFamilies}`,
    `- verificationReadyFamilies: ${artifact.deltas.verificationReadyFamilies}`,
    `- firstWaveAverage: ${artifact.deltas.firstWaveAverage.toFixed(2)}`,
    `- averageNextTargetsPerFamily: ${artifact.deltas.averageNextTargetsPerFamily.toFixed(2)}`,
    `- specialistAverageProgressPercent: ${artifact.deltas.specialistAverageProgressPercent.toFixed(2)}`,
    `- specialistFixtureWarningRouteCount: ${artifact.deltas.specialistFixtureWarningRouteCount}`,
    '',
    '## Metric status',
    `- improvedMetrics: ${artifact.improvedMetrics.join(', ') || 'none'}`,
    `- regressedMetrics: ${artifact.regressedMetrics.join(', ') || 'none'}`,
    `- stableMetrics: ${artifact.stableMetrics.join(', ') || 'none'}`,
    '',
    '## Group delta detail',
  ];
  for (const group of artifact.groupDeltas) {
    lines.push(`- ${group.group}: current=${group.currentAverageProgressPercent.toFixed(2)} previous=${group.previousAverageProgressPercent?.toFixed(2) ?? 'none'} delta=${group.deltaAverageProgressPercent.toFixed(2)}`);
  }
  lines.push('', '## Family delta detail');
  for (const family of artifact.familyDeltas.slice(0, 8)) {
    lines.push(
      `- ${family.id}: progress=${family.currentProgressPercent}% previous=${family.previousProgressPercent ?? 'none'} delta=${family.deltaProgressPercent.toFixed(2)} stage=${family.currentStage} previousStage=${family.previousStage ?? 'none'} stageChanged=${family.stageChanged} nextTargets=${family.currentNextTargetCount} deltaNextTargets=${family.deltaNextTargetCount}`,
    );
  }
  lines.push('', '## Recent history');
  for (const entry of artifact.recentHistory) {
    lines.push(
      `- ${entry.dateLabel} @ ${entry.generatedAt}: averageProgressPercent=${entry.averageProgressPercent.toFixed(2)} projectIntegratedFamilies=${entry.projectIntegratedFamilies}`,
    );
  }
  return lines.join('\n');
}
