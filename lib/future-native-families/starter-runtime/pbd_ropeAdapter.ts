import { getDefaultPbdRopeConfig, type PbdRopeNormalizedConfig } from './pbd_ropeSchema';
import { createPbdRopeRuntimeState, type PbdRopeRuntimeState } from './pbd_ropeSolver';

export type PbdRopeInputConfig = Partial<PbdRopeNormalizedConfig>;

export function normalizePbdRopeConfig(input?: PbdRopeInputConfig): PbdRopeNormalizedConfig {
  const defaults = getDefaultPbdRopeConfig();
  return {
    segments: Math.max(4, Math.floor(input?.segments ?? defaults.segments)),
    restLength: Math.max(0.002, input?.restLength ?? defaults.restLength),
    stiffness: Math.min(1, Math.max(0, input?.stiffness ?? defaults.stiffness)),
    bendStiffness: Math.min(1, Math.max(0, input?.bendStiffness ?? defaults.bendStiffness)),
    damping: Math.min(0.999, Math.max(0, input?.damping ?? defaults.damping)),
    gravity: Math.max(0, input?.gravity ?? defaults.gravity),
    anchorMode: input?.anchorMode ?? defaults.anchorMode,
    collisionRadius: Math.max(0, input?.collisionRadius ?? defaults.collisionRadius),
    floorY: Math.min(0, input?.floorY ?? defaults.floorY),
    circleColliderX: input?.circleColliderX ?? defaults.circleColliderX,
    circleColliderY: input?.circleColliderY ?? defaults.circleColliderY,
    circleColliderRadius: Math.max(0, input?.circleColliderRadius ?? defaults.circleColliderRadius),
    capsuleColliderAx: input?.capsuleColliderAx ?? defaults.capsuleColliderAx,
    capsuleColliderAy: input?.capsuleColliderAy ?? defaults.capsuleColliderAy,
    capsuleColliderBx: input?.capsuleColliderBx ?? defaults.capsuleColliderBx,
    capsuleColliderBy: input?.capsuleColliderBy ?? defaults.capsuleColliderBy,
    capsuleColliderRadius: Math.max(0, input?.capsuleColliderRadius ?? defaults.capsuleColliderRadius),
    selfCollisionStiffness: Math.min(1, Math.max(0, input?.selfCollisionStiffness ?? defaults.selfCollisionStiffness)),
  };
}

export function createPbdRopeRuntimeFromInput(input?: PbdRopeInputConfig): PbdRopeRuntimeState {
  return createPbdRopeRuntimeState(normalizePbdRopeConfig(input));
}
