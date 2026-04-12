import { APP_STATE_DEFAULT_AUDIO_SYNTH } from '../lib/appStateDefaultAudioSynth';
import { normalizeConfig } from '../lib/appStateConfig';
import { createLegacyAudioRoutes } from '../lib/audioReactiveConfig';
import { buildProjectAudioLegacyCloseoutSummary } from '../lib/projectAudioLegacyCloseoutSummary';
import { buildProjectAudioLegacyTargetHostProofPacket, formatProjectAudioLegacyTargetHostProofPacket } from '../lib/projectAudioLegacyTargetHostProofPacket';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

assert(APP_STATE_DEFAULT_AUDIO_SYNTH.audioLegacySliderVisibilityMode === 'retired-safe', 'fresh defaults should start in retired-safe mode');

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
const readyConfig = normalizeConfig({
  ...baseConfig,
  audioRoutes: createLegacyAudioRoutes(baseConfig),
});

const readyCloseout = buildProjectAudioLegacyCloseoutSummary(readyConfig, [], []);
const readyPacket = buildProjectAudioLegacyTargetHostProofPacket(readyCloseout);
assert(readyCloseout.status === 'ready', 'default closeout should be ready for packet verification');
assert(readyPacket.status === 'required', 'ready closeout should require target-host proof packet');
assert(readyPacket.runnerCommand.includes('RUN_TARGET_HOST_INTEL_MAC_CLOSEOUT.command'), 'runner command missing');
assert(readyPacket.refreshCommand.includes('run:target-host:intel-mac:closeout:refresh'), 'refresh command missing');
assert(readyPacket.proofArtifacts.some((value) => value.endsWith('target-host-intel-mac-closeout.json')), 'json proof artifact missing');
assert(readyPacket.docs.some((value) => value.includes('TARGET_HOST_INTEL_MAC_ONE_SHOT_CLOSEOUT')), 'doc link missing');

const readyPayload = formatProjectAudioLegacyTargetHostProofPacket(readyPacket, readyCloseout);
assert(readyPayload.includes('requiresTargetHostProof=yes'), 'formatted packet should include proof flag');
assert(readyPayload.includes('runner=./RUN_TARGET_HOST_INTEL_MAC_CLOSEOUT.command'), 'formatted packet should include runner');

const blockedCloseout = {
  ...readyCloseout,
  status: 'blocked' as const,
  requiresTargetHostProof: false,
  currentBlockedCount: 2,
  closeoutMessage: 'blocked',
};
const blockedPacket = buildProjectAudioLegacyTargetHostProofPacket(blockedCloseout);
assert(blockedPacket.status === 'not-needed', 'blocked closeout without proof requirement should not need packet');

console.log(JSON.stringify({
  readyStatus: readyPacket.status,
  blockedStatus: blockedPacket.status,
  artifactCount: readyPacket.proofArtifacts.length,
  docCount: readyPacket.docs.length,
}, null, 2));
