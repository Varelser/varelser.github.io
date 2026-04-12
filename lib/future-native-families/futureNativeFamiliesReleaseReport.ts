import { futureNativeFamilySpecs } from './futureNativeFamiliesRegistry';
import { listFutureNativeFamiliesByProgress, summarizeFutureNativeFamilyProgress } from './futureNativeFamiliesProgress';
import { buildFutureNativeSpecialistReleaseHandoffArtifact } from './futureNativeFamiliesSpecialistReleaseHandoff';
import { buildFutureNativeNonVolumetricRouteTrendGroups } from './futureNativeNonVolumetricRouteGroupTrend';
import { buildFutureNativeVolumetricRouteTrendSummary } from './futureNativeVolumetricRouteTrend';

export const FUTURE_NATIVE_RELEASE_REPORT_DATE_LABEL = '2026-04-05';

export interface FutureNativeReleaseReportArtifact {
  generatedAt: string;
  dateLabel: string;
  summary: ReturnType<typeof summarizeFutureNativeFamilyProgress> & {
    projectIntegratedFamilies: number;
    averageNextTargetsPerFamily: number;
  };
  stageCounts: Record<string, number>;
  groupSummaries: Array<{
    group: string;
    familyCount: number;
    projectIntegratedFamilies: number;
    averageProgressPercent: number;
    minProgressFamilyId: string;
    minProgressPercent: number;
    maxProgressFamilyId: string;
    maxProgressPercent: number;
  }>;
  lowestProgressFamilies: Array<{
    id: string;
    title: string;
    group: string;
    progressPercent: number;
    currentStage: string;
    nextTargets: string[];
  }>;
  highestProgressFamilies: Array<{
    id: string;
    title: string;
    group: string;
    progressPercent: number;
    currentStage: string;
  }>;
  nonVolumetricGroupRouteSummaries: Array<{
    group: 'mpm' | 'fracture';
    familyCount: number;
    averageProgressPercent: number;
    totalRouteCount: number;
    totalPresetCount: number;
    totalNextTargetCount: number;
    lowBandFamilies: Array<{
      familyId: string;
      title: string;
      progressPercent: number;
      nextTargetCount: number;
      routeCount: number;
      presetCount: number;
      bindingModes: string[];
      deltaLines: string[];
      primaryPresetIds: string[];
      helperArtifacts: string[];
      bundleArtifacts: string[];
      coverageLabel: string | null;
    }>;
  }>;
  volumetricRouteSummary: {
    group: 'volumetric';
    familyCount: number;
    averageProgressPercent: number;
    totalRouteCount: number;
    totalPresetCount: number;
    totalNextTargetCount: number;
    lowBandFamilies: Array<{
      familyId: string;
      title: string;
      progressPercent: number;
      nextTargetCount: number;
      routeCount: number;
      presetCount: number;
      bindingModes: string[];
      deltaLines: string[];
      primaryPresetIds: string[];
      authoringDescription: string;
      helperArtifacts: string[];
      bundleArtifacts: string[];
      coverageLabel: string | null;
    }>;
  };
  specialistSummary: {
    familyCount: number;
    averageProgressPercent: number;
    fixtureWarningRouteCount: number;
    exportImportWarningRouteCount: number;
    controlRoundtripStableCount: number;
  };
  checklist: string[];
}

export function buildFutureNativeReleaseReportArtifact(args: { specialistArtifact?: ReturnType<typeof buildFutureNativeSpecialistReleaseHandoffArtifact> } = {}): FutureNativeReleaseReportArtifact {
  const { specialistArtifact = buildFutureNativeSpecialistReleaseHandoffArtifact() } = args;
  const summary = summarizeFutureNativeFamilyProgress();
  const progressEntries = listFutureNativeFamiliesByProgress();
  const specById = new Map(futureNativeFamilySpecs.map((family) => [family.id, family]));
  const stageCounts: Record<string, number> = {};
  const nonVolumetricGroupRouteSummaries = buildFutureNativeNonVolumetricRouteTrendGroups();
  const volumetricRouteSummary = buildFutureNativeVolumetricRouteTrendSummary();
  const groupAccumulator = new Map<
    string,
    {
      familyCount: number;
      projectIntegratedFamilies: number;
      totalProgress: number;
      minProgressFamilyId: string;
      minProgressPercent: number;
      maxProgressFamilyId: string;
      maxProgressPercent: number;
    }
  >();
  let projectIntegratedFamilies = 0;
  let nextTargetCount = 0;

  for (const entry of progressEntries) {
    stageCounts[entry.currentStage] = (stageCounts[entry.currentStage] ?? 0) + 1;
    if (entry.currentStage === 'project-integrated') {
      projectIntegratedFamilies += 1;
    }
    nextTargetCount += entry.nextTargets.length;
    const group = specById.get(entry.id)?.group ?? 'unknown';
    const state = groupAccumulator.get(group) ?? {
      familyCount: 0,
      projectIntegratedFamilies: 0,
      totalProgress: 0,
      minProgressFamilyId: entry.id,
      minProgressPercent: entry.progressPercent,
      maxProgressFamilyId: entry.id,
      maxProgressPercent: entry.progressPercent,
    };
    state.familyCount += 1;
    state.totalProgress += entry.progressPercent;
    if (entry.currentStage === 'project-integrated') {
      state.projectIntegratedFamilies += 1;
    }
    if (entry.progressPercent < state.minProgressPercent) {
      state.minProgressPercent = entry.progressPercent;
      state.minProgressFamilyId = entry.id;
    }
    if (entry.progressPercent > state.maxProgressPercent) {
      state.maxProgressPercent = entry.progressPercent;
      state.maxProgressFamilyId = entry.id;
    }
    groupAccumulator.set(group, state);
  }

  const ascendingProgressEntries = [...progressEntries].sort(
    (left, right) => left.progressPercent - right.progressPercent || left.id.localeCompare(right.id),
  );

  return {
    generatedAt: new Date().toISOString(),
    dateLabel: FUTURE_NATIVE_RELEASE_REPORT_DATE_LABEL,
    summary: {
      ...summary,
      projectIntegratedFamilies,
      averageNextTargetsPerFamily: nextTargetCount / Math.max(1, progressEntries.length),
    },
    stageCounts,
    groupSummaries: [...groupAccumulator.entries()]
      .map(([group, value]) => ({
        group,
        familyCount: value.familyCount,
        projectIntegratedFamilies: value.projectIntegratedFamilies,
        averageProgressPercent: value.totalProgress / Math.max(1, value.familyCount),
        minProgressFamilyId: value.minProgressFamilyId,
        minProgressPercent: value.minProgressPercent,
        maxProgressFamilyId: value.maxProgressFamilyId,
        maxProgressPercent: value.maxProgressPercent,
      }))
      .sort((left, right) => left.group.localeCompare(right.group)),
    lowestProgressFamilies: ascendingProgressEntries.slice(0, 6).map((entry) => ({
      id: entry.id,
      title: specById.get(entry.id)?.title ?? entry.id,
      group: specById.get(entry.id)?.group ?? 'unknown',
      progressPercent: entry.progressPercent,
      currentStage: entry.currentStage,
      nextTargets: [...entry.nextTargets],
    })),
    highestProgressFamilies: progressEntries.slice(0, 6).map((entry) => ({
      id: entry.id,
      title: specById.get(entry.id)?.title ?? entry.id,
      group: specById.get(entry.id)?.group ?? 'unknown',
      progressPercent: entry.progressPercent,
      currentStage: entry.currentStage,
    })),
    nonVolumetricGroupRouteSummaries,
    volumetricRouteSummary,
    specialistSummary: {
      familyCount: specialistArtifact.summary.specialistFamilyCount,
      averageProgressPercent: specialistArtifact.summary.averageProgressPercent,
      fixtureWarningRouteCount: specialistArtifact.summary.fixtureWarningRouteCount,
      exportImportWarningRouteCount: specialistArtifact.summary.exportImportWarningRouteCount,
      controlRoundtripStableCount: specialistArtifact.summary.controlRoundtripStableCount,
    },
    checklist: [
      'npm run typecheck',
      'npm run inspect:project-health',
      'npm run verify:future-native-safe-pipeline',
      'npm run emit:future-native-report',
      'npm run emit:future-native-specialist-handoff',
    ],
  };
}

export function renderFutureNativeReleaseReportMarkdown(
  artifact = buildFutureNativeReleaseReportArtifact(),
): string {
  const lines: string[] = [
    '# FUTURE_NATIVE_RELEASE_REPORT',
    '',
    `- generatedAt: ${artifact.generatedAt}`,
    `- dateLabel: ${artifact.dateLabel}`,
    '',
    '## 全体進捗',
    `- totalFamilies: **${artifact.summary.totalFamilies}**`,
    `- projectIntegratedFamilies: **${artifact.summary.projectIntegratedFamilies} / ${artifact.summary.totalFamilies}**`,
    `- nativeStarterFamilies: **${artifact.summary.nativeStarterFamilies} / ${artifact.summary.totalFamilies}**`,
    `- verificationReadyFamilies: **${artifact.summary.verificationReadyFamilies} / ${artifact.summary.totalFamilies}**`,
    `- averageProgressPercent: **${artifact.summary.averageProgressPercent.toFixed(2)}%**`,
    `- firstWaveAverage: **${artifact.summary.firstWaveAverage.toFixed(2)}%**`,
    `- averageNextTargetsPerFamily: **${artifact.summary.averageNextTargetsPerFamily.toFixed(2)}**`,
    '',
    '## stage counts',
  ];

  for (const [stage, count] of Object.entries(artifact.stageCounts).sort((left, right) => left[0].localeCompare(right[0]))) {
    lines.push(`- ${stage}: **${count}**`);
  }

  lines.push('', '## group summaries');
  for (const group of artifact.groupSummaries) {
    lines.push(`### ${group.group}`);
    lines.push(`- familyCount: **${group.familyCount}**`);
    lines.push(`- projectIntegratedFamilies: **${group.projectIntegratedFamilies} / ${group.familyCount}**`);
    lines.push(`- averageProgressPercent: **${group.averageProgressPercent.toFixed(2)}%**`);
    lines.push(`- lowest: **${group.minProgressFamilyId} (${group.minProgressPercent}%)**`);
    lines.push(`- highest: **${group.maxProgressFamilyId} (${group.maxProgressPercent}%)**`);
    lines.push('');
  }

  lines.push('## 進捗が低い family');
  for (const family of artifact.lowestProgressFamilies) {
    lines.push(`### ${family.title} (${family.id})`);
    lines.push(`- group: **${family.group}**`);
    lines.push(`- progressPercent: **${family.progressPercent}%**`);
    lines.push(`- currentStage: **${family.currentStage}**`);
    lines.push(`- nextTargets: ${family.nextTargets.join(' / ')}`);
    lines.push('');
  }

  lines.push('## fracture / mpm route trend summaries');
  for (const summary of artifact.nonVolumetricGroupRouteSummaries) {
    lines.push(`### ${summary.group}`);
    lines.push(`- familyCount: **${summary.familyCount}**`);
    lines.push(`- averageProgressPercent: **${summary.averageProgressPercent.toFixed(2)}%**`);
    lines.push(`- totalRouteCount: **${summary.totalRouteCount}**`);
    lines.push(`- totalPresetCount: **${summary.totalPresetCount}**`);
    lines.push(`- totalNextTargetCount: **${summary.totalNextTargetCount}**`);
    for (const family of summary.lowBandFamilies) {
      lines.push(`- ${family.familyId}: progress=${family.progressPercent}% nextTargets=${family.nextTargetCount} routes=${family.routeCount} presets=${family.presetCount} binding=${family.bindingModes.join('/')} delta=${family.deltaLines.join(', ')} primary=${family.primaryPresetIds.join(', ')} helper=${family.helperArtifacts.join('+') || '-'} bundle=${family.bundleArtifacts.join('+') || '-'} coverage=${family.coverageLabel ?? '-'}`);
    }
    lines.push('');
  }

  lines.push('## volumetric route trend summary');
  lines.push(`- familyCount: **${artifact.volumetricRouteSummary.familyCount}**`);
  lines.push(`- averageProgressPercent: **${artifact.volumetricRouteSummary.averageProgressPercent.toFixed(2)}%**`);
  lines.push(`- totalRouteCount: **${artifact.volumetricRouteSummary.totalRouteCount}**`);
  lines.push(`- totalPresetCount: **${artifact.volumetricRouteSummary.totalPresetCount}**`);
  lines.push(`- totalNextTargetCount: **${artifact.volumetricRouteSummary.totalNextTargetCount}**`);
  for (const family of artifact.volumetricRouteSummary.lowBandFamilies) {
    lines.push(`- ${family.familyId}: progress=${family.progressPercent}% nextTargets=${family.nextTargetCount} routes=${family.routeCount} presets=${family.presetCount} binding=${family.bindingModes.join('/')} delta=${family.deltaLines.join(', ')} primary=${family.primaryPresetIds.join(', ')} helper=${family.helperArtifacts.join('+') || '-'} bundle=${family.bundleArtifacts.join('+') || '-'} coverage=${family.coverageLabel ?? '-'} authoring=${family.authoringDescription}`);
  }
  lines.push('');

  lines.push('## 進捗が高い family');
  for (const family of artifact.highestProgressFamilies) {
    lines.push(`### ${family.title} (${family.id})`);
    lines.push(`- group: **${family.group}**`);
    lines.push(`- progressPercent: **${family.progressPercent}%**`);
    lines.push(`- currentStage: **${family.currentStage}**`);
    lines.push('');
  }

  lines.push(
    '## specialist route 併記',
    `- specialistFamilyCount: **${artifact.specialistSummary.familyCount}**`,
    `- specialistAverageProgressPercent: **${artifact.specialistSummary.averageProgressPercent.toFixed(2)}%**`,
    `- specialistFixtureWarningRouteCount: **${artifact.specialistSummary.fixtureWarningRouteCount}**`,
    `- specialistExportImportWarningRouteCount: **${artifact.specialistSummary.exportImportWarningRouteCount}**`,
    `- specialistControlRoundtripStableCount: **${artifact.specialistSummary.controlRoundtripStableCount}**`,
    '',
    '## release 手順',
  );
  artifact.checklist.forEach((step, index) => lines.push(`${index + 1}. \`${step}\``));
  lines.push(
    '',
    '## 参照先',
    '1. `CURRENT_STATUS.md`',
    '2. `docs/handoff/FUTURE_NATIVE_RELEASE_REPORT.md`',
    '3. `docs/handoff/SESSION_CHECKPOINT_2026-04-05.md`',
    '4. `docs/handoff/FUTURE_NATIVE_RELEASE_CHECKLIST.md`',
    '5. `docs/handoff/archive/INDEX.md`',
  );
  return lines.join('\n');
}
