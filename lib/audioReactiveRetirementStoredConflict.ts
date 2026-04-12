import type { PresetRecord, PresetSequenceItem } from '../types';
import { summarizeFocusedCustomConflict } from './audioReactiveValidation';
import type { AudioStoredFocusedConflictSummary } from './audioReactiveRetirementMigrationTypes';

export function summarizeStoredFocusedConflict(
  presets: PresetRecord[],
  presetSequence: PresetSequenceItem[],
  key: string,
  scope: 'presets' | 'keyframes' | 'all' = 'all',
): AudioStoredFocusedConflictSummary {
  const summary: AudioStoredFocusedConflictSummary = {
    key,
    presetContextCount: 0,
    keyframeContextCount: 0,
    manualCustomChoiceCount: 0,
    manualResidualMergeCount: 0,
    autoResolvableCount: 0,
    informationalCount: 0,
    dominantRecommendation: 'none',
    sampleContexts: [],
  };

  const note = (
    label: string,
    recommendation: AudioStoredFocusedConflictSummary['dominantRecommendation'],
  ) => {
    const tagged = `${label} [${recommendation}]`;
    if (summary.sampleContexts.length < 6 && !summary.sampleContexts.includes(tagged)) {
      summary.sampleContexts.push(tagged);
    }
  };

  if (scope !== 'keyframes') {
    presets.forEach((preset) => {
      const detail = summarizeFocusedCustomConflict(preset.config, preset.config.audioRoutes, key);
      if (!detail) return;
      summary.presetContextCount += 1;
      if (detail.recommendation === 'manual-custom-choice') {
        summary.manualCustomChoiceCount += 1;
        note(preset.name, 'manual-custom-choice');
      } else if (detail.recommendation === 'manual-residual-merge') {
        summary.manualResidualMergeCount += 1;
        note(preset.name, 'manual-residual-merge');
      } else if (
        detail.recommendation === 'collapse-exact-custom'
        || detail.recommendation === 'remove-legacy-shadow'
      ) {
        summary.autoResolvableCount += 1;
        note(preset.name, detail.recommendation);
      } else {
        summary.informationalCount += 1;
        note(preset.name, 'none');
      }
    });
  }

  if (scope !== 'presets') {
    presetSequence.forEach((item, index) => {
      if (!item.keyframeConfig) return;
      const detail = summarizeFocusedCustomConflict(item.keyframeConfig, item.keyframeConfig.audioRoutes, key);
      if (!detail) return;
      const label = item.label?.trim() || `Sequence ${index + 1}`;
      summary.keyframeContextCount += 1;
      if (detail.recommendation === 'manual-custom-choice') {
        summary.manualCustomChoiceCount += 1;
        note(label, 'manual-custom-choice');
      } else if (detail.recommendation === 'manual-residual-merge') {
        summary.manualResidualMergeCount += 1;
        note(label, 'manual-residual-merge');
      } else if (
        detail.recommendation === 'collapse-exact-custom'
        || detail.recommendation === 'remove-legacy-shadow'
      ) {
        summary.autoResolvableCount += 1;
        note(label, detail.recommendation);
      } else {
        summary.informationalCount += 1;
        note(label, 'none');
      }
    });
  }

  summary.dominantRecommendation =
    summary.manualResidualMergeCount > 0
      ? 'manual-residual-merge'
      : summary.manualCustomChoiceCount > 0
        ? 'manual-custom-choice'
        : summary.autoResolvableCount > 0
          ? 'collapse-exact-custom'
          : 'none';

  return summary;
}
