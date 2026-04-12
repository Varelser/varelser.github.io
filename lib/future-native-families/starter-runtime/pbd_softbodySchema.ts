export interface PbdSoftbodyNormalizedConfig {
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
  volumePreservation: number;
  clusterStiffness: number;
  shellTension: number;
  anchorMode: 'none' | 'top-edge' | 'top-corners' | 'core';
  pinGroupCount: number;
  pinGroupStrength: number;
  pinChoreographyMode: 'static' | 'sweep' | 'orbit';
  pinChoreographyPreset: 'manual' | 'breath-wave' | 'counter-orbit' | 'shear-walk';
  pinChoreographyAmplitude: number;
  pinChoreographySpeed: number;
  obstacleFieldX: number;
  obstacleFieldY: number;
  obstacleFieldRadius: number;
  obstacleFieldStrength: number;
  obstacleField2X: number;
  obstacleField2Y: number;
  obstacleField2Radius: number;
  obstacleField2Strength: number;
  obstaclePreset: 'manual' | 'staggered-arc' | 'shear-lattice';
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

export function getDefaultPbdSoftbodyConfig(): PbdSoftbodyNormalizedConfig {
  return {
    width: 7,
    height: 7,
    spacing: 0.09,
    stiffness: 0.92,
    shearStiffness: 0.74,
    bendStiffness: 0.26,
    damping: 0.05,
    gravity: 8.8,
    pulseX: 0.14,
    pulseY: 0.06,
    collisionRadius: 0.02,
    floorY: -0.38,
    selfCollisionStiffness: 0.32,
    volumePreservation: 0.7,
    clusterStiffness: 0.42,
    shellTension: 0.28,
    anchorMode: 'core',
    pinGroupCount: 2,
    pinGroupStrength: 0.18,
    pinChoreographyMode: 'orbit',
    pinChoreographyPreset: 'counter-orbit',
    pinChoreographyAmplitude: 0.03,
    pinChoreographySpeed: 0.07,
    obstacleFieldX: 0.0,
    obstacleFieldY: -0.02,
    obstacleFieldRadius: 0.24,
    obstacleFieldStrength: 0.54,
    obstacleField2X: 0.16,
    obstacleField2Y: -0.12,
    obstacleField2Radius: 0.14,
    obstacleField2Strength: 0.28,
    obstaclePreset: 'staggered-arc',
    windX: 0.2,
    windY: 0.06,
    windPulse: 0.34,
    pressureStrength: 0.2,
    pressurePulse: 0.38,
    circleColliderX: 0.0,
    circleColliderY: -0.02,
    circleColliderRadius: 0.12,
    capsuleColliderAx: -0.16,
    capsuleColliderAy: -0.12,
    capsuleColliderBx: 0.18,
    capsuleColliderBy: -0.14,
    capsuleColliderRadius: 0.045,
  };
}
