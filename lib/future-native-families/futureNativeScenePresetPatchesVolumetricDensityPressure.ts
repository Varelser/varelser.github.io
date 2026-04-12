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

export function buildFutureNativeVolumetricDensityPressurePresetPatch(
  id: string,
  layerIndex: 2 | 3,
): Partial<ParticleConfig> | null {
  switch (id) {

    case 'future-native-volumetric-density-plume-weave':
      return layerPatch(layerIndex, {
        Enabled: true, Type: 'volume_fog', Source: 'sphere', Count: 7400, BaseSize: 1.14, RadiusScale: 1.08,
        MaterialStyle: 'glass', TemporalProfile: 'hysteresis', TemporalStrength: 0.22, TemporalSpeed: 0.14,
        FogOpacity: 0.28, FogDensity: 0.46, FogDepth: 0.82, FogScale: 0.96, FogDrift: 0.18, FogSlices: 20,
        FogGlow: 0.12, FogAnisotropy: 0.34, FlowAmplitude: 0.22, FlowFrequency: 8, ConnectionEnabled: false, Trail: 0.01,
      });
    case 'future-native-volumetric-density-shadow-wake':
      return layerPatch(layerIndex, {
        Enabled: true, Type: 'volume_fog', Source: 'grid', Count: 7600, BaseSize: 1.08, RadiusScale: 1.0,
        MaterialStyle: 'glass', TemporalProfile: 'collapse', TemporalStrength: 0.16, TemporalSpeed: 0.1,
        FogOpacity: 0.34, FogDensity: 0.62, FogDepth: 0.68, FogScale: 0.88, FogDrift: 0.08, FogSlices: 18,
        FogGlow: 0.04, FogAnisotropy: 0.12, FlowAmplitude: 0.04, FlowFrequency: 4, ConnectionEnabled: false, Trail: 0.01,
      });
    case 'future-native-volumetric-density-vortex-pocket':
      return layerPatch(layerIndex, {
        Enabled: true, Type: 'volume_fog', Source: 'ring', Count: 7200, BaseSize: 1.18, RadiusScale: 1.14,
        MaterialStyle: 'glass', TemporalProfile: 'intermittent', TemporalStrength: 0.28, TemporalSpeed: 0.24,
        FogOpacity: 0.24, FogDensity: 0.34, FogDepth: 0.96, FogScale: 1.04, FogDrift: 0.28, FogSlices: 22,
        FogGlow: 0.18, FogAnisotropy: 0.68, FlowAmplitude: 0.48, FlowFrequency: 18, ConnectionEnabled: false, Trail: 0.01,
      });
    case 'future-native-volumetric-pressure-vortex-column':
      return layerPatch(layerIndex, {
        Enabled: true, Type: 'vortex_transport', Source: 'sphere', Count: 7600, BaseSize: 1.18, RadiusScale: 1.16,
        MaterialStyle: 'glass', TemporalProfile: 'erupt', TemporalStrength: 0.24, TemporalSpeed: 0.22,
        FogOpacity: 0.3, FogDensity: 0.38, FogDepth: 0.86, FogScale: 1.0, FogDrift: 0.34, FogSlices: 22,
        FogGlow: 0.2, FogAnisotropy: 0.56, ConnectionEnabled: false, Trail: 0.01,
      });
    case 'future-native-volumetric-pressure-vortex-lift':
      return layerPatch(layerIndex, {
        Enabled: true, Type: 'vortex_transport', Source: 'ring', Count: 7800, BaseSize: 1.12, RadiusScale: 1.1,
        MaterialStyle: 'glass', TemporalProfile: 'erupt', TemporalStrength: 0.28, TemporalSpeed: 0.28,
        FogOpacity: 0.24, FogDensity: 0.28, FogDepth: 1.02, FogScale: 1.08, FogDrift: 0.4, FogSlices: 24,
        FogGlow: 0.24, FogAnisotropy: 0.78, ConnectionEnabled: false, Trail: 0.01,
      });
    case 'future-native-volumetric-pressure-vortex-shear':
      return layerPatch(layerIndex, {
        Enabled: true, Type: 'vortex_transport', Source: 'sphere', Count: 7400, BaseSize: 1.16, RadiusScale: 1.04,
        MaterialStyle: 'glass', TemporalProfile: 'intermittent', TemporalStrength: 0.18, TemporalSpeed: 0.16,
        FogOpacity: 0.32, FogDensity: 0.54, FogDepth: 0.74, FogScale: 0.92, FogDrift: 0.16, FogSlices: 20,
        FogGlow: 0.08, FogAnisotropy: 0.34, ConnectionEnabled: false, Trail: 0.01,
      });
    case 'future-native-volumetric-pressure-cells-basin':
      return layerPatch(layerIndex, {
        Enabled: true, Type: 'pressure_cells', Source: 'grid', Count: 7200, BaseSize: 1.12, RadiusScale: 1.0,
        MaterialStyle: 'halftone', TemporalProfile: 'hysteresis', TemporalStrength: 0.24, TemporalSpeed: 0.16,
        FogOpacity: 0.28, FogDensity: 0.44, FogDepth: 0.62, FogScale: 0.84, FogDrift: 0.12, FogSlices: 20,
        FogGlow: 0.08, FogAnisotropy: 0.18, ConnectionEnabled: false, Trail: 0.01,
      });
    case 'future-native-volumetric-pressure-cells-lantern':
      return layerPatch(layerIndex, {
        Enabled: true, Type: 'pressure_cells', Source: 'plane', Count: 7000, BaseSize: 1.08, RadiusScale: 0.96,
        MaterialStyle: 'halftone', TemporalProfile: 'recover', TemporalStrength: 0.26, TemporalSpeed: 0.18,
        FogOpacity: 0.24, FogDensity: 0.32, FogDepth: 0.78, FogScale: 0.92, FogDrift: 0.18, FogSlices: 22,
        FogGlow: 0.18, FogAnisotropy: 0.24, ConnectionEnabled: false, Trail: 0.01,
      });
    case 'future-native-volumetric-pressure-cells-wall':
      return layerPatch(layerIndex, {
        Enabled: true, Type: 'pressure_cells', Source: 'grid', Count: 7400, BaseSize: 1.14, RadiusScale: 1.04,
        MaterialStyle: 'halftone', TemporalProfile: 'hysteresis', TemporalStrength: 0.18, TemporalSpeed: 0.12,
        FogOpacity: 0.34, FogDensity: 0.62, FogDepth: 0.58, FogScale: 0.8, FogDrift: 0.08, FogSlices: 18,
        FogGlow: 0.04, FogAnisotropy: 0.12, ConnectionEnabled: false, Trail: 0.01,
      });
    default:
      return null;
  }
}
