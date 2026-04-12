export interface PbdMembraneNormalizedConfig {
  width: number;
  height: number;
  spacing: number;
  stiffness: number;
  shearStiffness: number;
  bendStiffness: number;
  damping: number;
  gravity: number;
  pulseX: number;
  pulseY: number;
  collisionRadius: number;
  floorY: number;
  selfCollisionStiffness: number;
  inflation: number;
  boundaryTension: number;
  anchorMode: 'corners' | 'top-edge' | 'none' | 'rim-quadrants';
  pinGroupCount: number;
  pinGroupStrength: number;
  pinChoreographyMode: 'static' | 'sweep' | 'orbit';
  pinChoreographyPreset: 'manual' | 'breath-wave' | 'counter-orbit' | 'shear-walk';
  pinChoreographyAmplitude: number;
  pinChoreographySpeed: number;
  tearThreshold: number;
  tearPropagationBias: number;
  tearDirectionX: number;
  tearDirectionY: number;
  obstacleFieldX: number;
  obstacleFieldY: number;
  obstacleFieldRadius: number;
  obstacleFieldStrength: number;
  obstacleField2X: number;
  obstacleField2Y: number;
  obstacleField2Radius: number;
  obstacleField2Strength: number;
  obstaclePreset: 'manual' | 'staggered-arc' | 'shear-lattice';
  tearBiasMapPreset: 'manual' | 'warp-weft' | 'radial-flare' | 'shear-noise';
  tearBiasMapScale: number;
  tearBiasMapFrequency: number;
  tearBiasMapRotation: number;
  tearBiasMapContrast: number;
  windX: number;
  windY: number;
  windPulse: number;
  pressureStrength: number;
  pressurePulse: number;
  circleColliderX: number;
  circleColliderY: number;
  circleColliderRadius: number;
  capsuleColliderAx: number;
  capsuleColliderAy: number;
  capsuleColliderBx: number;
  capsuleColliderBy: number;
  capsuleColliderRadius: number;
}

export function getDefaultPbdMembraneConfig(): PbdMembraneNormalizedConfig {
  return {
    width: 9,
    height: 9,
    spacing: 0.08,
    stiffness: 0.93,
    shearStiffness: 0.7,
    bendStiffness: 0.2,
    damping: 0.05,
    gravity: 7.2,
    pulseX: 0.08,
    pulseY: 0.12,
    collisionRadius: 0.018,
    floorY: -0.42,
    selfCollisionStiffness: 0.38,
    inflation: 0.28,
    boundaryTension: 0.22,
    anchorMode: 'corners',
    pinGroupCount: 4,
    pinGroupStrength: 0.16,
    pinChoreographyMode: 'orbit',
    pinChoreographyPreset: 'counter-orbit',
    pinChoreographyAmplitude: 0.028,
    pinChoreographySpeed: 0.07,
    tearThreshold: 1.42,
    tearPropagationBias: 0.34,
    tearDirectionX: 0.2,
    tearDirectionY: -1.0,
    obstacleFieldX: 0.0,
    obstacleFieldY: -0.04,
    obstacleFieldRadius: 0.26,
    obstacleFieldStrength: 0.48,
    obstacleField2X: 0.16,
    obstacleField2Y: -0.12,
    obstacleField2Radius: 0.18,
    obstacleField2Strength: 0.28,
    obstaclePreset: 'shear-lattice',
    tearBiasMapPreset: 'radial-flare',
    tearBiasMapScale: 0.38,
    tearBiasMapFrequency: 2.1,
    tearBiasMapRotation: 1.1,
    tearBiasMapContrast: 0.66,
    windX: 0.18,
    windY: 0.1,
    windPulse: 0.35,
    pressureStrength: 0.22,
    pressurePulse: 0.42,
    circleColliderX: 0,
    circleColliderY: 0.02,
    circleColliderRadius: 0.12,
    capsuleColliderAx: -0.18,
    capsuleColliderAy: -0.08,
    capsuleColliderBx: 0.18,
    capsuleColliderBy: -0.08,
    capsuleColliderRadius: 0.05,
  };
}
