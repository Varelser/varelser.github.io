import { normalizeConfig } from '../appStateConfig';
import { buildProjectData } from '../projectStateData';
import { parseProjectData } from '../projectStateStorage';
import type {
  ProjectFutureNativeSpecialistRouteControlEntry,
  ProjectFutureNativeSpecialistRouteEntry,
  ProjectUiState,
} from '../../types';
import {
  buildFutureNativeSpecialistRouteFixtureDiffs,
  buildFutureNativeSpecialistRouteFixtureSummary,
  buildStressProjectFutureNativeSpecialistRouteControls,
} from './futureNativeFamiliesSpecialistRouteFixtures';
import {
  buildAllFutureNativeSpecialistRouteSnapshots,
  type FutureNativeSpecialistRouteSnapshot,
} from './futureNativeFamiliesSpecialistPackets';
import { buildFutureNativeSpecialistRouteAggregateSummary } from './futureNativeFamiliesSpecialistRouteSummary';

export interface FutureNativeSpecialistRouteExportImportComparisonRoute {
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
  manifestDeltaValues: string[];
  serializationDeltaValues: string[];
  controlDeltaValues: string[];
}

export interface FutureNativeSpecialistRouteExportImportComparison {
  baselineSummary: ReturnType<typeof buildFutureNativeSpecialistRouteAggregateSummary>;
  fixtureSummary: ReturnType<typeof buildFutureNativeSpecialistRouteFixtureSummary>;
  exportImportSummary: {
    routeCount: number;
    changedRouteCount: number;
    warningRouteCount: number;
    manifestRoundtripStableCount: number;
    serializationRoundtripStableCount: number;
    controlRoundtripStableCount: number;
  };
  routes: FutureNativeSpecialistRouteExportImportComparisonRoute[];
}

function buildProjectWithControls(
  futureNativeSpecialistRouteControls: ProjectFutureNativeSpecialistRouteControlEntry[],
) {
  return buildProjectData({
    name: 'Future native specialist route comparison',
    config: normalizeConfig({}),
    activePresetId: null,
    presetBlendDuration: 1.5,
    sequenceLoopEnabled: true,
    presets: [],
    presetSequence: [],
    ui: {
      isPlaying: false,
      isPanelOpen: true,
      videoExportMode: 'current',
      videoDurationSeconds: 8,
      videoFps: 30,
      futureNativeSpecialistRouteControls,
    } as Partial<ProjectUiState>,
  });
}

function diffStringArrays(baseline: string[], comparison: string[], label: string) {
  const deltas: string[] = [];
  for (const value of comparison) {
    if (!baseline.includes(value)) deltas.push(`${label}+${value}`);
  }
  for (const value of baseline) {
    if (!comparison.includes(value)) deltas.push(`${label}-${value}`);
  }
  return deltas;
}

function diffRouteValues(
  baseline: ProjectFutureNativeSpecialistRouteEntry | FutureNativeSpecialistRouteSnapshot,
  comparison: ProjectFutureNativeSpecialistRouteEntry | FutureNativeSpecialistRouteSnapshot,
) {
  return [
    ...diffStringArrays(baseline.adapterSelectionValues, comparison.adapterSelectionValues, 'selection:'),
    ...diffStringArrays(baseline.adapterTargetSwitchValues, comparison.adapterTargetSwitchValues, 'switch:'),
    ...diffStringArrays(baseline.adapterOverrideStateValues, comparison.adapterOverrideStateValues, 'override:'),
    ...diffStringArrays(baseline.overrideChangeHistoryValues, comparison.overrideChangeHistoryValues, 'history:'),
    ...diffStringArrays(baseline.adapterFallbackHistoryValues, comparison.adapterFallbackHistoryValues, 'fallback:'),
    ...diffStringArrays(baseline.capabilityTrendDeltaValues, comparison.capabilityTrendDeltaValues, 'trend:'),
  ];
}

function diffControlValues(
  baseline: ProjectFutureNativeSpecialistRouteControlEntry,
  comparison: ProjectFutureNativeSpecialistRouteControlEntry,
) {
  return [
    baseline.selectedAdapterId === comparison.selectedAdapterId ? null : `selectedAdapter:${baseline.selectedAdapterId}->${comparison.selectedAdapterId}`,
    baseline.selectedExecutionTarget === comparison.selectedExecutionTarget ? null : `executionTarget:${baseline.selectedExecutionTarget}->${comparison.selectedExecutionTarget}`,
    baseline.overrideMode === comparison.overrideMode ? null : `overrideMode:${baseline.overrideMode}->${comparison.overrideMode}`,
    baseline.overrideCandidateId === comparison.overrideCandidateId ? null : `overrideCandidate:${baseline.overrideCandidateId}->${comparison.overrideCandidateId}`,
    baseline.overrideDisposition === comparison.overrideDisposition ? null : `overrideDisposition:${baseline.overrideDisposition}->${comparison.overrideDisposition}`,
  ].filter((value): value is string => typeof value === 'string');
}

function routeStable(deltas: string[]) {
  return deltas.length === 0;
}

export function buildFutureNativeSpecialistRouteExportImportComparison(): FutureNativeSpecialistRouteExportImportComparison {
  const baselineRoutes = buildAllFutureNativeSpecialistRouteSnapshots();
  const stressControls = buildStressProjectFutureNativeSpecialistRouteControls();
  const stressProject = buildProjectWithControls(stressControls);
  const parsedStressProject = parseProjectData(JSON.parse(JSON.stringify(stressProject)));
  if (!parsedStressProject) {
    throw new Error('future-native specialist route comparison parse failed');
  }

  const fixtureDiffs = buildFutureNativeSpecialistRouteFixtureDiffs();
  const fixtureSummary = buildFutureNativeSpecialistRouteFixtureSummary(fixtureDiffs);
  const baselineSummary = buildFutureNativeSpecialistRouteAggregateSummary(baselineRoutes);
  const manifestRoutes = stressProject.manifest.futureNativeSpecialistRoutes ?? [];
  const parsedManifestRoutes = parsedStressProject.manifest.futureNativeSpecialistRoutes ?? [];
  const parsedSerializationRoutes = parsedStressProject.serialization.futureNative?.specialistRoutes ?? [];
  const parsedControls = parsedStressProject.ui.futureNativeSpecialistRouteControls ?? [];
  const manifestRouteMap = new Map(manifestRoutes.map((route) => [route.familyId, route]));
  const parsedManifestRouteMap = new Map(parsedManifestRoutes.map((route) => [route.familyId, route]));
  const parsedSerializationRouteMap = new Map(parsedSerializationRoutes.map((route) => [route.familyId, route]));
  const parsedControlMap = new Map(parsedControls.map((control) => [control.familyId, control]));
  const fixtureDiffMap = new Map(fixtureDiffs.map((diff) => [diff.familyId, diff]));

  const routes = stressControls.map<FutureNativeSpecialistRouteExportImportComparisonRoute>((control) => {
    const baselineRoute = baselineRoutes.find((route) => route.familyId === control.familyId);
    const manifestRoute = manifestRouteMap.get(control.familyId);
    const parsedManifestRoute = parsedManifestRouteMap.get(control.familyId);
    const parsedSerializationRoute = parsedSerializationRouteMap.get(control.familyId);
    const parsedControl = parsedControlMap.get(control.familyId);
    const fixtureDiff = fixtureDiffMap.get(control.familyId);
    if (!baselineRoute || !manifestRoute || !parsedManifestRoute || !parsedSerializationRoute || !parsedControl || !fixtureDiff) {
      throw new Error(`future-native specialist route comparison missing route payload for ${control.familyId}`);
    }
    const manifestDeltaValues = diffRouteValues(manifestRoute, parsedManifestRoute);
    const serializationDeltaValues = diffRouteValues(manifestRoute, parsedSerializationRoute);
    const controlDeltaValues = diffControlValues(control, parsedControl);
    return {
      familyId: manifestRoute.familyId,
      routeId: manifestRoute.routeId,
      routeLabel: manifestRoute.routeLabel,
      executionTarget: manifestRoute.executionTarget,
      selectedAdapterId: manifestRoute.selectedAdapterId,
      changedSections: [...fixtureDiff.changedSections],
      warningValues: [...fixtureDiff.warningValues],
      manifestRoundtripStable: routeStable(manifestDeltaValues),
      serializationRoundtripStable: routeStable(serializationDeltaValues),
      controlRoundtripStable: routeStable(controlDeltaValues),
      manifestDeltaValues,
      serializationDeltaValues,
      controlDeltaValues,
    };
  });

  return {
    baselineSummary,
    fixtureSummary,
    exportImportSummary: routes.reduce<FutureNativeSpecialistRouteExportImportComparison['exportImportSummary']>((summary, route) => ({
      routeCount: summary.routeCount + 1,
      changedRouteCount: summary.changedRouteCount + (route.changedSections.length > 0 ? 1 : 0),
      warningRouteCount: summary.warningRouteCount + (route.warningValues.length > 0 ? 1 : 0),
      manifestRoundtripStableCount: summary.manifestRoundtripStableCount + (route.manifestRoundtripStable ? 1 : 0),
      serializationRoundtripStableCount: summary.serializationRoundtripStableCount + (route.serializationRoundtripStable ? 1 : 0),
      controlRoundtripStableCount: summary.controlRoundtripStableCount + (route.controlRoundtripStable ? 1 : 0),
    }), {
      routeCount: 0,
      changedRouteCount: 0,
      warningRouteCount: 0,
      manifestRoundtripStableCount: 0,
      serializationRoundtripStableCount: 0,
      controlRoundtripStableCount: 0,
    }),
    routes,
  };
}
