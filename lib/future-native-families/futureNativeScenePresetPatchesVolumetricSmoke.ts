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

export function buildFutureNativeVolumetricSmokePresetPatch(id: string, layerIndex: 2 | 3): Partial<ParticleConfig> | null {
  switch (id) {
    case 'future-native-volumetric-smoke-prism':
      return layerPatch(layerIndex, {
        Enabled: true, Type: 'prism_smoke', Source: 'video', Count: 7800, BaseSize: 1.04, RadiusScale: 1.02,
        MaterialStyle: 'glass', TemporalProfile: 'oscillate', TemporalStrength: 0.26, TemporalSpeed: 0.22,
        FogOpacity: 0.26, FogDensity: 0.42, FogDepth: 0.82, FogScale: 1.0, FogDrift: 0.18, FogSlices: 24,
        FogGlow: 0.16, FogAnisotropy: 0.34, ConnectionEnabled: false, Trail: 0.01,
      });
    case 'future-native-volumetric-smoke-prism-light-fan':
      return layerPatch(layerIndex, {
        Enabled: true, Type: 'prism_smoke', Source: 'video', Count: 8000, BaseSize: 1.02, RadiusScale: 1.08,
        MaterialStyle: 'glass', TemporalProfile: 'oscillate', TemporalStrength: 0.3, TemporalSpeed: 0.24,
        FogOpacity: 0.24, FogDensity: 0.38, FogDepth: 0.86, FogScale: 1.04, FogDrift: 0.24, FogSlices: 26,
        FogGlow: 0.24, FogAnisotropy: 0.52, ConnectionEnabled: false, Trail: 0.01,
      });
    case 'future-native-volumetric-smoke-prism-obstacle-gate':
      return layerPatch(layerIndex, {
        Enabled: true, Type: 'prism_smoke', Source: 'video', Count: 7600, BaseSize: 1.0, RadiusScale: 1.14,
        MaterialStyle: 'glass', TemporalProfile: 'oscillate', TemporalStrength: 0.22, TemporalSpeed: 0.18,
        FogOpacity: 0.28, FogDensity: 0.5, FogDepth: 0.78, FogScale: 0.98, FogDrift: 0.12, FogSlices: 28,
        FogGlow: 0.14, FogAnisotropy: 0.42, ConnectionEnabled: false, Trail: 0.01,
      });
    case 'future-native-volumetric-smoke-static-slab':
      return layerPatch(layerIndex, {
        Enabled: true, Type: 'static_smoke', Source: 'grid', Count: 7200, BaseSize: 1.08, RadiusScale: 1.0,
        MaterialStyle: 'glass', TemporalProfile: 'steady', TemporalStrength: 0.2, TemporalSpeed: 0.14,
        FogOpacity: 0.28, FogDensity: 0.5, FogDepth: 0.76, FogScale: 0.94, FogDrift: 0.1, FogSlices: 22,
        FogGlow: 0.08, FogAnisotropy: 0.18, ConnectionEnabled: false, Trail: 0.01,
      });
    case 'future-native-volumetric-smoke-static-shadow-wall':
      return layerPatch(layerIndex, {
        Enabled: true, Type: 'static_smoke', Source: 'grid', Count: 7400, BaseSize: 1.06, RadiusScale: 1.1,
        MaterialStyle: 'glass', TemporalProfile: 'steady', TemporalStrength: 0.18, TemporalSpeed: 0.1,
        FogOpacity: 0.3, FogDensity: 0.6, FogDepth: 0.72, FogScale: 0.9, FogDrift: 0.06, FogSlices: 24,
        FogGlow: 0.04, FogAnisotropy: 0.12, ConnectionEnabled: false, Trail: 0.01,
      });
    case 'future-native-volumetric-smoke-static-lantern-slab':
      return layerPatch(layerIndex, {
        Enabled: true, Type: 'static_smoke', Source: 'grid', Count: 7000, BaseSize: 1.02, RadiusScale: 0.96,
        MaterialStyle: 'glass', TemporalProfile: 'steady', TemporalStrength: 0.24, TemporalSpeed: 0.16,
        FogOpacity: 0.26, FogDensity: 0.44, FogDepth: 0.84, FogScale: 1.02, FogDrift: 0.18, FogSlices: 22,
        FogGlow: 0.18, FogAnisotropy: 0.28, ConnectionEnabled: false, Trail: 0.01,
      });
    default:
      return null;
  }
}
