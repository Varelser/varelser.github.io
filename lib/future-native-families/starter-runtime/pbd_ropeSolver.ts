import type { PbdRopeNormalizedConfig } from './pbd_ropeSchema';

export interface PbdRopeParticle {
  x: number;
  y: number;
  px: number;
  py: number;
  pinned: boolean;
}

export interface PbdRopeRuntimeState {
  config: PbdRopeNormalizedConfig;
  particles: PbdRopeParticle[];
  frame: number;
}

export interface PbdRopeStats {
  frame: number;
  segmentCount: number;
  totalLength: number;
  maxStretchRatio: number;
  anchorCount: number;
  tipDisplacement: number;
  floorContacts: number;
  circleContacts: number;
  capsuleContacts: number;
  selfCollisionPairs: number;
  minNonAdjacentDistance: number;
  averageBendDeviation: number;
}

function cloneParticle(particle: PbdRopeParticle): PbdRopeParticle {
  return { ...particle };
}

export function createPbdRopeParticles(config: PbdRopeNormalizedConfig): PbdRopeParticle[] {
  return Array.from({ length: config.segments + 1 }, (_, index) => {
    const y = -index * config.restLength;
    const pinned = config.anchorMode === 'start' ? index === 0 : config.anchorMode === 'both-ends' ? index === 0 || index === config.segments : false;
    return { x: 0, y, px: 0, py: y, pinned };
  });
}

export function createPbdRopeRuntimeState(config: PbdRopeNormalizedConfig): PbdRopeRuntimeState {
  return {
    config,
    particles: createPbdRopeParticles(config),
    frame: 0,
  };
}

function integrateParticle(particle: PbdRopeParticle, gravity: number, damping: number, dt: number): void {
  if (particle.pinned) return;
  const vx = (particle.x - particle.px) * (1 - damping);
  const vy = (particle.y - particle.py) * (1 - damping);
  particle.px = particle.x;
  particle.py = particle.y;
  particle.x += vx;
  particle.y += vy - gravity * dt * dt;
}

function solveDistanceConstraint(a: PbdRopeParticle, b: PbdRopeParticle, restLength: number, stiffness: number): void {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = Math.hypot(dx, dy);
  if (length <= 1e-9) return;

  const diff = (length - restLength) / length;
  const corrX = dx * 0.5 * stiffness * diff;
  const corrY = dy * 0.5 * stiffness * diff;

  if (!a.pinned) {
    a.x += corrX;
    a.y += corrY;
  }
  if (!b.pinned) {
    b.x -= corrX;
    b.y -= corrY;
  }
  if (a.pinned && !b.pinned) {
    b.x = a.x + dx * (restLength / length);
    b.y = a.y + dy * (restLength / length);
  }
  if (!a.pinned && b.pinned) {
    a.x = b.x - dx * (restLength / length);
    a.y = b.y - dy * (restLength / length);
  }
}

function solveBendConstraint(a: PbdRopeParticle, b: PbdRopeParticle, c: PbdRopeParticle, restLength: number, bendStiffness: number): void {
  if (bendStiffness <= 0) return;
  const targetDistance = restLength * 2;
  const dx = c.x - a.x;
  const dy = c.y - a.y;
  const length = Math.hypot(dx, dy);
  if (length <= 1e-9) return;

  const diff = (length - targetDistance) / length;
  const corrX = dx * 0.25 * bendStiffness * diff;
  const corrY = dy * 0.25 * bendStiffness * diff;

  if (!a.pinned) {
    a.x += corrX;
    a.y += corrY;
  }
  if (!c.pinned) {
    c.x -= corrX;
    c.y -= corrY;
  }
  if (!b.pinned) {
    b.x -= corrX * 0.5;
    b.y -= corrY * 0.5;
  }
}

function solveFloorCollision(particle: PbdRopeParticle, floorY: number, radius: number): boolean {
  if (particle.pinned) return false;
  const minY = floorY + radius;
  if (particle.y < minY) {
    particle.y = minY;
    return true;
  }
  return false;
}

function closestPointOnSegment(px: number, py: number, ax: number, ay: number, bx: number, by: number): { x: number; y: number } {
  const abx = bx - ax;
  const aby = by - ay;
  const denom = abx * abx + aby * aby;
  if (denom <= 1e-12) return { x: ax, y: ay };
  const t = Math.max(0, Math.min(1, ((px - ax) * abx + (py - ay) * aby) / denom));
  return { x: ax + abx * t, y: ay + aby * t };
}

function solveCircleCollision(particle: PbdRopeParticle, centerX: number, centerY: number, colliderRadius: number, particleRadius: number): boolean {
  if (particle.pinned || colliderRadius <= 0) return false;
  const dx = particle.x - centerX;
  const dy = particle.y - centerY;
  const combined = colliderRadius + particleRadius;
  let distance = Math.hypot(dx, dy);
  if (distance <= 1e-9) distance = 1e-9;
  if (distance < combined) {
    const scale = combined / distance;
    particle.x = centerX + dx * scale;
    particle.y = centerY + dy * scale;
    return true;
  }
  return false;
}

function solveCapsuleCollision(
  particle: PbdRopeParticle,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  capsuleRadius: number,
  particleRadius: number,
): boolean {
  if (particle.pinned || capsuleRadius <= 0) return false;
  const closest = closestPointOnSegment(particle.x, particle.y, ax, ay, bx, by);
  let dx = particle.x - closest.x;
  let dy = particle.y - closest.y;
  const combined = capsuleRadius + particleRadius;
  let distance = Math.hypot(dx, dy);
  if (distance <= 1e-9) {
    const sdx = bx - ax;
    const sdy = by - ay;
    const sl = Math.hypot(sdx, sdy) || 1;
    dx = -sdy / sl;
    dy = sdx / sl;
    distance = 1;
  }
  if (distance < combined) {
    const scale = combined / distance;
    particle.x = closest.x + dx * scale;
    particle.y = closest.y + dy * scale;
    return true;
  }
  return false;
}

function solveSelfCollision(a: PbdRopeParticle, b: PbdRopeParticle, radius: number, stiffness: number): boolean {
  if (stiffness <= 0) return false;
  const minDistance = radius * 2;
  let dx = b.x - a.x;
  let dy = b.y - a.y;
  let distance = Math.hypot(dx, dy);
  if (distance <= 1e-9) {
    dx = minDistance;
    dy = 0;
    distance = minDistance * 0.25;
  }
  if (distance >= minDistance) return false;

  const nx = dx / distance;
  const ny = dy / distance;
  const move = (minDistance - distance) * 0.5 * stiffness;
  if (!a.pinned) {
    a.x -= nx * move;
    a.y -= ny * move;
  }
  if (!b.pinned) {
    b.x += nx * move;
    b.y += ny * move;
  }
  if (a.pinned && !b.pinned) {
    b.x = a.x + nx * minDistance;
    b.y = a.y + ny * minDistance;
  }
  if (!a.pinned && b.pinned) {
    a.x = b.x - nx * minDistance;
    a.y = b.y - ny * minDistance;
  }
  return true;
}

export function stepPbdRopeRuntime(runtime: PbdRopeRuntimeState, options?: { dt?: number; iterations?: number }): PbdRopeRuntimeState {
  const dt = options?.dt ?? 1 / 60;
  const iterations = Math.max(1, Math.floor(options?.iterations ?? 12));
  const next: PbdRopeRuntimeState = {
    config: runtime.config,
    particles: runtime.particles.map(cloneParticle),
    frame: runtime.frame + 1,
  };

  for (const particle of next.particles) {
    integrateParticle(particle, runtime.config.gravity, runtime.config.damping, dt);
  }

  for (let iteration = 0; iteration < iterations; iteration += 1) {
    for (let index = 0; index < next.particles.length - 1; index += 1) {
      solveDistanceConstraint(next.particles[index], next.particles[index + 1], runtime.config.restLength, runtime.config.stiffness);
    }
    for (let index = 1; index < next.particles.length - 1; index += 1) {
      solveBendConstraint(next.particles[index - 1], next.particles[index], next.particles[index + 1], runtime.config.restLength, runtime.config.bendStiffness);
    }
    for (const particle of next.particles) {
      solveFloorCollision(particle, runtime.config.floorY, runtime.config.collisionRadius);
      solveCircleCollision(particle, runtime.config.circleColliderX, runtime.config.circleColliderY, runtime.config.circleColliderRadius, runtime.config.collisionRadius);
      solveCapsuleCollision(
        particle,
        runtime.config.capsuleColliderAx,
        runtime.config.capsuleColliderAy,
        runtime.config.capsuleColliderBx,
        runtime.config.capsuleColliderBy,
        runtime.config.capsuleColliderRadius,
        runtime.config.collisionRadius,
      );
    }
    for (let aIndex = 0; aIndex < next.particles.length; aIndex += 1) {
      for (let bIndex = aIndex + 2; bIndex < next.particles.length; bIndex += 1) {
        if (aIndex === 0 && bIndex === next.particles.length - 1) continue;
        solveSelfCollision(next.particles[aIndex], next.particles[bIndex], runtime.config.collisionRadius, runtime.config.selfCollisionStiffness);
      }
    }
  }

  return next;
}

export function simulatePbdRopeFrames(config: PbdRopeNormalizedConfig, frameCount: number, options?: { dt?: number; iterations?: number }): PbdRopeRuntimeState {
  let runtime = createPbdRopeRuntimeState(config);
  for (let frame = 0; frame < frameCount; frame += 1) {
    runtime = stepPbdRopeRuntime(runtime, options);
  }
  return runtime;
}

export function getPbdRopeStats(runtime: PbdRopeRuntimeState): PbdRopeStats {
  let totalLength = 0;
  let maxStretchRatio = 1;
  let floorContacts = 0;
  let circleContacts = 0;
  let capsuleContacts = 0;
  let selfCollisionPairs = 0;
  let minNonAdjacentDistance = Number.POSITIVE_INFINITY;
  let bendDeviationTotal = 0;

  for (let index = 0; index < runtime.particles.length - 1; index += 1) {
    const a = runtime.particles[index];
    const b = runtime.particles[index + 1];
    const length = Math.hypot(b.x - a.x, b.y - a.y);
    totalLength += length;
    maxStretchRatio = Math.max(maxStretchRatio, length / runtime.config.restLength);
  }

  const floorThreshold = runtime.config.floorY + runtime.config.collisionRadius + 1e-6;
  const circleThreshold = runtime.config.circleColliderRadius + runtime.config.collisionRadius + 4e-3;
  const capsuleThreshold = runtime.config.capsuleColliderRadius + runtime.config.collisionRadius + 4e-3;

  for (let index = 0; index < runtime.particles.length; index += 1) {
    const particle = runtime.particles[index];
    if (particle.y <= floorThreshold) floorContacts += 1;
    const circleDistance = Math.hypot(particle.x - runtime.config.circleColliderX, particle.y - runtime.config.circleColliderY);
    if (circleDistance <= circleThreshold) circleContacts += 1;
    const capsuleClosest = closestPointOnSegment(
      particle.x,
      particle.y,
      runtime.config.capsuleColliderAx,
      runtime.config.capsuleColliderAy,
      runtime.config.capsuleColliderBx,
      runtime.config.capsuleColliderBy,
    );
    const capsuleDistance = Math.hypot(particle.x - capsuleClosest.x, particle.y - capsuleClosest.y);
    if (capsuleDistance <= capsuleThreshold) capsuleContacts += 1;

    if (index > 0 && index < runtime.particles.length - 1) {
      const prev = runtime.particles[index - 1];
      const next = runtime.particles[index + 1];
      const chord = Math.hypot(next.x - prev.x, next.y - prev.y);
      bendDeviationTotal += Math.abs(runtime.config.restLength * 2 - chord);
    }
  }

  for (let aIndex = 0; aIndex < runtime.particles.length; aIndex += 1) {
    for (let bIndex = aIndex + 2; bIndex < runtime.particles.length; bIndex += 1) {
      if (aIndex === 0 && bIndex === runtime.particles.length - 1) continue;
      const a = runtime.particles[aIndex];
      const b = runtime.particles[bIndex];
      const distance = Math.hypot(b.x - a.x, b.y - a.y);
      minNonAdjacentDistance = Math.min(minNonAdjacentDistance, distance);
      if (distance <= runtime.config.collisionRadius * 2 + 1e-3) selfCollisionPairs += 1;
    }
  }

  const tip = runtime.particles[runtime.particles.length - 1];
  const restTipY = -runtime.config.segments * runtime.config.restLength;
  return {
    frame: runtime.frame,
    segmentCount: runtime.config.segments,
    totalLength,
    maxStretchRatio,
    anchorCount: runtime.particles.filter((particle) => particle.pinned).length,
    tipDisplacement: Math.hypot(tip.x, tip.y - restTipY),
    floorContacts,
    circleContacts,
    capsuleContacts,
    selfCollisionPairs,
    minNonAdjacentDistance: Number.isFinite(minNonAdjacentDistance) ? minNonAdjacentDistance : runtime.config.collisionRadius * 2,
    averageBendDeviation: runtime.particles.length > 2 ? bendDeviationTotal / (runtime.particles.length - 2) : 0,
  };
}
