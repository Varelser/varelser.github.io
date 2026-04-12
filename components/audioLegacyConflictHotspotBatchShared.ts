import type { AudioHotspotBatchSummary } from "./controlPanelTabsAudioLegacy";
import type { HotspotBatchStateSummary } from "./audioLegacyConflictBatchActionTypes";

export function createEmptyHotspotSummary(
  scope: AudioHotspotBatchSummary["scope"],
  limit: number,
  before: HotspotBatchStateSummary,
): AudioHotspotBatchSummary {
  return {
    scope,
    limit,
    beforeHotspotCount: before.hotspotCount,
    afterHotspotCount: before.hotspotCount,
    beforeContextCount: before.contextCount,
    afterContextCount: before.contextCount,
    beforePendingHotspotCount: before.pendingHotspotCount,
    afterPendingHotspotCount: before.pendingHotspotCount,
    beforePendingContextCount: before.pendingContextCount,
    afterPendingContextCount: before.pendingContextCount,
    beforePendingSamples: before.pendingSamples,
    afterPendingSamples: before.pendingSamples,
    currentAppliedCount: 0,
    currentSamples: [],
    storedPresetUpdatedCount: 0,
    storedKeyframeUpdatedCount: 0,
    storedAppliedCount: 0,
    storedSamples: [],
    createdAt: new Date().toISOString(),
  };
}
