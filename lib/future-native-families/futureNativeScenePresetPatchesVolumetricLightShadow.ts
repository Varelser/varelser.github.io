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

export function buildFutureNativeVolumetricLightShadowPresetPatch(
  id: string,
  layerIndex: 2 | 3,
): Partial<ParticleConfig> | null {
  switch (id) {
    case 'future-native-volumetric-light-charge-veil':
      return layerPatch(layerIndex, {
        Enabled: true, Type: 'charge_veil', Source: 'video', Count: 7600, BaseSize: 1.06, RadiusScale: 1.02,
        MaterialStyle: 'glass', TemporalProfile: 'oscillate', TemporalStrength: 0.26, TemporalSpeed: 0.24,
        FogOpacity: 0.22, FogDensity: 0.32, FogDepth: 0.96, FogScale: 0.92, FogDrift: 0.22, FogSlices: 24,
        FogGlow: 0.28, FogAnisotropy: 0.74, ConnectionEnabled: false, Trail: 0.01,
      });
    case 'future-native-volumetric-light-charge-radiant':
      return layerPatch(layerIndex, {
        Enabled: true, Type: 'charge_veil', Source: 'text', Count: 7800, BaseSize: 1.02, RadiusScale: 1.08,
        MaterialStyle: 'glass', TemporalProfile: 'oscillate', TemporalStrength: 0.32, TemporalSpeed: 0.3,
        FogOpacity: 0.18, FogDensity: 0.24, FogDepth: 1.06, FogScale: 0.98, FogDrift: 0.28, FogSlices: 26,
        FogGlow: 0.38, FogAnisotropy: 0.9, ConnectionEnabled: false, Trail: 0.01,
      });
    case 'future-native-volumetric-light-charge-occluded':
      return layerPatch(layerIndex, {
        Enabled: true, Type: 'charge_veil', Source: 'plane', Count: 7400, BaseSize: 1.08, RadiusScale: 0.98,
        MaterialStyle: 'glass', TemporalProfile: 'intermittent', TemporalStrength: 0.18, TemporalSpeed: 0.16,
        FogOpacity: 0.28, FogDensity: 0.48, FogDepth: 0.78, FogScale: 0.88, FogDrift: 0.12, FogSlices: 22,
        FogGlow: 0.12, FogAnisotropy: 0.36, ConnectionEnabled: false, Trail: 0.01,
      });
    case 'future-native-volumetric-shadow-velvet-ash':
      return layerPatch(layerIndex, {
        Enabled: true, Type: 'velvet_ash', Source: 'plane', Count: 7200, BaseSize: 1.14, RadiusScale: 1.0,
        MaterialStyle: 'halftone', TemporalProfile: 'shed', TemporalStrength: 0.22, TemporalSpeed: 0.14,
        FogOpacity: 0.3, FogDensity: 0.58, FogDepth: 0.7, FogScale: 0.88, FogDrift: 0.08, FogSlices: 22,
        FogGlow: 0.06, FogAnisotropy: 0.16, ConnectionEnabled: false, Trail: 0.01,
      });
    case 'future-native-volumetric-shadow-velvet-lantern':
      return layerPatch(layerIndex, {
        Enabled: true, Type: 'velvet_ash', Source: 'image', Count: 7000, BaseSize: 1.08, RadiusScale: 0.96,
        MaterialStyle: 'halftone', TemporalProfile: 'recover', TemporalStrength: 0.26, TemporalSpeed: 0.18,
        FogOpacity: 0.24, FogDensity: 0.42, FogDepth: 0.84, FogScale: 0.94, FogDrift: 0.16, FogSlices: 24,
        FogGlow: 0.14, FogAnisotropy: 0.24, ConnectionEnabled: false, Trail: 0.01,
      });
    case 'future-native-volumetric-shadow-velvet-wall':
      return layerPatch(layerIndex, {
        Enabled: true, Type: 'velvet_ash', Source: 'plane', Count: 7400, BaseSize: 1.16, RadiusScale: 1.04,
        MaterialStyle: 'halftone', TemporalProfile: 'shed', TemporalStrength: 0.16, TemporalSpeed: 0.1,
        FogOpacity: 0.34, FogDensity: 0.7, FogDepth: 0.6, FogScale: 0.82, FogDrift: 0.06, FogSlices: 20,
        FogGlow: 0.02, FogAnisotropy: 0.1, ConnectionEnabled: false, Trail: 0.01,
      });
    default:
      return null;
  }
}
