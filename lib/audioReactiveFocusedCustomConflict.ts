import { createLegacyAudioRoutes } from './audioReactiveConfig';
import type { AudioModulationRoute } from '../types/audioReactive';
import {
  createRouteComparisonDelta,
  createRouteKey,
  getRouteOwner,
  roundMetric,
} from './audioReactiveValidationShared';
import type {
  AudioFocusedCustomConflictDetail,
  AudioFocusedCustomConflictRouteDetail,
} from './audioReactiveValidationTypes';

export function summarizeFocusedCustomConflict(
  config: Parameters<typeof createLegacyAudioRoutes>[0],
  currentRoutes: AudioModulationRoute[],
  key: string | null | undefined,
): AudioFocusedCustomConflictDetail | null {
  if (!key) {
    return null;
  }
  const expectedRoutes = createLegacyAudioRoutes(config);
  const expectedRoute = expectedRoutes.find((route) => createRouteKey(route) === key);
  const matchingRoutes = currentRoutes.filter((route) => createRouteKey(route) === key);
  if (!expectedRoute || matchingRoutes.length === 0) {
    return null;
  }

  const detailedRoutes: AudioFocusedCustomConflictRouteDetail[] = matchingRoutes
    .map((route): AudioFocusedCustomConflictRouteDetail => {
      const delta = createRouteComparisonDelta(expectedRoute, route);
      const score = delta.amountDelta + delta.biasDelta + delta.timingDelta;
      return {
        id: route.id,
        owner: getRouteOwner(route),
        enabled: route.enabled,
        notes: route.notes ?? '',
        amount: route.amount,
        bias: route.bias,
        smoothing: route.smoothing,
        attack: route.attack,
        release: route.release,
        clampMin: route.clampMin,
        clampMax: route.clampMax,
        mode: route.mode,
        curve: route.curve,
        score: roundMetric(score),
        amountDelta: roundMetric(delta.amountDelta),
        biasDelta: roundMetric(delta.biasDelta),
        timingDelta: roundMetric(delta.timingDelta),
      };
    })
    .sort((left, right) => left.score - right.score || left.id.localeCompare(right.id));

  const customRoutes = detailedRoutes.filter((route) => route.owner === 'custom');
  const legacyRoutes = detailedRoutes.filter((route) => route.owner === 'legacy');
  const exactCustomCount = customRoutes.filter(
    (route) => route.amountDelta < 1e-6 && route.biasDelta < 1e-6 && route.timingDelta < 1e-6,
  ).length;
  const exactLegacyCount = legacyRoutes.filter(
    (route) => route.amountDelta < 1e-6 && route.biasDelta < 1e-6 && route.timingDelta < 1e-6,
  ).length;
  const dominantRoute = detailedRoutes[0];
  const amountValues = detailedRoutes.map((route) => route.amount);
  const biasValues = detailedRoutes.map((route) => route.bias);
  const timingValues = detailedRoutes.map(
    (route) => route.smoothing + route.attack + route.release + route.clampMin + route.clampMax,
  );
  const amountSpread = roundMetric(Math.max(...amountValues) - Math.min(...amountValues));
  const biasSpread = roundMetric(Math.max(...biasValues) - Math.min(...biasValues));
  const timingSpread = roundMetric(Math.max(...timingValues) - Math.min(...timingValues));

  let recommendation: AudioFocusedCustomConflictDetail['recommendation'] = 'none';
  let recommendationReason = 'No focused conflict details available.';
  if (exactCustomCount > 1) {
    recommendation = 'collapse-exact-custom';
    recommendationReason = 'Multiple custom routes are already exact matches for this legacy key.';
  } else if (exactCustomCount >= 1 && exactLegacyCount >= 1) {
    recommendation = 'remove-legacy-shadow';
    recommendationReason = 'A custom exact match exists and the remaining exact duplicate is legacy-owned shadow.';
  } else if (customRoutes.length > 1) {
    recommendation =
      amountSpread <= 1e-6 && biasSpread <= 1e-6 && timingSpread <= 1e-6
        ? 'collapse-exact-custom'
        : 'manual-custom-choice';
    recommendationReason =
      recommendation === 'collapse-exact-custom'
        ? 'Custom routes are effectively identical after rounding; collapse to one route.'
        : 'Custom routes still differ in amount, bias, or timing; pick one dominant custom route manually.';
  } else if (customRoutes.length === 1) {
    recommendation = 'manual-residual-merge';
    recommendationReason = 'Only one custom route remains, but it still differs from the legacy baseline.';
  }

  return {
    key,
    legacyId: expectedRoute.id,
    dominantRouteId: dominantRoute?.id,
    dominantOwner: dominantRoute?.owner,
    recommendation,
    recommendationReason,
    customRouteCount: customRoutes.length,
    legacyRouteCount: legacyRoutes.length,
    exactCustomCount,
    exactLegacyCount,
    amountSpread,
    biasSpread,
    timingSpread,
    routes: detailedRoutes,
  };
}
