import type { FutureNativeReleaseReportArtifact } from './futureNativeFamiliesReleaseReport';
import type { FutureNativeSpecialistReleaseHandoffArtifact } from './futureNativeFamiliesSpecialistReleaseHandoff';
import type { FutureNativeSpecialistWarningTrendComparisonArtifact } from './futureNativeFamiliesSpecialistWarningTrend';

export function renderFutureNativeSpecialistArchiveIndexMarkdown(args: {
  releaseHandoffArtifact: FutureNativeSpecialistReleaseHandoffArtifact;
  warningTrendArtifact: FutureNativeSpecialistWarningTrendComparisonArtifact;
  releaseReportArtifact: FutureNativeReleaseReportArtifact;
}): string {
  const { releaseHandoffArtifact, warningTrendArtifact, releaseReportArtifact } = args;
  return [
    '# Handoff Archive Index',
    '',
    '## Current release records',
    '- `docs/handoff/FUTURE_NATIVE_RELEASE_REPORT.md` — future-native 全体の release report。',
    '- `docs/handoff/SESSION_CHECKPOINT_2026-04-05.md` — 最新の specialist route handoff summary。',
    '- `docs/handoff/FUTURE_NATIVE_RELEASE_CHECKLIST.md` — release / integration 前の確認順。',
    '- `docs/handoff/FUTURE_NATIVE_SPECIALIST_ROUTE_COMPACT_ARTIFACT.md` — compact artifact の意味と出力先。',
    '',
    '## Archive summaries',
    '- `docs/handoff/archive/FUTURE_NATIVE_RELEASE_TREND_2026-04-05.md` — future-native 全体進捗の checkpoint trend。',
    '- `docs/handoff/archive/FUTURE_NATIVE_SPECIALIST_ROUTE_WARNING_SUMMARY_2026-04-05.md` — route warning summary。',
    '- `docs/handoff/archive/FUTURE_NATIVE_SPECIALIST_ROUTE_WARNING_TREND_2026-04-05.md` — checkpoint 間の trend comparison。',
    '',
    '## Generated artifacts',
    '- `docs/handoff/archive/generated/future-native-release-report/future-native-release-report.json`',
    '- `docs/handoff/archive/generated/future-native-release-report/future-native-release-report.md`',
    '- `docs/handoff/archive/generated/future-native-release-report/future-native-release-trend-history.json`',
    '- `docs/handoff/archive/generated/future-native-release-report/future-native-release-trend-comparison.json`',
    '- `docs/handoff/archive/generated/future-native-release-report/future-native-release-trend-comparison.md`',
    '- `docs/handoff/archive/generated/future-native-specialist-handoff/future-native-specialist-handoff.json`',
    '- `docs/handoff/archive/generated/future-native-specialist-handoff/future-native-specialist-handoff.md`',
    '- `docs/handoff/archive/generated/future-native-specialist-handoff/future-native-specialist-warning-trend-history.json`',
    '- `docs/handoff/archive/generated/future-native-specialist-handoff/future-native-specialist-warning-trend-comparison.json`',
    '- `docs/handoff/archive/generated/future-native-specialist-handoff/future-native-specialist-warning-trend-comparison.md`',
    '',
    '## Current metrics',
    `- totalFamilies: ${releaseReportArtifact.summary.totalFamilies}`,
    `- projectIntegratedFamilies: ${releaseReportArtifact.summary.projectIntegratedFamilies}`,
    `- overallAverageProgressPercent: ${releaseReportArtifact.summary.averageProgressPercent.toFixed(2)}`,
    `- specialistFamilyCount: ${releaseHandoffArtifact.summary.specialistFamilyCount}`,
    `- specialistAverageProgressPercent: ${releaseHandoffArtifact.summary.averageProgressPercent.toFixed(2)}`,
    `- fixtureWarningRouteCount: ${releaseHandoffArtifact.summary.fixtureWarningRouteCount}`,
    `- exportImportWarningRouteCount: ${releaseHandoffArtifact.summary.exportImportWarningRouteCount}`,
    `- historyDepth: ${warningTrendArtifact.historyDepth}`,
    `- currentCheckpoint: ${warningTrendArtifact.current.dateLabel} @ ${warningTrendArtifact.current.generatedAt}`,
    `- previousCheckpoint: ${warningTrendArtifact.previous ? `${warningTrendArtifact.previous.dateLabel} @ ${warningTrendArtifact.previous.generatedAt}` : 'none'}`,
    `- improvedMetrics: ${warningTrendArtifact.improvedMetrics.join(', ') || 'none'}`,
    `- regressedMetrics: ${warningTrendArtifact.regressedMetrics.join(', ') || 'none'}`,
    '',
    '## Source-only quick note',
    '- 非同梱: `node_modules/`, `dist/`, `tmp/`, `.tmp-*`',
    '- 復旧開始: `npm run bootstrap`',
    '- 確認順の正本: `docs/handoff/FUTURE_NATIVE_RELEASE_CHECKLIST.md`',
  ].join('\n');
}
