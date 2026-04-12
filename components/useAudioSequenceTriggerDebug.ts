import React from "react";

import {
  readSequenceAudioTriggerDebug,
  readSequenceAudioTriggerDebugHistory,
  type SequenceAudioTriggerDebugHistoryEntry,
  type SequenceAudioTriggerDebugSnapshot,
} from "../lib/audioReactiveDebug";

export interface AudioSequenceTriggerDebugState {
  snapshot: SequenceAudioTriggerDebugSnapshot | null;
  history: SequenceAudioTriggerDebugHistoryEntry[];
}

export function useAudioSequenceTriggerDebug(
  audioEnabled: boolean,
  audioRoutesEnabled: boolean,
): AudioSequenceTriggerDebugState {
  const [sequenceTriggerDebugState, setSequenceTriggerDebugState] =
    React.useState<AudioSequenceTriggerDebugState>({
      snapshot: null,
      history: [],
    });

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const syncDebug = () => {
      setSequenceTriggerDebugState({
        snapshot: readSequenceAudioTriggerDebug(),
        history: readSequenceAudioTriggerDebugHistory(),
      });
    };

    syncDebug();
    const intervalId = window.setInterval(syncDebug, 160);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [audioEnabled, audioRoutesEnabled]);

  return sequenceTriggerDebugState;
}
