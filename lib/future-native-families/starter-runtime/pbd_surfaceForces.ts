import type { PbdSharedParticle } from './pbd_sharedConstraints';

export interface PbdSurfaceForceConfig {
  windX: number;
  windY: number;
  windPulse: number;
  pressureStrength: number;
  pressurePulse: number;
}

export interface PbdSurfaceForceStats {
  windImpulse: number;
  pressureImpulse: number;
}

export function applyPbdSurfaceForces(
  particles: PbdSharedParticle[],
  frame: number,
  centerX: number,
  centerY: number,
  force: PbdSurfaceForceConfig,
  weightForIndex: (index: number, particle: PbdSharedParticle) => number,
): PbdSurfaceForceStats {
  const phase = Math.sin(frame * 0.1);
  const windPulseScale = 1 + force.windPulse * phase;
  const pressurePulseScale = 1 + force.pressurePulse * phase;
  let windImpulse = 0;
  let pressureImpulse = 0;
  for (let i = 0; i < particles.length; i += 1) {
    const particle = particles[i];
    if (particle.pinned) continue;
    const weight = weightForIndex(i, particle);
    if (weight <= 0) continue;
    const dx = particle.x - centerX;
    const dy = particle.y - centerY;
    const dist = Math.hypot(dx, dy) || 1;
    const nx = dx / dist;
    const ny = dy / dist;
    const windX = force.windX * weight * windPulseScale * 0.0014;
    const windY = force.windY * weight * windPulseScale * 0.0014;
    const pressure = force.pressureStrength * weight * pressurePulseScale * 0.0012;
    particle.x += windX + nx * pressure;
    particle.y += windY + ny * pressure;
    windImpulse += Math.abs(windX) + Math.abs(windY);
    pressureImpulse += Math.abs(pressure);
  }
  return { windImpulse, pressureImpulse };
}
