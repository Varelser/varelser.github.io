import type { AudioModulationRoute } from '../types/audioReactive';

export interface AudioRouteBundleDiffSample {
  key: string;
  incomingRouteId?: string;
  currentRouteId?: string;
  amountDelta?: number;
  biasDelta?: number;
  timingDelta?: number;
}

export interface AudioRouteBundleDiffSummary {
  currentRouteCount: number;
  incomingRouteCount: number;
  overlappingKeyCount: number;
  exactValueMatchCount: number;
  changedMatchCount: number;
  addedCount: number;
  removedCount: number;
  sampleAdded: AudioRouteBundleDiffSample[];
  sampleRemoved: AudioRouteBundleDiffSample[];
  sampleChanged: AudioRouteBundleDiffSample[];
}

export interface AudioRouteBundleValidation {
  ok: boolean;
  routeCount: number;
  scope: 'all' | 'visible' | 'unknown';
  parseError?: string;
  duplicateIds: string[];
  unknownTargets: string[];
  invalidSources: string[];
  invalidCurves: string[];
  invalidModes: string[];
  normalization: {
    normalizedSourceCount: number;
    normalizedCurveCount: number;
    normalizedModeCount: number;
    defaultedTargetCount: number;
    clampedAmountCount: number;
    clampedBiasCount: number;
    clampedSmoothingCount: number;
    clampedAttackCount: number;
    clampedReleaseCount: number;
    clampedClampMinCount: number;
    clampedClampMaxCount: number;
  };
  diff?: AudioRouteBundleDiffSummary;
}

export interface AudioLegacyDeprecationCandidate {
  legacyId: string;
  key: string;
  status: 'safe' | 'review' | 'blocked';
  reason: string;
  routeId?: string;
  amountDelta: number;
  biasDelta: number;
  timingDelta: number;
}

export interface AudioLegacyCustomConflictCandidate {
  legacyId: string;
  key: string;
  conflictKind:
    | 'shadowed-by-custom-exact'
    | 'other-custom-duplicate-conflict'
    | 'mixed-custom-conflict';
  routeId?: string;
  customRouteCount: number;
  legacyRouteCount: number;
  exactCustomCount: number;
  exactLegacyCount: number;
  amountDelta: number;
  biasDelta: number;
  timingDelta: number;
}

export interface AudioFocusedCustomConflictRouteDetail {
  id: string;
  owner: 'legacy' | 'custom';
  enabled: boolean;
  notes: string;
  amount: number;
  bias: number;
  smoothing: number;
  attack: number;
  release: number;
  clampMin: number;
  clampMax: number;
  mode: AudioModulationRoute['mode'];
  curve: AudioModulationRoute['curve'];
  score: number;
  amountDelta: number;
  biasDelta: number;
  timingDelta: number;
}

export interface AudioFocusedCustomConflictDetail {
  key: string;
  legacyId?: string;
  dominantRouteId?: string;
  dominantOwner?: 'legacy' | 'custom';
  recommendation:
    | 'collapse-exact-custom'
    | 'remove-legacy-shadow'
    | 'manual-residual-merge'
    | 'manual-custom-choice'
    | 'none';
  recommendationReason: string;
  customRouteCount: number;
  legacyRouteCount: number;
  exactCustomCount: number;
  exactLegacyCount: number;
  amountSpread: number;
  biasSpread: number;
  timingSpread: number;
  routes: AudioFocusedCustomConflictRouteDetail[];
}

export interface AudioLegacyParitySummary {
  legacyRouteCount: number;
  exactMatchCount: number;
  partialMatchCount: number;
  missingCount: number;
  duplicateMatchCount: number;
  staleLegacyCount: number;
  extraCustomCount: number;
  residualCount: number;
  safeToDeprecateCount: number;
  reviewBeforeDeprecateCount: number;
  reviewDuplicateOnlyCount: number;
  reviewResidualOnlyCount: number;
  reviewMixedCount: number;
  reviewCollapsibleDuplicateCount: number;
  reviewShadowedByCustomExactCount: number;
  reviewCustomConflictCount: number;
  blockedDeprecationCount: number;
  sampleMissing: string[];
  sampleCollapsibleReview: string[];
  sampleCustomConflicts: string[];
  sampleResiduals: Array<{
    key: string;
    routeId: string;
    amountDelta: number;
    biasDelta: number;
    timingDelta: number;
  }>;
  deprecationOrder: AudioLegacyDeprecationCandidate[];
  customConflictCandidates: AudioLegacyCustomConflictCandidate[];
}
