import type { MpmGranularNormalizedConfig } from './mpm_granularSchema';
import { integrateParticle, solveBoundaryConstraint, solvePairConstraint } from './mpm_granularConstraints';
import { createGridState, resetGridState } from './mpm_granularGrid';
import { cloneParticle, type MpmGranularParticle, type MpmGranularRuntimeState } from './mpm_granularShared';
import { getMpmGranularStats } from './mpm_granularStats';
import { accumulateParticleToGrid, applyGridToParticle, finalizeGridTransfer } from './mpm_granularTransfer';

export type {
  MpmGranularGridCell,
  MpmGranularGridState,
  MpmGranularParticle,
  MpmGranularRuntimeState,
  MpmGranularStats,
} from './mpm_granularShared';

export { getMpmGranularStats } from './mpm_granularStats';

export function createMpmGranularSeed(config: MpmGranularNormalizedConfig): MpmGranularParticle[] {
  const side = Math.max(1, Math.ceil(Math.sqrt(config.particleCount)));
  const spacing = config.particleRadius * 1.9;
  const startX = -config.spawnWidth * 0.5;
  const startY = 0.35;
  const particles: MpmGranularParticle[] = [];
  for (let row = 0; row < side; row += 1) {
    for (let col = 0; col < side; col += 1) {
      if (particles.length >= config.particleCount) break;
      const jitter = ((row * 17 + col * 31) % 7) * 0.0008;
      const x = startX + col * spacing + (row % 2) * spacing * 0.2 + jitter;
      const y = startY + row * spacing + jitter * 0.5;
      particles.push({ x, y, px: x, py: y, vx: 0, vy: 0, mass: 1, plasticStrain: 0, compactness: 0, affineXX: 0, affineXY: 0, affineYX: 0, affineYY: 0, meanStress: 0, shearStress: 0, hardeningState: 0, viscosityState: 0, yieldMemory: 0 });
    }
  }
  return particles;
}

export function createMpmGranularRuntimeState(config: MpmGranularNormalizedConfig): MpmGranularRuntimeState {
  const particles = createMpmGranularSeed(config);
  const grid = createGridState(config);
  for (const particle of particles) accumulateParticleToGrid(grid, particle, config);
  finalizeGridTransfer(grid, particles.length);
  return { config, particles, grid, frame: 0 };
}

export function stepMpmGranularRuntime(runtime: MpmGranularRuntimeState, options?: { dt?: number; substeps?: number }): MpmGranularRuntimeState {
  const dt = options?.dt ?? 1 / 60;
  const substeps = Math.max(1, Math.floor(options?.substeps ?? runtime.config.substeps));
  const next: MpmGranularRuntimeState = { config: runtime.config, particles: runtime.particles.map(cloneParticle), grid: createGridState(runtime.config), frame: runtime.frame + 1 };

  for (let substep = 0; substep < substeps; substep += 1) {
    const subDt = dt / substeps;
    for (const particle of next.particles) integrateParticle(particle, runtime.config.gravity, runtime.config.damping, subDt);
    resetGridState(next.grid);
    for (const particle of next.particles) accumulateParticleToGrid(next.grid, particle, runtime.config);
    finalizeGridTransfer(next.grid, next.particles.length);
    for (const particle of next.particles) applyGridToParticle(next.grid, particle, runtime.config);
    for (let iteration = 0; iteration < 2; iteration += 1) {
      for (let index = 0; index < next.particles.length; index += 1) {
        for (let other = index + 1; other < next.particles.length; other += 1) solvePairConstraint(next.particles[index], next.particles[other], runtime.config);
      }
      for (const particle of next.particles) solveBoundaryConstraint(particle, runtime.config);
    }
    for (const particle of next.particles) {
      particle.plasticStrain *= 0.995;
      particle.compactness *= 0.998;
      particle.meanStress *= 0.996 + runtime.config.hardening * 0.002;
      particle.shearStress *= 0.996;
      particle.hardeningState *= 0.999;
      particle.viscosityState *= 0.999;
      particle.yieldMemory *= 0.999;
    }
  }

  resetGridState(next.grid);
  for (const particle of next.particles) {
    particle.vx = particle.x - particle.px;
    particle.vy = particle.y - particle.py;
    accumulateParticleToGrid(next.grid, particle, runtime.config);
  }
  finalizeGridTransfer(next.grid, next.particles.length);
  return next;
}

export function simulateMpmGranularFrames(config: MpmGranularNormalizedConfig, frameCount: number, options?: { dt?: number; substeps?: number }): MpmGranularRuntimeState {
  let runtime = createMpmGranularRuntimeState(config);
  for (let frame = 0; frame < frameCount; frame += 1) runtime = stepMpmGranularRuntime(runtime, options);
  return runtime;
}
