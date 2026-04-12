export interface PbdRopeNormalizedConfig {
  segments: number;
  restLength: number;
  stiffness: number;
  bendStiffness: number;
  damping: number;
  gravity: number;
  anchorMode: 'start' | 'both-ends' | 'free';
  collisionRadius: number;
  floorY: number;
  circleColliderX: number;
  circleColliderY: number;
  circleColliderRadius: number;
  capsuleColliderAx: number;
  capsuleColliderAy: number;
  capsuleColliderBx: number;
  capsuleColliderBy: number;
  capsuleColliderRadius: number;
  selfCollisionStiffness: number;
}

export function getDefaultPbdRopeConfig(): PbdRopeNormalizedConfig {
  return {
    segments: 32,
    restLength: 0.035,
    stiffness: 0.92,
    bendStiffness: 0.18,
    damping: 0.08,
    gravity: 9.8,
    anchorMode: 'start',
    collisionRadius: 0.012,
    floorY: -1.28,
    circleColliderX: 0.06,
    circleColliderY: -0.85,
    circleColliderRadius: 0.24,
    capsuleColliderAx: -0.22,
    capsuleColliderAy: -0.58,
    capsuleColliderBx: 0.26,
    capsuleColliderBy: -0.94,
    capsuleColliderRadius: 0.08,
    selfCollisionStiffness: 0.65,
  };
}
