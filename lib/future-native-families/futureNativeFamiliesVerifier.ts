import {
  buildAllFirstWaveIntegrationSnapshots,
  buildAllProjectFutureNativeIntegrationSnapshots,
  type FutureNativeIntegrationSnapshot,
  type ProjectFutureNativeIntegrationSnapshot,
} from './futureNativeFamiliesIntegration';

export interface FutureNativeVerificationCheck {
  label: string;
  passed: boolean;
  detail: string;
}

export interface FutureNativeFamilyVerificationResult {
  familyId: string;
  checks: FutureNativeVerificationCheck[];
}

export interface FutureNativeVerificationSummary {
  familyCount: number;
  passedChecks: number;
  totalChecks: number;
  allPassed: boolean;
}

export interface FutureNativeVerificationReport {
  summary: FutureNativeVerificationSummary;
  families: FutureNativeFamilyVerificationResult[];
}

function check(label: string, passed: boolean, detail: string): FutureNativeVerificationCheck {
  return { label, passed, detail };
}

function summarizeFamilies(families: FutureNativeFamilyVerificationResult[]): FutureNativeVerificationSummary {
  const totalChecks = families.reduce((sum, family) => sum + family.checks.length, 0);
  const passedChecks = families.reduce((sum, family) => sum + family.checks.filter((entry) => entry.passed).length, 0);
  return {
    familyCount: families.length,
    passedChecks,
    totalChecks,
    allPassed: passedChecks === totalChecks,
  };
}

function formatThresholdDetail(actual: number, minimum: number): string {
  return `${actual} >= ${minimum}`;
}

export function verifyFutureNativeIntegrationSnapshot(snapshot: FutureNativeIntegrationSnapshot): FutureNativeFamilyVerificationResult {
  const checks: FutureNativeVerificationCheck[] = [
    check('ui-control-count', snapshot.uiControlCount >= 3, formatThresholdDetail(snapshot.uiControlCount, 3)),
    check('scalar-samples', snapshot.scalarSamples.length >= 4, formatThresholdDetail(snapshot.scalarSamples.length, 4)),
    check('starter-runtime-stages', snapshot.starterRuntimeStages.length >= 6, formatThresholdDetail(snapshot.starterRuntimeStages.length, 6)),
    check('serializer-block-key', snapshot.serializerBlock.serializerBlockKey.length > 0, snapshot.serializerBlock.serializerBlockKey),
    check('serializer-family-match', snapshot.serializerBlock.familyId === snapshot.familyId, `${snapshot.serializerBlock.familyId} === ${snapshot.familyId}`),
    check('stats-count', Object.keys(snapshot.stats).length >= 5, formatThresholdDetail(Object.keys(snapshot.stats).length, 5)),
    check('runtime-config-values', snapshot.runtimeConfigBlock.values.length >= 4, formatThresholdDetail(snapshot.runtimeConfigBlock.values.length, 4)),
    check('summary-non-empty', snapshot.summary.length > 0, snapshot.summary),
  ];
  return { familyId: snapshot.familyId, checks };
}

export function verifyProjectFutureNativeIntegrationSnapshot(snapshot: ProjectFutureNativeIntegrationSnapshot): FutureNativeFamilyVerificationResult {
  const checks: FutureNativeVerificationCheck[] = [
    check('ui-section-count', snapshot.uiSectionIds.length >= 1, formatThresholdDetail(snapshot.uiSectionIds.length, 1)),
    check('ui-control-count', snapshot.uiControlCount >= 3, formatThresholdDetail(snapshot.uiControlCount, 3)),
    check('runtime-config-values', snapshot.runtimeConfig.values.length >= 4, formatThresholdDetail(snapshot.runtimeConfig.values.length, 4)),
    check('runtime-state-values', snapshot.runtimeState.values.length >= 4, formatThresholdDetail(snapshot.runtimeState.values.length, 4)),
    check('stats-keys', snapshot.statsKeys.length >= 3, formatThresholdDetail(snapshot.statsKeys.length, 3)),
    check('serializer-block-key', snapshot.serializerBlockKey.length > 0, snapshot.serializerBlockKey),
    check('progress-range', snapshot.progressPercent >= 0 && snapshot.progressPercent <= 100, `${snapshot.progressPercent} in [0,100]`),
    check(
      'next-targets',
      snapshot.stage === 'project-integrated' ? snapshot.nextTargets.length >= 0 : snapshot.nextTargets.length >= 1,
      snapshot.stage === 'project-integrated'
        ? `${snapshot.nextTargets.length} >= 0 (project-integrated)`
        : formatThresholdDetail(snapshot.nextTargets.length, 1),
    ),
  ];
  return { familyId: snapshot.familyId, checks };
}

export function verifyAllFutureNativeIntegrationSnapshots(
  snapshots = buildAllFirstWaveIntegrationSnapshots(),
): FutureNativeVerificationReport {
  const families = snapshots.map((snapshot) => verifyFutureNativeIntegrationSnapshot(snapshot));
  return {
    summary: summarizeFamilies(families),
    families,
  };
}

export function verifyAllProjectFutureNativeIntegrationSnapshots(
  snapshots = buildAllProjectFutureNativeIntegrationSnapshots(),
): FutureNativeVerificationReport {
  const families = snapshots.map((snapshot) => verifyProjectFutureNativeIntegrationSnapshot(snapshot));
  return {
    summary: summarizeFamilies(families),
    families,
  };
}

export function assertFutureNativeVerificationReport(report: FutureNativeVerificationReport, label: string): void {
  if (!report.summary.allPassed) {
    const failing = report.families
      .flatMap((family) => family.checks.filter((entry) => !entry.passed).map((entry) => `${family.familyId}:${entry.label}:${entry.detail}`));
    throw new Error(`${label} failed -> ${failing.join(' | ')}`);
  }
}
