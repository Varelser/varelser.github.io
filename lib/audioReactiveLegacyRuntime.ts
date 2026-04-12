import type { ParticleConfig } from '../types';
import { summarizeLegacyAudioRouteParity } from './audioReactiveValidation';

type LegacyAudioSliderKey = keyof Pick<
  ParticleConfig,
  | 'audioBassMotionScale'
  | 'audioBassSizeScale'
  | 'audioBassAlphaScale'
  | 'audioTrebleMotionScale'
  | 'audioTrebleSizeScale'
  | 'audioTrebleAlphaScale'
  | 'audioPulseScale'
  | 'audioBurstScale'
  | 'audioScreenScale'
  | 'audioMorphScale'
  | 'audioShatterScale'
  | 'audioTwistScale'
  | 'audioBendScale'
  | 'audioWarpScale'
  | 'audioLineScale'
  | 'audioCameraScale'
  | 'audioHueShiftScale'
  | 'audioBandAMotionScale'
  | 'audioBandASizeScale'
  | 'audioBandAAlphaScale'
  | 'audioBandBMotionScale'
  | 'audioBandBSizeScale'
  | 'audioBandBAlphaScale'
>;

const LEGACY_ID_TO_CONFIG_KEY: Record<string, LegacyAudioSliderKey> = {
  'legacy-bass-motion': 'audioBassMotionScale',
  'legacy-bass-size': 'audioBassSizeScale',
  'legacy-bass-alpha': 'audioBassAlphaScale',
  'legacy-treble-motion': 'audioTrebleMotionScale',
  'legacy-treble-size': 'audioTrebleSizeScale',
  'legacy-treble-alpha': 'audioTrebleAlphaScale',
  'legacy-pulse-particles': 'audioPulseScale',
  'legacy-pulse-burst': 'audioBurstScale',
  'legacy-pulse-screen': 'audioScreenScale',
  'legacy-pulse-morph': 'audioMorphScale',
  'legacy-treble-shatter': 'audioShatterScale',
  'legacy-audio-twist': 'audioTwistScale',
  'legacy-audio-bend': 'audioBendScale',
  'legacy-audio-warp': 'audioWarpScale',
  'legacy-audio-lines': 'audioLineScale',
  'legacy-audio-camera': 'audioCameraScale',
  'legacy-audio-hue': 'audioHueShiftScale',
  'legacy-bandA-motion': 'audioBandAMotionScale',
  'legacy-bandA-size': 'audioBandASizeScale',
  'legacy-bandA-alpha': 'audioBandAAlphaScale',
  'legacy-bandB-motion': 'audioBandBMotionScale',
  'legacy-bandB-size': 'audioBandBSizeScale',
  'legacy-bandB-alpha': 'audioBandBAlphaScale',
};

export function getRetiredSafeLegacySliderIds(config: ParticleConfig): string[] {
  if (config.audioLegacySliderVisibilityMode !== 'retired-safe') {
    return [];
  }
  const parity = summarizeLegacyAudioRouteParity(config, config.audioRoutes);
  return parity.deprecationOrder
    .filter((candidate) => candidate.status === 'safe')
    .map((candidate) => candidate.legacyId)
    .filter((legacyId) => LEGACY_ID_TO_CONFIG_KEY[legacyId] !== undefined);
}

export function createLegacySafeRetiredRuntimeConfig(config: ParticleConfig): ParticleConfig {
  const retiredSafeIds = getRetiredSafeLegacySliderIds(config);
  if (retiredSafeIds.length === 0) {
    return config;
  }

  const nextConfig: ParticleConfig = { ...config };
  retiredSafeIds.forEach((legacyId) => {
    const key = LEGACY_ID_TO_CONFIG_KEY[legacyId];
    if (!key) return;
    nextConfig[key] = 0;
  });
  return nextConfig;
}
