import { APP_STATE_DEFAULT_AUDIO_SYNTH } from '../lib/appStateDefaultAudioSynth';
import { normalizeConfig } from '../lib/appStateConfig';
import { createLegacyAudioRoutes } from '../lib/audioReactiveConfig';
import { buildProjectData, parseProjectData } from '../lib/projectState';
import { buildProjectAudioLegacyCloseoutSummary } from '../lib/projectAudioLegacyCloseoutSummary';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
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
const config = normalizeConfig({
  ...baseConfig,
  audioRoutes: createLegacyAudioRoutes(baseConfig),
});

const closeout = buildProjectAudioLegacyCloseoutSummary(config, [], []);
assert(closeout.status === 'ready', 'exact current route parity should be ready for closeout');
assert(closeout.recommendedVisibilityMode === 'retired-safe', 'safe parity should recommend retired-safe');
assert(closeout.modeDrift === false, 'fresh defaults should not drift from retired-safe recommendation');
assert(closeout.safeToDeprecateCount >= 1, 'expected safe legacy closeout candidates');

const project = buildProjectData({
  name: 'Audio Legacy Closeout Defaults',
  config,
  presets: [],
  presetSequence: [],
  activePresetId: null,
  presetBlendDuration: 1,
  sequenceLoopEnabled: false,
  ui: {
    isPlaying: false,
    isPanelOpen: true,
    videoExportMode: 'current',
    videoDurationSeconds: 4,
    videoFps: 24,
  },
});

assert(project.manifest.audioLegacyCloseout, 'manifest should include audio legacy closeout summary');
assert(project.serialization.diagnostics?.audioLegacyCloseout, 'serialization should include audio legacy closeout summary');
assert(project.manifest.audioLegacyCloseout.status === 'ready', 'manifest closeout status drift');
assert(project.manifest.audioLegacyCloseout.currentVisibilityMode === 'retired-safe', 'manifest closeout current mode drift');
assert(project.manifest.audioLegacyCloseout.recommendedVisibilityMode === 'retired-safe', 'manifest closeout recommendation drift');

const parsed = parseProjectData(JSON.parse(JSON.stringify(project)));
assert(parsed, 'parseProjectData returned null');
assert(parsed.manifest.audioLegacyCloseout, 'parsed manifest should keep closeout summary');
assert(parsed.serialization.diagnostics?.audioLegacyCloseout, 'parsed serialization should keep closeout summary');
assert(parsed.manifest.audioLegacyCloseout.currentVisibilityMode === 'retired-safe', 'parsed closeout current mode drift');
assert(parsed.manifest.audioLegacyCloseout.recommendedVisibilityMode === 'retired-safe', 'parsed closeout recommendation drift');

console.log(JSON.stringify({
  defaultMode: APP_STATE_DEFAULT_AUDIO_SYNTH.audioLegacySliderVisibilityMode,
  manifest: project.manifest.audioLegacyCloseout,
  parsed: parsed.manifest.audioLegacyCloseout,
}, null, 2));
