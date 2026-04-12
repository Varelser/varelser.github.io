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

export function buildFutureNativePbdMembranePresetPatch(id: string, layerIndex: 2 | 3): Partial<ParticleConfig> | null {
  switch (id) {
    case 'future-native-pbd-membrane-elastic':
      return layerPatch(layerIndex, {
        Enabled: true,
        Type: 'elastic_sheet',
        Source: 'plane',
        Count: 9600,
        BaseSize: 0.96,
        RadiusScale: 1.08,
        MaterialStyle: 'glass',
        TemporalProfile: 'rebound',
        TemporalStrength: 0.26,
        TemporalSpeed: 0.2,
        SheetOpacity: 0.64,
        SheetFresnel: 0.8,
        SheetAudioReactive: 0.1,
        SheetWireframe: false,
        ConnectionEnabled: false,
        Trail: 0.04,
        WindX: 0.14,
        WindY: 0.04,
      });
    case 'future-native-pbd-membrane-memory':
      return layerPatch(layerIndex, {
        Enabled: true,
        Type: 'viscoelastic_membrane',
        Source: 'plane',
        Count: 9800,
        BaseSize: 0.94,
        RadiusScale: 1.1,
        MaterialStyle: 'glass',
        TemporalProfile: 'hysteresis',
        TemporalStrength: 0.28,
        TemporalSpeed: 0.16,
        SheetOpacity: 0.68,
        SheetFresnel: 0.78,
        SheetAudioReactive: 0.12,
        SheetWireframe: false,
        ConnectionEnabled: false,
        Trail: 0.04,
        WindX: 0.12,
        WindY: 0.05,
      });
    default:
      return null;
  }
}
