import type { ProjectFutureNativeSpecialistRouteEntry } from '../../types';

export interface FutureNativeSpecialistRouteAggregateSummary {
  routeCount: number;
  manualSelectionCount: number;
  fallbackActiveCount: number;
  pinnedOverrideCount: number;
  capabilityDeltaCount: number;
  overrideHistoryChangeCount: number;
  fallbackHistoryTransitionCount: number;
  capabilityTrendDeltaCount: number;
  warningRouteCount: number;
}

function hasValue(values: string[], prefix: string, expected: string) {
  return values.some((value) => value === `${prefix}${expected}`);
}

export function hasSpecialistRouteOverrideHistoryChange(route: ProjectFutureNativeSpecialistRouteEntry) {
  return route.overrideChangeHistoryValues.some((value) => value === 'historyState:override-updated');
}

export function hasSpecialistRouteFallbackHistoryTransition(route: ProjectFutureNativeSpecialistRouteEntry) {
  return route.adapterFallbackHistoryValues.some((value) => value.startsWith('fallbackTransition:') && value !== 'fallbackTransition:none');
}

export function hasSpecialistRouteCapabilityTrendDelta(route: ProjectFutureNativeSpecialistRouteEntry) {
  return route.capabilityTrendDeltaValues.some((value) => value === 'capabilityTrend:manual-delta');
}

export function hasSpecialistRouteWarning(route: ProjectFutureNativeSpecialistRouteEntry) {
  return hasValue(route.adapterSelectionValues, 'selection:', 'manual')
    || hasValue(route.fallbackReasonValues, 'fallbackActive:', 'true')
    || hasValue(route.adapterOverrideStateValues, 'overrideDisposition:', 'pinned')
    || hasSpecialistRouteOverrideHistoryChange(route)
    || hasSpecialistRouteFallbackHistoryTransition(route)
    || hasSpecialistRouteCapabilityTrendDelta(route);
}

export function buildFutureNativeSpecialistRouteAggregateSummary(
  routes: ProjectFutureNativeSpecialistRouteEntry[],
): FutureNativeSpecialistRouteAggregateSummary {
  return routes.reduce<FutureNativeSpecialistRouteAggregateSummary>((summary, route) => ({
    routeCount: summary.routeCount + 1,
    manualSelectionCount: summary.manualSelectionCount + (hasValue(route.adapterSelectionValues, 'selection:', 'manual') ? 1 : 0),
    fallbackActiveCount: summary.fallbackActiveCount + (hasValue(route.fallbackReasonValues, 'fallbackActive:', 'true') ? 1 : 0),
    pinnedOverrideCount: summary.pinnedOverrideCount + (hasValue(route.adapterOverrideStateValues, 'overrideDisposition:', 'pinned') ? 1 : 0),
    capabilityDeltaCount: summary.capabilityDeltaCount + (hasValue(route.adapterCapabilityDiffValues, 'selectionDiff:', 'manual-delta') ? 1 : 0),
    overrideHistoryChangeCount: summary.overrideHistoryChangeCount + (hasSpecialistRouteOverrideHistoryChange(route) ? 1 : 0),
    fallbackHistoryTransitionCount: summary.fallbackHistoryTransitionCount + (hasSpecialistRouteFallbackHistoryTransition(route) ? 1 : 0),
    capabilityTrendDeltaCount: summary.capabilityTrendDeltaCount + (hasSpecialistRouteCapabilityTrendDelta(route) ? 1 : 0),
    warningRouteCount: summary.warningRouteCount + (hasSpecialistRouteWarning(route) ? 1 : 0),
  }), {
    routeCount: 0,
    manualSelectionCount: 0,
    fallbackActiveCount: 0,
    pinnedOverrideCount: 0,
    capabilityDeltaCount: 0,
    overrideHistoryChangeCount: 0,
    fallbackHistoryTransitionCount: 0,
    capabilityTrendDeltaCount: 0,
    warningRouteCount: 0,
  });
}
