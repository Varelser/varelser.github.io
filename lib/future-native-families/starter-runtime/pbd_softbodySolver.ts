import {
  applyCapsuleCollision,
  applyCircleCollision,
  applyDistanceConstraint,
  applyFloorCollision,
  applyObstacleField,
  applySpacingGuard,
  integrateVerletParticles,
} from './pbd_sharedConstraints';
import { applyPulseAndSoftbodyForces } from './pbd_softbodyForces';
import { applyShapeMatching, applyVolumeConstraints } from './pbd_softbodyShape';
import { clonePbdSoftbodyRuntimeState, createPbdSoftbodyRuntimeState } from './pbd_softbodyState';
import { getPbdSoftbodyStats } from './pbd_softbodyStats';
import { buildObstacleFields, buildPinGroups, type PbdSoftbodyRuntimeState } from './pbd_softbodyTypes';

export { createPbdSoftbodyRuntimeState, getPbdSoftbodyStats };
export type {
  PbdSoftbodyCell,
  PbdSoftbodyParticle,
  PbdSoftbodyRuntimeState,
  PbdSoftbodyStats,
} from './pbd_softbodyTypes';

export function stepPbdSoftbodyRuntime(runtime: PbdSoftbodyRuntimeState, options?: { iterations?: number; dt?: number }): PbdSoftbodyRuntimeState {
  const next = clonePbdSoftbodyRuntimeState(runtime);
  const iterations = options?.iterations ?? 12;
  const dt = options?.dt ?? 1 / 60;
  integrateVerletParticles(next.particles, next.config.gravity, next.config.damping, dt);
  applyPulseAndSoftbodyForces(next);
  for (let iteration = 0; iteration < iterations; iteration += 1) {
    applyShapeMatching(next);
    next.volumeConstraintError = Math.max(next.volumeConstraintError, applyVolumeConstraints(next));
    const obstacleFields = buildObstacleFields(next.config, next.frame + iteration);
    next.obstacleLayerCount = obstacleFields.length;
    const obstacleStats = applyObstacleField(next.particles, obstacleFields, next.config.collisionRadius, 0.9);
    next.obstacleImpulse += obstacleStats.obstacleImpulse;
    next.obstacleContacts += obstacleStats.obstacleContacts;
    for (const link of next.links) {
      const a = next.particles[link.a];
      const b = next.particles[link.b];
      if (!a || !b) continue;
      applyDistanceConstraint(a, b, link.restLength, link.stiffness);
    }
    let contactCount = 0;
    for (const particle of next.particles) {
      if (applyFloorCollision(particle, next.config.floorY, next.config.collisionRadius)) contactCount += 1;
      if (applyCircleCollision(particle, next.config.circleColliderX, next.config.circleColliderY, next.config.circleColliderRadius, next.config.collisionRadius, 0.92)) contactCount += 1;
      if (
        applyCapsuleCollision(
          particle,
          {
            ax: next.config.capsuleColliderAx,
            ay: next.config.capsuleColliderAy,
            bx: next.config.capsuleColliderBx,
            by: next.config.capsuleColliderBy,
            radius: next.config.capsuleColliderRadius,
          },
          next.config.collisionRadius,
          0.92,
        )
      ) {
        contactCount += 1;
      }
    }
    next.impactResponse += contactCount;
    applySpacingGuard(next.particles, next.config.collisionRadius, next.config.selfCollisionStiffness, (a, b) => {
      const ax = a % next.config.width;
      const ay = Math.floor(a / next.config.width);
      const bx = b % next.config.width;
      const by = Math.floor(b / next.config.width);
      return Math.abs(ax - bx) <= 1 && Math.abs(ay - by) <= 1;
    });
  }
  next.pinGroupCount = buildPinGroups(next.config).length;
  return next;
}
