import { buildProjectData, parseProjectData } from '../lib/projectState';
import { normalizeConfig } from '../lib/appStateConfig';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const config = normalizeConfig({
  audioLegacySliderVisibilityMode: 'retired-safe',
  audioRoutes: [
    {
      id: 'route-bass-motion',
      enabled: true,
      source: 'bass',
      target: 'particle.motion',
      amount: 0.72,
      bias: 0,
      curve: 'linear',
      smoothing: 0.24,
      attack: 0.08,
      release: 0.18,
      clampMin: -1,
      clampMax: 1,
      mode: 'add',
    },
    {
      id: 'route-treble-size',
      enabled: true,
      source: 'treble',
      target: 'particle.size',
      amount: 0.58,
      bias: 0,
      curve: 'linear',
      smoothing: 0.18,
      attack: 0.05,
      release: 0.14,
      clampMin: -1,
      clampMax: 1,
      mode: 'add',
    },
    {
      id: 'route-bandA-line-width',
      enabled: true,
      source: 'bandA',
      target: 'line.width',
      amount: 0.42,
      bias: 0,
      curve: 'ease-out',
      smoothing: 0.2,
      attack: 0.06,
      release: 0.16,
      clampMin: -1,
      clampMax: 1,
      mode: 'add',
    },
  ],
});

const project = buildProjectData({
  name: 'Audio Legacy Export Diagnostic',
  config,
  presets: [
    {
      id: 'preset-risky',
      name: 'Risky Preset',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      config: normalizeConfig({
        audioLegacySliderVisibilityMode: 'retired-safe',
        audioRoutes: config.audioRoutes,
        audioBassMotionScale: 0.55,
        audioTrebleSizeScale: 0.35,
      }),
    },
  ],
  presetSequence: [
    {
      id: 'sequence-risky',
      presetId: 'preset-risky',
      label: 'Risk Sequence',
      holdSeconds: 1.2,
      transitionSeconds: 0.9,
      transitionEasing: 'ease-in-out',
      screenSequenceDriveMode: 'inherit',
      screenSequenceDriveStrengthMode: 'inherit',
      screenSequenceDriveStrengthOverride: 1,
      screenSequenceDriveMultiplier: 1,
      keyframeConfig: normalizeConfig({
        audioLegacySliderVisibilityMode: 'retired-safe',
        audioRoutes: config.audioRoutes,
        audioBassMotionScale: 0.45,
      }),
    },
  ],
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

assert(project.manifest.audioLegacyRetirement, 'manifest should include audio legacy retirement summary');
assert(project.serialization.diagnostics?.audioLegacyRetirement, 'serialization should include audio legacy retirement diagnostics');
assert(project.manifest.audioLegacyRetirement.visibilityMode === 'retired-safe', 'manifest visibility mode drift');
assert(project.serialization.diagnostics.audioLegacyRetirement.visibilityMode === 'retired-safe', 'serialization visibility mode drift');
assert(project.manifest.audioLegacyRetirement.highestRiskLegacyIds.length >= 1, 'expected highest risk legacy ids');

const parsed = parseProjectData(JSON.parse(JSON.stringify(project)));
assert(parsed, 'parseProjectData returned null');
assert(parsed.manifest.audioLegacyRetirement, 'parsed manifest should keep audio legacy retirement summary');
assert(parsed.serialization.diagnostics?.audioLegacyRetirement, 'parsed serialization should keep audio legacy retirement diagnostics');
assert(parsed.manifest.audioLegacyRetirement.visibilityMode === 'retired-safe', 'parsed manifest visibility mode drift');
assert(
  JSON.stringify(parsed.serialization.diagnostics.audioLegacyRetirement) === JSON.stringify(project.serialization.diagnostics.audioLegacyRetirement),
  'parsed serialization diagnostics drift',
);

console.log(JSON.stringify({
  manifest: project.manifest.audioLegacyRetirement,
  serialization: project.serialization.diagnostics.audioLegacyRetirement,
}, null, 2));
