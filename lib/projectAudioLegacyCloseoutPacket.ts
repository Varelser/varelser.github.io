import type { ProjectAudioLegacyCloseoutSummary, ProjectAudioLegacyStoredQueuePreviewSummary } from '../types';
import {
  buildProjectAudioLegacyTargetHostProofPacket,
  formatProjectAudioLegacyTargetHostProofPacket,
} from './projectAudioLegacyTargetHostProofPacket';

export interface ProjectAudioLegacyCloseoutPacket {
  status: 'blocked' | 'proof-required' | 'ready';
  actionChecklist: string[];
  targetHostPacket: ReturnType<typeof buildProjectAudioLegacyTargetHostProofPacket>;
  previewKeyCount: number;
  previewAppliedKeyCount: number;
  previewTotalUpdatedCount: number;
  previewDeltaReview: number;
  previewDeltaBlocked: number;
  previewDeltaResidual: number;
  highestRiskLegacyIds: string[];
  previewKeys: string[];
}

function buildActionChecklist(
  closeoutSummary: ProjectAudioLegacyCloseoutSummary,
  storedQueuePreviewSummary?: ProjectAudioLegacyStoredQueuePreviewSummary,
): string[] {
  const steps: string[] = [];

  if (closeoutSummary.modeDrift) {
    steps.push(`Adopt ${closeoutSummary.recommendedVisibilityMode} before final handoff.`);
  }
  if (closeoutSummary.currentBlockedCount > 0) {
    steps.push(`Resolve current blocked legacy ids (${closeoutSummary.currentBlockedCount}).`);
  }
  if (closeoutSummary.currentReviewCount > 0) {
    steps.push(`Review current unresolved legacy ids (${closeoutSummary.currentReviewCount}).`);
  }
  if (closeoutSummary.storedBlockedCount > 0) {
    steps.push(`Resolve stored blocked contexts (${closeoutSummary.storedBlockedCount}).`);
  }
  if (closeoutSummary.storedReviewCount > 0) {
    steps.push(`Review stored preset / keyframe contexts (${closeoutSummary.storedReviewCount}).`);
  }
  if (closeoutSummary.currentResidualCount > 0) {
    steps.push(`Collapse remaining residual routes (${closeoutSummary.currentResidualCount}).`);
  }
  if ((storedQueuePreviewSummary?.keyCount ?? 0) > 0) {
    steps.push(`Apply or confirm the staged stored queue preview for ${storedQueuePreviewSummary?.keyCount ?? 0} key(s).`);
  }
  if (closeoutSummary.requiresTargetHostProof) {
    steps.push('Run the Intel Mac target-host proof packet and archive the proof artifacts.');
  }
  if (steps.length === 0) {
    steps.push('No additional legacy cleanup is pending in the sandbox state.');
  }
  return steps;
}

export function buildProjectAudioLegacyCloseoutPacket(
  closeoutSummary: ProjectAudioLegacyCloseoutSummary,
  storedQueuePreviewSummary?: ProjectAudioLegacyStoredQueuePreviewSummary,
): ProjectAudioLegacyCloseoutPacket {
  const targetHostPacket = buildProjectAudioLegacyTargetHostProofPacket(closeoutSummary);
  const status: ProjectAudioLegacyCloseoutPacket['status'] = closeoutSummary.status === 'blocked'
    ? 'blocked'
    : closeoutSummary.requiresTargetHostProof
      ? 'proof-required'
      : 'ready';

  return {
    status,
    actionChecklist: buildActionChecklist(closeoutSummary, storedQueuePreviewSummary),
    targetHostPacket,
    previewKeyCount: storedQueuePreviewSummary?.keyCount ?? 0,
    previewAppliedKeyCount: storedQueuePreviewSummary?.appliedKeyCount ?? 0,
    previewTotalUpdatedCount: storedQueuePreviewSummary?.totalUpdatedCount ?? 0,
    previewDeltaReview: storedQueuePreviewSummary?.totalReviewDelta ?? 0,
    previewDeltaBlocked: storedQueuePreviewSummary?.totalBlockedDelta ?? 0,
    previewDeltaResidual: storedQueuePreviewSummary?.totalResidualDelta ?? 0,
    highestRiskLegacyIds: [...closeoutSummary.highestRiskLegacyIds],
    previewKeys: storedQueuePreviewSummary ? [...storedQueuePreviewSummary.previewKeys] : [],
  };
}

export function formatProjectAudioLegacyCloseoutPacket(
  packet: ProjectAudioLegacyCloseoutPacket,
  closeoutSummary: ProjectAudioLegacyCloseoutSummary,
  storedQueuePreviewSummary?: ProjectAudioLegacyStoredQueuePreviewSummary,
): string {
  return [
    `status=${packet.status}`,
    `closeoutStatus=${closeoutSummary.status}`,
    `currentMode=${closeoutSummary.currentVisibilityMode}`,
    `recommendedMode=${closeoutSummary.recommendedVisibilityMode}`,
    `modeDrift=${closeoutSummary.modeDrift ? 'yes' : 'no'}`,
    `currentReview=${closeoutSummary.currentReviewCount}`,
    `currentBlocked=${closeoutSummary.currentBlockedCount}`,
    `currentResidual=${closeoutSummary.currentResidualCount}`,
    `storedReview=${closeoutSummary.storedReviewCount}`,
    `storedBlocked=${closeoutSummary.storedBlockedCount}`,
    `safe=${closeoutSummary.safeToDeprecateCount}`,
    `closeoutMessage=${closeoutSummary.closeoutMessage}`,
    `next=${closeoutSummary.nextStepLabel}`,
    `previewKeys=${packet.previewKeyCount}`,
    `previewAppliedKeys=${packet.previewAppliedKeyCount}`,
    `previewTotalUpdated=${packet.previewTotalUpdatedCount}`,
    `previewDeltaReview=${packet.previewDeltaReview}`,
    `previewDeltaBlocked=${packet.previewDeltaBlocked}`,
    `previewDeltaResidual=${packet.previewDeltaResidual}`,
    `previewKeyList=${packet.previewKeys.join(' | ') || 'none'}`,
    `highestRiskLegacyIds=${packet.highestRiskLegacyIds.join(' | ') || 'none'}`,
    `actions=${packet.actionChecklist.join(' | ')}`,
    '',
    '[target-host-proof-packet]',
    formatProjectAudioLegacyTargetHostProofPacket(packet.targetHostPacket, closeoutSummary),
    '',
    '[stored-queue-preview]',
    storedQueuePreviewSummary
      ? [
          `scope=${storedQueuePreviewSummary.scope}`,
          `profile=${storedQueuePreviewSummary.profile}`,
          `limit=${storedQueuePreviewSummary.limit}`,
          `sampleUpdatedIds=${storedQueuePreviewSummary.sampleUpdatedIds.join(' | ') || 'none'}`,
        ].join('\n')
      : 'none',
  ].join('\n');
}
