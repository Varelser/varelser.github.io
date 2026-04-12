import type { AudioManualBatchSummary } from '../components/controlPanelTabsAudioLegacy';

export function formatAudioManualBatchSummary(summary: AudioManualBatchSummary) {
  return [
    `scope=${summary.scope}`,
    `limit=${summary.limit}`,
    `batchLabel=${summary.batchLabel ?? 'none'}`,
    `previewProfile=${summary.previewProfile ?? 'none'}`,
    `current=${summary.beforeCurrentManualKeyCount}->${summary.afterCurrentManualKeyCount}`,
    `stored=${summary.beforeStoredManualKeyCount}->${summary.afterStoredManualKeyCount}`,
    `pendingCurrent=${summary.beforePendingCurrentManualKeyCount}->${summary.afterPendingCurrentManualKeyCount}`,
    `pendingStored=${summary.beforePendingStoredManualKeyCount}->${summary.afterPendingStoredManualKeyCount}`,
    `pendingCurrentSamplesBefore=${summary.beforePendingCurrentSamples.join(' | ') || 'none'}`,
    `pendingCurrentSamplesAfter=${summary.afterPendingCurrentSamples.join(' | ') || 'none'}`,
    `pendingStoredSamplesBefore=${summary.beforePendingStoredSamples.join(' | ') || 'none'}`,
    `pendingStoredSamplesAfter=${summary.afterPendingStoredSamples.join(' | ') || 'none'}`,
    `currentApplied=${summary.currentAppliedCount}`,
    `storedApplied=${summary.storedAppliedCount}`,
    `currentSamples=${summary.currentSamples.join(' | ') || 'none'}`,
    `storedSamples=${summary.storedSamples.join(' | ') || 'none'}`,
    `previewKeyCount=${summary.previewKeyCount ?? 0}`,
    `previewPresetUpdated=${summary.previewPresetUpdatedCount ?? 0}`,
    `previewKeyframeUpdated=${summary.previewKeyframeUpdatedCount ?? 0}`,
    `previewDeltaReview=${summary.previewTotalReviewDelta ?? 0}`,
    `previewDeltaBlocked=${summary.previewTotalBlockedDelta ?? 0}`,
    `previewDeltaResidual=${summary.previewTotalResidualDelta ?? 0}`,
    `previewAppliedKeys=${summary.previewAppliedKeys?.join(' | ') || 'none'}`,
    `previewSampleUpdatedIds=${summary.previewSampleUpdatedIds?.join(' | ') || 'none'}`,
    `createdAt=${summary.createdAt}`,
  ].join('\n');
}
