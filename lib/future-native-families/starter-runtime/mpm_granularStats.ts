import type { MpmGranularRuntimeState, MpmGranularStats } from './mpm_granularShared';

export function getMpmGranularStats(runtime: MpmGranularRuntimeState): MpmGranularStats {
  let minY = Number.POSITIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  let sumY = 0;
  let floorContacts = 0;
  let wallContacts = 0;
  let spillCount = 0;
  let speedTotal = 0;
  let plasticTotal = 0;
  let compactTotal = 0;
  let maxPlasticStrain = 0;
  let stressTotal = 0;
  let maxStress = 0;
  let shearTotal = 0;
  let apicEnergy = 0;
  let hardeningTotal = 0;
  let viscosityTotal = 0;
  let yieldMemoryTotal = 0;
  for (const particle of runtime.particles) {
    minY = Math.min(minY, particle.y);
    maxY = Math.max(maxY, particle.y);
    sumY += particle.y;
    speedTotal += Math.hypot(particle.vx, particle.vy);
    plasticTotal += particle.plasticStrain;
    compactTotal += particle.compactness;
    maxPlasticStrain = Math.max(maxPlasticStrain, particle.plasticStrain);
    stressTotal += particle.meanStress;
    maxStress = Math.max(maxStress, particle.meanStress);
    shearTotal += particle.shearStress;
    apicEnergy += Math.abs(particle.affineXX) + Math.abs(particle.affineXY) + Math.abs(particle.affineYX) + Math.abs(particle.affineYY);
    hardeningTotal += particle.hardeningState;
    viscosityTotal += particle.viscosityState;
    yieldMemoryTotal += particle.yieldMemory;
    const minFloorY = runtime.config.floorY + runtime.config.particleRadius + 0.04;
    if (particle.y <= minFloorY) floorContacts += 1;
    const wallX = runtime.config.wallHalfWidth - runtime.config.particleRadius - 1e-6;
    if (Math.abs(particle.x) >= wallX) wallContacts += 1;
    if (Math.abs(particle.x) > runtime.config.wallHalfWidth + runtime.config.particleRadius * 2) spillCount += 1;
  }
  let pairContacts = 0;
  const contactThreshold = runtime.config.particleRadius * 2.15;
  for (let index = 0; index < runtime.particles.length; index += 1) {
    for (let other = index + 1; other < runtime.particles.length; other += 1) {
      const a = runtime.particles[index];
      const b = runtime.particles[other];
      if (Math.hypot(b.x - a.x, b.y - a.y) <= contactThreshold) pairContacts += 1;
    }
  }
  let denseCells = 0;
  for (const cell of runtime.grid.cells) if (cell.density >= 1.2) denseCells += 1;
  return {
    frame: runtime.frame,
    particles: runtime.particles.length,
    centerOfMassY: runtime.particles.length > 0 ? sumY / runtime.particles.length : 0,
    minY: Number.isFinite(minY) ? minY : 0,
    maxY: Number.isFinite(maxY) ? maxY : 0,
    pileHeight: Number.isFinite(minY) && Number.isFinite(maxY) ? maxY - minY : 0,
    floorContacts,
    wallContacts,
    pairContacts,
    spillCount,
    meanSpeed: runtime.particles.length > 0 ? speedTotal / runtime.particles.length : 0,
    occupiedCells: runtime.grid.occupiedCells,
    gridTotalMass: runtime.grid.totalMass,
    maxCellMass: runtime.grid.maxCellMass,
    transferResidual: runtime.grid.transferResidual,
    meanPlasticStrain: runtime.particles.length > 0 ? plasticTotal / runtime.particles.length : 0,
    maxPlasticStrain,
    meanCompactness: runtime.particles.length > 0 ? compactTotal / runtime.particles.length : 0,
    denseCells,
    meanStress: runtime.particles.length > 0 ? stressTotal / runtime.particles.length : 0,
    maxStress,
    meanShearStress: runtime.particles.length > 0 ? shearTotal / runtime.particles.length : 0,
    apicEnergy: runtime.particles.length > 0 ? apicEnergy / runtime.particles.length : 0,
    meanHardeningState: runtime.particles.length > 0 ? hardeningTotal / runtime.particles.length : 0,
    meanViscosityState: runtime.particles.length > 0 ? viscosityTotal / runtime.particles.length : 0,
    meanYieldMemory: runtime.particles.length > 0 ? yieldMemoryTotal / runtime.particles.length : 0,
    materialBranchScore: runtime.particles.length > 0 ? (hardeningTotal + viscosityTotal + yieldMemoryTotal) / runtime.particles.length : 0,
  };
}
