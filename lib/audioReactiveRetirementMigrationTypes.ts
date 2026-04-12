import type { PresetRecord, PresetSequenceItem } from '../types';
import type { AudioLegacyAutoFixSummary } from './audioReactiveLegacyFixes';
import type { AudioFocusedCustomConflictRouteDetail } from './audioReactiveValidation';

export interface AudioLegacyStoredContextMigrationSummary extends AudioLegacyAutoFixSummary {
  updatedCount: number;
  reviewBeforeCount: number;
  reviewAfterCount: number;
  blockedBeforeCount: number;
  blockedAfterCount: number;
  residualBeforeCount: number;
  residualAfterCount: number;
  sampleUpdatedIds: string[];
}

export interface AudioLegacyStoredContextMigrationResult {
  presets: PresetRecord[];
  presetSequence: PresetSequenceItem[];
  presetsSummary: AudioLegacyStoredContextMigrationSummary;
  keyframesSummary: AudioLegacyStoredContextMigrationSummary;
}

export interface AudioStoredHotspotBatchSummary {
  updatedCount: number;
  appliedRecommendationCount: number;
  collapsedExactCustomDuplicateCount: number;
  removedLegacyShadowedByCustomExactCount: number;
  disabledNonDominantFocusedRouteCount: number;
  sampleApplied: string[];
  appliedKeys: string[];
}

export interface AudioStoredHotspotBatchResult {
  presets: PresetRecord[];
  presetSequence: PresetSequenceItem[];
  presetsSummary: AudioStoredHotspotBatchSummary;
  keyframesSummary: AudioStoredHotspotBatchSummary;
}

export interface AudioStoredKeepRouteReference {
  owner: 'legacy' | 'custom';
  amount: number;
  bias: number;
  smoothing: number;
  attack: number;
  release: number;
  clampMin: number;
  clampMax: number;
  mode: AudioFocusedCustomConflictRouteDetail['mode'];
  curve: AudioFocusedCustomConflictRouteDetail['curve'];
}

export interface AudioStoredFocusedConflictSummary {
  key: string;
  presetContextCount: number;
  keyframeContextCount: number;
  manualCustomChoiceCount: number;
  manualResidualMergeCount: number;
  autoResolvableCount: number;
  informationalCount: number;
  dominantRecommendation:
    | 'manual-custom-choice'
    | 'manual-residual-merge'
    | 'collapse-exact-custom'
    | 'remove-legacy-shadow'
    | 'none';
  sampleContexts: string[];
}
