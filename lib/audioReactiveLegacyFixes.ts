import type { AudioModulationRoute } from '../types/audioReactive';
import { createLegacyAudioRoutes } from './audioReactiveConfig';

export interface AudioLegacyAutoFixOptions {
  appendMissing?: boolean;
  alignResiduals?: boolean;
  dedupeExact?: boolean;
  collapseLegacyOwnedDuplicates?: boolean;
  removeLegacyShadowedByCustomExact?: boolean;
  collapseExactCustomDuplicates?: boolean;
  disableNonDominantFocusedRoutes?: boolean;
  keepRouteId?: string;
  onlyKey?: string;
  removeStaleLegacy?: boolean;
}

export interface AudioLegacyAutoFixSummary {
  missingAddedCount: number;
  residualAlignedCount: number;
  duplicateRemovedCount: number;
  collapsedLegacyOwnedDuplicateCount: number;
  removedLegacyShadowedByCustomExactCount: number;
  collapsedExactCustomDuplicateCount: number;
  disabledNonDominantFocusedRouteCount: number;
  staleLegacyRemovedCount: number;
}

interface AudioLegacyAutoFixResult {
  routes: AudioModulationRoute[];
  summary: AudioLegacyAutoFixSummary;
}

function createRouteKey(route: Pick<AudioModulationRoute, 'source' | 'target'>) {
  return `${route.source} -> ${route.target}`;
}

function createRouteComparisonScore(expected: AudioModulationRoute, actual: AudioModulationRoute) {
  return Math.abs(expected.amount - actual.amount)
    + Math.abs(expected.bias - actual.bias)
    + Math.abs(expected.smoothing - actual.smoothing)
    + Math.abs(expected.attack - actual.attack)
    + Math.abs(expected.release - actual.release)
    + Math.abs(expected.clampMin - actual.clampMin)
    + Math.abs(expected.clampMax - actual.clampMax)
    + (expected.curve === actual.curve ? 0 : 1)
    + (expected.mode === actual.mode ? 0 : 1)
    + (expected.enabled === actual.enabled ? 0 : 1);
}

function routesAreExactValueMatch(expected: AudioModulationRoute, actual: AudioModulationRoute) {
  return createRouteComparisonScore(expected, actual) < 1e-6;
}

function isLegacyOwnedRoute(route: AudioModulationRoute) {
  return route.id.startsWith('legacy-') || route.notes?.toLowerCase().includes('legacy') === true;
}

function sortMatchIndices(expected: AudioModulationRoute, routes: AudioModulationRoute[], indices: number[]) {
  return [...indices].sort((left, right) => createRouteComparisonScore(expected, routes[left]) - createRouteComparisonScore(expected, routes[right]));
}

export function applyLegacyAudioRouteAutoFixes(
  config: Parameters<typeof createLegacyAudioRoutes>[0],
  currentRoutes: AudioModulationRoute[],
  options: AudioLegacyAutoFixOptions,
): AudioLegacyAutoFixResult {
  const expectedRoutes = createLegacyAudioRoutes(config);
  const nextRoutes = currentRoutes.map((route) => ({ ...route }));
  const summary: AudioLegacyAutoFixSummary = {
    missingAddedCount: 0,
    residualAlignedCount: 0,
    duplicateRemovedCount: 0,
    collapsedLegacyOwnedDuplicateCount: 0,
    removedLegacyShadowedByCustomExactCount: 0,
    collapsedExactCustomDuplicateCount: 0,
    disabledNonDominantFocusedRouteCount: 0,
    staleLegacyRemovedCount: 0,
  };

  const buildIndexMap = () => {
    const indexMap = new Map<string, number[]>();
    nextRoutes.forEach((route, index) => {
      const key = createRouteKey(route);
      const bucket = indexMap.get(key);
      if (bucket) {
        bucket.push(index);
      } else {
        indexMap.set(key, [index]);
      }
    });
    return indexMap;
  };

  let indexMap = buildIndexMap();
  const removalSet = new Set<number>();

  expectedRoutes.forEach((expectedRoute) => {
    const key = createRouteKey(expectedRoute);
    if (options.onlyKey && options.onlyKey !== key) {
      return;
    }
    const matchIndices = (indexMap.get(key) ?? []).filter((index) => !removalSet.has(index));
    if (matchIndices.length === 0) {
      if (options.appendMissing) {
        nextRoutes.push({ ...expectedRoute });
        summary.missingAddedCount += 1;
        indexMap = buildIndexMap();
      }
      return;
    }

    const rankedIndices = sortMatchIndices(expectedRoute, nextRoutes, matchIndices);
    const bestIndex = rankedIndices[0];
    const bestRoute = nextRoutes[bestIndex];

    if (options.alignResiduals && !routesAreExactValueMatch(expectedRoute, bestRoute)) {
      nextRoutes[bestIndex] = {
        ...bestRoute,
        enabled: expectedRoute.enabled,
        source: expectedRoute.source,
        target: expectedRoute.target,
        amount: expectedRoute.amount,
        bias: expectedRoute.bias,
        curve: expectedRoute.curve,
        smoothing: expectedRoute.smoothing,
        attack: expectedRoute.attack,
        release: expectedRoute.release,
        clampMin: expectedRoute.clampMin,
        clampMax: expectedRoute.clampMax,
        mode: expectedRoute.mode,
        notes: bestRoute.notes ?? expectedRoute.notes,
      };
      summary.residualAlignedCount += 1;
    }

    if (options.dedupeExact) {
      rankedIndices.slice(1).forEach((index) => {
        if (!removalSet.has(index) && routesAreExactValueMatch(expectedRoute, nextRoutes[index])) {
          removalSet.add(index);
          summary.duplicateRemovedCount += 1;
        }
      });
    }

    if (options.collapseLegacyOwnedDuplicates) {
      const remainingDuplicateIndices = rankedIndices.slice(1).filter((index) => !removalSet.has(index));
      if (remainingDuplicateIndices.length > 0 && remainingDuplicateIndices.every((index) => isLegacyOwnedRoute(nextRoutes[index]))) {
        remainingDuplicateIndices.forEach((index) => {
          removalSet.add(index);
          summary.collapsedLegacyOwnedDuplicateCount += 1;
        });
      }
    }

    if (options.removeLegacyShadowedByCustomExact) {
      const exactMatchIndices = rankedIndices.filter((index) => !removalSet.has(index) && routesAreExactValueMatch(expectedRoute, nextRoutes[index]));
      const hasCustomExactMatch = exactMatchIndices.some((index) => !isLegacyOwnedRoute(nextRoutes[index]));
      if (hasCustomExactMatch) {
        exactMatchIndices.forEach((index) => {
          if (isLegacyOwnedRoute(nextRoutes[index])) {
            removalSet.add(index);
            summary.removedLegacyShadowedByCustomExactCount += 1;
          }
        });
      }
    }

    if (options.collapseExactCustomDuplicates) {
      const exactCustomMatchIndices = rankedIndices.filter((index) => !removalSet.has(index) && !isLegacyOwnedRoute(nextRoutes[index]) && routesAreExactValueMatch(expectedRoute, nextRoutes[index]));
      if (exactCustomMatchIndices.length > 1) {
        exactCustomMatchIndices.slice(1).forEach((index) => {
          removalSet.add(index);
          summary.collapsedExactCustomDuplicateCount += 1;
        });
      }
    }

    if (options.disableNonDominantFocusedRoutes && options.keepRouteId && options.onlyKey === key) {
      rankedIndices.forEach((index) => {
        if (removalSet.has(index)) {
          return;
        }
        const route = nextRoutes[index];
        if (route.id === options.keepRouteId) {
          if (!route.enabled) {
            nextRoutes[index] = { ...route, enabled: true };
          }
          return;
        }
        if (route.enabled) {
          nextRoutes[index] = {
            ...route,
            enabled: false,
            notes: route.notes ? `${route.notes} | muted-focused-conflict:${key} keep=${options.keepRouteId}` : `muted-focused-conflict:${key} keep=${options.keepRouteId}`,
          };
          summary.disabledNonDominantFocusedRouteCount += 1;
        }
      });
    }
  });

  if (options.removeStaleLegacy) {
    const expectedKeys = new Set(expectedRoutes.map((route) => createRouteKey(route)));
    nextRoutes.forEach((route, index) => {
      if (!removalSet.has(index) && route.id.startsWith('legacy-') && !expectedKeys.has(createRouteKey(route))) {
        removalSet.add(index);
        summary.staleLegacyRemovedCount += 1;
      }
    });
  }

  const routes = nextRoutes.filter((_, index) => !removalSet.has(index));
  return { routes, summary };
}
