import type { PbdClothNormalizedConfig } from './pbd_clothSchema';
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

export interface PbdClothParticle extends PbdSharedParticle {}
export interface PbdClothRuntimeState {
  config: PbdClothNormalizedConfig;
  particles: PbdClothParticle[];
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
export interface PbdClothStats {
  frame: number;
  particleCount: number;
  width: number;
  height: number;
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

function indexOf(config: PbdClothNormalizedConfig, x: number, y: number): number { return y * config.width + x; }
function isPinned(config: PbdClothNormalizedConfig, x: number, y: number): boolean {
  if (config.pinMode === 'top-edge') return y === 0;
  if (config.pinMode === 'left-edge') return x === 0;
  if (config.pinMode === 'top-band') {
    const mid = (config.width - 1) / 2;
    return y === 0 && Math.abs(x - mid) <= Math.floor(config.pinGroupWidth / 2);
  }
  return y === 0 && (x === 0 || x === config.width - 1);
}
function getClothPinGroups(config: PbdClothNormalizedConfig): { indices: number[]; x: number; y: number; strength: number }[] {
  const ox = -((config.width - 1) * config.spacing) / 2;
  const baseY = 0.35;
  if (config.pinMode !== 'top-band') {
    const indices: number[] = [];
    let sx = 0;
    for (let x = 0; x < config.width; x += 1) {
      if (!isPinned(config, x, 0)) continue;
      const idx = indexOf(config, x, 0);
      indices.push(idx);
      sx += ox + x * config.spacing;
    }
    return [{ indices, x: indices.length ? sx / indices.length : 0, y: baseY, strength: config.pinGroupStrength * 0.18 }];
  }
  const centers = Array.from({ length: config.pinGroupCount }, (_, i) => {
    if (config.pinGroupCount <= 1) return (config.width - 1) / 2;
    return (i / (config.pinGroupCount - 1)) * (config.width - 1);
  });
  return centers.map((center, groupIndex) => {
    const indices: number[] = [];
    let sx = 0;
    for (let x = 0; x < config.width; x += 1) {
      if (Math.abs(x - center) > Math.floor(config.pinGroupWidth / 2)) continue;
      const idx = indexOf(config, x, 0);
      indices.push(idx);
      sx += ox + x * config.spacing;
    }
    const y = baseY + Math.sin(groupIndex * 0.8) * 0.01;
    return { indices, x: indices.length ? sx / indices.length : ox + center * config.spacing, y, strength: config.pinGroupStrength * 0.18 };
  });
}
function pushLink(links: PbdSharedLink[], a: number, b: number, restLength: number, stiffness: number, breakThreshold: number, kind: string): void {
  links.push({ a, b, restLength, stiffness, breakThreshold, kind, active: true });
}
function buildLinks(config: PbdClothNormalizedConfig): PbdSharedLink[] {
  const links: PbdSharedLink[] = [];
  const structural = config.spacing;
  const diagonal = config.spacing * Math.SQRT2;
  const bend = config.spacing * 2;
  for (let y = 0; y < config.height; y += 1) {
    for (let x = 0; x < config.width; x += 1) {
      const i = indexOf(config, x, y);
      if (x + 1 < config.width) pushLink(links, i, indexOf(config, x + 1, y), structural, config.stiffness, config.tearThreshold, 'structural');
      if (y + 1 < config.height) pushLink(links, i, indexOf(config, x, y + 1), structural, config.stiffness, config.tearThreshold, 'structural');
      if (x + 1 < config.width && y + 1 < config.height) pushLink(links, i, indexOf(config, x + 1, y + 1), diagonal, config.shearStiffness, config.tearThreshold * 1.08, 'shear');
      if (x - 1 >= 0 && y + 1 < config.height) pushLink(links, i, indexOf(config, x - 1, y + 1), diagonal, config.shearStiffness, config.tearThreshold * 1.08, 'shear');
      if (x + 2 < config.width) pushLink(links, i, indexOf(config, x + 2, y), bend, config.bendStiffness, config.tearThreshold * 1.15, 'bend');
      if (y + 2 < config.height) pushLink(links, i, indexOf(config, x, y + 2), bend, config.bendStiffness, config.tearThreshold * 1.15, 'bend');
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

export function createPbdClothRuntimeState(config: PbdClothNormalizedConfig): PbdClothRuntimeState {
  const ox = -((config.width - 1) * config.spacing) / 2;
  const oy = 0.35;
  const particles = Array.from({ length: config.width * config.height }, (_, i) => {
    const x = i % config.width;
    const y = Math.floor(i / config.width);
    const px = ox + x * config.spacing;
    const py = oy - y * config.spacing;
    return { x: px, y: py, px, py, pinned: isPinned(config, x, y) };
  });
  return { config, particles, links: buildLinks(config), frame: 0, windImpulse: 0, pressureImpulse: 0, pinGroupCount: config.pinGroupCount, tornFrontLinks: 0, obstacleImpulse: 0, obstacleContacts: 0, choreographyDrift: 0, obstacleLayerCount: 0, tearBiasTextureScore: 0 };
}

function applyPulseAndSurfaceForces(runtime: PbdClothRuntimeState): void {
  const { config, particles, frame } = runtime;
  const pulse = Math.sin(frame * 0.1) * 0.0025;
  for (let y = 0; y < config.height; y += 1) {
    for (let x = 0; x < config.width; x += 1) {
      const p = particles[indexOf(config, x, y)];
      if (p.pinned) continue;
      const weight = 1 - y / Math.max(1, config.height - 1);
      p.x += config.pulseX * pulse * weight;
      p.y += config.pulseY * pulse * weight;
    }
  }
  if (config.pinGroupStrength > 0) {
    const baseGroups = getClothPinGroups(config);
    const groups = buildChoreographedPinGroups(baseGroups, resolvePinChoreographyPreset({
      mode: config.pinChoreographyMode,
      amplitude: config.pinChoreographyAmplitude,
      speed: config.pinChoreographySpeed,
      frame,
    }, config.pinChoreographyPreset));
    applyMultiPinGroupPull(particles, groups);
    runtime.choreographyDrift = groups.reduce((sum, group, index) => sum + Math.hypot(group.x - baseGroups[index].x, group.y - baseGroups[index].y), 0);
  }
  let cx = 0;
  let cy = 0;
  for (const p of particles) { cx += p.x; cy += p.y; }
  cx /= particles.length;
  cy /= particles.length;
  const impulse = applyPbdSurfaceForces(
    particles,
    frame,
    cx,
    cy,
    {
      windX: config.windX,
      windY: config.windY,
      windPulse: config.windPulse,
      pressureStrength: config.pressureStrength,
      pressurePulse: config.pressurePulse,
    },
    (index) => {
      const y = Math.floor(index / config.width);
      return 0.35 + 0.65 * (1 - y / Math.max(1, config.height - 1));
    },
  );
  runtime.windImpulse = impulse.windImpulse;
  runtime.pressureImpulse = impulse.pressureImpulse;
}

export function stepPbdClothRuntime(runtime: PbdClothRuntimeState, options?: { iterations?: number; dt?: number }): PbdClothRuntimeState {
  const next: PbdClothRuntimeState = {
    config: runtime.config,
    particles: runtime.particles.map((p) => ({ ...p })),
    links: runtime.links.map((link) => ({ ...link })),
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
  const iterations = options?.iterations ?? 10;
  const dt = options?.dt ?? 1 / 60;
  integrateVerletParticles(next.particles, next.config.gravity, next.config.damping, dt);
  applyPulseAndSurfaceForces(next);
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
      applyCircleCollision(p, next.config.circleColliderX, next.config.circleColliderY, next.config.circleColliderRadius, next.config.collisionRadius, 0.92);
      applyCapsuleCollision(p, {
        ax: next.config.capsuleColliderAx,
        ay: next.config.capsuleColliderAy,
        bx: next.config.capsuleColliderBx,
        by: next.config.capsuleColliderBy,
        radius: next.config.capsuleColliderRadius,
      }, next.config.collisionRadius, 0.92);
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


export function getPbdClothStats(runtime: PbdClothRuntimeState): PbdClothStats {
  const { particles, config, links } = runtime;
  let minY = Infinity;
  let maxY = -Infinity;
  let sumY = 0;
  let floorContacts = 0;
  let circleContacts = 0;
  let capsuleContacts = 0;
  let totalStretch = 0;
  let stretchCount = 0;
  let pulseResponse = 0;
  let selfPairs = 0;
  let obstacleContacts = 0;
  for (let i = 0; i < particles.length; i += 1) {
    const p = particles[i];
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
    sumY += p.y;
    pulseResponse += Math.abs(p.x - p.px) + Math.abs(p.y - p.py);
    if (p.y <= config.floorY + config.collisionRadius + 1e-6) floorContacts += 1;
    if (Math.hypot(p.x - config.circleColliderX, p.y - config.circleColliderY) <= config.circleColliderRadius + config.collisionRadius + 1e-4) circleContacts += 1;
    for (const obstacleField of buildObstacleFields(config, runtime.frame)) {
      if (Math.hypot(p.x - obstacleField.x, p.y - obstacleField.y) <= obstacleField.radius + config.collisionRadius + 1e-4) obstacleContacts += 1;
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
  const brokenLinks = links.filter((link) => link.active === false).length;
  const tornFrontLinks = links.filter((link) => link.active !== false && (link.tearBias ?? 0) > 0.2).length;
  return {
    frame: runtime.frame,
    particleCount: particles.length,
    width: config.width,
    height: config.height,
    pinnedCount: particles.filter((p) => p.pinned).length,
    floorContacts,
    selfCollisionPairs: selfPairs,
    circleContacts,
    capsuleContacts,
    brokenLinks,
    tearEvents: brokenLinks,
    centerY: sumY / particles.length,
    minY,
    maxY,
    averageStretch: stretchCount > 0 ? totalStretch / stretchCount : 1,
    pulseResponse: pulseResponse / particles.length,
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
