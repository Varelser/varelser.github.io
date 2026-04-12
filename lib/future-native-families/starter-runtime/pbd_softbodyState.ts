import type { PbdSoftbodyNormalizedConfig } from './pbd_softbodySchema';
import {
  buildCells,
  buildLinks,
  isPinned,
  type PbdSoftbodyRuntimeState,
} from './pbd_softbodyTypes';

export function createPbdSoftbodyRuntimeState(config: PbdSoftbodyNormalizedConfig): PbdSoftbodyRuntimeState {
  const ox = -((config.width - 1) * config.spacing) / 2;
  const oy = 0.26;
  const cx = ox + ((config.width - 1) * config.spacing) / 2;
  const cy = oy - ((config.height - 1) * config.spacing) / 2;
  const particles = Array.from({ length: config.width * config.height }, (_, index) => {
    const x = index % config.width;
    const y = Math.floor(index / config.width);
    const px = ox + x * config.spacing;
    const py = oy - y * config.spacing;
    return {
      x: px,
      y: py,
      px,
      py,
      pinned: isPinned(config, x, y),
      restOffsetX: px - cx,
      restOffsetY: py - cy,
    };
  });
  return {
    config,
    particles,
    links: buildLinks(config),
    cells: buildCells(config),
    frame: 0,
    windImpulse: 0,
    pressureImpulse: 0,
    pinGroupCount: config.pinGroupCount,
    obstacleImpulse: 0,
    obstacleContacts: 0,
    choreographyDrift: 0,
    obstacleLayerCount: 0,
    volumeConstraintError: 0,
    impactResponse: 0,
  };
}

export function clonePbdSoftbodyRuntimeState(runtime: PbdSoftbodyRuntimeState): PbdSoftbodyRuntimeState {
  return {
    config: runtime.config,
    particles: runtime.particles.map((particle) => ({ ...particle })),
    links: runtime.links.map((link) => ({ ...link })),
    cells: runtime.cells.map((cell) => ({ ...cell, indices: [...cell.indices] as [number, number, number, number] })),
    frame: runtime.frame + 1,
    windImpulse: 0,
    pressureImpulse: 0,
    pinGroupCount: runtime.pinGroupCount,
    obstacleImpulse: runtime.obstacleImpulse,
    obstacleContacts: runtime.obstacleContacts,
    choreographyDrift: runtime.choreographyDrift,
    obstacleLayerCount: runtime.obstacleLayerCount,
    volumeConstraintError: runtime.volumeConstraintError,
    impactResponse: 0,
  };
}
