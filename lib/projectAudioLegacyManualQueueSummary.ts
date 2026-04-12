import type { ParticleConfig, PresetRecord, PresetSequenceItem, ProjectAudioLegacyManualQueueSummary } from '../types';
import { summarizeFocusedCustomConflict } from './audioReactiveValidation';
import { summarizeAudioLegacyRetirementImpact } from './audioReactiveRetirementImpact';
import { summarizeStoredFocusedConflict } from './audioReactiveRetirementMigration';

export function buildProjectAudioLegacyManualQueueSummary(
  config: ParticleConfig,
  presets: PresetRecord[] = [],
  presetSequence: PresetSequenceItem[] = [],
): ProjectAudioLegacyManualQueueSummary {
  const hotspots = summarizeAudioLegacyRetirementImpact(config, presets, presetSequence).customConflictHotspots;

  const currentEntries = hotspots
    .map((hotspot) => {
      const detail = summarizeFocusedCustomConflict(config, config.audioRoutes, hotspot.key);
      if (!detail) return null;
      if (detail.recommendation !== 'manual-custom-choice' && detail.recommendation !== 'manual-residual-merge') return null;
      return { key: hotspot.key, recommendation: detail.recommendation };
    })
    .filter((entry): entry is { key: string; recommendation: 'manual-custom-choice' | 'manual-residual-merge' } => Boolean(entry));

  const storedEntries = hotspots
    .map((hotspot) => {
      const summary = summarizeStoredFocusedConflict(presets, presetSequence, hotspot.key);
      const manualCount = summary.manualCustomChoiceCount + summary.manualResidualMergeCount;
      if (manualCount <= 0) return null;
      return {
        key: hotspot.key,
        manualCustomChoiceCount: summary.manualCustomChoiceCount,
        manualResidualMergeCount: summary.manualResidualMergeCount,
        presetContextCount: summary.presetContextCount,
        keyframeContextCount: summary.keyframeContextCount,
        manualCount,
      };
    })
    .filter((entry): entry is { key: string; manualCustomChoiceCount: number; manualResidualMergeCount: number; presetContextCount: number; keyframeContextCount: number; manualCount: number } => Boolean(entry))
    .sort((left, right) => right.manualCount - left.manualCount || left.key.localeCompare(right.key));

  const combinedHeadKeys = Array.from(new Set([...currentEntries.map((entry) => entry.key), ...storedEntries.map((entry) => entry.key)])).slice(0, 5);

  return {
    currentManualKeyCount: currentEntries.length,
    storedManualKeyCount: storedEntries.length,
    combinedKeyCount: Array.from(new Set([...currentEntries.map((entry) => entry.key), ...storedEntries.map((entry) => entry.key)])).length,
    currentManualCustomChoiceCount: currentEntries.filter((entry) => entry.recommendation === 'manual-custom-choice').length,
    currentManualResidualMergeCount: currentEntries.filter((entry) => entry.recommendation === 'manual-residual-merge').length,
    storedManualCustomChoiceCount: storedEntries.reduce((sum, entry) => sum + entry.manualCustomChoiceCount, 0),
    storedManualResidualMergeCount: storedEntries.reduce((sum, entry) => sum + entry.manualResidualMergeCount, 0),
    storedPresetContextCount: storedEntries.reduce((sum, entry) => sum + entry.presetContextCount, 0),
    storedKeyframeContextCount: storedEntries.reduce((sum, entry) => sum + entry.keyframeContextCount, 0),
    currentHeadKeys: currentEntries.slice(0, 5).map((entry) => entry.key),
    storedHeadKeys: storedEntries.slice(0, 5).map((entry) => entry.key),
    combinedHeadKeys,
  };
}
