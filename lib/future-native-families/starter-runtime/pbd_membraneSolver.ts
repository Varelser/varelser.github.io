import type { PbdMembraneNormalizedConfig } from './pbd_membraneSchema';
import { applyPbdSurfaceForces } from './pbd_surfaceForces';
import {
  applyCapsuleCollision,
  applyCircleCollision,
  applyFloorCollision,
  applyMultiPinGroupPull,
  buildChoreographedPinGroups,
  buildLayeredObstacleFields,
  resolvePinChoreographyPreset,
  resolveTearBiasTexturePreset,
  applyObstacleField,
  applySpacingGuard,
  applyTearableDistanceLinks,
  integrateVerletParticles,
  type PbdSharedLink,
  type PbdSharedParticle,
} from './pbd_sharedConstraints';

export interface PbdMembraneParticle extends PbdSharedParticle {}
export interface PbdMembraneRuntimeState {
  config: PbdMembraneNormalizedConfig;
  particles: PbdMembraneParticle[];
  links: PbdSharedLink[];
  frame: number;
  windImpulse: number;
  pressureImpulse: number;
  pinGroupCount: number;
  tornFrontLinks: number;
  obstacleImpulse: number;
  obstacleContacts: number;
  choreographyDrift: number;
  obstacleLayerCount: number;
  tearBiasTextureScore: number;
}
export interface PbdMembraneStats {
  frame: number;
  particleCount: number;
  pinnedCount: number;
  floorContacts: number;
  selfCollisionPairs: number;
  circleContacts: number;
  capsuleContacts: number;
  brokenLinks: number;
  tearEvents: number;
  centerY: number;
  minY: number;
  maxY: number;
  averageStretch: number;
  pulseResponse: number;
  inflationLift: number;
  rimSpanX: number;
  windImpulse: number;
  pressureImpulse: number;
  pinGroupCount: number;
  tornFrontLinks: number;
  obstacleImpulse: number;
  obstacleContacts: number;
  choreographyDrift: number;
  obstacleLayerCount: number;
  tearBiasTextureScore: number;
}
function indexOf(config: PbdMembraneNormalizedConfig, x: number, y: number): number { return y * config.width + x; }
function isBoundary(config: PbdMembraneNormalizedConfig, x: number, y: number): boolean { return x === 0 || y === 0 || x === config.width - 1 || y === config.height - 1; }
function isPinned(config: PbdMembraneNormalizedConfig, x: number, y: number): boolean {
  if (config.anchorMode === 'none') return false;
  if (config.anchorMode === 'top-edge') return y === 0;
  if (config.anchorMode === 'rim-quadrants') return isBoundary(config, x, y) && ((x === 0 || x === config.width - 1) || (y === 0 || y === config.height - 1)) && ((x + y) % 2 === 0);
  return y === 0 && (x === 0 || x === config.width - 1);
}
function buildPinGroups(config: PbdMembraneNormalizedConfig): { indices: number[]; x: number; y: number; strength: number }[] {
  const ox = -((config.width - 1) * config.spacing) / 2;
  const oy = 0.28;
  if (config.anchorMode !== 'rim-quadrants') {
    const indices: number[] = [];
    let sx = 0;
    let sy = 0;
    for (let y = 0; y < config.height; y += 1) {
      for (let x = 0; x < config.width; x += 1) {
        if (!isPinned(config, x, y)) continue;
        const idx = indexOf(config, x, y);
        indices.push(idx);
        sx += ox + x * config.spacing;
        sy += oy - y * config.spacing;
      }
    }
    return [{ indices, x: indices.length ? sx / indices.length : 0, y: indices.length ? sy / indices.length : 0.28, strength: config.pinGroupStrength * 0.18 }];
  }
  const groups: { indices: number[]; x: number; y: number; strength: number }[] = [];
  const quadrants = [
    (x: number, y: number) => x <= (config.width - 1) / 2 && y <= (config.height - 1) / 2,
    (x: number, y: number) => x > (config.width - 1) / 2 && y <= (config.height - 1) / 2,
    (x: number, y: number) => x <= (config.width - 1) / 2 && y > (config.height - 1) / 2,
    (x: number, y: number) => x > (config.width - 1) / 2 && y > (config.height - 1) / 2,
  ];
  for (let gi = 0; gi < Math.min(config.pinGroupCount, quadrants.length); gi += 1) {
    const test = quadrants[gi];
    const indices: number[] = [];
    let sx = 0;
    let sy = 0;
    for (let y = 0; y < config.height; y += 1) {
      for (let x = 0; x < config.width; x += 1) {
        if (!isPinned(config, x, y) || !test(x, y)) continue;
        const idx = indexOf(config, x, y);
        indices.push(idx);
        sx += ox + x * config.spacing;
        sy += oy - y * config.spacing;
      }
    }
    if (indices.length > 0) groups.push({ indices, x: sx / indices.length, y: sy / indices.length, strength: config.pinGroupStrength * 0.18 });
  }
  return groups;
}
function pushLink(links: PbdSharedLink[], a: number, b: number, restLength: number, stiffness: number, breakThreshold: number, kind: string): void {
  links.push({ a, b, restLength, stiffness, breakThreshold, kind, active: true });
}
function buildLinks(config: PbdMembraneNormalizedConfig): PbdSharedLink[] {
  const links: PbdSharedLink[] = [];
  const structural = config.spacing;
  const diagonal = config.spacing * Math.SQRT2;
  const bend = config.spacing * 2;
  for (let y = 0; y < config.height; y += 1) {
    for (let x = 0; x < config.width; x += 1) {
      const i = indexOf(config, x, y);
      const edgeBoost = isBoundary(config, x, y) ? 1 + config.boundaryTension : 1;
      if (x + 1 < config.width) pushLink(links, i, indexOf(config, x + 1, y), structural, Math.min(1, config.stiffness * edgeBoost), config.tearThreshold, 'structural');
      if (y + 1 < config.height) pushLink(links, i, indexOf(config, x, y + 1), structural, Math.min(1, config.stiffness * edgeBoost), config.tearThreshold, 'structural');
      if (x + 1 < config.width && y + 1 < config.height) pushLink(links, i, indexOf(config, x + 1, y + 1), diagonal, config.shearStiffness, config.tearThreshold * 1.06, 'shear');
      if (x - 1 >= 0 && y + 1 < config.height) pushLink(links, i, indexOf(config, x - 1, y + 1), diagonal, config.shearStiffness, config.tearThreshold * 1.06, 'shear');
      if (x + 2 < config.width) pushLink(links, i, indexOf(config, x + 2, y), bend, config.bendStiffness, config.tearThreshold * 1.14, 'bend');
      if (y + 2 < config.height) pushLink(links, i, indexOf(config, x, y + 2), bend, config.bendStiffness, config.tearThreshold * 1.14, 'bend');
    }
  }
  return links;
}

function buildObstacleFields(config: { obstacleFieldX: number; obstacleFieldY: number; obstacleFieldRadius: number; obstacleFieldStrength: number; obstacleField2X: number; obstacleField2Y: number; obstacleField2Radius: number; obstacleField2Strength: number; obstaclePreset: 'manual' | 'staggered-arc' | 'shear-lattice'; }, frame: number) {
  return buildLayeredObstacleFields([
    { x: config.obstacleFieldX, y: config.obstacleFieldY, radius: config.obstacleFieldRadius, strength: config.obstacleFieldStrength },
    { x: config.obstacleField2X, y: config.obstacleField2Y, radius: config.obstacleField2Radius, strength: config.obstacleField2Strength },
  ], { preset: config.obstaclePreset, frame });
}

export function createPbdMembraneRuntimeState(config: PbdMembraneNormalizedConfig): PbdMembraneRuntimeState {
  const ox = -((config.width - 1) * config.spacing) / 2;
  const oy = 0.28;
  const particles = Array.from({ length: config.width * config.height }, (_, i) => {
    const x = i % config.width;
    const y = Math.floor(i / config.width);
    const px = ox + x * config.spacing;
    const py = oy - y * config.spacing;
    return { x: px, y: py, px, py, pinned: isPinned(config, x, y) };
  });
  return { config, particles, links: buildLinks(config), frame: 0, windImpulse: 0, pressureImpulse: 0, pinGroupCount: config.pinGroupCount, tornFrontLinks: 0, obstacleImpulse: 0, obstacleContacts: 0, choreographyDrift: 0, obstacleLayerCount: 0, tearBiasTextureScore: 0 };
}
function applyPulseAndInflation(runtime: PbdMembraneRuntimeState): void {
  const { config, particles, frame } = runtime;
  let cx = 0;
  let cy = 0;
  for (const p of particles) { cx += p.x; cy += p.y; }
  cx /= particles.length;
  cy /= particles.length;
  const pulse = Math.sin(frame * 0.1) * 0.0025;
  for (let y = 0; y < config.height; y += 1) {
    for (let x = 0; x < config.width; x += 1) {
      const p = particles[indexOf(config, x, y)];
      if (p.pinned) continue;
      const dx = p.x - cx;
      const dy = p.y - cy;
      const d = Math.hypot(dx, dy) || 1;
      const radial = (isBoundary(config, x, y) ? 0.6 : 1) * config.inflation * 0.0018;
      p.x += (dx / d) * radial + config.pulseX * pulse;
      p.y += (dy / d) * radial + config.pulseY * pulse + config.inflation * 0.0008;
    }
  }
  if (config.pinGroupStrength > 0) {
    const baseGroups = buildPinGroups(config);
    const groups = buildChoreographedPinGroups(baseGroups, resolvePinChoreographyPreset({
      mode: config.pinChoreographyMode,
      amplitude: config.pinChoreographyAmplitude,
      speed: config.pinChoreographySpeed,
      frame,
    }, config.pinChoreographyPreset));
    applyMultiPinGroupPull(particles, groups);
    runtime.choreographyDrift = groups.reduce((sum, group, index) => sum + Math.hypot(group.x - baseGroups[index].x, group.y - baseGroups[index].y), 0);
  }
  const impulse = applyPbdSurfaceForces(
    particles,
    frame,
    cx,
    cy,
    {
      windX: config.windX,
      windY: config.windY,
      windPulse: config.windPulse,
      pressureStrength: config.pressureStrength + config.inflation * 0.6,
      pressurePulse: config.pressurePulse,
    },
    (index) => {
      const x = index % config.width;
      const y = Math.floor(index / config.width);
      return isBoundary(config, x, y) ? 0.55 : 1.0;
    },
  );
  runtime.windImpulse = impulse.windImpulse;
  runtime.pressureImpulse = impulse.pressureImpulse;
}
export function stepPbdMembraneRuntime(runtime: PbdMembraneRuntimeState, options?: { iterations?: number; dt?: number }): PbdMembraneRuntimeState {
  const next: PbdMembraneRuntimeState = {
    config: runtime.config,
    particles: runtime.particles.map((p) => ({ ...p })),
    links: runtime.links.map((l) => ({ ...l })),
    frame: runtime.frame + 1,
    windImpulse: 0,
    pressureImpulse: 0,
    pinGroupCount: runtime.pinGroupCount,
    tornFrontLinks: runtime.tornFrontLinks,
    obstacleImpulse: runtime.obstacleImpulse,
    obstacleContacts: runtime.obstacleContacts,
    choreographyDrift: runtime.choreographyDrift,
    obstacleLayerCount: runtime.obstacleLayerCount,
    tearBiasTextureScore: runtime.tearBiasTextureScore,
  };
  const iterations = options?.iterations ?? 11;
  const dt = options?.dt ?? 1 / 60;
  integrateVerletParticles(next.particles, next.config.gravity, next.config.damping, dt);
  applyPulseAndInflation(next);
  for (let i = 0; i < iterations; i += 1) {
    const obstacleFields = buildObstacleFields(next.config, next.frame + i);
    next.obstacleLayerCount = obstacleFields.length;
    const obstacleStats = applyObstacleField(next.particles, obstacleFields, next.config.collisionRadius, 0.9);
    next.obstacleImpulse += obstacleStats.obstacleImpulse;
    next.obstacleContacts += obstacleStats.obstacleContacts;
    const tearBiasMap = resolveTearBiasTexturePreset({ scale: next.config.tearBiasMapScale, frequency: next.config.tearBiasMapFrequency, rotation: next.config.tearBiasMapRotation, contrast: next.config.tearBiasMapContrast }, next.config.tearBiasMapPreset, next.frame + i);
    applyTearableDistanceLinks(next.particles, next.links, { propagationBias: next.config.tearPropagationBias, directionX: next.config.tearDirectionX, directionY: next.config.tearDirectionY, obstacleFields, tearBiasMap });
    next.tearBiasTextureScore = Math.max(next.tearBiasTextureScore, tearBiasMap.scale * tearBiasMap.contrast);
    for (const p of next.particles) {
      applyFloorCollision(p, next.config.floorY, next.config.collisionRadius);
      applyCircleCollision(p, next.config.circleColliderX, next.config.circleColliderY, next.config.circleColliderRadius, next.config.collisionRadius, 0.9);
      applyCapsuleCollision(p, { ax: next.config.capsuleColliderAx, ay: next.config.capsuleColliderAy, bx: next.config.capsuleColliderBx, by: next.config.capsuleColliderBy, radius: next.config.capsuleColliderRadius }, next.config.collisionRadius, 0.9);
    }
    applySpacingGuard(next.particles, next.config.collisionRadius, next.config.selfCollisionStiffness, (a, b) => {
      const ax = a % next.config.width;
      const ay = Math.floor(a / next.config.width);
      const bx = b % next.config.width;
      const by = Math.floor(b / next.config.width);
      return Math.abs(ax - bx) <= 1 && Math.abs(ay - by) <= 1;
    });
  }
  next.pinGroupCount = next.config.pinGroupCount;
  next.tornFrontLinks = next.links.filter((l) => l.active !== false && (l.tearBias ?? 0) > 0.2).length;
  return next;
}
export function getPbdMembraneStats(runtime: PbdMembraneRuntimeState): PbdMembraneStats {
  const { particles, config, links } = runtime;
  let minY = Infinity;
  let maxY = -Infinity;
  let sumY = 0;
  let floorContacts = 0;
  let circleContacts = 0;
  let capsuleContacts = 0;
  let pulseResponse = 0;
  let totalStretch = 0;
  let stretchCount = 0;
  let selfPairs = 0;
  let tornFrontLinks = 0;
  let obstacleContacts = 0;
  let rimMinX = Infinity;
  let rimMaxX = -Infinity;
  for (let i = 0; i < particles.length; i += 1) {
    const p = particles[i];
    if (p.y <= config.floorY + config.collisionRadius + 1e-6) floorContacts += 1;
    if (Math.hypot(p.x - config.circleColliderX, p.y - config.circleColliderY) <= config.circleColliderRadius + config.collisionRadius + 1e-4) circleContacts += 1;
    for (const obstacleField of buildObstacleFields(config, runtime.frame)) {
      if (Math.hypot(p.x - obstacleField.x, p.y - obstacleField.y) <= obstacleField.radius + config.collisionRadius + 1e-4) obstacleContacts += 1;
    }
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
    sumY += p.y;
    pulseResponse += Math.abs(p.x - p.px) + Math.abs(p.y - p.py);
    const x = i % config.width;
    const y = Math.floor(i / config.width);
    if (isBoundary(config, x, y)) {
      rimMinX = Math.min(rimMinX, p.x);
      rimMaxX = Math.max(rimMaxX, p.x);
    }
    const dx = config.capsuleColliderBx - config.capsuleColliderAx;
    const dy = config.capsuleColliderBy - config.capsuleColliderAy;
    const denom = dx * dx + dy * dy;
    const t = denom <= 1e-8 ? 0 : Math.max(0, Math.min(1, ((p.x - config.capsuleColliderAx) * dx + (p.y - config.capsuleColliderAy) * dy) / denom));
    const qx = config.capsuleColliderAx + dx * t;
    const qy = config.capsuleColliderAy + dy * t;
    if (Math.hypot(p.x - qx, p.y - qy) <= config.capsuleColliderRadius + config.collisionRadius + 1e-4) capsuleContacts += 1;
  }
  for (const link of links) {
    if (link.active === false) continue;
    const a = particles[link.a];
    const b = particles[link.b];
    totalStretch += Math.hypot(b.x - a.x, b.y - a.y) / link.restLength;
    stretchCount += 1;
  }
  for (let i = 0; i < particles.length; i += 1) {
    for (let j = i + 1; j < particles.length; j += 1) {
      const ax = i % config.width;
      const ay = Math.floor(i / config.width);
      const bx = j % config.width;
      const by = Math.floor(j / config.width);
      if (Math.abs(ax - bx) <= 1 && Math.abs(ay - by) <= 1) continue;
      if (Math.hypot(particles[j].x - particles[i].x, particles[j].y - particles[i].y) < config.collisionRadius * 2.05) selfPairs += 1;
    }
  }
  const centerY = sumY / particles.length;
  const brokenLinks = links.filter((l) => l.active === false).length;
  tornFrontLinks = links.filter((l) => l.active !== false && (l.tearBias ?? 0) > 0.2).length;
  return {
    frame: runtime.frame,
    particleCount: particles.length,
    pinnedCount: particles.filter((p) => p.pinned).length,
    floorContacts,
    selfCollisionPairs: selfPairs,
    circleContacts,
    capsuleContacts,
    brokenLinks,
    tearEvents: brokenLinks,
    centerY,
    minY,
    maxY,
    averageStretch: stretchCount > 0 ? totalStretch / stretchCount : 1,
    pulseResponse: pulseResponse / particles.length,
    inflationLift: maxY - centerY,
    rimSpanX: rimMaxX - rimMinX,
    windImpulse: runtime.windImpulse,
    pressureImpulse: runtime.pressureImpulse,
    pinGroupCount: runtime.config.pinGroupCount,
    tornFrontLinks,
    obstacleImpulse: runtime.obstacleImpulse,
    obstacleContacts,
    choreographyDrift: runtime.choreographyDrift,
    obstacleLayerCount: runtime.obstacleLayerCount,
    tearBiasTextureScore: runtime.tearBiasTextureScore,
  };
}
