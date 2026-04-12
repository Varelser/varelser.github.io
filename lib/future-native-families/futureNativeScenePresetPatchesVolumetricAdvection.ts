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

export function buildFutureNativeVolumetricAdvectionPresetPatch(
  id: string,
  layerIndex: 2 | 3,
): Partial<ParticleConfig> | null {
  switch (id) {
    case 'future-native-volumetric-condense-field':
      return layerPatch(layerIndex, {
        Enabled: true, Type: 'condense_field', Source: 'plane', Count: 7600, BaseSize: 1.06, RadiusScale: 1.0,
        MaterialStyle: 'glass', TemporalProfile: 'emerge', TemporalStrength: 0.24, TemporalSpeed: 0.2,
        FogOpacity: 0.3, FogDensity: 0.48, FogDepth: 0.7, FogScale: 0.9, FogDrift: 0.14, FogSlices: 22,
        FogGlow: 0.12, FogAnisotropy: 0.22, ConnectionEnabled: false, Trail: 0.01,
      });
    case 'future-native-volumetric-condense-flow-lattice':
      return layerPatch(layerIndex, {
        Enabled: true, Type: 'condense_field', Source: 'plane', Count: 7800, BaseSize: 1.02, RadiusScale: 1.08,
        MaterialStyle: 'glass', TemporalProfile: 'emerge', TemporalStrength: 0.28, TemporalSpeed: 0.28,
        FogOpacity: 0.24, FogDensity: 0.34, FogDepth: 0.82, FogScale: 0.96, FogDrift: 0.22, FogSlices: 24,
        FogGlow: 0.18, FogAnisotropy: 0.52, ConnectionEnabled: false, Trail: 0.01,
      });
    case 'future-native-volumetric-condense-obstacle-basin':
      return layerPatch(layerIndex, {
        Enabled: true, Type: 'condense_field', Source: 'plane', Count: 7600, BaseSize: 1.1, RadiusScale: 0.94,
        MaterialStyle: 'glass', TemporalProfile: 'emerge', TemporalStrength: 0.18, TemporalSpeed: 0.14,
        FogOpacity: 0.34, FogDensity: 0.62, FogDepth: 0.66, FogScale: 0.88, FogDrift: 0.1, FogSlices: 20,
        FogGlow: 0.08, FogAnisotropy: 0.18, ConnectionEnabled: false, Trail: 0.01,
      });
    case 'future-native-volumetric-sublimate-cloud':
      return layerPatch(layerIndex, {
        Enabled: true, Type: 'sublimate_cloud', Source: 'ring', Count: 7000, BaseSize: 1.12, RadiusScale: 1.04,
        MaterialStyle: 'glass', TemporalProfile: 'invert', TemporalStrength: 0.24, TemporalSpeed: 0.24,
        FogOpacity: 0.24, FogDensity: 0.34, FogDepth: 0.92, FogScale: 1.12, FogDrift: 0.26, FogSlices: 20,
        FogGlow: 0.16, FogAnisotropy: 0.48, ConnectionEnabled: false, Trail: 0.01,
      });
    case 'future-native-volumetric-sublimate-lift-veil':
      return layerPatch(layerIndex, {
        Enabled: true, Type: 'sublimate_cloud', Source: 'ring', Count: 7200, BaseSize: 1.08, RadiusScale: 1.08,
        MaterialStyle: 'glass', TemporalProfile: 'invert', TemporalStrength: 0.28, TemporalSpeed: 0.3,
        FogOpacity: 0.2, FogDensity: 0.24, FogDepth: 1.08, FogScale: 1.18, FogDrift: 0.3, FogSlices: 22,
        FogGlow: 0.22, FogAnisotropy: 0.58, ConnectionEnabled: false, Trail: 0.01,
      });
    case 'future-native-volumetric-sublimate-shadow-ring':
      return layerPatch(layerIndex, {
        Enabled: true, Type: 'sublimate_cloud', Source: 'ring', Count: 7000, BaseSize: 1.16, RadiusScale: 1.02,
        MaterialStyle: 'glass', TemporalProfile: 'collapse', TemporalStrength: 0.18, TemporalSpeed: 0.18,
        FogOpacity: 0.28, FogDensity: 0.42, FogDepth: 0.86, FogScale: 1.06, FogDrift: 0.18, FogSlices: 20,
        FogGlow: 0.1, FogAnisotropy: 0.34, ConnectionEnabled: false, Trail: 0.01,
      });
    default:
      return null;
  }
}
