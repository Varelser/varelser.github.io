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
import type { PbdMembraneInputConfig } from './starter-runtime/pbd_membraneAdapter';

export function buildFutureNativeMembraneInput(
  config: ParticleConfig,
  layerIndex: SupportedLayerIndex,
): PbdMembraneInputConfig {
  const source = getLayerSource(config, layerIndex);
  const mode = getLayerMode(config, layerIndex);
  const dims = deriveGridDimensions(getLayerCount(config, layerIndex), source, 'pbd-membrane');
  const temporalStrength = getLayerTemporalStrength(config, layerIndex);
  const temporalSpeed = getLayerTemporalSpeed(config, layerIndex);
  const flowAmplitude = getLayerFlowAmplitude(config, layerIndex);
  const flowFrequency = getLayerFlowFrequency(config, layerIndex);
  return {
    width: dims.width,
    height: dims.height,
    spacing: clamp(0.078 * getLayerBaseSize(config, layerIndex), 0.055, 0.105),
    stiffness: clamp(0.84 + getLayerRadiusScale(config, layerIndex) * 0.06, 0.78, 0.98),
    shearStiffness: clamp(0.58 + flowFrequency * 0.035, 0.48, 0.86),
    bendStiffness: clamp(0.16 + temporalStrength * 0.18, 0.12, 0.36),
    damping: clamp(0.032 + temporalSpeed * 0.08, 0.028, 0.12),
    gravity: clamp(5.8 + getLayerGravity(config, layerIndex) * 0.4, 4.2, 9.8),
    pulseX: clamp(getLayerWindX(config, layerIndex) * 0.14, -0.28, 0.28),
    pulseY: clamp(getLayerWindY(config, layerIndex) * 0.16, -0.24, 0.24),
    collisionRadius: clamp(getLayerCollisionRadius(config, layerIndex) * 0.08, 0.012, 0.038),
    floorY: -0.46,
    selfCollisionStiffness: clamp(0.22 + getLayerRepulsion(config, layerIndex) * 0.018, 0.18, 0.52),
    inflation: clamp((mode === 'viscoelastic_membrane' ? 0.16 : 0.24) + temporalStrength * 0.24, 0.12, 0.58),
    boundaryTension: clamp(0.18 + getLayerRadiusScale(config, layerIndex) * 0.12, 0.12, 0.42),
    anchorMode:
      source === 'ring' || source === 'disc' || source === 'torus'
        ? 'rim-quadrants'
        : source === 'plane' || source === 'grid'
          ? 'top-edge'
          : 'corners',
    pinGroupCount: source === 'text' ? 4 : 3,
    pinGroupStrength: clamp(0.12 + temporalStrength * 0.18, 0.1, 0.32),
    pinChoreographyMode: mode === 'viscoelastic_membrane' ? 'orbit' : 'sweep',
    pinChoreographyPreset: mode === 'viscoelastic_membrane' ? 'counter-orbit' : 'breath-wave',
    pinChoreographyAmplitude: clamp(0.016 + flowAmplitude * 0.05, 0.012, 0.05),
    pinChoreographySpeed: clamp(0.04 + temporalSpeed * 0.14, 0.04, 0.18),
    tearThreshold: clamp(1.34 + getLayerRepulsion(config, layerIndex) * 0.015, 1.18, 1.68),
    tearPropagationBias: clamp(0.22 + flowAmplitude * 0.2, 0.14, 0.48),
    tearDirectionX: source === 'ring' || source === 'disc' ? 0.2 : 0.42,
    tearDirectionY: mode === 'viscoelastic_membrane' ? -0.86 : -1,
    obstacleFieldX: 0,
    obstacleFieldY: -0.04,
    obstacleFieldRadius: 0.24,
    obstacleFieldStrength: 0.42,
    obstacleField2X: 0.16,
    obstacleField2Y: -0.12,
    obstacleField2Radius: 0.16,
    obstacleField2Strength: 0.24,
    obstaclePreset: source === 'text' ? 'shear-lattice' : 'staggered-arc',
    tearBiasMapPreset: source === 'ring' || source === 'disc' ? 'radial-flare' : 'warp-weft',
    tearBiasMapScale: clamp(0.28 + temporalStrength * 0.18, 0.22, 0.58),
    tearBiasMapFrequency: clamp(1.8 + flowFrequency * 0.06, 1.4, 4.2),
    tearBiasMapRotation: source === 'text' ? 0.8 : 1.08,
    tearBiasMapContrast: clamp(0.58 + temporalStrength * 0.16, 0.5, 0.82),
    windX: clamp(getLayerWindX(config, layerIndex) * 0.3, -0.42, 0.42),
    windY: clamp(getLayerWindY(config, layerIndex) * 0.28, -0.32, 0.32),
    windPulse: clamp(0.18 + flowAmplitude * 0.14, 0.08, 0.48),
    pressureStrength: clamp(0.16 + temporalStrength * 0.18, 0.12, 0.42),
    pressurePulse: clamp(0.18 + temporalSpeed * 0.24, 0.14, 0.56),
    circleColliderX: 0,
    circleColliderY: 0.02,
    circleColliderRadius: 0.11,
    capsuleColliderAx: -0.18,
    capsuleColliderAy: -0.08,
    capsuleColliderBx: 0.18,
    capsuleColliderBy: -0.08,
    capsuleColliderRadius: 0.046,
  };
}
