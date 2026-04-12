import type { ParticleConfig } from '../../types';
import { layerPatch } from './futureNativeScenePresetPatchShared';

export function buildFutureNativeFractureDedicatedPresetPatch(
  id: string,
  layerIndex: 2 | 3,
): Partial<ParticleConfig> | null {
  switch (id) {
    case 'future-native-fracture-voxel-lattice':
      return layerPatch(layerIndex, {
        Enabled: true,
        Type: 'voxel_lattice',
        Source: 'cube',
        Count: 9800,
        BaseSize: 0.84,
        RadiusScale: 1.08,
        MaterialStyle: 'chrome',
        TemporalProfile: 'collapse',
        TemporalStrength: 0.26,
        TemporalSpeed: 0.2,
        VoxelOpacity: 0.68,
        VoxelScale: 1.12,
        VoxelDensity: 0.72,
        VoxelSnap: 0.74,
        VoxelAudioReactive: 0.08,
        VoxelWireframe: false,
        ConnectionEnabled: false,
        Trail: 0.01,
      });
    case 'future-native-fracture-crack-propagation-seep':
      return layerPatch(layerIndex, {
        Enabled: true,
        Type: 'seep_fracture',
        Source: 'image',
        Count: 9200,
        BaseSize: 0.8,
        RadiusScale: 0.98,
        MaterialStyle: 'glass',
        TemporalProfile: 'collapse',
        TemporalStrength: 0.32,
        TemporalSpeed: 0.24,
        VoxelOpacity: 0.58,
        VoxelScale: 1.04,
        VoxelDensity: 0.64,
        VoxelSnap: 0.66,
        VoxelAudioReactive: 0.06,
        VoxelWireframe: false,
        ConnectionEnabled: false,
        Trail: 0.012,
      });
    case 'future-native-fracture-debris-generation-shard':
      return layerPatch(layerIndex, {
        Enabled: true,
        Type: 'shard_debris',
        Source: 'sphere',
        Count: 9600,
        BaseSize: 0.78,
        RadiusScale: 1.04,
        MaterialStyle: 'chrome',
        TemporalProfile: 'collapse',
        TemporalStrength: 0.34,
        TemporalSpeed: 0.2,
        VoxelOpacity: 0.52,
        VoxelScale: 1.08,
        VoxelDensity: 0.68,
        VoxelSnap: 0.62,
        VoxelAudioReactive: 0.08,
        VoxelWireframe: false,
        ConnectionEnabled: false,
        Trail: 0.016,
      });
    case 'future-native-fracture-debris-generation-orbit':
      return layerPatch(layerIndex, {
        Enabled: true,
        Type: 'orbit_fracture',
        Source: 'ring',
        Count: 9400,
        BaseSize: 0.76,
        RadiusScale: 1.0,
        MaterialStyle: 'glass',
        TemporalProfile: 'phase_shift',
        TemporalStrength: 0.3,
        TemporalSpeed: 0.26,
        VoxelOpacity: 0.58,
        VoxelScale: 1.02,
        VoxelDensity: 0.62,
        VoxelSnap: 0.58,
        VoxelAudioReactive: 0.1,
        VoxelWireframe: false,
        ConnectionEnabled: false,
        Trail: 0.018,
      });
    case 'future-native-fracture-debris-generation-pollen':
      return layerPatch(layerIndex, {
        Enabled: true,
        Type: 'fracture_pollen',
        Source: 'text',
        Count: 9200,
        BaseSize: 0.86,
        RadiusScale: 0.96,
        MaterialStyle: 'glass',
        TemporalProfile: 'breath',
        TemporalStrength: 0.26,
        TemporalSpeed: 0.24,
        VoxelOpacity: 0.48,
        VoxelScale: 0.98,
        VoxelDensity: 0.56,
        VoxelSnap: 0.54,
        VoxelAudioReactive: 0.12,
        VoxelWireframe: false,
        ConnectionEnabled: false,
        Trail: 0.02,
      });
    default:
      return null;
  }
}
