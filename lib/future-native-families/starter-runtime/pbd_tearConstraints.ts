import { applyDistanceConstraint } from './pbd_collisionConstraints';
import type {
  PbdObstacleField,
  PbdSharedLink,
  PbdSharedParticle,
  PbdTearBiasMap,
  PbdTearBiasTexturePreset,
  PbdTearPropagationOptions,
} from './pbd_sharedTypes';

export function resolveTearBiasTexturePreset(
  base: PbdTearBiasMap,
  preset: PbdTearBiasTexturePreset,
  frame: number,
): PbdTearBiasMap {
  if (preset === 'manual') return base;
  if (preset === 'warp-weft') {
    return {
      ...base,
      scale: Math.max(base.scale, 0.5),
      frequency: Math.max(base.frequency, 2.4),
      rotation: base.rotation + 0.15,
      contrast: Math.max(base.contrast, 0.78),
    };
  }
  if (preset === 'radial-flare') {
    return {
      ...base,
      scale: Math.max(base.scale, 0.58),
      frequency: Math.max(base.frequency, 1.8),
      rotation: base.rotation + frame * 0.004,
      contrast: Math.max(base.contrast, 0.84),
    };
  }
  return {
    ...base,
    scale: Math.max(base.scale, 0.54),
    frequency: Math.max(base.frequency, 3.4),
    rotation: base.rotation + 0.42,
    contrast: Math.max(base.contrast, 0.88),
  };
}

function sampleTearBiasMap(x: number, y: number, map?: PbdTearBiasMap): number {
  if (!map || map.scale <= 0 || map.frequency <= 0 || map.contrast <= 0) return 0;
  const cosR = Math.cos(map.rotation);
  const sinR = Math.sin(map.rotation);
  const rx = x * cosR - y * sinR;
  const ry = x * sinR + y * cosR;
  const stripe = Math.sin((rx + ry * 0.35) * map.frequency * Math.PI);
  return Math.max(0, stripe) * map.scale * map.contrast;
}

function collectObstacleBias(
  obstacles: readonly PbdObstacleField[],
  dist: number,
  dx: number,
  dy: number,
  midX: number,
  midY: number,
): number {
  let obstacleBias = 0;
  for (const obstacle of obstacles) {
    if (!obstacle || obstacle.radius <= 0 || obstacle.strength <= 0) continue;
    const ox = midX - obstacle.x;
    const oy = midY - obstacle.y;
    const od = Math.hypot(ox, oy) || 1;
    const proximity = Math.max(0, 1 - od / obstacle.radius);
    const radialAlignment = dist < 1e-8 ? 0 : Math.max(0, (dx / dist) * (ox / od) + (dy / dist) * (oy / od));
    obstacleBias += proximity * (0.55 + radialAlignment * 0.45) * obstacle.strength;
  }
  return obstacleBias;
}

export function applyTearableDistanceLinks(
  particles: PbdSharedParticle[],
  links: PbdSharedLink[],
  options?: PbdTearPropagationOptions,
): number {
  let broken = 0;
  const px = options?.directionX ?? 1;
  const py = options?.directionY ?? 0;
  const plen = Math.hypot(px, py) || 1;
  const nxDir = px / plen;
  const nyDir = py / plen;
  const propagationBias = options?.propagationBias ?? 0;
  const obstacles = options?.obstacleFields?.length
    ? options.obstacleFields
    : (options?.obstacleField ? [options.obstacleField] : []);
  for (const link of links) {
    if (link.active === false) continue;
    const a = particles[link.a];
    const b = particles[link.b];
    if (!a || !b) continue;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dist = Math.hypot(dx, dy);
    const alignment = dist < 1e-8 ? 0 : Math.max(0, (dx / dist) * nxDir + (dy / dist) * nyDir);
    const midX = (a.x + b.x) * 0.5;
    const midY = (a.y + b.y) * 0.5;
    const obstacleBias = collectObstacleBias(obstacles, dist, dx, dy, midX, midY);
    const mapBias = sampleTearBiasMap(midX, midY, options?.tearBiasMap);
    const tearScale = 1 - propagationBias * 0.18 * alignment - (link.tearBias ?? 0) * 0.05 - obstacleBias * 0.11 - mapBias * 0.08;
    const breakThreshold = (link.breakThreshold ?? 0) * Math.max(0.68, tearScale);
    if ((link.breakThreshold ?? 0) > 0 && dist > link.restLength * breakThreshold) {
      link.active = false;
      broken += 1;
      continue;
    }
    applyDistanceConstraint(a, b, link.restLength, link.stiffness);
  }
  if (broken > 0 && propagationBias > 0) {
    const propagate = propagationBias * 0.06 * broken;
    for (const link of links) {
      if (link.active === false) continue;
      link.tearBias = Math.min(1, (link.tearBias ?? 0) + propagate);
    }
  }
  return broken;
}
