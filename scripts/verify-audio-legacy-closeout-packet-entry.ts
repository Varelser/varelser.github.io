import { APP_STATE_DEFAULT_AUDIO_SYNTH } from '../lib/appStateDefaultAudioSynth';
import { normalizeConfig } from '../lib/appStateConfig';
import { createLegacyAudioRoutes } from '../lib/audioReactiveConfig';
import { buildProjectAudioLegacyCloseoutSummary } from '../lib/projectAudioLegacyCloseoutSummary';
import { buildProjectAudioLegacyStoredQueuePreviewSummary } from '../lib/projectAudioLegacyStoredQueuePreviewSummary';
import { buildProjectAudioLegacyCloseoutPacket, formatProjectAudioLegacyCloseoutPacket } from '../lib/projectAudioLegacyCloseoutPacket';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

assert(APP_STATE_DEFAULT_AUDIO_SYNTH.audioLegacySliderVisibilityMode === 'retired-safe', 'fresh defaults should stay retired-safe');

const baseConfig = normalizeConfig({
  audioBassMotionScale: 0.88,
  audioBassSizeScale: 0,
  audioBassAlphaScale: 0,
  audioTrebleMotionScale: 0,
  audioTrebleSizeScale: 0,
  audioTrebleAlphaScale: 0,
  audioPulseScale: 0,
  audioBurstScale: 0,
  audioScreenScale: 0,
  audioMorphScale: 0,
  audioShatterScale: 0,
  audioTwistScale: 0,
  audioBendScale: 0,
  audioWarpScale: 0,
  audioLineScale: 0,
  audioCameraScale: 0,
  audioHueShiftScale: 0,
  audioBandAMotionScale: 0,
  audioBandASizeScale: 0,
  audioBandAAlphaScale: 0,
  audioBandBMotionScale: 0,
  audioBandBSizeScale: 0,
  audioBandBAlphaScale: 0,
});
const config = normalizeConfig({
  ...baseConfig,
  audioRoutes: createLegacyAudioRoutes(baseConfig),
});

const closeoutSummary = buildProjectAudioLegacyCloseoutSummary(config, [], []);
const storedQueuePreviewSummary = buildProjectAudioLegacyStoredQueuePreviewSummary(config, [], []);
const packet = buildProjectAudioLegacyCloseoutPacket(closeoutSummary, storedQueuePreviewSummary);
const formatted = formatProjectAudioLegacyCloseoutPacket(packet, closeoutSummary, storedQueuePreviewSummary);

assert(packet.status === 'proof-required', 'ready closeout should still require proof in sandbox packet');
assert(packet.actionChecklist.some((value) => value.includes('Intel Mac target-host proof packet')), 'action checklist should include target-host proof step');
assert(formatted.includes('[target-host-proof-packet]'), 'formatted packet should include nested target-host packet');
assert(formatted.includes('previewKeys='), 'formatted packet should include preview key count');
assert(formatted.includes('closeoutMessage='), 'formatted packet should include closeout message');

console.log(JSON.stringify({
  status: packet.status,
  actionCount: packet.actionChecklist.length,
  previewKeyCount: packet.previewKeyCount,
  previewAppliedKeyCount: packet.previewAppliedKeyCount,
}, null, 2));
