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

export function buildFutureNativeMpmGranularPresetPatch(
  id: string,
  layerIndex: 2 | 3,
): Partial<ParticleConfig> | null {
  switch (id) {
    case 'future-native-mpm-granular-sand-fall':
      return layerPatch(layerIndex, {
        Enabled: true, Type: 'granular_fall', Source: 'sphere', Count: 15200, BaseSize: 0.98, RadiusScale: 1.02,
        MaterialStyle: 'halftone', TemporalProfile: 'cascade', TemporalStrength: 0.18, TemporalSpeed: 0.22,
        FogOpacity: 0.08, ConnectionEnabled: false, Trail: 0.02,
      });
    case 'future-native-mpm-granular-jammed-pack':
      return layerPatch(layerIndex, {
        Enabled: true, Type: 'jammed_pack', Source: 'sphere', Count: 13800, BaseSize: 0.92, RadiusScale: 1.08,
        MaterialStyle: 'halftone', TemporalProfile: 'compress', TemporalStrength: 0.22, TemporalSpeed: 0.16,
        FogOpacity: 0.04, ConnectionEnabled: false, Trail: 0.01,
      });
    default:
      return null;
  }
}
