export interface PbdClothNormalizedConfig {
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
  pinMode: 'top-corners' | 'top-edge' | 'left-edge' | 'top-band';
  pinGroupWidth: number;
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
  selfCollisionStiffness: number;
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

export function getDefaultPbdClothConfig(): PbdClothNormalizedConfig {
  return {
    width: 12,
    height: 10,
    spacing: 0.08,
    stiffness: 0.94,
    shearStiffness: 0.72,
    bendStiffness: 0.24,
    damping: 0.045,
    gravity: 9.8,
    pulseX: 0.35,
    pulseY: 0.0,
    collisionRadius: 0.018,
    floorY: -1.18,
    pinMode: 'top-corners',
    pinGroupWidth: 3,
    pinGroupCount: 2,
    pinGroupStrength: 0.18,
    pinChoreographyMode: 'sweep',
    pinChoreographyPreset: 'breath-wave',
    pinChoreographyAmplitude: 0.035,
    pinChoreographySpeed: 0.08,
    tearThreshold: 1.45,
    tearPropagationBias: 0.28,
    tearDirectionX: 1.0,
    tearDirectionY: -0.2,
    obstacleFieldX: 0.02,
    obstacleFieldY: -0.08,
    obstacleFieldRadius: 0.28,
    obstacleFieldStrength: 0.55,
    obstacleField2X: -0.18,
    obstacleField2Y: -0.18,
    obstacleField2Radius: 0.18,
    obstacleField2Strength: 0.34,
    obstaclePreset: 'staggered-arc',
    tearBiasMapPreset: 'warp-weft',
    tearBiasMapScale: 0.42,
    tearBiasMapFrequency: 2.6,
    tearBiasMapRotation: 0.45,
    tearBiasMapContrast: 0.7,
    selfCollisionStiffness: 0.45,
    windX: 0.28,
    windY: 0.06,
    windPulse: 0.45,
    pressureStrength: 0.08,
    pressurePulse: 0.25,
    circleColliderX: 0.08,
    circleColliderY: -0.28,
    circleColliderRadius: 0.14,
    capsuleColliderAx: -0.26,
    capsuleColliderAy: -0.12,
    capsuleColliderBx: 0.18,
    capsuleColliderBy: -0.42,
    capsuleColliderRadius: 0.06,
  };
}
