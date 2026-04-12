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

export function buildFutureNativePbdClothSoftbodyPresetPatch(
  id: string,
  layerIndex: 2 | 3,
): Partial<ParticleConfig> | null {
  switch (id) {
    case 'future-native-pbd-cloth-drape':
      return layerPatch(layerIndex, {
        Enabled: true, Type: 'cloth_membrane', Source: 'plane', Count: 9800, BaseSize: 1.02, RadiusScale: 1.12,
        MaterialStyle: 'glass', TemporalProfile: 'unravel', TemporalStrength: 0.18, TemporalSpeed: 0.22,
        SheetOpacity: 0.68, SheetFresnel: 0.74, SheetAudioReactive: 0.08, SheetWireframe: false,
        ConnectionEnabled: false, Trail: 0.06, WindX: 0.18, WindY: 0.06,
      });
    case 'future-native-pbd-softbody-shell':
      return layerPatch(layerIndex, {
        Enabled: true, Type: 'surface_shell', Source: 'sphere', Count: 11200, BaseSize: 0.88, RadiusScale: 1.14,
        MaterialStyle: 'glass', TemporalProfile: 'rebound', TemporalStrength: 0.22, TemporalSpeed: 0.18,
        HullOpacity: 0.64, HullPointBudget: 3072, HullJitter: 0.07, HullFresnel: 0.68, HullAudioReactive: 0.08,
        HullWireframe: false, ConnectionEnabled: false, Trail: 0.03,
      });
    case 'future-native-pbd-softbody-lattice':
      return layerPatch(layerIndex, {
        Enabled: true, Type: 'elastic_lattice', Source: 'cube', Count: 9600, BaseSize: 0.82, RadiusScale: 1.04,
        MaterialStyle: 'chrome', TemporalProfile: 'rebound', TemporalStrength: 0.24, TemporalSpeed: 0.18,
        VoxelOpacity: 0.62, VoxelScale: 1.08, VoxelDensity: 0.54, VoxelSnap: 0.68, VoxelAudioReactive: 0.06,
        VoxelWireframe: false, ConnectionEnabled: false, Trail: 0.02,
      });
    default:
      return null;
  }
}
