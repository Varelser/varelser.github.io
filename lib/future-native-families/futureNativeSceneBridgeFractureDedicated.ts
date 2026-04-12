import type { ParticleConfig } from '../../types';
import {
  clamp,
  getLayerCount,
  getLayerFlowAmplitude,
  getLayerFlowFrequency,
  getLayerMode,
  getLayerRadiusScale,
  getLayerRepulsion,
  getLayerTemporalStrength,
  type SupportedLayerIndex,
} from './futureNativeSceneBridgeShared';
import type { FractureLatticeInputConfig } from './starter-runtime/fracture_latticeAdapter';

function buildDedicatedFractureConfig(
  config: ParticleConfig,
  layerIndex: SupportedLayerIndex,
  kind: 'voxel' | 'crack' | 'debris-shard' | 'debris-orbit' | 'debris-pollen',
): FractureLatticeInputConfig {
  const temporalStrength = getLayerTemporalStrength(config, layerIndex);
  const flowAmplitude = getLayerFlowAmplitude(config, layerIndex);
  const flowFrequency = getLayerFlowFrequency(config, layerIndex);
  const width = clamp(
    Math.round(
      Math.sqrt(Math.max(1, getLayerCount(config, layerIndex))) /
        (kind === 'voxel' ? 3.2 : kind === 'crack' ? 4.8 : 4.2),
    ),
    18,
    kind === 'crack' ? 22 : 26,
  );
  const height = clamp(
    Math.round(
      width *
        (kind === 'voxel' ? 0.72 : kind === 'crack' ? 0.7 : kind === 'debris-pollen' ? 0.9 : 0.76),
    ),
    14,
    32,
  );
  return {
    width,
    height,
    bondStrength: clamp((kind === 'voxel' ? 0.96 : kind === 'crack' ? 1.06 : 0.82) + getLayerRadiusScale(config, layerIndex) * 0.12, 0.72, 1.4),
    impulseThreshold: clamp((kind === 'voxel' ? 0.48 : kind === 'crack' ? 0.52 : 0.38) + temporalStrength * 0.14, 0.32, 0.9),
    debrisSpawnRate: clamp(
      kind === 'voxel'
        ? 0.18 + flowAmplitude * 0.16
        : kind === 'crack'
          ? 0.06 + temporalStrength * 0.08
          : 0.28 + flowAmplitude * 0.18 + (kind === 'debris-orbit' ? 0.06 : kind === 'debris-pollen' ? 0.1 : 0),
      0.04,
      0.64,
    ),
    impactX: clamp(kind === 'voxel' ? 0.52 : kind === 'crack' ? 0.34 : kind === 'debris-orbit' ? 0.42 : kind === 'debris-pollen' ? 0.56 : 0.62, 0.12, 0.88),
    impactY: clamp(kind === 'voxel' ? 0.52 : kind === 'crack' ? 0.64 : kind === 'debris-orbit' ? 0.5 : kind === 'debris-pollen' ? 0.42 : 0.6, 0.12, 0.88),
    impactRadius: clamp((kind === 'voxel' ? 0.16 : kind === 'crack' ? 0.09 : kind === 'debris-pollen' ? 0.14 : 0.18) + getLayerRadiusScale(config, layerIndex) * 0.03, 0.08, 0.34),
    impulseMagnitude: clamp((kind === 'voxel' ? 1.65 : kind === 'crack' ? 1.34 : kind === 'debris-orbit' ? 1.56 : kind === 'debris-pollen' ? 1.48 : 1.72) + temporalStrength * 0.22, 1, 2.8),
    propagationFalloff: clamp((kind === 'voxel' ? 0.74 : kind === 'crack' ? 0.86 : kind === 'debris-orbit' ? 0.62 : kind === 'debris-pollen' ? 0.58 : 0.54) + flowFrequency * 0.001, 0.48, 0.94),
    propagationDirectionX: kind === 'voxel' ? 0.62 : kind === 'crack' ? 0.94 : kind === 'debris-orbit' ? 0.48 : kind === 'debris-pollen' ? 0.38 : 0.76,
    propagationDirectionY: kind === 'voxel' ? -0.46 : kind === 'crack' ? -0.28 : kind === 'debris-orbit' ? -0.72 : kind === 'debris-pollen' ? 0.18 : -0.32,
    directionalBias: clamp(kind === 'voxel' ? 0.58 : kind === 'crack' ? 0.76 : kind === 'debris-orbit' ? 0.52 : kind === 'debris-pollen' ? 0.28 : 0.4, 0.18, 0.88),
    debrisImpulseScale: clamp(kind === 'voxel' ? 1.04 + flowAmplitude * 0.12 : kind === 'crack' ? 0.78 + temporalStrength * 0.08 : 1.08 + flowAmplitude * 0.16 + (kind === 'debris-orbit' ? 0.08 : 0), 0.68, 1.62),
    splitAffinity: clamp((kind === 'voxel' ? 0.4 : kind === 'crack' ? 0.62 : 0.68) + temporalStrength * 0.14, 0.16, 0.88),
    fragmentDetachThreshold: clamp(kind === 'voxel' ? 0.1 + getLayerRepulsion(config, layerIndex) * 0.01 : kind === 'crack' ? 0.05 + getLayerRepulsion(config, layerIndex) * 0.002 : 0.05 + getLayerRepulsion(config, layerIndex) * 0.006, 0.04, 0.3),
    seed: Math.round(getLayerCount(config, layerIndex) + getLayerFlowFrequency(config, layerIndex)) % 997,
  };
}

export function buildFractureVoxelInput(config: ParticleConfig, layerIndex: SupportedLayerIndex): FractureLatticeInputConfig {
  return buildDedicatedFractureConfig(config, layerIndex, 'voxel');
}

export function buildFractureCrackPropagationInput(config: ParticleConfig, layerIndex: SupportedLayerIndex): FractureLatticeInputConfig {
  return buildDedicatedFractureConfig(config, layerIndex, 'crack');
}

export function buildFractureDebrisGenerationInput(config: ParticleConfig, layerIndex: SupportedLayerIndex): FractureLatticeInputConfig {
  const kind = getLayerMode(config, layerIndex) === 'orbit_fracture'
    ? 'debris-orbit'
    : getLayerMode(config, layerIndex) === 'fracture_pollen'
      ? 'debris-pollen'
      : 'debris-shard';
  return buildDedicatedFractureConfig(config, layerIndex, kind);
}

export function resolveFractureDedicatedWarmFrameCount(routeTag: string, temporalStrength: number): number {
  return Math.max(
    3,
    Math.min(
      7,
      Math.round(
        (routeTag === 'future-native-fracture-voxel-lattice'
          ? 6
          : routeTag === 'future-native-fracture-crack-propagation'
            ? 4
            : routeTag === 'future-native-fracture-debris-orbit'
              ? 6
              : routeTag === 'future-native-fracture-debris-pollen'
                ? 5
                : 4) + temporalStrength * 2,
      ),
    ),
  );
}
