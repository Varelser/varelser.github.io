import type { FutureNativeDebugPoint } from './runtimeContracts';
import type {
  PbdCapsuleCollider,
  PbdCircleCollider,
  PbdObstacleField,
  PbdObstacleFieldStats,
  PbdSharedParticle,
} from './pbd_sharedTypes';

export function integrateVerletParticles(
  particles: PbdSharedParticle[],
  gravity: number,
  damping: number,
  dt: number,
): void {
  const gy = -gravity * dt * dt;
  for (const particle of particles) {
    if (particle.pinned) continue;
    const vx = (particle.x - particle.px) * (1 - damping);
    const vy = (particle.y - particle.py) * (1 - damping);
    particle.px = particle.x;
    particle.py = particle.y;
    particle.x += vx;
    particle.y += vy + gy;
  }
}

export function applyDistanceConstraint(
  a: PbdSharedParticle,
  b: PbdSharedParticle,
  restLength: number,
  stiffness: number,
): void {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 1e-8) return;
  const error = dist - restLength;
  const nx = dx / dist;
  const ny = dy / dist;
  const wA = a.pinned ? 0 : 1;
  const wB = b.pinned ? 0 : 1;
  const weight = wA + wB;
  if (weight <= 0) return;
  const correction = (error * stiffness) / weight;
  if (!a.pinned) {
    a.x += nx * correction * wA;
    a.y += ny * correction * wA;
  }
  if (!b.pinned) {
    b.x -= nx * correction * wB;
    b.y -= ny * correction * wB;
  }
}

export function applyFloorCollision(
  particle: PbdSharedParticle,
  floorY: number,
  radius: number,
): boolean {
  if (particle.pinned) return false;
  const minY = floorY + radius;
  if (particle.y >= minY) return false;
  particle.y = minY;
  return true;
}

export function applyCircleCollision(
  particle: PbdSharedParticle,
  centerOrCollider: PbdCircleCollider | number,
  yOrRadius: number,
  radiusOrStiffness: number,
  maybeParticleRadius?: number,
  maybeStiffness?: number,
): boolean {
  if (particle.pinned) return false;
  const collider = typeof centerOrCollider === 'number'
    ? { x: centerOrCollider, y: yOrRadius, radius: radiusOrStiffness }
    : centerOrCollider;
  const radius = typeof centerOrCollider === 'number' ? (maybeParticleRadius ?? 0) : yOrRadius;
  const stiffness = typeof centerOrCollider === 'number' ? (maybeStiffness ?? 1) : radiusOrStiffness;
  const dx = particle.x - collider.x;
  const dy = particle.y - collider.y;
  const dist = Math.hypot(dx, dy);
  const minDist = collider.radius + radius;
  if (dist >= minDist || dist < 1e-8) return false;
  const nx = dx / dist;
  const ny = dy / dist;
  const push = (minDist - dist) * stiffness;
  particle.x += nx * push;
  particle.y += ny * push;
  return true;
}

export function closestPointOnCapsule(
  x: number,
  y: number,
  capsule: PbdCapsuleCollider,
): FutureNativeDebugPoint {
  const abx = capsule.bx - capsule.ax;
  const aby = capsule.by - capsule.ay;
  const denom = abx * abx + aby * aby;
  const t = denom <= 1e-8 ? 0 : Math.max(0, Math.min(1, ((x - capsule.ax) * abx + (y - capsule.ay) * aby) / denom));
  return { x: capsule.ax + abx * t, y: capsule.ay + aby * t };
}

export function applyCapsuleCollision(
  particle: PbdSharedParticle,
  capsule: PbdCapsuleCollider,
  radius: number,
  stiffness: number,
): boolean {
  if (particle.pinned) return false;
  const point = closestPointOnCapsule(particle.x, particle.y, capsule);
  const dx = particle.x - point.x;
  const dy = particle.y - point.y;
  const dist = Math.hypot(dx, dy);
  const minDist = capsule.radius + radius;
  if (dist >= minDist || dist < 1e-8) return false;
  const nx = dx / dist;
  const ny = dy / dist;
  const push = (minDist - dist) * stiffness;
  particle.x += nx * push;
  particle.y += ny * push;
  return true;
}

export function applyObstacleField(
  particles: PbdSharedParticle[],
  obstacleOrFields: PbdObstacleField | readonly PbdObstacleField[],
  particleRadius: number,
  stiffness: number,
): PbdObstacleFieldStats {
  const fields = Array.isArray(obstacleOrFields) ? obstacleOrFields : [obstacleOrFields];
  let obstacleImpulse = 0;
  let obstacleContacts = 0;
  for (const obstacle of fields) {
    if (obstacle.radius <= 0 || obstacle.strength <= 0) continue;
    const influenceRadius = obstacle.radius + particleRadius * 2;
    for (const particle of particles) {
      if (particle.pinned) continue;
      const dx = particle.x - obstacle.x;
      const dy = particle.y - obstacle.y;
      const dist = Math.hypot(dx, dy) || 1;
      if (dist > influenceRadius) continue;
      const nx = dx / dist;
      const ny = dy / dist;
      const proximity = Math.max(0, 1 - dist / influenceRadius);
      const push = proximity * obstacle.strength * stiffness * 0.012;
      particle.x += nx * push;
      particle.y += ny * push;
      obstacleImpulse += Math.abs(push);
      if (dist <= obstacle.radius + particleRadius) obstacleContacts += 1;
    }
  }
  return { obstacleImpulse, obstacleContacts };
}

export function applySpacingGuard(
  particles: PbdSharedParticle[],
  radius: number,
  stiffness: number,
  skipAdjacency: (a: number, b: number) => boolean,
): number {
  let pairs = 0;
  const minDist = radius * 2;
  for (let i = 0; i < particles.length; i += 1) {
    for (let j = i + 1; j < particles.length; j += 1) {
      if (skipAdjacency(i, j)) continue;
      const a = particles[i];
      const b = particles[j];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.hypot(dx, dy);
      if (dist >= minDist || dist < 1e-8) continue;
      const nx = dx / dist;
      const ny = dy / dist;
      const push = ((minDist - dist) * stiffness) / 2;
      if (!a.pinned) {
        a.x -= nx * push;
        a.y -= ny * push;
      }
      if (!b.pinned) {
        b.x += nx * push;
        b.y += ny * push;
      }
      pairs += 1;
    }
  }
  return pairs;
}
