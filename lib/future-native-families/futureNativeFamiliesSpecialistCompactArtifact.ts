import { buildFutureNativeSpecialistRouteExportImportComparison } from './futureNativeFamiliesSpecialistRouteComparison';

export interface FutureNativeSpecialistRouteCompactArtifact {
  generatedAt: string;
  summary: {
    routeCount: number;
    baselineWarningRouteCount: number;
    fixtureChangedRouteCount: number;
    fixtureWarningRouteCount: number;
    exportImportWarningRouteCount: number;
    manifestRoundtripStableCount: number;
    serializationRoundtripStableCount: number;
    controlRoundtripStableCount: number;
  };
  routes: Array<{
    familyId: string;
    routeId: string;
    routeLabel: string;
    executionTarget: string;
    selectedAdapterId: string;
    changedSections: string[];
    warningValues: string[];
    manifestRoundtripStable: boolean;
    serializationRoundtripStable: boolean;
    controlRoundtripStable: boolean;
  }>;
}

export function buildFutureNativeSpecialistRouteCompactArtifact(
  comparison = buildFutureNativeSpecialistRouteExportImportComparison(),
): FutureNativeSpecialistRouteCompactArtifact {
  return {
    generatedAt: new Date().toISOString(),
    summary: {
      routeCount: comparison.exportImportSummary.routeCount,
      baselineWarningRouteCount: comparison.baselineSummary.warningRouteCount,
      fixtureChangedRouteCount: comparison.fixtureSummary.changedRouteCount,
      fixtureWarningRouteCount: comparison.fixtureSummary.warningRouteCount,
      exportImportWarningRouteCount: comparison.exportImportSummary.warningRouteCount,
      manifestRoundtripStableCount: comparison.exportImportSummary.manifestRoundtripStableCount,
      serializationRoundtripStableCount: comparison.exportImportSummary.serializationRoundtripStableCount,
      controlRoundtripStableCount: comparison.exportImportSummary.controlRoundtripStableCount,
    },
    routes: comparison.routes.map((route) => ({
      familyId: route.familyId,
      routeId: route.routeId,
      routeLabel: route.routeLabel,
      executionTarget: route.executionTarget,
      selectedAdapterId: route.selectedAdapterId,
      changedSections: [...route.changedSections],
      warningValues: [...route.warningValues],
      manifestRoundtripStable: route.manifestRoundtripStable,
      serializationRoundtripStable: route.serializationRoundtripStable,
      controlRoundtripStable: route.controlRoundtripStable,
    })),
  };
}

export function renderFutureNativeSpecialistRouteCompactArtifactMarkdown(
  artifact = buildFutureNativeSpecialistRouteCompactArtifact(),
): string {
  const lines = [
    '# Future Native Specialist Route Compact Artifact',
    '',
    `- generatedAt: ${artifact.generatedAt}`,
    `- routeCount: ${artifact.summary.routeCount}`,
    `- baselineWarningRouteCount: ${artifact.summary.baselineWarningRouteCount}`,
    `- fixtureChangedRouteCount: ${artifact.summary.fixtureChangedRouteCount}`,
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
    lines.push(`- routeId: ${route.routeId}`);
    lines.push(`- executionTarget: ${route.executionTarget}`);
    lines.push(`- selectedAdapterId: ${route.selectedAdapterId}`);
    lines.push(`- changedSections: ${route.changedSections.join(', ') || 'none'}`);
    lines.push(`- warningValues: ${route.warningValues.join(', ') || 'none'}`);
    lines.push(`- manifestRoundtripStable: ${route.manifestRoundtripStable}`);
    lines.push(`- serializationRoundtripStable: ${route.serializationRoundtripStable}`);
    lines.push(`- controlRoundtripStable: ${route.controlRoundtripStable}`);
    lines.push('');
  }
  return lines.join('\n');
}
