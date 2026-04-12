import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import {
  buildFutureNativeSpecialistReleaseHandoffArtifact,
  renderFutureNativeSpecialistReleaseHandoffMarkdown,
  renderFutureNativeSpecialistWarningArchiveMarkdown,
} from '../lib/future-native-families/futureNativeFamiliesSpecialistReleaseHandoff';
import {
  buildFutureNativeSpecialistRouteCompactArtifact,
} from '../lib/future-native-families/futureNativeFamiliesSpecialistCompactArtifact';
import {
  buildFutureNativeSpecialistRouteExportImportComparison,
} from '../lib/future-native-families/futureNativeFamiliesSpecialistRouteComparison';
import {
  FUTURE_NATIVE_SPECIALIST_HANDOFF_DATE_LABEL,
  buildFutureNativeSpecialistWarningTrendComparisonArtifact,
  buildFutureNativeSpecialistWarningTrendSnapshot,
  type FutureNativeSpecialistWarningTrendSnapshot,
  renderFutureNativeSpecialistWarningTrendComparisonMarkdown,
} from '../lib/future-native-families/futureNativeFamiliesSpecialistWarningTrend';
import { renderFutureNativeSpecialistArchiveIndexMarkdown } from '../lib/future-native-families/futureNativeFamiliesSpecialistArchiveIndex';
import {
  buildFutureNativeReleaseReportArtifact,
} from '../lib/future-native-families/futureNativeFamiliesReleaseReport';

function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    return JSON.parse(readFileSync(filePath, 'utf8')) as T;
  } catch {
    return fallback;
  }
}

const outputDir = path.resolve('docs/handoff/archive/generated/future-native-specialist-handoff');
const releaseReportOutputDir = path.resolve('docs/handoff/archive/generated/future-native-release-report');
const releaseReportJsonPath = path.join(releaseReportOutputDir, 'future-native-release-report.json');
const comparison = buildFutureNativeSpecialistRouteExportImportComparison();
const compactArtifact = buildFutureNativeSpecialistRouteCompactArtifact(comparison);
const artifact = buildFutureNativeSpecialistReleaseHandoffArtifact({ comparison, compactArtifact });
const releaseReportArtifact = readJsonFile(releaseReportJsonPath, buildFutureNativeReleaseReportArtifact({ specialistArtifact: artifact }));
const handoffDocPath = path.resolve(`docs/handoff/SESSION_CHECKPOINT_${FUTURE_NATIVE_SPECIALIST_HANDOFF_DATE_LABEL}.md`);
const archiveDocPath = path.resolve(
  `docs/handoff/archive/FUTURE_NATIVE_SPECIALIST_ROUTE_WARNING_SUMMARY_${FUTURE_NATIVE_SPECIALIST_HANDOFF_DATE_LABEL}.md`,
);
const trendDocPath = path.resolve(
  `docs/handoff/archive/FUTURE_NATIVE_SPECIALIST_ROUTE_WARNING_TREND_${FUTURE_NATIVE_SPECIALIST_HANDOFF_DATE_LABEL}.md`,
);
const archiveIndexPath = path.resolve('docs/handoff/archive/INDEX.md');
const historyPath = path.join(outputDir, 'future-native-specialist-warning-trend-history.json');
const comparisonJsonPath = path.join(outputDir, 'future-native-specialist-warning-trend-comparison.json');
const comparisonMarkdownPath = path.join(outputDir, 'future-native-specialist-warning-trend-comparison.md');
mkdirSync(outputDir, { recursive: true });
mkdirSync(releaseReportOutputDir, { recursive: true });
mkdirSync(path.dirname(handoffDocPath), { recursive: true });
mkdirSync(path.dirname(archiveDocPath), { recursive: true });
mkdirSync(path.dirname(trendDocPath), { recursive: true });
mkdirSync(path.dirname(archiveIndexPath), { recursive: true });

const currentSnapshot = buildFutureNativeSpecialistWarningTrendSnapshot(artifact, FUTURE_NATIVE_SPECIALIST_HANDOFF_DATE_LABEL);
const existingHistory = readJsonFile<FutureNativeSpecialistWarningTrendSnapshot[]>(historyPath, []);
const history = [...existingHistory, currentSnapshot]
  .sort((left, right) => left.generatedAt.localeCompare(right.generatedAt) || left.dateLabel.localeCompare(right.dateLabel))
  .filter((entry, index, array) => array.findIndex((candidate) => candidate.generatedAt === entry.generatedAt) === index);
const comparisonArtifact = buildFutureNativeSpecialistWarningTrendComparisonArtifact(history);
writeFileSync(path.join(outputDir, 'future-native-specialist-handoff.json'), JSON.stringify(artifact, null, 2));
writeFileSync(path.join(outputDir, 'future-native-specialist-handoff.md'), renderFutureNativeSpecialistReleaseHandoffMarkdown(artifact, compactArtifact));
writeFileSync(historyPath, JSON.stringify(history, null, 2));
writeFileSync(comparisonJsonPath, JSON.stringify(comparisonArtifact, null, 2));
writeFileSync(comparisonMarkdownPath, renderFutureNativeSpecialistWarningTrendComparisonMarkdown(comparisonArtifact));
writeFileSync(handoffDocPath, renderFutureNativeSpecialistReleaseHandoffMarkdown(artifact, compactArtifact));
writeFileSync(archiveDocPath, renderFutureNativeSpecialistWarningArchiveMarkdown(artifact));
writeFileSync(trendDocPath, renderFutureNativeSpecialistWarningTrendComparisonMarkdown(comparisonArtifact));
writeFileSync(
  archiveIndexPath,
  renderFutureNativeSpecialistArchiveIndexMarkdown({
    releaseHandoffArtifact: artifact,
    warningTrendArtifact: comparisonArtifact,
    releaseReportArtifact,
  }),
);
console.log(`Using ${releaseReportJsonPath}`);
console.log(`Wrote ${outputDir}/future-native-specialist-handoff.json`);
console.log(`Wrote ${outputDir}/future-native-specialist-handoff.md`);
console.log(`Wrote ${historyPath}`);
console.log(`Wrote ${comparisonJsonPath}`);
console.log(`Wrote ${comparisonMarkdownPath}`);
console.log(`Wrote ${handoffDocPath}`);
console.log(`Wrote ${archiveDocPath}`);
console.log(`Wrote ${trendDocPath}`);
console.log(`Wrote ${archiveIndexPath}`);
process.exit(0);
