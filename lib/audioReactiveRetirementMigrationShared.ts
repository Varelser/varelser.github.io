import type { ParticleConfig } from '../types';
import type { AudioLegacyAutoFixSummary } from './audioReactiveLegacyFixes';
import { applyLegacyAudioRouteAutoFixes } from './audioReactiveLegacyFixes';
import { summarizeFocusedCustomConflict } from './audioReactiveValidation';
import type { AudioFocusedCustomConflictRouteDetail } from './audioReactiveValidation';
import type {
  AudioLegacyStoredContextMigrationSummary,
  AudioStoredHotspotBatchSummary,
  AudioStoredKeepRouteReference,
} from './audioReactiveRetirementMigrationTypes';

export function createEmptySummary(): AudioLegacyStoredContextMigrationSummary {
  return {
    updatedCount: 0,
    missingAddedCount: 0,
    residualAlignedCount: 0,
    duplicateRemovedCount: 0,
    collapsedLegacyOwnedDuplicateCount: 0,
    removedLegacyShadowedByCustomExactCount: 0,
    collapsedExactCustomDuplicateCount: 0,
    disabledNonDominantFocusedRouteCount: 0,
    staleLegacyRemovedCount: 0,
    reviewBeforeCount: 0,
    reviewAfterCount: 0,
    blockedBeforeCount: 0,
    blockedAfterCount: 0,
    residualBeforeCount: 0,
    residualAfterCount: 0,
    sampleUpdatedIds: [],
  };
}

export function addAutoFixSummary(
  target: AudioLegacyStoredContextMigrationSummary,
  source: AudioLegacyAutoFixSummary,
) {
  target.missingAddedCount += source.missingAddedCount;
  target.residualAlignedCount += source.residualAlignedCount;
  target.duplicateRemovedCount += source.duplicateRemovedCount;
  target.collapsedLegacyOwnedDuplicateCount += source.collapsedLegacyOwnedDuplicateCount;
  target.removedLegacyShadowedByCustomExactCount += source.removedLegacyShadowedByCustomExactCount;
  target.collapsedExactCustomDuplicateCount += source.collapsedExactCustomDuplicateCount;
  target.disabledNonDominantFocusedRouteCount += source.disabledNonDominantFocusedRouteCount;
  target.staleLegacyRemovedCount += source.staleLegacyRemovedCount;
}

export function createEmptyHotspotBatchSummary(): AudioStoredHotspotBatchSummary {
  return {
    updatedCount: 0,
    appliedRecommendationCount: 0,
    collapsedExactCustomDuplicateCount: 0,
    removedLegacyShadowedByCustomExactCount: 0,
    disabledNonDominantFocusedRouteCount: 0,
    sampleApplied: [],
    appliedKeys: [],
  };
}

export function pushSample(target: string[], value: string, limit = 8) {
  if (!target.includes(value) && target.length < limit) {
    target.push(value);
  }
}

export function pushAppliedKey(target: string[], key: string) {
  if (key && !target.includes(key)) {
    target.push(key);
  }
}

export function applyFocusedRecommendation(
  config: ParticleConfig,
  routes: ParticleConfig['audioRoutes'],
  key: string,
): { routes: ParticleConfig['audioRoutes']; applied: boolean; label: string } {
  const detail = summarizeFocusedCustomConflict(config, routes, key);
  if (!detail) {
    return { routes, applied: false, label: 'none' };
  }
  if (detail.recommendation === 'collapse-exact-custom') {
    const fix = applyLegacyAudioRouteAutoFixes(config, routes, {
      collapseExactCustomDuplicates: true,
      onlyKey: key,
    });
    return {
      routes: fix.routes,
      applied: routesChanged(routes, fix.routes),
      label: 'collapse-exact-custom',
    };
  }
  if (detail.recommendation === 'remove-legacy-shadow') {
    const fix = applyLegacyAudioRouteAutoFixes(config, routes, {
      removeLegacyShadowedByCustomExact: true,
      onlyKey: key,
    });
    return {
      routes: fix.routes,
      applied: routesChanged(routes, fix.routes),
      label: 'remove-legacy-shadow',
    };
  }
  if (detail.recommendation === 'manual-residual-merge') {
    const fix = applyLegacyAudioRouteAutoFixes(config, routes, { alignResiduals: true, onlyKey: key });
    return {
      routes: fix.routes,
      applied: routesChanged(routes, fix.routes),
      label: 'align-residuals',
    };
  }
  if (detail.dominantRouteId) {
    const fix = applyLegacyAudioRouteAutoFixes(config, routes, {
      disableNonDominantFocusedRoutes: true,
      onlyKey: key,
      keepRouteId: detail.dominantRouteId,
    });
    return {
      routes: fix.routes,
      applied: routesChanged(routes, fix.routes),
      label: 'mute-focused-conflict',
    };
  }
  return { routes, applied: false, label: 'none' };
}

export function createStoredKeepReferenceScore(
  reference: AudioStoredKeepRouteReference,
  route: AudioFocusedCustomConflictRouteDetail,
) {
  return (reference.owner === route.owner ? 0 : 3)
    + Math.abs(reference.amount - route.amount)
    + Math.abs(reference.bias - route.bias)
    + Math.abs(reference.smoothing - route.smoothing)
    + Math.abs(reference.attack - route.attack)
    + Math.abs(reference.release - route.release)
    + Math.abs(reference.clampMin - route.clampMin)
    + Math.abs(reference.clampMax - route.clampMax)
    + (reference.mode === route.mode ? 0 : 1)
    + (reference.curve === route.curve ? 0 : 1);
}

export function applyKeepRouteReference(
  config: ParticleConfig,
  routes: ParticleConfig['audioRoutes'],
  key: string,
  reference: AudioStoredKeepRouteReference,
): { routes: ParticleConfig['audioRoutes']; applied: boolean; label: string } {
  const detail = summarizeFocusedCustomConflict(config, routes, key);
  if (!detail) {
    return { routes, applied: false, label: 'none' };
  }
  const ranked = [...detail.routes].sort(
    (left, right) =>
      createStoredKeepReferenceScore(reference, left)
      - createStoredKeepReferenceScore(reference, right),
  );
  const keep = ranked[0];
  if (!keep) {
    return { routes, applied: false, label: 'none' };
  }
  const fix = applyLegacyAudioRouteAutoFixes(config, routes, {
    disableNonDominantFocusedRoutes: true,
    onlyKey: key,
    keepRouteId: keep.id,
  });
  return {
    routes: fix.routes,
    applied: routesChanged(routes, fix.routes),
    label: 'mute-focused-conflict',
  };
}

export function addHotspotFixSummary(target: AudioStoredHotspotBatchSummary, source: AudioLegacyAutoFixSummary) {
  target.collapsedExactCustomDuplicateCount += source.collapsedExactCustomDuplicateCount;
  target.removedLegacyShadowedByCustomExactCount += source.removedLegacyShadowedByCustomExactCount;
  target.disabledNonDominantFocusedRouteCount += source.disabledNonDominantFocusedRouteCount;
}

export function routesChanged(left: ParticleConfig['audioRoutes'], right: ParticleConfig['audioRoutes']) {
  return JSON.stringify(left) !== JSON.stringify(right);
}
