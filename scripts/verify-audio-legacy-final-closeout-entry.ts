import { strict as assert } from 'node:assert';
import { normalizeConfig } from '../lib/appStateConfig';
import { createLegacyAudioRoutes } from '../lib/audioReactiveConfig';
import { buildProjectAudioLegacyCloseoutSummary } from '../lib/projectAudioLegacyCloseoutSummary';
import { buildAudioLegacyCleanupState } from '../lib/audioLegacyCleanupState';
import { buildAudioLegacyFinalPanelState } from '../lib/audioLegacyFinalPanelState';
import { buildProjectData, parseProjectData } from '../lib/projectState';

const baseConfig = normalizeConfig({
  audioLegacySliderVisibilityMode: 'retired-safe',
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

const closeout = buildProjectAudioLegacyCloseoutSummary(config, [], []);
assert(closeout.status === 'ready', 'closeout should be ready when current parity is exact');
assert(closeout.requiresTargetHostProof === true, 'ready closeout should still require target-host proof');
assert(closeout.closeoutMessage.includes('target-host live browser proof'), 'closeout message should mention target-host proof');
assert(closeout.nextStepLabel.length > 10, 'next step label should be populated');

const cleanupState = buildAudioLegacyCleanupState({
  focusedConflictKey: null,
  hotspotKeys: [],
  manualConflictKeys: [],
  storedManualConflictKeys: [],
  lastHotspotBatchSummary: null,
  lastManualBatchSummary: null,
});
const panelState = buildAudioLegacyFinalPanelState(cleanupState, closeout);
assert(panelState.compactCloseoutReady === true, 'final panel state should compact once cleanup is ready');
assert(panelState.shouldShowTargetHostReminder === true, 'final panel state should remind about target-host proof');

const project = buildProjectData({
  name: 'Audio Legacy Final Closeout',
  config,
  presets: [],
  presetSequence: [],
  activePresetId: null,
  presetBlendDuration: 1.5,
  sequenceLoopEnabled: true,
  ui: {
    isPlaying: false,
    isPanelOpen: true,
    videoExportMode: 'current',
    videoDurationSeconds: 8,
    videoFps: 30,
  },
});
assert(project.manifest.audioLegacyCloseout?.requiresTargetHostProof === true, 'manifest should keep target-host proof flag');
assert(project.manifest.audioLegacyCloseout?.closeoutMessage.includes('target-host live browser proof'), 'manifest closeout message should survive');
assert(project.manifest.audioLegacyCloseout?.nextStepLabel.includes('target-host Intel Mac closeout proof'), 'manifest next step label should survive');

const parsed = parseProjectData(JSON.parse(JSON.stringify(project)));
assert(parsed, 'parseProjectData returned null');
assert(parsed.manifest.audioLegacyCloseout?.requiresTargetHostProof === true, 'parsed manifest should keep proof flag');
assert(parsed.manifest.audioLegacyCloseout?.closeoutMessage === project.manifest.audioLegacyCloseout?.closeoutMessage, 'parsed message drift');
assert(parsed.manifest.audioLegacyCloseout?.nextStepLabel === project.manifest.audioLegacyCloseout?.nextStepLabel, 'parsed next-step drift');

console.log(JSON.stringify({
  name: 'Audio Legacy Final Closeout',
  ready: closeout.status,
  compactCloseoutReady: panelState.compactCloseoutReady,
  requiresTargetHostProof: closeout.requiresTargetHostProof,
  nextStepLabel: closeout.nextStepLabel,
}, null, 2));
