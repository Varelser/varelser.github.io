import type { MpmGranularNormalizedConfig } from './mpm_granularSchema';
import { getCellVelocity, getGridColRow, getGridIndex } from './mpm_granularGrid';
import { getMaterialStateProfile, type MpmGranularGridState, type MpmGranularParticle } from './mpm_granularShared';

export function accumulateParticleToGrid(grid: MpmGranularGridState, particle: MpmGranularParticle, config: MpmGranularNormalizedConfig): void {
  const center = getGridColRow(grid, particle.x, particle.y);
  const support = Math.max(1, Math.ceil(config.kernelRadius));
  const radiusSq = (config.kernelRadius * 0.8) ** 2;
  let weightSum = 0;
  const weighted: Array<[number, number, number, number]> = [];
  for (let row = Math.max(0, center.row - support); row <= Math.min(grid.resolution - 1, center.row + support); row += 1) {
    for (let col = Math.max(0, center.col - support); col <= Math.min(grid.resolution - 1, center.col + support); col += 1) {
      const index = getGridIndex(grid, col, row);
      const cell = grid.cells[index];
      const dx = particle.x - cell.x;
      const dy = particle.y - cell.y;
      const ndx = dx / Math.max(grid.cellWidth, 1e-6);
      const ndy = dy / Math.max(grid.cellHeight, 1e-6);
      const distSq = ndx * ndx + ndy * ndy;
      if (distSq > radiusSq) continue;
      const weight = Math.max(0.0001, 1 - distSq / Math.max(radiusSq, 1e-6));
      weighted.push([index, weight, dx, dy]);
      weightSum += weight;
    }
  }
  if (weightSum <= 0) {
    const index = getGridIndex(grid, center.col, center.row);
    weighted.push([index, 1, 0, 0]);
    weightSum = 1;
  }
  for (const [index, rawWeight, dx, dy] of weighted) {
    const weight = rawWeight / weightSum;
    const cell = grid.cells[index];
    const mass = particle.mass * weight;
    const apicVx = particle.affineXX * dx + particle.affineXY * dy;
    const apicVy = particle.affineYX * dx + particle.affineYY * dy;
    cell.mass += mass;
    cell.vx += (particle.vx + apicVx * config.apicBlend) * mass;
    cell.vy += (particle.vy + apicVy * config.apicBlend) * mass;
    cell.occupancy += 1;
    cell.density += (1 + particle.compactness * 0.5) * weight;
    grid.totalMass += mass;
  }
}

export function finalizeGridTransfer(grid: MpmGranularGridState, totalParticleMass: number): void {
  let occupiedCells = 0;
  let maxCellMass = 0;
  for (const cell of grid.cells) {
    if (cell.mass > 0) {
      occupiedCells += 1;
      cell.vx /= cell.mass;
      cell.vy /= cell.mass;
      maxCellMass = Math.max(maxCellMass, cell.mass);
    }
  }
  grid.occupiedCells = occupiedCells;
  grid.maxCellMass = maxCellMass;
  grid.transferResidual = Math.abs(totalParticleMass - grid.totalMass);
}

export function applyGridToParticle(grid: MpmGranularGridState, particle: MpmGranularParticle, config: MpmGranularNormalizedConfig): void {
  const center = getGridColRow(grid, particle.x, particle.y);
  const support = Math.max(1, Math.ceil(config.kernelRadius));
  let vx = 0;
  let vy = 0;
  let density = 0;
  let weightSum = 0;
  for (let row = Math.max(0, center.row - support); row <= Math.min(grid.resolution - 1, center.row + support); row += 1) {
    for (let col = Math.max(0, center.col - support); col <= Math.min(grid.resolution - 1, center.col + support); col += 1) {
      const index = getGridIndex(grid, col, row);
      const cell = grid.cells[index];
      if (cell.mass <= 0) continue;
      const dx = particle.x - cell.x;
      const dy = particle.y - cell.y;
      const ndx = dx / Math.max(grid.cellWidth, 1e-6);
      const ndy = dy / Math.max(grid.cellHeight, 1e-6);
      const distSq = ndx * ndx + ndy * ndy;
      const radiusSq = (config.kernelRadius * 0.8) ** 2;
      if (distSq > radiusSq) continue;
      const weight = Math.max(0.0001, 1 - distSq / Math.max(radiusSq, 1e-6));
      vx += cell.vx * weight;
      vy += cell.vy * weight;
      density += cell.density * weight;
      weightSum += weight;
    }
  }
  if (weightSum <= 0) return;
  vx /= weightSum;
  vy /= weightSum;
  density /= weightSum;

  const left = getCellVelocity(grid, center.col - 1, center.row);
  const right = getCellVelocity(grid, center.col + 1, center.row);
  const down = getCellVelocity(grid, center.col, center.row - 1);
  const up = getCellVelocity(grid, center.col, center.row + 1);
  const gradXX = (right.vx - left.vx) / Math.max(grid.cellWidth * 2, 1e-6);
  const gradXY = (up.vx - down.vx) / Math.max(grid.cellHeight * 2, 1e-6);
  const gradYX = (right.vy - left.vy) / Math.max(grid.cellWidth * 2, 1e-6);
  const gradYY = (up.vy - down.vy) / Math.max(grid.cellHeight * 2, 1e-6);

  const profile = getMaterialStateProfile(config.materialKind);
  const blend = 0.04 + config.friction * 0.018 + config.plasticity * 0.015;
  particle.vx = particle.vx * (1 - blend) + vx * blend;
  particle.vy = particle.vy * (1 - blend) + vy * blend;
  particle.compactness = particle.compactness * 0.85 + Math.min(1.5, density / Math.max(1, config.kernelRadius)) * 0.15;

  const affineDamp = Math.max(0.4, 1 - config.apicBlend * 0.45 * profile.affineRetention);
  const affineLimit = 8;
  particle.affineXX = Math.max(-affineLimit, Math.min(affineLimit, particle.affineXX * affineDamp + gradXX * config.apicBlend * 0.18));
  particle.affineXY = Math.max(-affineLimit, Math.min(affineLimit, particle.affineXY * affineDamp + gradXY * config.apicBlend * 0.18));
  particle.affineYX = Math.max(-affineLimit, Math.min(affineLimit, particle.affineYX * affineDamp + gradYX * config.apicBlend * 0.18));
  particle.affineYY = Math.max(-affineLimit, Math.min(affineLimit, particle.affineYY * affineDamp + gradYY * config.apicBlend * 0.18));

  const divergence = gradXX + gradYY;
  const shear = Math.abs(gradXY + gradYX);
  const densityFactor = Math.min(1.5, density / Math.max(0.8, config.kernelRadius));
  const stressImpulse = Math.min(0.8, Math.abs(divergence) * config.stressGain * 0.12 * profile.stressScale + shear * config.stressGain * 0.08 * profile.shearRetention);
  particle.meanStress = Math.max(0, Math.min(4, particle.meanStress * (1 - config.hardening * 0.08) + stressImpulse));
  particle.shearStress = Math.max(0, Math.min(4, particle.shearStress * (1 - config.hardening * 0.06) + shear * config.stressGain * 0.12 * profile.shearRetention));

  const hardeningImpulse = (particle.compactness * 0.08 + particle.plasticStrain * 0.12 + Math.abs(divergence) * 0.04) * profile.hardeningGain * (1 + config.hardening);
  particle.hardeningState = Math.max(0, Math.min(2, particle.hardeningState * 0.985 + hardeningImpulse));

  const viscosityImpulse = (densityFactor * 0.08 + particle.compactness * 0.05 + Math.abs(particle.shearStress) * 0.02) * profile.viscosityGain * (1 + config.damping);
  particle.viscosityState = Math.max(0, Math.min(2, particle.viscosityState * 0.988 + viscosityImpulse));

  const yieldImpulse = Math.max(0, particle.meanStress - config.yieldRate * 0.25) * config.plasticity * 0.02;
  const yieldMemoryImpulse = (yieldImpulse * 10 + particle.meanStress * 0.02 + densityFactor * 0.02) * profile.yieldGain;
  particle.yieldMemory = Math.max(0, Math.min(2, particle.yieldMemory * 0.99 + yieldMemoryImpulse));

  if (yieldImpulse > 0) {
    particle.plasticStrain = Math.min(1, particle.plasticStrain + yieldImpulse * (1 + particle.yieldMemory * 0.12));
    particle.compactness = Math.min(1.5, particle.compactness + yieldImpulse * (0.6 + profile.compactionBias));
  }

  if (config.materialKind === 'sand') {
    particle.compactness = Math.max(0, particle.compactness - shear * 0.006);
    particle.shearStress *= 1.015;
  } else if (config.materialKind === 'snow') {
    particle.meanStress += particle.hardeningState * config.hardening * 0.018;
    particle.affineXX *= 1 + particle.hardeningState * 0.004;
    particle.affineYY *= 1 + particle.hardeningState * 0.004;
  } else if (config.materialKind === 'mud') {
    const mudDrag = Math.min(0.12, particle.viscosityState * (0.012 + profile.velocityDrag));
    particle.vx *= 1 - mudDrag;
    particle.vy *= 1 - mudDrag;
    particle.shearStress *= 0.985;
  } else if (config.materialKind === 'paste') {
    const pasteDrag = Math.min(0.16, particle.viscosityState * (0.016 + profile.velocityDrag) + particle.yieldMemory * 0.008);
    particle.vx *= 1 - pasteDrag;
    particle.vy *= 1 - pasteDrag;
    particle.meanStress += particle.yieldMemory * 0.012;
    particle.compactness = Math.min(1.5, particle.compactness + particle.yieldMemory * 0.004);
  }

  particle.meanStress *= 0.992 + particle.hardeningState * 0.0005;
  particle.shearStress *= 0.994 - Math.min(0.006, particle.viscosityState * 0.002);
  particle.hardeningState *= 0.998;
  particle.viscosityState *= 0.998;
  particle.yieldMemory *= 0.999;
  particle.vx *= 1 - Math.min(0.08, particle.viscosityState * 0.004 + profile.velocityDrag);
  particle.vy *= 1 - Math.min(0.08, particle.viscosityState * 0.004 + profile.velocityDrag);
  particle.px = particle.x - particle.vx;
  particle.py = particle.y - particle.vy;
}
