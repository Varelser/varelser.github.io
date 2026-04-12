import { getFutureNativeFamilyProgress, summarizeFutureNativeFamilyProgress } from './futureNativeFamiliesProgress';
import {
  buildFutureNativeSpecialistRouteCompactArtifact,
  renderFutureNativeSpecialistRouteCompactArtifactMarkdown,
} from './futureNativeFamiliesSpecialistCompactArtifact';
import { buildFutureNativeSpecialistRouteExportImportComparison } from './futureNativeFamiliesSpecialistRouteComparison';

const SPECIALIST_RELEASE_HANDOFF_DATE_LABEL = '2026-04-05';

const SPECIALIST_FAMILY_IDS = [
  'specialist-houdini-native',
  'specialist-niagara-native',
  'specialist-touchdesigner-native',
  'specialist-unity-vfx-native',
] as const;

export interface FutureNativeSpecialistReleaseHandoffArtifact {
  generatedAt: string;
  overallSummary: ReturnType<typeof summarizeFutureNativeFamilyProgress> & {
    projectIntegratedFamilies: number;
  };
  summary: {
    specialistFamilyCount: number;
    averageProgressPercent: number;
    baselineWarningRouteCount: number;
    fixtureChangedRouteCount: number;
    fixtureWarningRouteCount: number;
    exportImportWarningRouteCount: number;
    manifestRoundtripStableCount: number;
    serializationRoundtripStableCount: number;
    controlRoundtripStableCount: number;
  };
  families: Array<{
    familyId: (typeof SPECIALIST_FAMILY_IDS)[number];
    progressPercent: number;
    currentStage: string;
    nextTargets: string[];
    notes: string[];
  }>;
  routes: Array<{
    familyId: string;
    routeLabel: string;
    changedSections: string[];
    warningValues: string[];
    manifestRoundtripStable: boolean;
    serializationRoundtripStable: boolean;
    controlRoundtripStable: boolean;
  }>;
}

export function buildFutureNativeSpecialistReleaseHandoffArtifact(options?: {
  comparison?: ReturnType<typeof buildFutureNativeSpecialistRouteExportImportComparison>;
  compactArtifact?: ReturnType<typeof buildFutureNativeSpecialistRouteCompactArtifact>;
}): FutureNativeSpecialistReleaseHandoffArtifact {
  const comparison = options?.comparison ?? buildFutureNativeSpecialistRouteExportImportComparison();
  const compactArtifact = options?.compactArtifact ?? buildFutureNativeSpecialistRouteCompactArtifact(comparison);
  const overallSummary = summarizeFutureNativeFamilyProgress();
  const families = SPECIALIST_FAMILY_IDS.map((familyId) => {
    const progress = getFutureNativeFamilyProgress(familyId);
    return {
      familyId,
      progressPercent: progress.progressPercent,
      currentStage: progress.currentStage,
      nextTargets: [...progress.nextTargets],
      notes: [...progress.notes],
    };
  });
  const averageProgressPercent = families.reduce((sum, family) => sum + family.progressPercent, 0) / families.length;
  return {
    generatedAt: new Date().toISOString(),
    overallSummary: {
      ...overallSummary,
      projectIntegratedFamilies: overallSummary.verificationReadyFamilies,
    },
    summary: {
      specialistFamilyCount: families.length,
      averageProgressPercent,
      baselineWarningRouteCount: compactArtifact.summary.baselineWarningRouteCount,
      fixtureChangedRouteCount: compactArtifact.summary.fixtureChangedRouteCount,
      fixtureWarningRouteCount: compactArtifact.summary.fixtureWarningRouteCount,
      exportImportWarningRouteCount: compactArtifact.summary.exportImportWarningRouteCount,
      manifestRoundtripStableCount: compactArtifact.summary.manifestRoundtripStableCount,
      serializationRoundtripStableCount: compactArtifact.summary.serializationRoundtripStableCount,
      controlRoundtripStableCount: compactArtifact.summary.controlRoundtripStableCount,
    },
    families,
    routes: comparison.routes.map((route) => ({
      familyId: route.familyId,
      routeLabel: route.routeLabel,
      changedSections: [...route.changedSections],
      warningValues: [...route.warningValues],
      manifestRoundtripStable: route.manifestRoundtripStable,
      serializationRoundtripStable: route.serializationRoundtripStable,
      controlRoundtripStable: route.controlRoundtripStable,
    })),
  };
}

export function renderFutureNativeSpecialistReleaseHandoffMarkdown(
  artifact = buildFutureNativeSpecialistReleaseHandoffArtifact(),
  compactArtifact?: ReturnType<typeof buildFutureNativeSpecialistRouteCompactArtifact>,
): string {
  const compactMarkdown = renderFutureNativeSpecialistRouteCompactArtifactMarkdown(compactArtifact);
  const lines = [
    `# SESSION_CHECKPOINT_${SPECIALIST_RELEASE_HANDOFF_DATE_LABEL}`,
    '',
    '## この時点で完了していること',
    '- specialist 4 family の route comparison は compact artifact / handoff / archive summary まで接続済み。',
    '- specialist route comparison の warning trend は session checkpoint と archive summary へ自動反映される。',
    '- specialist route comparison は dedicated runtime/export regression verifier からも再検証できる。',
    '- future-native safe pipeline と release checklist から specialist regression を辿れる。',
    '- archive index と warning trend comparison から生成物の参照先を固定した。',
    '- session checkpoint 自体に future-native 全体進捗を埋め込み、局所進捗だけで止まらないようにした。',
    '',
    '## 全体進捗',
    `- totalFamilies: **${artifact.overallSummary.totalFamilies}**`,
    `- projectIntegratedFamilies: **${artifact.overallSummary.projectIntegratedFamilies} / ${artifact.overallSummary.totalFamilies}**`,
    `- nativeStarterFamilies: **${artifact.overallSummary.nativeStarterFamilies} / ${artifact.overallSummary.totalFamilies}**`,
    `- verificationReadyFamilies: **${artifact.overallSummary.verificationReadyFamilies} / ${artifact.overallSummary.totalFamilies}**`,
    `- averageProgressPercent: **${artifact.overallSummary.averageProgressPercent.toFixed(2)}%**`,
    `- firstWaveAverage: **${artifact.overallSummary.firstWaveAverage.toFixed(2)}%**`,
    '',
    '## specialist 指標',
    `- specialistFamilyCount: **${artifact.summary.specialistFamilyCount}**`,
    `- averageProgressPercent: **${artifact.summary.averageProgressPercent.toFixed(2)}%**`,
    `- baselineWarningRouteCount: **${artifact.summary.baselineWarningRouteCount}**`,
    `- fixtureChangedRouteCount: **${artifact.summary.fixtureChangedRouteCount}**`,
    `- fixtureWarningRouteCount: **${artifact.summary.fixtureWarningRouteCount}**`,
    `- exportImportWarningRouteCount: **${artifact.summary.exportImportWarningRouteCount}**`,
    `- manifestRoundtripStableCount: **${artifact.summary.manifestRoundtripStableCount}**`,
    `- serializationRoundtripStableCount: **${artifact.summary.serializationRoundtripStableCount}**`,
    `- controlRoundtripStableCount: **${artifact.summary.controlRoundtripStableCount}**`,
    '',
    '## specialist family 状態',
    '',
  ];
  for (const family of artifact.families) {
    lines.push(`### ${family.familyId}`);
    lines.push(`- progressPercent: **${family.progressPercent}%**`);
    lines.push(`- currentStage: **${family.currentStage}**`);
    lines.push(`- nextTargets: ${family.nextTargets.join(' / ')}`);
    lines.push(`- notes: ${family.notes.join(' ')}`);
    lines.push('');
  }
  lines.push('## compact artifact 埋め込み', '');
  lines.push(...compactMarkdown.split('\n'));
  lines.push(
    '',
    '## source-only 復旧メモ',
    '- 非同梱: `node_modules/`, `dist/`, `tmp/`, `.tmp-*`',
    '- 最短順: `npm run bootstrap` → `npm run doctor:tooling` → `npm run typecheck` → `npm run inspect:project-health` → `npm run verify:future-native-safe-pipeline` → `npm run verify:future-native-project-snapshots` → `npm run emit:future-native-report` → `npm run emit:future-native-specialist-handoff`',
    '',
    '## 次回の再開順',
    '1. `CURRENT_STATUS.md`',
    '2. `docs/handoff/FUTURE_NATIVE_RELEASE_REPORT.md`',
    `3. \`docs/handoff/SESSION_CHECKPOINT_${SPECIALIST_RELEASE_HANDOFF_DATE_LABEL}.md\``,
    '4. `docs/handoff/FUTURE_NATIVE_RELEASE_CHECKLIST.md`',
    '5. `docs/handoff/archive/INDEX.md`',
    `6. \`docs/handoff/archive/FUTURE_NATIVE_SPECIALIST_ROUTE_WARNING_TREND_${SPECIALIST_RELEASE_HANDOFF_DATE_LABEL}.md\``,
  );
  return lines.join('\n');
}

export function renderFutureNativeSpecialistWarningArchiveMarkdown(
  artifact = buildFutureNativeSpecialistReleaseHandoffArtifact(),
): string {
  const lines = [
    `# FUTURE_NATIVE_SPECIALIST_ROUTE_WARNING_SUMMARY_${SPECIALIST_RELEASE_HANDOFF_DATE_LABEL}`,
    '',
    `- generatedAt: ${artifact.generatedAt}`,
    `- totalFamilies: ${artifact.overallSummary.totalFamilies}`,
    `- overallAverageProgressPercent: ${artifact.overallSummary.averageProgressPercent.toFixed(2)}`,
    `- specialistFamilyCount: ${artifact.summary.specialistFamilyCount}`,
    `- fixtureWarningRouteCount: ${artifact.summary.fixtureWarningRouteCount}`,
    `- exportImportWarningRouteCount: ${artifact.summary.exportImportWarningRouteCount}`,
    `- manifestRoundtripStableCount: ${artifact.summary.manifestRoundtripStableCount}`,
    `- serializationRoundtripStableCount: ${artifact.summary.serializationRoundtripStableCount}`,
    `- controlRoundtripStableCount: ${artifact.summary.controlRoundtripStableCount}`,
    '',
    '## Routes',
    '',
  ];
  for (const route of artifact.routes) {
    lines.push(`### ${route.routeLabel} (${route.familyId})`);
    lines.push(`- changedSections: ${route.changedSections.join(', ') || 'none'}`);
    lines.push(`- warningValues: ${route.warningValues.join(', ') || 'none'}`);
    lines.push(`- manifestRoundtripStable: ${route.manifestRoundtripStable}`);
    lines.push(`- serializationRoundtripStable: ${route.serializationRoundtripStable}`);
    lines.push(`- controlRoundtripStable: ${route.controlRoundtripStable}`);
    lines.push('');
  }
  return lines.join('\n');
}
