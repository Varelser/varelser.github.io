import type { AudioLegacyCleanupState } from './audioLegacyCleanupState';
import type { ProjectAudioLegacyCloseoutSummary } from '../types';

export interface AudioLegacyFinalPanelState {
  compactCloseoutReady: boolean;
  shouldCollapseAdvancedSections: boolean;
  shouldShowTargetHostReminder: boolean;
}

export function buildAudioLegacyFinalPanelState(
  cleanupState: AudioLegacyCleanupState,
  closeoutSummary: ProjectAudioLegacyCloseoutSummary,
): AudioLegacyFinalPanelState {
  const compactCloseoutReady = cleanupState.cleanupReady && closeoutSummary.status === 'ready' && !closeoutSummary.modeDrift;

  return {
    compactCloseoutReady,
    shouldCollapseAdvancedSections: compactCloseoutReady,
    shouldShowTargetHostReminder: compactCloseoutReady && closeoutSummary.requiresTargetHostProof,
  };
}
