import { useAudioLegacyConflictHotspotBatchActions } from "./useAudioLegacyConflictHotspotBatchActions";
import { useAudioLegacyConflictManualBatchActions } from "./useAudioLegacyConflictManualBatchActions";
import type { UseAudioLegacyConflictBatchActionsArgs } from "./audioLegacyConflictBatchActionTypes";

export function useAudioLegacyConflictBatchActions(args: UseAudioLegacyConflictBatchActionsArgs) {
  const hotspotActions = useAudioLegacyConflictHotspotBatchActions(args);
  const manualActions = useAudioLegacyConflictManualBatchActions(args);
  return {
    ...hotspotActions,
    ...manualActions,
  };
}
