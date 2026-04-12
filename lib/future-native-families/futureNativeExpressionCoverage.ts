import { nonVolumetricBindingRegistrationSpecs } from './futureNativeNonVolumetricBindingMetadata';
import { getFutureNativeFamilyProgress, summarizeFutureNativeFamilyProgress } from './futureNativeFamiliesProgress';
import { buildIntegratedFamilySnapshot, getFutureNativeUiSections } from './futureNativeFamiliesIntegrationSnapshots';
import { futureNativeFamilySpecs } from './futureNativeFamiliesRegistry';
import { buildRouteMetadata } from './futureNativeFamiliesSpecialistRouteMetadata';
import type { FutureNativeFamilyId, FutureNativeFamilyStage } from './futureNativeFamiliesTypes';
import { volumetricRouteHighlightSpecs } from './futureNativeVolumetricFamilyMetadata';
import { buildFutureNativeVolumetricFamilyPreview } from './futureNativeVolumetricFamilyPreview';
import { getFutureNativeNonVolumetricBundleCoverage } from './futureNativeNonVolumetricBundleCoverage';
import { buildFutureNativeDedicatedCoreOwnershipReport } from './futureNativeDedicatedCoreOwnershipReport';

export type FutureNativeExpressionClosure =
  | 'independent'
  | 'dedicated-shared-core'
  | 'derived-on-substrate'
  | 'surface-thin'
  | 'stage-mismatch';

export interface FutureNativeExpressionCoverageEntry {
  familyId: FutureNativeFamilyId;
  group: string;
  title: string;
  registryStage: FutureNativeFamilyStage;
  progressStage: FutureNativeFamilyStage;
  progressPercent: number;
  closure: FutureNativeExpressionClosure;
  derivesFromSharedSubstrate: boolean;
  dedicatedSurfaceArtifacts: boolean;
  dedicatedSurfaceLabel: string | null;
  routeCount: number;
  presetCount: number;
  uiSectionCount: number;
  uiControlCount: number;
  uniqueRuntimeMarker: boolean;
  uniqueRuntimeMarkerDetail: string;
  closureScore: number;
  warnings: string[];
}

export interface FutureNativeExpressionCoverageSummary {
  totalFamilies: number;
  independentCount: number;
  dedicatedSharedCoreCount: number;
  derivedOnSubstrateCount: number;
  surfaceThinCount: number;
  stageMismatchCount: number;
  averageProgressPercent: number;
  closureProgressPercent: number;
  sharedCoreDedicatedFamilies: string[];
  familiesMissingUniqueRuntimeMarker: string[];
  familiesWithStageMismatch: string[];
}

export interface FutureNativeExpressionCoverageReport {
  generatedAtIso: string;
  summary: FutureNativeExpressionCoverageSummary;
  families: FutureNativeExpressionCoverageEntry[];
}

const runtimeMarkerExpectations: Partial<Record<FutureNativeFamilyId, readonly string[]>> = {
  'mpm-viscoplastic': ['familyRouteViscoplastic', 'viscoplastic '],
  'mpm-snow': ['familyRouteSnow', 'snow '],
  'mpm-mud': ['familyRouteMud', 'mud '],
  'mpm-paste': ['familyRoutePaste', 'paste '],
  'pbd-cloth': ['familyRouteCloth', 'cloth '],
  'pbd-membrane': ['familyRouteMembrane', 'membrane '],
  'pbd-softbody': ['familyRouteSoftbody', 'softbody '],
  'fracture-voxel': ['familyRouteVoxelized', 'voxel-chunks '],
  'fracture-crack-propagation': ['familyRouteCrackPropagation', 'crack-front '],
  'fracture-debris-generation': ['familyRouteDebrisGeneration', 'debris-field '],
  'volumetric-density-transport': ['familyRouteDensityTransport', 'density-transport '],
  'volumetric-smoke': ['familyRouteSmoke', 'smoke '],
  'volumetric-advection': ['familyRouteAdvection', 'advection '],
  'volumetric-pressure-coupling': ['familyRoutePressureCoupling', 'pressure-coupling '],
  'volumetric-light-shadow-coupling': ['familyRouteLightShadowCoupling', 'light-shadow '],
};

function countRoutesForFamily(familyId: FutureNativeFamilyId): { routeCount: number; presetCount: number } {
  if (familyId === 'volumetric-density-transport') {
    const preview = buildFutureNativeVolumetricFamilyPreview('volumetric-density-transport');
    return {
      routeCount: preview.routeCount,
      presetCount: preview.presetCount,
    };
  }

  if (familyId in volumetricRouteHighlightSpecs) {
    const routeDefinitions = volumetricRouteHighlightSpecs[familyId as keyof typeof volumetricRouteHighlightSpecs].routeDefinitions;
    return {
      routeCount: routeDefinitions.length,
      presetCount: routeDefinitions.length,
    };
  }

  if (familyId.startsWith('specialist-')) {
    const metadata = buildRouteMetadata(familyId as Parameters<typeof buildRouteMetadata>[0]);
    return {
      routeCount: metadata.adapterOptions.length,
      presetCount: metadata.adapterOptions.length,
    };
  }

  const specs = nonVolumetricBindingRegistrationSpecs.filter((entry) => entry.familyId === familyId);
  return {
    routeCount: specs.length,
    presetCount: specs.reduce((sum, entry) => sum + entry.presets.length, 0),
  };
}

function getDedicatedSurfaceCoverage(familyId: FutureNativeFamilyId): { ok: boolean; label: string | null } {
  if (familyId.startsWith('specialist-')) {
    return { ok: true, label: 'specialist-routes' };
  }

  const coverage = getFutureNativeNonVolumetricBundleCoverage(familyId);
  if (!coverage) {
    return { ok: false, label: null };
  }

  const hasHelperSplit = coverage.helperArtifacts.length >= 2;
  const hasBundleSplit = coverage.bundleArtifacts.length >= 1;
  return {
    ok: hasHelperSplit && hasBundleSplit,
    label: coverage.coverageLabel,
  };
}

function getClosureScore(closure: FutureNativeExpressionClosure): number {
  switch (closure) {
    case 'independent':
      return 1;
    case 'dedicated-shared-core':
      return 0.9;
    case 'derived-on-substrate':
      return 0.7;
    case 'surface-thin':
      return 0.35;
    case 'stage-mismatch':
      return 0;
  }
}

function checkRuntimeMarker(familyId: FutureNativeFamilyId): { ok: boolean; detail: string; uiSectionCount: number; uiControlCount: number } {
  if (familyId.startsWith('specialist-')) {
    return {
      ok: true,
      detail: 'specialist-routes',
      uiSectionCount: 0,
      uiControlCount: 0,
    };
  }

  const snapshot = buildIntegratedFamilySnapshot(familyId as Parameters<typeof buildIntegratedFamilySnapshot>[0]);
  const uiSections = getFutureNativeUiSections(familyId as Parameters<typeof getFutureNativeUiSections>[0]);
  const expectation = runtimeMarkerExpectations[familyId];
  if (!expectation || expectation.length === 0) {
    return {
      ok: true,
      detail: 'base-family-runtime',
      uiSectionCount: uiSections.length,
      uiControlCount: snapshot.uiControlCount,
    };
  }

  const statsKeys = Object.keys(snapshot.stats);
  const hit = expectation.find((token) => statsKeys.includes(token) || snapshot.summary.startsWith(token));
  return {
    ok: typeof hit === 'string',
    detail: hit ?? `missing any of: ${expectation.join(', ')}`,
    uiSectionCount: uiSections.length,
    uiControlCount: snapshot.uiControlCount,
  };
}

let futureNativeExpressionCoverageReportCache: FutureNativeExpressionCoverageReport | null = null;

export function invalidateFutureNativeExpressionCoverageReportCache(): void {
  futureNativeExpressionCoverageReportCache = null;
}

export function buildFutureNativeExpressionCoverageReport(
  options: { refresh?: boolean } = {},
): FutureNativeExpressionCoverageReport {
  if (!options.refresh && futureNativeExpressionCoverageReportCache) return futureNativeExpressionCoverageReportCache;

  const ownershipReport = buildFutureNativeDedicatedCoreOwnershipReport(options);
  const fullyOwnedFamilies = new Set(ownershipReport.summary.fullyOwnedKernelFamilies);

  const entries: FutureNativeExpressionCoverageEntry[] = futureNativeFamilySpecs.map((family) => {
    const progress = getFutureNativeFamilyProgress(family.id);
    const { routeCount, presetCount } = countRoutesForFamily(family.id);
    const markerCheck = checkRuntimeMarker(family.id);
    const dedicatedSurface = getDedicatedSurfaceCoverage(family.id);
    const derivesFromSharedSubstrate = family.implementationNotes.some((note) => /reuses? the .*substrate/i.test(note));
    const stageMismatch = family.stage !== progress.currentStage;
    const fullyOwnedKernel = fullyOwnedFamilies.has(family.id as never);
    const warnings: string[] = [];

    if (stageMismatch) warnings.push(`registry=${family.stage}, progress=${progress.currentStage}`);
    if (!markerCheck.ok) warnings.push(markerCheck.detail);
    if (routeCount <= 0) warnings.push('missing route coverage');
    if (presetCount <= 0) warnings.push('missing preset coverage');
    if (derivesFromSharedSubstrate && !dedicatedSurface.ok) warnings.push('shared substrate without dedicated helper surface');
    if (derivesFromSharedSubstrate && !fullyOwnedKernel && dedicatedSurface.ok) warnings.push('shared substrate still pending owned-kernel extraction');
    if (!family.id.startsWith('specialist-') && markerCheck.uiControlCount < 3) warnings.push(`thin ui controls (${markerCheck.uiControlCount})`);

    const closure: FutureNativeExpressionClosure = stageMismatch
      ? 'stage-mismatch'
      : !markerCheck.ok || routeCount <= 0 || presetCount <= 0
        ? 'surface-thin'
        : derivesFromSharedSubstrate
          ? fullyOwnedKernel
            ? 'independent'
            : dedicatedSurface.ok
              ? 'dedicated-shared-core'
              : 'derived-on-substrate'
          : 'independent';

    return {
      familyId: family.id,
      group: family.group,
      title: family.title,
      registryStage: family.stage,
      progressStage: progress.currentStage,
      progressPercent: progress.progressPercent,
      closure,
      derivesFromSharedSubstrate,
      dedicatedSurfaceArtifacts: dedicatedSurface.ok,
      dedicatedSurfaceLabel: dedicatedSurface.label,
      routeCount,
      presetCount,
      uiSectionCount: markerCheck.uiSectionCount,
      uiControlCount: markerCheck.uiControlCount,
      uniqueRuntimeMarker: markerCheck.ok,
      uniqueRuntimeMarkerDetail: markerCheck.detail,
      closureScore: getClosureScore(closure),
      warnings,
    };
  });

  const progressSummary = summarizeFutureNativeFamilyProgress();
  const summary: FutureNativeExpressionCoverageSummary = {
    totalFamilies: entries.length,
    independentCount: entries.filter((entry) => entry.closure === 'independent').length,
    dedicatedSharedCoreCount: entries.filter((entry) => entry.closure === 'dedicated-shared-core').length,
    derivedOnSubstrateCount: entries.filter((entry) => entry.closure === 'derived-on-substrate').length,
    surfaceThinCount: entries.filter((entry) => entry.closure === 'surface-thin').length,
    stageMismatchCount: entries.filter((entry) => entry.closure === 'stage-mismatch').length,
    averageProgressPercent: progressSummary.averageProgressPercent,
    closureProgressPercent: (entries.reduce((sum, entry) => sum + entry.closureScore, 0) / Math.max(entries.length, 1)) * 100,
    sharedCoreDedicatedFamilies: entries.filter((entry) => entry.closure === 'dedicated-shared-core').map((entry) => entry.familyId),
    familiesMissingUniqueRuntimeMarker: entries.filter((entry) => !entry.uniqueRuntimeMarker).map((entry) => entry.familyId),
    familiesWithStageMismatch: entries.filter((entry) => entry.registryStage !== entry.progressStage).map((entry) => entry.familyId),
  };

  const report: FutureNativeExpressionCoverageReport = {
    generatedAtIso: new Date().toISOString(),
    summary,
    families: entries,
  };

  futureNativeExpressionCoverageReportCache = report;
  return report;
}

export function renderFutureNativeExpressionCoverageMarkdown(
  report = buildFutureNativeExpressionCoverageReport(),
): string {
  const lines: string[] = [
    '# Future Native Expression Coverage Report',
    '',
    `- generatedAt: ${report.generatedAtIso}`,
    `- totalFamilies: ${report.summary.totalFamilies}`,
    `- independentCount: ${report.summary.independentCount}`,
    `- derivedOnSubstrateCount: ${report.summary.derivedOnSubstrateCount}`,
    `- surfaceThinCount: ${report.summary.surfaceThinCount}`,
    `- stageMismatchCount: ${report.summary.stageMismatchCount}`,
    `- averageProgressPercent: ${report.summary.averageProgressPercent.toFixed(1)}`,
    '',
    '## Families',
  ];

  for (const entry of report.families) {
    lines.push(`### ${entry.title} (${entry.familyId})`);
    lines.push(`- closure: ${entry.closure}`);
    lines.push(`- progress: ${entry.progressPercent}%`);
    lines.push(`- stage: registry=${entry.registryStage} / progress=${entry.progressStage}`);
    lines.push(`- routes: ${entry.routeCount}`);
    lines.push(`- presets: ${entry.presetCount}`);
    lines.push(`- uiSections: ${entry.uiSectionCount}`);
    lines.push(`- uiControls: ${entry.uiControlCount}`);
    lines.push(`- uniqueRuntimeMarker: ${entry.uniqueRuntimeMarker ? 'yes' : 'no'} (${entry.uniqueRuntimeMarkerDetail})`);
    lines.push(`- derivesFromSharedSubstrate: ${entry.derivesFromSharedSubstrate ? 'yes' : 'no'}`);
    lines.push(`- dedicatedSurfaceArtifacts: ${entry.dedicatedSurfaceArtifacts ? 'yes' : 'no'}${entry.dedicatedSurfaceLabel ? ` (${entry.dedicatedSurfaceLabel})` : ''}`);
    lines.push(`- closureScore: ${entry.closureScore.toFixed(2)}`);
    if (entry.warnings.length > 0) {
      lines.push('- warnings:');
      entry.warnings.forEach((warning) => lines.push(`  - ${warning}`));
    }
    lines.push('');
  }

  if (report.summary.sharedCoreDedicatedFamilies.length > 0) {
    lines.push('## Shared-core dedicated families');
    report.summary.sharedCoreDedicatedFamilies.forEach((familyId) => lines.push(`- ${familyId}`));
    lines.push('');
  }

  if (report.summary.familiesMissingUniqueRuntimeMarker.length > 0) {
    lines.push('## Missing unique runtime markers');
    report.summary.familiesMissingUniqueRuntimeMarker.forEach((familyId) => lines.push(`- ${familyId}`));
    lines.push('');
  }

  if (report.summary.familiesWithStageMismatch.length > 0) {
    lines.push('## Stage mismatches');
    report.summary.familiesWithStageMismatch.forEach((familyId) => lines.push(`- ${familyId}`));
    lines.push('');
  }

  return lines.join('\n');
}
