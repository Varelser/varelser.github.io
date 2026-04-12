import type { ParticleConfig } from '../../types';
import {
  clamp,
  deriveGridDimensions,
  getLayerBaseSize,
  getLayerCollisionRadius,
  getLayerCount,
  getLayerFlowAmplitude,
  getLayerFlowFrequency,
  getLayerGravity,
  getLayerMode,
  getLayerRadiusScale,
  getLayerRepulsion,
  getLayerSource,
  getLayerTemporalSpeed,
  getLayerTemporalStrength,
  getLayerWindX,
  getLayerWindY,
  type SupportedLayerIndex,
} from './futureNativeSceneBridgeShared';
import type { PbdClothInputConfig } from './starter-runtime/pbd_clothAdapter';
import type { PbdSoftbodyInputConfig } from './starter-runtime/pbd_softbodyAdapter';

export function buildFutureNativeClothInput(
  config: ParticleConfig,
  layerIndex: SupportedLayerIndex,
): PbdClothInputConfig {
  const source = getLayerSource(config, layerIndex);
  const mode = getLayerMode(config, layerIndex);
  const dims = deriveGridDimensions(getLayerCount(config, layerIndex), source, 'pbd-cloth');
  const temporalStrength = getLayerTemporalStrength(config, layerIndex);
  const temporalSpeed = getLayerTemporalSpeed(config, layerIndex);
  const flowAmplitude = getLayerFlowAmplitude(config, layerIndex);
  const flowFrequency = getLayerFlowFrequency(config, layerIndex);
  const pinMode = source === 'text' ? 'top-band' : source === 'plane' || source === 'grid' ? 'top-edge' : 'top-corners';
  return {
    width: dims.width,
    height: dims.height,
    spacing: clamp(0.08 * getLayerBaseSize(config, layerIndex), 0.055, 0.11),
    stiffness: clamp(0.82 + getLayerRadiusScale(config, layerIndex) * 0.08, 0.76, 0.97),
    shearStiffness: clamp(0.56 + flowFrequency * 0.04, 0.48, 0.88),
    bendStiffness: clamp(0.18 + temporalStrength * 0.22, 0.14, 0.42),
    damping: clamp(0.03 + temporalSpeed * 0.08, 0.025, 0.12),
    gravity: clamp(6.8 + getLayerGravity(config, layerIndex) * 0.55, 4.5, 12.5),
    pulseX: clamp(getLayerWindX(config, layerIndex) * 0.18, -0.48, 0.48),
    pulseY: clamp(getLayerWindY(config, layerIndex) * 0.16, -0.32, 0.32),
    collisionRadius: clamp(getLayerCollisionRadius(config, layerIndex) * 0.08, 0.012, 0.04),
    floorY: -1.18,
    pinMode,
    pinGroupWidth: Math.max(2, Math.round(dims.width * (source === 'text' ? 0.22 : 0.16))),
    pinGroupCount: source === 'text' ? 3 : 2,
    pinGroupStrength: clamp(0.16 + temporalStrength * 0.18, 0.12, 0.36),
    pinChoreographyMode: source === 'text' ? 'sweep' : 'orbit',
    pinChoreographyPreset: mode === 'cloth_membrane' ? 'breath-wave' : 'shear-walk',
    pinChoreographyAmplitude: clamp(0.02 + flowAmplitude * 0.06, 0.012, 0.06),
    pinChoreographySpeed: clamp(0.05 + temporalSpeed * 0.16, 0.04, 0.2),
    tearThreshold: clamp(1.36 + getLayerRepulsion(config, layerIndex) * 0.018, 1.18, 1.72),
    tearPropagationBias: clamp(0.18 + flowAmplitude * 0.24, 0.12, 0.52),
    tearDirectionX: source === 'text' ? 0.65 : 1,
    tearDirectionY: source === 'plane' ? -0.24 : -0.12,
    obstacleFieldX: 0.02,
    obstacleFieldY: -0.06,
    obstacleFieldRadius: 0.24,
    obstacleFieldStrength: 0.42,
    obstacleField2X: -0.18,
    obstacleField2Y: -0.18,
    obstacleField2Radius: 0.16,
    obstacleField2Strength: 0.26,
    obstaclePreset: source === 'text' ? 'shear-lattice' : 'staggered-arc',
    tearBiasMapPreset: source === 'text' ? 'shear-noise' : 'warp-weft',
    tearBiasMapScale: clamp(0.32 + temporalStrength * 0.24, 0.22, 0.68),
    tearBiasMapFrequency: clamp(1.8 + flowFrequency * 0.08, 1.4, 4.6),
    tearBiasMapRotation: source === 'text' ? 0.92 : 0.38,
    tearBiasMapContrast: clamp(0.56 + temporalStrength * 0.2, 0.45, 0.88),
    selfCollisionStiffness: clamp(0.24 + getLayerRepulsion(config, layerIndex) * 0.02, 0.18, 0.58),
    windX: clamp(getLayerWindX(config, layerIndex) * 0.34, -0.52, 0.52),
    windY: clamp(getLayerWindY(config, layerIndex) * 0.3, -0.4, 0.4),
    windPulse: clamp(0.18 + flowAmplitude * 0.18, 0.08, 0.62),
    pressureStrength: clamp(0.06 + temporalStrength * 0.16, 0.04, 0.28),
    pressurePulse: clamp(0.18 + temporalSpeed * 0.28, 0.12, 0.62),
    circleColliderX: 0.06,
    circleColliderY: -0.26,
    circleColliderRadius: 0.12,
    capsuleColliderAx: -0.24,
    capsuleColliderAy: -0.1,
    capsuleColliderBx: 0.18,
    capsuleColliderBy: -0.36,
    capsuleColliderRadius: 0.052,
  };
}

export function buildFutureNativeSoftbodyInput(
  config: ParticleConfig,
  layerIndex: SupportedLayerIndex,
): PbdSoftbodyInputConfig {
  const source = getLayerSource(config, layerIndex);
  const dims = deriveGridDimensions(getLayerCount(config, layerIndex), source, 'pbd-softbody');
  const temporalStrength = getLayerTemporalStrength(config, layerIndex);
  const temporalSpeed = getLayerTemporalSpeed(config, layerIndex);
  const flowAmplitude = getLayerFlowAmplitude(config, layerIndex);
  const flowFrequency = getLayerFlowFrequency(config, layerIndex);
  return {
    width: dims.width,
    height: dims.height,
    spacing: clamp(0.094 * getLayerBaseSize(config, layerIndex), 0.074, 0.12),
    stiffness: clamp(0.86 + getLayerRadiusScale(config, layerIndex) * 0.08, 0.76, 0.98),
    damping: clamp(0.036 + temporalSpeed * 0.08, 0.028, 0.13),
    gravity: clamp(5.4 + getLayerGravity(config, layerIndex) * 0.44, 3.8, 10.8),
    collisionRadius: clamp(getLayerCollisionRadius(config, layerIndex) * 0.09, 0.015, 0.045),
    floorY: -0.72,
    shellTension: clamp(0.22 + getLayerRadiusScale(config, layerIndex) * 0.18, 0.18, 0.56),
    pressureStrength: clamp(0.2 + temporalStrength * 0.2, 0.16, 0.54),
    volumePreservation: clamp(0.74 + temporalStrength * 0.16, 0.68, 1),
    windX: clamp(getLayerWindX(config, layerIndex) * 0.28, -0.36, 0.36),
    windY: clamp(getLayerWindY(config, layerIndex) * 0.24, -0.28, 0.28),
    windPulse: clamp(0.16 + flowAmplitude * 0.12, 0.08, 0.44),
    selfCollisionStiffness: clamp(0.26 + getLayerRepulsion(config, layerIndex) * 0.018, 0.18, 0.58),
    circleColliderX: 0,
    circleColliderY: -0.18,
    circleColliderRadius: clamp(0.11 + flowAmplitude * 0.04, 0.1, 0.22),
    capsuleColliderAx: -0.18,
    capsuleColliderAy: -0.06,
    capsuleColliderBx: 0.18,
    capsuleColliderBy: -0.06,
    capsuleColliderRadius: clamp(0.045 + flowFrequency * 0.002, 0.04, 0.08),
  };
}
