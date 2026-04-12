import type { ProjectAudioLegacyCloseoutSummary, ProjectAudioLegacyManualQueueSummary, ProjectAudioLegacyStoredQueuePreviewSummary } from '../types';

export interface ProjectAudioLegacyMigrationPacket {
  status: 'blocked' | 'cleanup-required' | 'proof-required' | 'ready';
  currentManualKeyCount: number;
  storedManualKeyCount: number;
  combinedKeyCount: number;
  stagedStoredPreviewKeyCount: number;
  stagedStoredPreviewUpdatedCount: number;
  suggestedActions: string[];
  currentHeadKeys: string[];
  storedHeadKeys: string[];
  combinedHeadKeys: string[];
}

export function buildProjectAudioLegacyMigrationPacket(
  closeoutSummary: ProjectAudioLegacyCloseoutSummary,
  manualQueueSummary?: ProjectAudioLegacyManualQueueSummary,
  storedQueuePreviewSummary?: ProjectAudioLegacyStoredQueuePreviewSummary,
): ProjectAudioLegacyMigrationPacket {
  const currentManualKeyCount = manualQueueSummary?.currentManualKeyCount ?? 0;
  const storedManualKeyCount = manualQueueSummary?.storedManualKeyCount ?? 0;
  const combinedKeyCount = manualQueueSummary?.combinedKeyCount ?? 0;
  const stagedStoredPreviewKeyCount = storedQueuePreviewSummary?.keyCount ?? 0;
  const stagedStoredPreviewUpdatedCount = storedQueuePreviewSummary?.totalUpdatedCount ?? 0;
  const suggestedActions: string[] = [];
  if (currentManualKeyCount > 0) suggestedActions.push(`Resolve current manual queue (${currentManualKeyCount}).`);
  if (storedManualKeyCount > 0) suggestedActions.push(`Resolve stored manual queue (${storedManualKeyCount}).`);
  if (stagedStoredPreviewKeyCount > 0) suggestedActions.push(`Apply or verify stored queue preview (${stagedStoredPreviewKeyCount} keys / ${stagedStoredPreviewUpdatedCount} updates).`);
  if (closeoutSummary.currentResidualCount > 0) suggestedActions.push(`Collapse remaining residual routes (${closeoutSummary.currentResidualCount}).`);
  if (closeoutSummary.requiresTargetHostProof) suggestedActions.push('Collect Intel Mac target-host proof before final closeout.');
  if (suggestedActions.length === 0) suggestedActions.push('No additional migration actions are pending in the exported manifest.');

  const status: ProjectAudioLegacyMigrationPacket['status'] =
    closeoutSummary.status === 'blocked' ? 'blocked' :
    currentManualKeyCount > 0 || storedManualKeyCount > 0 || closeoutSummary.currentResidualCount > 0 ? 'cleanup-required' :
    closeoutSummary.requiresTargetHostProof ? 'proof-required' : 'ready';

  return {
    status,
    currentManualKeyCount,
    storedManualKeyCount,
    combinedKeyCount,
    stagedStoredPreviewKeyCount,
    stagedStoredPreviewUpdatedCount,
    suggestedActions,
    currentHeadKeys: manualQueueSummary ? [...manualQueueSummary.currentHeadKeys] : [],
    storedHeadKeys: manualQueueSummary ? [...manualQueueSummary.storedHeadKeys] : [],
    combinedHeadKeys: manualQueueSummary ? [...manualQueueSummary.combinedHeadKeys] : [],
  };
}

export function formatProjectAudioLegacyMigrationPacket(
  packet: ProjectAudioLegacyMigrationPacket,
  closeoutSummary: ProjectAudioLegacyCloseoutSummary,
  manualQueueSummary?: ProjectAudioLegacyManualQueueSummary,
  storedQueuePreviewSummary?: ProjectAudioLegacyStoredQueuePreviewSummary,
): string {
  return [
    `status=${packet.status}`,
    `closeoutStatus=${closeoutSummary.status}`,
    `currentMode=${closeoutSummary.currentVisibilityMode}`,
    `recommendedMode=${closeoutSummary.recommendedVisibilityMode}`,
    `currentManualKeys=${packet.currentManualKeyCount}`,
    `storedManualKeys=${packet.storedManualKeyCount}`,
    `combinedManualKeys=${packet.combinedKeyCount}`,
    `storedPresetContexts=${manualQueueSummary?.storedPresetContextCount ?? 0}`,
    `storedKeyframeContexts=${manualQueueSummary?.storedKeyframeContextCount ?? 0}`,
    `stagedStoredPreviewKeys=${packet.stagedStoredPreviewKeyCount}`,
    `stagedStoredPreviewUpdates=${packet.stagedStoredPreviewUpdatedCount}`,
    `currentHeadKeys=${packet.currentHeadKeys.join(' | ') || 'none'}`,
    `storedHeadKeys=${packet.storedHeadKeys.join(' | ') || 'none'}`,
    `combinedHeadKeys=${packet.combinedHeadKeys.join(' | ') || 'none'}`,
    `storedPreviewScope=${storedQueuePreviewSummary?.scope ?? 'none'}`,
    `storedPreviewProfile=${storedQueuePreviewSummary?.profile ?? 'none'}`,
    `actions=${packet.suggestedActions.join(' | ')}`,
  ].join('\n');
}
