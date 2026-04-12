import type { ParticleConfig } from '../../types';
import { layerPatch } from './futureNativeScenePresetPatchShared';

export function buildFutureNativeMpmMudPastePresetPatch(
  id: string,
  layerIndex: 2 | 3,
): Partial<ParticleConfig> | null {
  switch (id) {
    case 'future-native-mpm-mud-sediment-stack':
      return layerPatch(layerIndex, {
        Enabled: true,
        Type: 'sediment_stack',
        Source: 'plane',
        Count: 10200,
        BaseSize: 0.82,
        RadiusScale: 1.02,
        MaterialStyle: 'classic',
        TemporalProfile: 'accumulate',
        TemporalStrength: 0.3,
        TemporalSpeed: 0.18,
        CrystalOpacity: 0.82,
        CrystalScale: 0.92,
        CrystalDensity: 0.88,
        CrystalSpread: 0.2,
        CrystalAudioReactive: 0.06,
        ConnectionEnabled: false,
        Trail: 0.02,
        WindX: 0.04,
        WindY: -0.01,
      });
    case 'future-native-mpm-mud-talus-heap':
      return layerPatch(layerIndex, {
        Enabled: true,
        Type: 'talus_heap',
        Source: 'sphere',
        Count: 9800,
        BaseSize: 0.76,
        RadiusScale: 1.08,
        MaterialStyle: 'halftone',
        TemporalProfile: 'accumulate',
        TemporalStrength: 0.26,
        TemporalSpeed: 0.2,
        CrystalOpacity: 0.8,
        CrystalScale: 0.9,
        CrystalDensity: 0.86,
        CrystalSpread: 0.16,
        CrystalAudioReactive: 0.05,
        ConnectionEnabled: false,
        Trail: 0.018,
        WindX: 0.02,
        WindY: -0.02,
      });
    case 'future-native-mpm-mud-liquid-smear':
      return layerPatch(layerIndex, {
        Enabled: true,
        Type: 'liquid_smear',
        Source: 'plane',
        Count: 9400,
        BaseSize: 0.96,
        RadiusScale: 1.06,
        MaterialStyle: 'chrome',
        TemporalProfile: 'recover',
        TemporalStrength: 0.28,
        TemporalSpeed: 0.22,
        CrystalOpacity: 0.78,
        CrystalScale: 1.02,
        CrystalDensity: 0.82,
        CrystalSpread: 0.24,
        CrystalAudioReactive: 0.08,
        ConnectionEnabled: false,
        Trail: 0.022,
        WindX: 0.08,
        WindY: 0,
      });
    case 'future-native-mpm-paste-capillary-sheet':
      return layerPatch(layerIndex, {
        Enabled: true,
        Type: 'capillary_sheet',
        Source: 'text',
        Count: 9800,
        BaseSize: 0.9,
        RadiusScale: 1.04,
        MaterialStyle: 'halftone',
        TemporalProfile: 'saturate',
        TemporalStrength: 0.3,
        TemporalSpeed: 0.16,
        DepositionOpacity: 0.86,
        DepositionRelief: 0.64,
        DepositionErosion: 0.1,
        DepositionBands: 8,
        ConnectionEnabled: false,
        Trail: 0.02,
        WindX: 0.02,
        WindY: -0.01,
      });
    case 'future-native-mpm-paste-percolation-sheet':
      return layerPatch(layerIndex, {
        Enabled: true,
        Type: 'percolation_sheet',
        Source: 'image',
        Count: 9600,
        BaseSize: 0.94,
        RadiusScale: 1.08,
        MaterialStyle: 'halftone',
        TemporalProfile: 'percolate',
        TemporalStrength: 0.28,
        TemporalSpeed: 0.18,
        DepositionOpacity: 0.84,
        DepositionRelief: 0.7,
        DepositionErosion: 0.08,
        DepositionBands: 9,
        ConnectionEnabled: false,
        Trail: 0.025,
        WindX: 0.03,
        WindY: -0.01,
      });
    case 'future-native-mpm-paste-crawl-seep':
      return layerPatch(layerIndex, {
        Enabled: true,
        Type: 'crawl_seep',
        Source: 'plane',
        Count: 9200,
        BaseSize: 1.02,
        RadiusScale: 1.06,
        MaterialStyle: 'classic',
        TemporalProfile: 'recover',
        TemporalStrength: 0.26,
        TemporalSpeed: 0.24,
        FlowOpacity: 0.84,
        FlowAmplitude: 0.34,
        FlowFrequency: 0.22,
        FlowWarp: 0.18,
        ConnectionEnabled: false,
        Trail: 0.03,
        WindX: 0.02,
        WindY: 0,
      });
    default:
      return null;
  }
}
