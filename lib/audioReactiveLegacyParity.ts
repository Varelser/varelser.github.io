import { createLegacyAudioRoutes } from './audioReactiveConfig';
import type { AudioModulationRoute } from '../types/audioReactive';
import {
  createRouteComparisonDelta,
  createRouteKey,
  createRouteMap,
  isLegacyOwnedRoute,
} from './audioReactiveValidationShared';
import type {
  AudioLegacyCustomConflictCandidate,
  AudioLegacyDeprecationCandidate,
  AudioLegacyParitySummary,
} from './audioReactiveValidationTypes';

export function summarizeLegacyAudioRouteParity(
  config: Parameters<typeof createLegacyAudioRoutes>[0],
  currentRoutes: AudioModulationRoute[],
): AudioLegacyParitySummary {
  const expectedRoutes = createLegacyAudioRoutes(config);
  const currentRouteMap = createRouteMap(currentRoutes);
  const expectedKeys = new Set<string>();

  let exactMatchCount = 0;
  let partialMatchCount = 0;
  let missingCount = 0;
  let duplicateMatchCount = 0;
  let reviewDuplicateOnlyCount = 0;
  let reviewResidualOnlyCount = 0;
  let reviewMixedCount = 0;
  let reviewCollapsibleDuplicateCount = 0;
  let reviewShadowedByCustomExactCount = 0;
  let reviewCustomConflictCount = 0;
  const sampleMissing: string[] = [];
  const sampleCollapsibleReview: string[] = [];
  const sampleCustomConflicts: string[] = [];
  const sampleResiduals: AudioLegacyParitySummary['sampleResiduals'] = [];
  const deprecationCandidates: AudioLegacyDeprecationCandidate[] = [];
  const customConflictCandidates: AudioLegacyParitySummary['customConflictCandidates'] = [];

  expectedRoutes.forEach((route) => {
    const key = createRouteKey(route);
    expectedKeys.add(key);
    const matches = currentRouteMap.get(key) ?? [];
    if (matches.length === 0) {
      missingCount += 1;
      if (sampleMissing.length < 6) {
        sampleMissing.push(key);
      }
      deprecationCandidates.push({
        legacyId: route.id,
        key,
        status: 'blocked',
        reason: 'No current route matches this legacy slider yet.',
        amountDelta: 0,
        biasDelta: 0,
        timingDelta: 0,
      });
      return;
    }
    const hasDuplicateMatches = matches.length > 1;
    if (hasDuplicateMatches) {
      duplicateMatchCount += 1;
    }

    const ranked = [...matches].sort((left, right) => {
      const leftDelta = createRouteComparisonDelta(route, left);
      const rightDelta = createRouteComparisonDelta(route, right);
      return leftDelta.amountDelta + leftDelta.biasDelta + leftDelta.timingDelta
        - (rightDelta.amountDelta + rightDelta.biasDelta + rightDelta.timingDelta);
    });
    const best = ranked[0];
    const extraMatches = ranked.slice(1);
    const exactMatches = ranked.filter((entry) => {
      const delta = createRouteComparisonDelta(route, entry);
      return delta.amountDelta < 1e-6 && delta.biasDelta < 1e-6 && delta.timingDelta < 1e-6;
    });
    const duplicateExtrasAreLegacyOwned =
      extraMatches.length > 0 && extraMatches.every((entry) => isLegacyOwnedRoute(entry));
    const exactCustomMatches = exactMatches.filter((entry) => !isLegacyOwnedRoute(entry));
    const exactLegacyMatches = exactMatches.filter((entry) => isLegacyOwnedRoute(entry));
    const hasCustomExactMatch = exactCustomMatches.length > 0;
    const hasLegacyExactMatch = exactLegacyMatches.length > 0;
    const hasCustomDuplicateConflict = extraMatches.some((entry) => !isLegacyOwnedRoute(entry));
    const delta = createRouteComparisonDelta(route, best);
    const isExact = delta.amountDelta < 1e-6 && delta.biasDelta < 1e-6 && delta.timingDelta < 1e-6;
    if (hasCustomExactMatch || hasCustomDuplicateConflict) {
      if (sampleCustomConflicts.length < 6) {
        sampleCustomConflicts.push(key);
      }
      customConflictCandidates.push({
        legacyId: route.id,
        key,
        conflictKind:
          hasCustomExactMatch && hasLegacyExactMatch
            ? 'shadowed-by-custom-exact'
            : hasCustomDuplicateConflict && !isExact
              ? 'mixed-custom-conflict'
              : 'other-custom-duplicate-conflict',
        routeId: best.id,
        customRouteCount: ranked.filter((entry) => !isLegacyOwnedRoute(entry)).length,
        legacyRouteCount: ranked.filter((entry) => isLegacyOwnedRoute(entry)).length,
        exactCustomCount: exactCustomMatches.length,
        exactLegacyCount: exactLegacyMatches.length,
        amountDelta: Number(delta.amountDelta.toFixed(3)),
        biasDelta: Number(delta.biasDelta.toFixed(3)),
        timingDelta: Number(delta.timingDelta.toFixed(3)),
      });
    }
    if (isExact) {
      exactMatchCount += 1;
      if (hasDuplicateMatches) {
        reviewDuplicateOnlyCount += 1;
        if (duplicateExtrasAreLegacyOwned) {
          reviewCollapsibleDuplicateCount += 1;
          if (sampleCollapsibleReview.length < 6) {
            sampleCollapsibleReview.push(key);
          }
        }
        if (hasCustomExactMatch && hasLegacyExactMatch) {
          reviewShadowedByCustomExactCount += 1;
        }
        if (hasCustomDuplicateConflict) {
          reviewCustomConflictCount += 1;
        }
      }
      deprecationCandidates.push({
        legacyId: route.id,
        key,
        status: hasDuplicateMatches ? 'review' : 'safe',
        reason: hasDuplicateMatches
          ? 'Exact route exists, but duplicate current routes still need cleanup.'
          : 'Exact route exists; safe candidate for legacy slider shrink.',
        routeId: best.id,
        amountDelta: 0,
        biasDelta: 0,
        timingDelta: 0,
      });
      return;
    }
    partialMatchCount += 1;
    if (hasDuplicateMatches) {
      reviewMixedCount += 1;
      if (duplicateExtrasAreLegacyOwned) {
        reviewCollapsibleDuplicateCount += 1;
        if (sampleCollapsibleReview.length < 6) {
          sampleCollapsibleReview.push(key);
        }
      }
      if (hasCustomExactMatch && hasLegacyExactMatch) {
        reviewShadowedByCustomExactCount += 1;
      }
      if (hasCustomDuplicateConflict) {
        reviewCustomConflictCount += 1;
      }
    } else {
      reviewResidualOnlyCount += 1;
    }
    if (sampleResiduals.length < 6) {
      sampleResiduals.push({
        key,
        routeId: best.id,
        amountDelta: Number(delta.amountDelta.toFixed(3)),
        biasDelta: Number(delta.biasDelta.toFixed(3)),
        timingDelta: Number(delta.timingDelta.toFixed(3)),
      });
    }
    deprecationCandidates.push({
      legacyId: route.id,
      key,
      status: 'review',
      reason:
        matches.length > 1
          ? 'Closest route still has residuals and duplicate matches.'
          : 'Closest route exists, but amount/bias/timing residual remains.',
      routeId: best.id,
      amountDelta: Number(delta.amountDelta.toFixed(3)),
      biasDelta: Number(delta.biasDelta.toFixed(3)),
      timingDelta: Number(delta.timingDelta.toFixed(3)),
    });
  });

  let staleLegacyCount = 0;
  let extraCustomCount = 0;
  currentRoutes.forEach((route) => {
    const key = createRouteKey(route);
    if (expectedKeys.has(key)) {
      return;
    }
    if (route.id.startsWith('legacy-')) {
      staleLegacyCount += 1;
      return;
    }
    extraCustomCount += 1;
  });

  const deprecationOrder = [...deprecationCandidates].sort((left, right) => {
    const rank = (candidate: AudioLegacyDeprecationCandidate) =>
      candidate.status === 'safe' ? 0 : candidate.status === 'review' ? 1 : 2;
    const statusDelta = rank(left) - rank(right);
    if (statusDelta !== 0) {
      return statusDelta;
    }
    const leftScore = left.amountDelta + left.biasDelta + left.timingDelta;
    const rightScore = right.amountDelta + right.biasDelta + right.timingDelta;
    if (Math.abs(leftScore - rightScore) > 1e-6) {
      return leftScore - rightScore;
    }
    return left.key.localeCompare(right.key);
  });

  return {
    legacyRouteCount: expectedRoutes.length,
    exactMatchCount,
    partialMatchCount,
    missingCount,
    duplicateMatchCount,
    staleLegacyCount,
    extraCustomCount,
    residualCount: partialMatchCount + missingCount + duplicateMatchCount + staleLegacyCount,
    safeToDeprecateCount: deprecationOrder.filter((candidate) => candidate.status === 'safe').length,
    reviewBeforeDeprecateCount: deprecationOrder.filter((candidate) => candidate.status === 'review').length,
    reviewDuplicateOnlyCount,
    reviewResidualOnlyCount,
    reviewMixedCount,
    reviewCollapsibleDuplicateCount,
    reviewShadowedByCustomExactCount,
    reviewCustomConflictCount,
    blockedDeprecationCount: deprecationOrder.filter((candidate) => candidate.status === 'blocked').length,
    sampleMissing,
    sampleCollapsibleReview,
    sampleCustomConflicts,
    sampleResiduals,
    deprecationOrder,
    customConflictCandidates: [...customConflictCandidates].sort((left, right) => {
      const rank = (kind: AudioLegacyCustomConflictCandidate['conflictKind']) =>
        kind === 'mixed-custom-conflict' ? 0 : kind === 'other-custom-duplicate-conflict' ? 1 : 2;
      const kindDelta = rank(left.conflictKind) - rank(right.conflictKind);
      if (kindDelta !== 0) {
        return kindDelta;
      }
      const leftScore = left.amountDelta + left.biasDelta + left.timingDelta;
      const rightScore = right.amountDelta + right.biasDelta + right.timingDelta;
      if (Math.abs(leftScore - rightScore) > 1e-6) {
        return rightScore - leftScore;
      }
      return left.key.localeCompare(right.key);
    }),
  };
}
