import type { ParticleConfig } from '../../types';
import { layerPatch } from './futureNativeScenePresetPatchShared';

export function buildFutureNativeMpmSnowViscoplasticPresetPatch(
  id: string,
  layerIndex: 2 | 3,
): Partial<ParticleConfig> | null {
  switch (id) {
    case 'future-native-mpm-viscoplastic-viscous-flow':
      return layerPatch(layerIndex, {
        Enabled: true,
        Type: 'viscous_flow',
        Source: 'plane',
        Count: 10100,
        BaseSize: 0.88,
        RadiusScale: 1.04,
        MaterialStyle: 'classic',
        TemporalProfile: 'recover',
        TemporalStrength: 0.3,
        TemporalSpeed: 0.22,
        CrystalOpacity: 0.84,
        CrystalScale: 0.94,
        CrystalDensity: 0.88,
        CrystalSpread: 0.22,
        CrystalAudioReactive: 0.08,
        ConnectionEnabled: false,
        Trail: 0.02,
        WindX: 0.06,
        WindY: -0.01,
      });
    case 'future-native-mpm-viscoplastic-melt-front':
      return layerPatch(layerIndex, {
        Enabled: true,
        Type: 'melt_front',
        Source: 'sphere',
        Count: 9400,
        BaseSize: 0.92,
        RadiusScale: 1.08,
        MaterialStyle: 'chrome',
        TemporalProfile: 'recover',
        TemporalStrength: 0.34,
        TemporalSpeed: 0.18,
        CrystalOpacity: 0.78,
        CrystalScale: 1.04,
        CrystalDensity: 0.92,
        CrystalSpread: 0.16,
        CrystalAudioReactive: 0.06,
        ConnectionEnabled: false,
        Trail: 0.018,
        WindX: 0.04,
        WindY: 0.0,
      });
    case 'future-native-mpm-viscoplastic-evaporative-sheet':
      return layerPatch(layerIndex, {
        Enabled: true,
        Type: 'evaporative_sheet',
        Source: 'plane',
        Count: 9200,
        BaseSize: 1.02,
        RadiusScale: 1.0,
        MaterialStyle: 'glass',
        TemporalProfile: 'recover',
        TemporalStrength: 0.26,
        TemporalSpeed: 0.24,
        CrystalOpacity: 0.72,
        CrystalScale: 0.98,
        CrystalDensity: 0.8,
        CrystalSpread: 0.28,
        CrystalAudioReactive: 0.08,
        ConnectionEnabled: false,
        Trail: 0.024,
        WindX: 0.1,
        WindY: 0.03,
      });
    case 'future-native-mpm-snow-ashfall':
      return layerPatch(layerIndex, {
        Enabled: true,
        Type: 'ashfall',
        Source: 'plane',
        Count: 9800,
        BaseSize: 0.9,
        RadiusScale: 1.02,
        MaterialStyle: 'classic',
        TemporalProfile: 'recover',
        TemporalStrength: 0.24,
        TemporalSpeed: 0.18,
        CrystalOpacity: 0.82,
        CrystalScale: 1.08,
        CrystalDensity: 0.86,
        CrystalSpread: 0.22,
        CrystalAudioReactive: 0.06,
        ConnectionEnabled: false,
        Trail: 0.016,
        WindX: 0.02,
        WindY: -0.03,
      });
    case 'future-native-mpm-snow-frost-lattice':
      return layerPatch(layerIndex, {
        Enabled: true,
        Type: 'frost_lattice',
        Source: 'grid',
        Count: 9600,
        BaseSize: 0.84,
        RadiusScale: 1.08,
        MaterialStyle: 'glass',
        TemporalProfile: 'phase_shift',
        TemporalStrength: 0.3,
        TemporalSpeed: 0.16,
        CrystalOpacity: 0.78,
        CrystalScale: 1.14,
        CrystalDensity: 0.94,
        CrystalSpread: 0.14,
        CrystalAudioReactive: 0.04,
        ConnectionEnabled: false,
        Trail: 0.014,
        WindX: 0.0,
        WindY: -0.02,
      });
    case 'future-native-mpm-snow-avalanche-field':
      return layerPatch(layerIndex, {
        Enabled: true,
        Type: 'avalanche_field',
        Source: 'sphere',
        Count: 10400,
        BaseSize: 0.96,
        RadiusScale: 1.12,
        MaterialStyle: 'chrome',
        TemporalProfile: 'collapse',
        TemporalStrength: 0.34,
        TemporalSpeed: 0.22,
        CrystalOpacity: 0.76,
        CrystalScale: 1.02,
        CrystalDensity: 0.9,
        CrystalSpread: 0.18,
        CrystalAudioReactive: 0.08,
        ConnectionEnabled: false,
        Trail: 0.02,
        WindX: 0.08,
        WindY: 0.0,
      });
    default:
      return null;
  }
}
