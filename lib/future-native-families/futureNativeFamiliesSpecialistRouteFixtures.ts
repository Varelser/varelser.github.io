import type { ProjectFutureNativeSpecialistRouteControlEntry } from '../../types';
import {
  buildAllFutureNativeSpecialistRouteSnapshots,
  buildEmptyProjectFutureNativeSpecialistRouteControls,
  type FutureNativeSpecialistRouteSnapshot,
} from './futureNativeFamiliesSpecialistPackets';
import { buildRouteMetadata } from './futureNativeFamiliesSpecialistRouteMetadata';

export interface FutureNativeSpecialistRouteFixtureDiff {
  familyId: string;
  routeId: string;
  routeLabel: string;
  baselineExecutionTarget: string;
  comparisonExecutionTarget: string;
  selectedAdapterId: string;
  changedSections: string[];
  overrideHistoryDeltaValues: string[];
  fallbackHistoryDeltaValues: string[];
  capabilityTrendDeltaValues: string[];
  warningValues: string[];
}

export interface FutureNativeSpecialistRouteFixtureSummary {
  routeCount: number;
  changedRouteCount: number;
  overrideHistoryChangedCount: number;
  fallbackHistoryChangedCount: number;
  capabilityTrendChangedCount: number;
  warningRouteCount: number;
}

function pickStressOverrideCandidate(control: ProjectFutureNativeSpecialistRouteControlEntry) {
  const suffix = control.selectedAdapterId.replace(/^.+?:/u, '');
  return `override:${suffix}`;
}

export function buildStressProjectFutureNativeSpecialistRouteControls(): ProjectFutureNativeSpecialistRouteControlEntry[] {
  return buildEmptyProjectFutureNativeSpecialistRouteControls().map((control, index) => {
    const route = buildRouteMetadata(control.familyId as Parameters<typeof buildRouteMetadata>[0]);
    const fallbackOption = route.adapterOptions[1] ?? route.adapterOptions[route.adapterOptions.length - 1] ?? route.adapterOptions[0];
    const selectedAdapterId = fallbackOption?.id || control.selectedAdapterId;
    const selectedExecutionTarget = fallbackOption?.executionTarget || control.selectedExecutionTarget;
    return {
      familyId: control.familyId,
      selectedAdapterId,
      selectedExecutionTarget,
      overrideMode: selectedAdapterId === control.selectedAdapterId ? 'auto' : 'manual',
      overrideCandidateId: selectedAdapterId === control.selectedAdapterId ? control.overrideCandidateId : pickStressOverrideCandidate({ ...control, selectedAdapterId }),
      overrideDisposition: index % 2 === 0 ? 'pinned' : 'advisory',
    };
  });
}

function buildWarningValues(route: FutureNativeSpecialistRouteSnapshot) {
  const warnings: string[] = [];
  if (route.overrideChangeHistoryValues.some((value) => value === 'historyState:override-updated')) warnings.push('override-history');
  if (route.adapterFallbackHistoryValues.some((value) => value.startsWith('fallbackTransition:') && value !== 'fallbackTransition:none')) warnings.push('fallback-history');
  if (route.capabilityTrendDeltaValues.some((value) => value === 'capabilityTrend:manual-delta')) warnings.push('capability-trend');
  if (route.adapterOverrideStateValues.some((value) => value === 'overrideDisposition:pinned')) warnings.push('pinned-override');
  return warnings;
}

export function buildFutureNativeSpecialistRouteFixtureDiffs(): FutureNativeSpecialistRouteFixtureDiff[] {
  const baselineRoutes = buildAllFutureNativeSpecialistRouteSnapshots();
  const comparisonRoutes = buildAllFutureNativeSpecialistRouteSnapshots(buildStressProjectFutureNativeSpecialistRouteControls());
  return comparisonRoutes.map((comparisonRoute) => {
    const baselineRoute = baselineRoutes.find((route) => route.familyId === comparisonRoute.familyId) ?? comparisonRoute;
    const overrideHistoryDeltaValues = comparisonRoute.overrideChangeHistoryValues.filter((value) => !baselineRoute.overrideChangeHistoryValues.includes(value));
    const fallbackHistoryDeltaValues = comparisonRoute.adapterFallbackHistoryValues.filter((value) => !baselineRoute.adapterFallbackHistoryValues.includes(value));
    const capabilityTrendDeltaValues = comparisonRoute.capabilityTrendDeltaValues.filter((value) => !baselineRoute.capabilityTrendDeltaValues.includes(value));
    const changedSections = [
      overrideHistoryDeltaValues.length > 0 ? 'override-history' : null,
      fallbackHistoryDeltaValues.length > 0 ? 'fallback-history' : null,
      capabilityTrendDeltaValues.length > 0 ? 'capability-trend' : null,
    ].filter((value): value is string => Boolean(value));
    return {
      familyId: comparisonRoute.familyId,
      routeId: comparisonRoute.routeId,
      routeLabel: comparisonRoute.routeLabel,
      baselineExecutionTarget: baselineRoute.executionTarget,
      comparisonExecutionTarget: comparisonRoute.executionTarget,
      selectedAdapterId: comparisonRoute.selectedAdapterId,
      changedSections,
      overrideHistoryDeltaValues,
      fallbackHistoryDeltaValues,
      capabilityTrendDeltaValues,
      warningValues: buildWarningValues(comparisonRoute),
    };
  });
}

export function buildFutureNativeSpecialistRouteFixtureSummary(
  diffs = buildFutureNativeSpecialistRouteFixtureDiffs(),
): FutureNativeSpecialistRouteFixtureSummary {
  return diffs.reduce<FutureNativeSpecialistRouteFixtureSummary>((summary, diff) => ({
    routeCount: summary.routeCount + 1,
    changedRouteCount: summary.changedRouteCount + (diff.changedSections.length > 0 ? 1 : 0),
    overrideHistoryChangedCount: summary.overrideHistoryChangedCount + (diff.overrideHistoryDeltaValues.length > 0 ? 1 : 0),
    fallbackHistoryChangedCount: summary.fallbackHistoryChangedCount + (diff.fallbackHistoryDeltaValues.length > 0 ? 1 : 0),
    capabilityTrendChangedCount: summary.capabilityTrendChangedCount + (diff.capabilityTrendDeltaValues.length > 0 ? 1 : 0),
    warningRouteCount: summary.warningRouteCount + (diff.warningValues.length > 0 ? 1 : 0),
  }), {
    routeCount: 0,
    changedRouteCount: 0,
    overrideHistoryChangedCount: 0,
    fallbackHistoryChangedCount: 0,
    capabilityTrendChangedCount: 0,
    warningRouteCount: 0,
  });
}
