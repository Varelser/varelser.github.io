import type { ParticleConfig } from '../../types';
import { layerPatch } from './futureNativeScenePresetPatchShared';
import { buildFutureNativeFractureDedicatedPresetPatch } from './futureNativeScenePresetPatchesFractureDedicated';

export function buildFutureNativeFracturePresetPatch(id: string, layerIndex: 2 | 3): Partial<ParticleConfig> | null {
  switch (id) {
    case 'future-native-fracture-lattice-grammar':
      return layerPatch(layerIndex, {
        Enabled: true,
        Type: 'fracture_grammar',
        Source: 'grid',
        Count: 8600,
        BaseSize: 0.76,
        RadiusScale: 1.0,
        MaterialStyle: 'classic',
        TemporalProfile: 'phase_shift',
        TemporalStrength: 0.28,
        TemporalSpeed: 0.22,
        ConnectionEnabled: false,
        Trail: 0.01,
      });
    case 'future-native-fracture-lattice-collapse':
      return layerPatch(layerIndex, {
        Enabled: true,
        Type: 'collapse_fracture',
        Source: 'sphere',
        Count: 9000,
        BaseSize: 0.82,
        RadiusScale: 1.06,
        MaterialStyle: 'chrome',
        TemporalProfile: 'collapse',
        TemporalStrength: 0.3,
        TemporalSpeed: 0.18,
        ConnectionEnabled: false,
        Trail: 0.01,
      });
    default:
      return buildFutureNativeFractureDedicatedPresetPatch(id, layerIndex);
  }
}
