import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import {
  buildFutureNativeReleaseReportArtifact,
  renderFutureNativeReleaseReportMarkdown,
} from '../lib/future-native-families/futureNativeFamiliesReleaseReport';
import type { FutureNativeSpecialistReleaseHandoffArtifact } from '../lib/future-native-families/futureNativeFamiliesSpecialistReleaseHandoff';
import {
  FUTURE_NATIVE_RELEASE_REPORT_DATE_LABEL,
  buildFutureNativeReleaseTrendComparisonArtifact,
  buildFutureNativeReleaseTrendSnapshot,
  renderFutureNativeReleaseTrendComparisonMarkdown,
  type FutureNativeReleaseTrendSnapshot,
} from '../lib/future-native-families/futureNativeFamiliesReleaseTrend';
import {
  buildFutureNativeDedicatedCoreOwnershipReport,
  renderFutureNativeDedicatedCoreOwnershipMarkdown,
} from '../lib/future-native-families/futureNativeDedicatedCoreOwnershipReport';
import {
  buildFutureNativeFinalCloseoutStatus,
  renderFutureNativeFinalCloseoutStatusMarkdown,
} from '../lib/future-native-families/futureNativeFinalCloseoutStatus';

function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    return JSON.parse(readFileSync(filePath, 'utf8')) as T;
  } catch {
    return fallback;
  }
}

const specialistArtifactPath = path.resolve('docs/handoff/archive/generated/future-native-specialist-handoff/future-native-specialist-handoff.json');
const specialistArtifact = readJsonFile<FutureNativeSpecialistReleaseHandoffArtifact | null>(specialistArtifactPath, null);
const artifact = buildFutureNativeReleaseReportArtifact({ specialistArtifact: specialistArtifact ?? undefined });
const markdown = renderFutureNativeReleaseReportMarkdown(artifact);
const outputDir = path.resolve('docs/handoff/archive/generated/future-native-release-report');
const rootReportPath = path.resolve('docs/handoff/FUTURE_NATIVE_RELEASE_REPORT.md');
const trendDocPath = path.resolve(`docs/handoff/archive/FUTURE_NATIVE_RELEASE_TREND_${FUTURE_NATIVE_RELEASE_REPORT_DATE_LABEL}.md`);
const historyPath = path.join(outputDir, 'future-native-release-trend-history.json');
const comparisonJsonPath = path.join(outputDir, 'future-native-release-trend-comparison.json');
const comparisonMarkdownPath = path.join(outputDir, 'future-native-release-trend-comparison.md');
const dedicatedCoreOwnershipDir = path.resolve('generated/future-native-dedicated-core-ownership');
const finalCloseoutDir = path.resolve('generated/future-native-final-closeout-status');
const dedicatedCoreOwnership = buildFutureNativeDedicatedCoreOwnershipReport();
const dedicatedCoreOwnershipMarkdown = renderFutureNativeDedicatedCoreOwnershipMarkdown(dedicatedCoreOwnership);
const finalCloseoutStatus = buildFutureNativeFinalCloseoutStatus();
const finalCloseoutStatusMarkdown = renderFutureNativeFinalCloseoutStatusMarkdown(finalCloseoutStatus);

mkdirSync(outputDir, { recursive: true });
mkdirSync(dedicatedCoreOwnershipDir, { recursive: true });
mkdirSync(finalCloseoutDir, { recursive: true });
mkdirSync(path.dirname(rootReportPath), { recursive: true });
mkdirSync(path.dirname(trendDocPath), { recursive: true });

const currentSnapshot = buildFutureNativeReleaseTrendSnapshot(artifact, FUTURE_NATIVE_RELEASE_REPORT_DATE_LABEL);
const existingHistory = readJsonFile<FutureNativeReleaseTrendSnapshot[]>(historyPath, []);
const history = [...existingHistory, currentSnapshot]
  .sort((left, right) => left.generatedAt.localeCompare(right.generatedAt) || left.dateLabel.localeCompare(right.dateLabel))
  .filter((entry, index, array) => array.findIndex((candidate) => candidate.generatedAt === entry.generatedAt) === index);
const comparisonArtifact = buildFutureNativeReleaseTrendComparisonArtifact(history);

writeFileSync(path.join(outputDir, 'future-native-release-report.json'), JSON.stringify(artifact, null, 2));
writeFileSync(path.join(outputDir, 'future-native-release-report.md'), markdown);
writeFileSync(historyPath, JSON.stringify(history, null, 2));
writeFileSync(comparisonJsonPath, JSON.stringify(comparisonArtifact, null, 2));
writeFileSync(comparisonMarkdownPath, renderFutureNativeReleaseTrendComparisonMarkdown(comparisonArtifact));
writeFileSync(rootReportPath, markdown);
writeFileSync(trendDocPath, renderFutureNativeReleaseTrendComparisonMarkdown(comparisonArtifact));
writeFileSync(path.join(dedicatedCoreOwnershipDir, 'future-native-dedicated-core-ownership.json'), JSON.stringify(dedicatedCoreOwnership, null, 2));
writeFileSync(path.join(dedicatedCoreOwnershipDir, 'future-native-dedicated-core-ownership.md'), dedicatedCoreOwnershipMarkdown);
writeFileSync(path.join(finalCloseoutDir, 'future-native-final-closeout-status.json'), JSON.stringify(finalCloseoutStatus, null, 2));
writeFileSync(path.join(finalCloseoutDir, 'future-native-final-closeout-status.md'), finalCloseoutStatusMarkdown);
writeFileSync(path.resolve('docs/FUTURE_NATIVE_FINAL_CLOSEOUT_REMAINING_2026-04-08.md'), finalCloseoutStatusMarkdown);
console.log(`Wrote ${outputDir}/future-native-release-report.json`);
console.log(`Wrote ${outputDir}/future-native-release-report.md`);
console.log(`Wrote ${historyPath}`);
console.log(`Wrote ${comparisonJsonPath}`);
console.log(`Wrote ${comparisonMarkdownPath}`);
console.log(`Wrote ${rootReportPath}`);
console.log(`Wrote ${trendDocPath}`);
console.log(`Wrote ${dedicatedCoreOwnershipDir}/future-native-dedicated-core-ownership.json`);
console.log(`Wrote ${dedicatedCoreOwnershipDir}/future-native-dedicated-core-ownership.md`);
console.log(`Wrote ${finalCloseoutDir}/future-native-final-closeout-status.json`);
console.log(`Wrote ${finalCloseoutDir}/future-native-final-closeout-status.md`);
console.log('Wrote docs/FUTURE_NATIVE_FINAL_CLOSEOUT_REMAINING_2026-04-08.md');
