import type { ParticleConfig } from '../../types';

function layerPatch(
  layerIndex: 2 | 3,
  values: Record<string, string | number | boolean>,
): Partial<ParticleConfig> {
  const prefix = layerIndex === 2 ? 'layer2' : 'layer3';
  const patch: Partial<ParticleConfig> = {};
  for (const [suffix, value] of Object.entries(values)) {
    const key = `${prefix}${suffix}` as keyof ParticleConfig;
    (patch as Record<string, string | number | boolean>)[key] = value;
  }
  return patch;
}

export function buildFutureNativePbdRopePresetPatch(id: string, layerIndex: 2 | 3): Partial<ParticleConfig> | null {
  switch (id) {
    case 'future-native-pbd-rope-plasma-thread':
      return layerPatch(layerIndex, {
        Enabled: true,
        Type: 'plasma_thread',
        Source: 'cylinder',
        Count: 7200,
        BaseSize: 0.78,
        RadiusScale: 0.98,
        MaterialStyle: 'hologram',
        TemporalProfile: 'resonate',
        TemporalStrength: 0.22,
        TemporalSpeed: 0.24,
        ConnectionEnabled: false,
        Trail: 0.04,
        WindX: 0.16,
        WindY: 0.03,
      });
    case 'future-native-pbd-rope-signal-braid':
      return layerPatch(layerIndex, {
        Enabled: true,
        Type: 'signal_braid',
        Source: 'text',
        Count: 7600,
        BaseSize: 0.82,
        RadiusScale: 1.0,
        MaterialStyle: 'chrome',
        TemporalProfile: 'resonate',
        TemporalStrength: 0.24,
        TemporalSpeed: 0.18,
        ConnectionEnabled: false,
        Trail: 0.03,
        WindX: 0.12,
        WindY: 0.02,
      });
    case 'future-native-pbd-rope-aurora-threads':
      return layerPatch(layerIndex, {
        Enabled: true,
        Type: 'aurora_threads',
        Source: 'ring',
        Count: 7800,
        BaseSize: 0.88,
        RadiusScale: 1.06,
        MaterialStyle: 'glass',
        TemporalProfile: 'resonate',
        TemporalStrength: 0.26,
        TemporalSpeed: 0.2,
        ConnectionEnabled: false,
        Trail: 0.03,
        WindX: 0.08,
        WindY: 0.04,
      });
    default:
      return null;
  }
}
