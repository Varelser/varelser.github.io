import type { AudioHotspotBatchSummary, AudioManualBatchSummary } from "../components/controlPanelTabsAudioLegacy";

export interface AudioLegacyCleanupStateArgs {
  focusedConflictKey: string | null;
  hotspotKeys: string[];
  manualConflictKeys: string[];
  storedManualConflictKeys: string[];
  lastHotspotBatchSummary: AudioHotspotBatchSummary | null;
  lastManualBatchSummary: AudioManualBatchSummary | null;
}

export interface AudioLegacyCleanupState {
  hotspotCount: number;
  manualConflictCount: number;
  storedManualConflictCount: number;
  cleanupReady: boolean;
  focusedConflictTracked: boolean;
  shouldAutoClearFocusedConflict: boolean;
  shouldAutoDismissLastHotspotBatch: boolean;
  shouldAutoDismissLastManualBatch: boolean;
}

export function buildAudioLegacyCleanupState({
  focusedConflictKey,
  hotspotKeys,
  manualConflictKeys,
  storedManualConflictKeys,
  lastHotspotBatchSummary,
  lastManualBatchSummary,
}: AudioLegacyCleanupStateArgs): AudioLegacyCleanupState {
  const hotspotCount = hotspotKeys.length;
  const manualConflictCount = manualConflictKeys.length;
  const storedManualConflictCount = storedManualConflictKeys.length;
  const cleanupReady = hotspotCount === 0 && manualConflictCount === 0 && storedManualConflictCount === 0;

  const trackedKeys = new Set<string>([
    ...hotspotKeys,
    ...manualConflictKeys,
    ...storedManualConflictKeys,
  ]);
  const focusedConflictTracked = focusedConflictKey ? trackedKeys.has(focusedConflictKey) : false;

  return {
    hotspotCount,
    manualConflictCount,
    storedManualConflictCount,
    cleanupReady,
    focusedConflictTracked,
    shouldAutoClearFocusedConflict: Boolean(focusedConflictKey) && !focusedConflictTracked,
    shouldAutoDismissLastHotspotBatch:
      Boolean(lastHotspotBatchSummary)
      && hotspotCount === 0
      && (lastHotspotBatchSummary?.afterPendingHotspotCount ?? 0) === 0
      && (lastHotspotBatchSummary?.afterPendingContextCount ?? 0) === 0,
    shouldAutoDismissLastManualBatch:
      Boolean(lastManualBatchSummary)
      && manualConflictCount === 0
      && storedManualConflictCount === 0
      && (lastManualBatchSummary?.afterPendingCurrentManualKeyCount ?? 0) === 0
      && (lastManualBatchSummary?.afterPendingStoredManualKeyCount ?? 0) === 0,
  };
}
