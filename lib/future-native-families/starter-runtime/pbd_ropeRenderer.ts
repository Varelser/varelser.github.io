import type { FutureNativeRenderPayload } from './runtimeContracts';
import { getPbdRopeStats, type PbdRopeParticle, type PbdRopeRuntimeState } from './pbd_ropeSolver';

function isPbdRopeRuntimeState(source: readonly PbdRopeParticle[] | PbdRopeRuntimeState): source is PbdRopeRuntimeState {
  return !Array.isArray(source);
}

export function buildPbdRopeDebugRenderPayload(
  source: readonly PbdRopeParticle[] | PbdRopeRuntimeState,
): FutureNativeRenderPayload {
  if (!isPbdRopeRuntimeState(source)) {
    const particles = source;
    return {
      familyId: 'pbd-rope',
      summary: `rope:${particles.length}`,
      points: particles.map((particle) => ({ x: particle.x, y: particle.y })),
      lines: particles.slice(0, -1).map((particle, index) => ({
        a: { x: particle.x, y: particle.y },
        b: { x: particles[index + 1].x, y: particles[index + 1].y },
      })),
      stats: {
        particles: particles.length,
        segments: Math.max(0, particles.length - 1),
        pinned: particles.filter((particle) => particle.pinned).length,
      },
    };
  }

  const runtime = source;
  const particles = runtime.particles;
  const stats = {
    ...getPbdRopeStats(runtime),
    particles: particles.length,
    pinned: particles.filter((particle) => particle.pinned).length,
  };
  return {
    familyId: 'pbd-rope',
    summary: `rope:f${runtime.frame}:n${particles.length}:fc${stats.floorContacts}:cc${stats.circleContacts}:kc${stats.capsuleContacts}:sc${stats.selfCollisionPairs}`,
    points: particles.map((particle) => ({ x: particle.x, y: particle.y })),
    lines: particles.slice(0, -1).map((particle, index) => ({
      a: { x: particle.x, y: particle.y },
      b: { x: particles[index + 1].x, y: particles[index + 1].y },
    })),
    scalarSamples: [
      runtime.config.floorY,
      runtime.config.circleColliderRadius,
      runtime.config.capsuleColliderRadius,
      runtime.config.selfCollisionStiffness,
      stats.minNonAdjacentDistance,
    ],
    stats,
  };
}
