import { buildFutureNativeSpecialistRouteCompactArtifact } from './futureNativeFamiliesSpecialistCompactArtifact';
import { buildFutureNativeSpecialistRouteExportImportComparison } from './futureNativeFamiliesSpecialistRouteComparison';
import { buildAllFutureNativeSpecialistRouteSnapshots } from './futureNativeFamiliesSpecialistPackets';

export interface FutureNativeSpecialistRuntimeExportRegressionArtifact {
  generatedAt: string;
  summary: {
    runtimeRouteCount: number;
    exportImportRouteCount: number;
    compactArtifactRouteCount: number;
    projectSnapshotRouteCount: number;
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
    routeLabel: string;
    warningValues: string[];
    changedSections: string[];
    manifestRoundtripStable: boolean;
    serializationRoundtripStable: boolean;
    controlRoundtripStable: boolean;
  }>;
}

export function buildFutureNativeSpecialistRuntimeExportRegressionArtifact(): FutureNativeSpecialistRuntimeExportRegressionArtifact {
  const runtimeRoutes = buildAllFutureNativeSpecialistRouteSnapshots();
  const comparison = buildFutureNativeSpecialistRouteExportImportComparison();
  const compactArtifact = buildFutureNativeSpecialistRouteCompactArtifact(comparison);
  return {
    generatedAt: new Date().toISOString(),
    summary: {
      runtimeRouteCount: runtimeRoutes.length,
      exportImportRouteCount: comparison.exportImportSummary.routeCount,
      compactArtifactRouteCount: compactArtifact.summary.routeCount,
      projectSnapshotRouteCount: runtimeRoutes.length,
      baselineWarningRouteCount: compactArtifact.summary.baselineWarningRouteCount,
      fixtureChangedRouteCount: compactArtifact.summary.fixtureChangedRouteCount,
      fixtureWarningRouteCount: compactArtifact.summary.fixtureWarningRouteCount,
      exportImportWarningRouteCount: compactArtifact.summary.exportImportWarningRouteCount,
      manifestRoundtripStableCount: compactArtifact.summary.manifestRoundtripStableCount,
      serializationRoundtripStableCount: compactArtifact.summary.serializationRoundtripStableCount,
      controlRoundtripStableCount: compactArtifact.summary.controlRoundtripStableCount,
    },
    routes: comparison.routes.map((route) => ({
      familyId: route.familyId,
      routeLabel: route.routeLabel,
      warningValues: [...route.warningValues],
      changedSections: [...route.changedSections],
      manifestRoundtripStable: route.manifestRoundtripStable,
      serializationRoundtripStable: route.serializationRoundtripStable,
      controlRoundtripStable: route.controlRoundtripStable,
    })),
  };
}
