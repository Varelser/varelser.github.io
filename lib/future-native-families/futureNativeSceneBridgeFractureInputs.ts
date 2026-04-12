import type { ParticleConfig } from '../../types';
import {
  clamp,
  getLayerCount,
  getLayerFlowAmplitude,
  getLayerFlowFrequency,
  getLayerMode,
  getLayerRadiusScale,
  getLayerRepulsion,
  getLayerSource,
  getLayerTemporalStrength,
  type SupportedLayerIndex,
} from './futureNativeSceneBridgeShared';
import {
  buildFractureCrackPropagationInput,
  buildFractureDebrisGenerationInput,
  buildFractureVoxelInput,
} from './futureNativeSceneBridgeFractureDedicated';
import type { FractureLatticeInputConfig } from './starter-runtime/fracture_latticeAdapter';

export function buildFractureLatticeInput(config: ParticleConfig, layerIndex: SupportedLayerIndex): FractureLatticeInputConfig {
  const mode = getLayerMode(config, layerIndex);
  if (mode === 'voxel_lattice') return buildFractureVoxelInput(config, layerIndex);
  if (mode === 'seep_fracture') return buildFractureCrackPropagationInput(config, layerIndex);
  if (mode === 'shard_debris' || mode === 'orbit_fracture' || mode === 'fracture_pollen') {
    return buildFractureDebrisGenerationInput(config, layerIndex);
  }

  const source = getLayerSource(config, layerIndex);
  const temporalStrength = getLayerTemporalStrength(config, layerIndex);
  const flowAmplitude = getLayerFlowAmplitude(config, layerIndex);
  const flowFrequency = getLayerFlowFrequency(config, layerIndex);
  const width = clamp(
    Math.round(Math.sqrt(Math.max(1, getLayerCount(config, layerIndex))) / (mode === 'collapse_fracture' ? 3.6 : 3.6)),
    18,
    34,
  );
  const height = clamp(Math.round(width * (source === 'grid' || source === 'plane' ? 1 : 0.82)), 14, 32);
  return {
    width,
    height,
    bondStrength: clamp(0.88 + getLayerRadiusScale(config, layerIndex) * 0.12, 0.72, 1.4),
    impulseThreshold: clamp(0.42 + temporalStrength * 0.14, 0.32, 0.9),
    debrisSpawnRate: clamp(0.12 + flowAmplitude * 0.16, 0.04, 0.64),
    impactX: clamp(mode === 'collapse_fracture' ? 0.5 : 0.58, 0.12, 0.88),
    impactY: clamp(mode === 'collapse_fracture' ? 0.46 : 0.58, 0.12, 0.88),
    impactRadius: clamp(0.12 + getLayerRadiusScale(config, layerIndex) * 0.03, 0.08, 0.34),
    impulseMagnitude: clamp((mode === 'collapse_fracture' ? 1.8 : 1.4) + temporalStrength * 0.22, 1.0, 2.8),
    propagationFalloff: clamp(0.7 + flowFrequency * 0.001, 0.48, 0.94),
    propagationDirectionX: mode === 'collapse_fracture' ? 0.18 : 0.85,
    propagationDirectionY: mode === 'collapse_fracture' ? -0.92 : -0.18,
    directionalBias: clamp(mode === 'collapse_fracture' ? 0.3 : 0.46, 0.18, 0.88),
    debrisImpulseScale: clamp(0.92 + flowAmplitude * 0.12, 0.68, 1.62),
    splitAffinity: clamp(0.26 + temporalStrength * 0.14, 0.16, 0.88),
    fragmentDetachThreshold: clamp(0.08 + getLayerRepulsion(config, layerIndex) * 0.01, 0.04, 0.3),
    seed: Math.round(getLayerCount(config, layerIndex) + getLayerFlowFrequency(config, layerIndex)) % 997,
  };
}
