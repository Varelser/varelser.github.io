import type { AudioLegacyRetirementImpactSummary } from './audioReactiveRetirementImpact';
import { summarizeFocusedCustomConflict } from './audioReactiveValidation';

type FocusedCustomConflictDetail = ReturnType<typeof summarizeFocusedCustomConflict>;
type ConflictHotspot = AudioLegacyRetirementImpactSummary['customConflictHotspots'][number];

interface AudioLegacyFocusedRetirementSnapshotArgs {
  legacyRetirementImpact: AudioLegacyRetirementImpactSummary;
  focusedCustomConflictDetail: FocusedCustomConflictDetail;
  filteredCustomConflictHotspots: ConflictHotspot[];
}

export function formatAudioLegacyRetirementImpactSummary(legacyRetirementImpact: AudioLegacyRetirementImpactSummary) {
  const { currentConfig, presets, sequence, highestRiskCandidates, customConflictHotspots } = legacyRetirementImpact;
  const lines = [
    `current.review=${currentConfig.reviewBeforeDeprecateCount}`,
    `current.blocked=${currentConfig.blockedDeprecationCount}`,
    `current.residual=${currentConfig.residualCount}`,
    `presets.total=${presets.total}`,
    `presets.review=${presets.affectedReviewCount}`,
    `presets.blocked=${presets.affectedBlockedCount}`,
    `presets.sampleReview=${presets.sampleReview.join(' | ') || 'none'}`,
    `presets.sampleBlocked=${presets.sampleBlocked.join(' | ') || 'none'}`,
    `sequence.totalItems=${sequence.totalItems}`,
    `sequence.linkedPresetReview=${sequence.linkedPresetReviewCount}`,
    `sequence.linkedPresetBlocked=${sequence.linkedPresetBlockedCount}`,
    `sequence.keyframeCount=${sequence.keyframeCount}`,
    `sequence.keyframeReview=${sequence.keyframeReviewCount}`,
    `sequence.keyframeBlocked=${sequence.keyframeBlockedCount}`,
    `sequence.sampleLinkedPresetReview=${sequence.sampleLinkedPresetReview.join(' | ') || 'none'}`,
    `sequence.sampleLinkedPresetBlocked=${sequence.sampleLinkedPresetBlocked.join(' | ') || 'none'}`,
    `sequence.sampleKeyframeReview=${sequence.sampleKeyframeReview.join(' | ') || 'none'}`,
    `sequence.sampleKeyframeBlocked=${sequence.sampleKeyframeBlocked.join(' | ') || 'none'}`,
    'highestRiskCandidates:',
    ...highestRiskCandidates.slice(0, 12).map(
      (candidate, index) =>
        `#${index + 1} ${candidate.status} / ${candidate.key} / ${candidate.legacyId} / contexts ${candidate.contextCount} / current ${candidate.currentConfig ? 'yes' : 'no'} / presets ${candidate.presetCount} / sequence presets ${candidate.sequenceLinkedPresetCount} / keyframes ${candidate.keyframeCount} / samples ${candidate.sampleContexts.join(' | ') || 'none'}`,
    ),
    'customConflictHotspots:',
    ...customConflictHotspots.slice(0, 12).map(
      (hotspot, index) =>
        `#${index + 1} ${hotspot.highestKind} / ${hotspot.key} / contexts ${hotspot.contextCount} / current ${hotspot.currentConfig ? 'yes' : 'no'} / presets ${hotspot.presetCount} / sequence presets ${hotspot.sequenceLinkedPresetCount} / keyframes ${hotspot.keyframeCount} / samples ${hotspot.sampleContexts.join(' | ') || 'none'}`,
    ),
  ];
  return lines.join('\n');
}

export function formatAudioLegacyFocusedRetirementSnapshot({
  legacyRetirementImpact,
  focusedCustomConflictDetail,
  filteredCustomConflictHotspots,
}: AudioLegacyFocusedRetirementSnapshotArgs) {
  const impactLines = formatAudioLegacyRetirementImpactSummary(legacyRetirementImpact).split('\n');
  const focusedLines = focusedCustomConflictDetail
    ? [
        'focusedConflict:',
        `key=${focusedCustomConflictDetail.key}`,
        `legacyId=${focusedCustomConflictDetail.legacyId ?? 'none'}`,
        `recommendation=${focusedCustomConflictDetail.recommendation}`,
        `reason=${focusedCustomConflictDetail.recommendationReason}`,
        `dominant=${focusedCustomConflictDetail.dominantRouteId ?? 'none'} (${focusedCustomConflictDetail.dominantOwner ?? 'n/a'})`,
        `counts=custom ${focusedCustomConflictDetail.customRouteCount} / legacy ${focusedCustomConflictDetail.legacyRouteCount} / exactCustom ${focusedCustomConflictDetail.exactCustomCount} / exactLegacy ${focusedCustomConflictDetail.exactLegacyCount}`,
        `spread=amount ${focusedCustomConflictDetail.amountSpread} / bias ${focusedCustomConflictDetail.biasSpread} / timing ${focusedCustomConflictDetail.timingSpread}`,
        'focusedRoutes:',
        ...focusedCustomConflictDetail.routes.slice(0, 8).map(
          (route, index) =>
            `#${index + 1} ${route.owner} / ${route.id} / enabled ${route.enabled ? 'yes' : 'no'} / score ${route.score} / Δ amount ${route.amountDelta} / Δ bias ${route.biasDelta} / Δ timing ${route.timingDelta} / amount ${route.amount} / bias ${route.bias} / mode ${route.mode} / curve ${route.curve}`,
        ),
      ]
    : ['focusedConflict: none'];
  const hotspotLines = [
    'visibleHotspots:',
    ...filteredCustomConflictHotspots.slice(0, 8).map(
      (hotspot, index) =>
        `#${index + 1} ${hotspot.highestKind} / ${hotspot.key} / contexts ${hotspot.contextCount} / current ${hotspot.currentConfig ? 'yes' : 'no'} / presets ${hotspot.presetCount} / sequence presets ${hotspot.sequenceLinkedPresetCount} / keyframes ${hotspot.keyframeCount}`,
    ),
  ];
  return [...impactLines, '', ...focusedLines, '', ...hotspotLines].join('\n');
}
