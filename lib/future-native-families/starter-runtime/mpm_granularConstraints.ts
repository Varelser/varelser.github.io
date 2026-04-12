import type { MpmGranularNormalizedConfig } from './mpm_granularSchema';
import type { MpmGranularParticle } from './mpm_granularShared';

export function integrateParticle(particle: MpmGranularParticle, gravity: number, damping: number, dt: number): void {
  const vx = (particle.x - particle.px) * (1 - damping);
  const vy = (particle.y - particle.py) * (1 - damping);
  particle.px = particle.x;
  particle.py = particle.y;
  particle.x += vx;
  particle.y += vy - gravity * dt * dt;
  particle.vx = vx;
  particle.vy = vy - gravity * dt * dt;
}

export function solveBoundaryConstraint(particle: MpmGranularParticle, config: MpmGranularNormalizedConfig): { floor: boolean; wall: boolean } {
  let floor = false;
  let wall = false;
  const minY = config.floorY + config.particleRadius;
  if (particle.y < minY) {
    particle.y = minY;
    particle.compactness = Math.min(1.5, particle.compactness + 0.08 + config.plasticity * 0.05);
    particle.plasticStrain = Math.min(1, particle.plasticStrain + config.yieldRate * 0.03);
    particle.meanStress += config.stressGain * 0.04;
    particle.viscosityState = Math.min(2, particle.viscosityState + 0.03 + config.plasticity * 0.02);
    floor = true;
  }
  const maxX = config.wallHalfWidth - config.particleRadius;
  if (particle.x < -maxX) {
    particle.x = -maxX;
    wall = true;
  } else if (particle.x > maxX) {
    particle.x = maxX;
    wall = true;
  }
  return { floor, wall };
}

export function solvePairConstraint(a: MpmGranularParticle, b: MpmGranularParticle, config: MpmGranularNormalizedConfig): boolean {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const minDistance = config.particleRadius * 2;
  const distance = Math.hypot(dx, dy);
  if (distance === 0) {
    a.x -= minDistance * 0.5;
    b.x += minDistance * 0.5;
    a.plasticStrain = Math.min(1, a.plasticStrain + config.yieldRate * 0.02);
    b.plasticStrain = Math.min(1, b.plasticStrain + config.yieldRate * 0.02);
    return true;
  }
  if (distance >= minDistance * 1.35) return false;
  const nx = dx / distance;
  const ny = dy / distance;
  const overlap = Math.max(0, minDistance - distance);
  const cohesivePull = distance < minDistance * 1.35 ? (minDistance * 1.35 - distance) * config.cohesion * 0.06 : 0;
  const correction = overlap * 0.5 + cohesivePull;
  if (correction <= 0) return false;
  const tangentX = -ny;
  const tangentY = nx;
  const avx = a.x - a.px;
  const avy = a.y - a.py;
  const bvx = b.x - b.px;
  const bvy = b.y - b.py;
  const relTangent = (bvx - avx) * tangentX + (bvy - avy) * tangentY;
  const frictionSlip = relTangent * config.friction * 0.03;
  const plasticGain = overlap * config.yieldRate * (0.4 + config.plasticity * 0.6);
  if (overlap > 0) {
    a.x -= nx * correction;
    a.y -= ny * correction;
    b.x += nx * correction;
    b.y += ny * correction;
    a.x += tangentX * frictionSlip;
    a.y += tangentY * frictionSlip;
    b.x -= tangentX * frictionSlip;
    b.y -= tangentY * frictionSlip;
    a.plasticStrain = Math.min(1, a.plasticStrain + plasticGain);
    b.plasticStrain = Math.min(1, b.plasticStrain + plasticGain);
    a.compactness = Math.min(1.5, a.compactness + overlap * 0.25);
    b.compactness = Math.min(1.5, b.compactness + overlap * 0.25);
    const stressBump = overlap * config.stressGain * 0.2;
    a.meanStress += stressBump;
    b.meanStress += stressBump;
    a.shearStress += Math.abs(relTangent) * config.stressGain * 0.05;
    b.shearStress += Math.abs(relTangent) * config.stressGain * 0.05;
    a.yieldMemory = Math.min(2, a.yieldMemory + plasticGain * 0.4);
    b.yieldMemory = Math.min(2, b.yieldMemory + plasticGain * 0.4);
  } else if (cohesivePull > 0) {
    a.x += nx * cohesivePull;
    a.y += ny * cohesivePull;
    b.x -= nx * cohesivePull;
    b.y -= ny * cohesivePull;
  }
  return true;
}
