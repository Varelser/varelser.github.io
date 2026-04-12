import { applySpacingGuard } from './pbd_sharedConstraints';
import {
  polygonArea,
  type PbdSoftbodyRuntimeState,
  type PbdSoftbodyStats,
} from './pbd_softbodyTypes';

function getCellAreaMetrics(runtime: PbdSoftbodyRuntimeState): { currentArea: number; restArea: number; maxCellAreaError: number } {
  let currentArea = 0;
  let restArea = 0;
  let maxCellAreaError = 0;
  for (const cell of runtime.cells) {
    const points = cell.indices.map((index) => runtime.particles[index]);
    const area = Math.abs(polygonArea(points));
    currentArea += area;
    restArea += cell.restArea;
    maxCellAreaError = Math.max(maxCellAreaError, Math.abs(area - cell.restArea) / Math.max(1e-6, cell.restArea));
  }
  return { currentArea, restArea, maxCellAreaError };
}

export function getPbdSoftbodyStats(runtime: PbdSoftbodyRuntimeState): PbdSoftbodyStats {
  const { particles, config, links } = runtime;
  let minY = Infinity;
  let maxY = -Infinity;
  let minX = Infinity;
  let maxX = -Infinity;
  let sumY = 0;
  let pinnedCount = 0;
  let floorContacts = 0;
  let circleContacts = 0;
  let capsuleContacts = 0;
  let totalStretch = 0;
  let stretchCount = 0;
  for (const particle of particles) {
    minY = Math.min(minY, particle.y);
    maxY = Math.max(maxY, particle.y);
    minX = Math.min(minX, particle.x);
    maxX = Math.max(maxX, particle.x);
    sumY += particle.y;
    if (particle.pinned) pinnedCount += 1;
    if (particle.y <= config.floorY + config.collisionRadius + 1e-5) floorContacts += 1;
    if (Math.hypot(particle.x - config.circleColliderX, particle.y - config.circleColliderY) <= config.circleColliderRadius + config.collisionRadius + 1e-5) circleContacts += 1;
    const abx = config.capsuleColliderBx - config.capsuleColliderAx;
    const aby = config.capsuleColliderBy - config.capsuleColliderAy;
    const denom = abx * abx + aby * aby;
    const t = denom <= 1e-8 ? 0 : Math.max(0, Math.min(1, ((particle.x - config.capsuleColliderAx) * abx + (particle.y - config.capsuleColliderAy) * aby) / denom));
    const qx = config.capsuleColliderAx + abx * t;
    const qy = config.capsuleColliderAy + aby * t;
    if (Math.hypot(particle.x - qx, particle.y - qy) <= config.capsuleColliderRadius + config.collisionRadius + 1e-5) capsuleContacts += 1;
  }
  for (const link of links) {
    const a = particles[link.a];
    const b = particles[link.b];
    const distance = Math.hypot(b.x - a.x, b.y - a.y);
    totalStretch += distance / Math.max(1e-6, link.restLength);
    stretchCount += 1;
  }
  const { currentArea, restArea, maxCellAreaError } = getCellAreaMetrics(runtime);
  const selfCollisionPairs = applySpacingGuard(
    particles.map((particle) => ({ ...particle })),
    config.collisionRadius,
    0,
    (a, b) => {
      const ax = a % config.width;
      const ay = Math.floor(a / config.width);
      const bx = b % config.width;
      const by = Math.floor(b / config.width);
      return Math.abs(ax - bx) <= 1 && Math.abs(ay - by) <= 1;
    },
  );
  const centerY = particles.length ? sumY / particles.length : 0;
  const volumeRatio = restArea <= 1e-6 ? 1 : currentArea / restArea;
  return {
    frame: runtime.frame,
    particleCount: particles.length,
    pinnedCount,
    floorContacts,
    selfCollisionPairs,
    circleContacts,
    capsuleContacts,
    centerY,
    minY,
    maxY,
    averageStretch: stretchCount ? totalStretch / stretchCount : 1,
    volumeRatio,
    shellSpanX: maxX - minX,
    shellSpanY: maxY - minY,
    maxCellAreaError,
    surfaceRipple: maxY - centerY,
    impactResponse: runtime.impactResponse,
    windImpulse: runtime.windImpulse,
    pressureImpulse: runtime.pressureImpulse,
    pinGroupCount: runtime.pinGroupCount,
    obstacleImpulse: runtime.obstacleImpulse,
    obstacleContacts: runtime.obstacleContacts,
    choreographyDrift: runtime.choreographyDrift,
    obstacleLayerCount: runtime.obstacleLayerCount,
    volumeConstraintError: runtime.volumeConstraintError,
  };
}
