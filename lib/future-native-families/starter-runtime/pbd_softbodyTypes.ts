import type { PbdSoftbodyNormalizedConfig } from './pbd_softbodySchema';
import {
  buildLayeredObstacleFields,
  type PbdSharedLink,
  type PbdSharedParticle,
} from './pbd_sharedConstraints';

export interface PbdSoftbodyParticle extends PbdSharedParticle {
  restOffsetX: number;
  restOffsetY: number;
}

export interface PbdSoftbodyCell {
  indices: readonly [number, number, number, number];
  restArea: number;
}

export interface PbdSoftbodyRuntimeState {
  config: PbdSoftbodyNormalizedConfig;
  particles: PbdSoftbodyParticle[];
  links: PbdSharedLink[];
  cells: PbdSoftbodyCell[];
  frame: number;
  windImpulse: number;
  pressureImpulse: number;
  pinGroupCount: number;
  obstacleImpulse: number;
  obstacleContacts: number;
  choreographyDrift: number;
  obstacleLayerCount: number;
  volumeConstraintError: number;
  impactResponse: number;
}

export interface PbdSoftbodyStats {
  frame: number;
  particleCount: number;
  pinnedCount: number;
  floorContacts: number;
  selfCollisionPairs: number;
  circleContacts: number;
  capsuleContacts: number;
  centerY: number;
  minY: number;
  maxY: number;
  averageStretch: number;
  volumeRatio: number;
  shellSpanX: number;
  shellSpanY: number;
  maxCellAreaError: number;
  surfaceRipple: number;
  impactResponse: number;
  windImpulse: number;
  pressureImpulse: number;
  pinGroupCount: number;
  obstacleImpulse: number;
  obstacleContacts: number;
  choreographyDrift: number;
  obstacleLayerCount: number;
  volumeConstraintError: number;
}

export function indexOf(config: PbdSoftbodyNormalizedConfig, x: number, y: number): number {
  return y * config.width + x;
}

export function isBoundary(config: PbdSoftbodyNormalizedConfig, x: number, y: number): boolean {
  return x === 0 || y === 0 || x === config.width - 1 || y === config.height - 1;
}

export function isPinned(config: PbdSoftbodyNormalizedConfig, x: number, y: number): boolean {
  if (config.anchorMode === 'none') return false;
  if (config.anchorMode === 'top-edge') return y === 0;
  if (config.anchorMode === 'top-corners') return y === 0 && (x === 0 || x === config.width - 1);
  const cx = (config.width - 1) / 2;
  const cy = (config.height - 1) / 2;
  return Math.abs(x - cx) <= 1 && Math.abs(y - cy) <= 1;
}

export function buildPinGroups(config: PbdSoftbodyNormalizedConfig): { indices: number[]; x: number; y: number; strength: number }[] {
  const ox = -((config.width - 1) * config.spacing) / 2;
  const oy = 0.26;
  if (config.anchorMode !== 'core') {
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
    return [{ indices, x: indices.length ? sx / indices.length : 0, y: indices.length ? sy / indices.length : 0, strength: config.pinGroupStrength * 0.18 }];
  }
  const groups: { indices: number[]; x: number; y: number; strength: number }[] = [];
  const midX = (config.width - 1) / 2;
  const midY = (config.height - 1) / 2;
  for (let groupIndex = 0; groupIndex < Math.min(config.pinGroupCount, 2); groupIndex += 1) {
    const indices: number[] = [];
    let sx = 0;
    let sy = 0;
    for (let y = 0; y < config.height; y += 1) {
      for (let x = 0; x < config.width; x += 1) {
        const inCore = Math.abs(x - midX) <= 1 && Math.abs(y - midY) <= 1;
        const matchSide = groupIndex === 0 ? x <= midX : x >= midX;
        if (!inCore || !matchSide) continue;
        const idx = indexOf(config, x, y);
        indices.push(idx);
        sx += ox + x * config.spacing;
        sy += oy - y * config.spacing;
      }
    }
    if (indices.length > 0) {
      groups.push({
        indices,
        x: sx / indices.length,
        y: sy / indices.length,
        strength: config.pinGroupStrength * 0.18,
      });
    }
  }
  return groups.length ? groups : [{ indices: [indexOf(config, Math.floor(midX), Math.floor(midY))], x: 0, y: 0, strength: config.pinGroupStrength * 0.18 }];
}

function pushLink(links: PbdSharedLink[], a: number, b: number, restLength: number, stiffness: number, kind: string): void {
  links.push({ a, b, restLength, stiffness, kind, active: true });
}

export function buildLinks(config: PbdSoftbodyNormalizedConfig): PbdSharedLink[] {
  const links: PbdSharedLink[] = [];
  const structural = config.spacing;
  const diagonal = config.spacing * Math.SQRT2;
  const bend = config.spacing * 2;
  for (let y = 0; y < config.height; y += 1) {
    for (let x = 0; x < config.width; x += 1) {
      const i = indexOf(config, x, y);
      const edgeBoost = isBoundary(config, x, y) ? 1 + config.shellTension : 1;
      if (x + 1 < config.width) pushLink(links, i, indexOf(config, x + 1, y), structural, Math.min(1, config.stiffness * edgeBoost), 'structural');
      if (y + 1 < config.height) pushLink(links, i, indexOf(config, x, y + 1), structural, Math.min(1, config.stiffness * edgeBoost), 'structural');
      if (x + 1 < config.width && y + 1 < config.height) pushLink(links, i, indexOf(config, x + 1, y + 1), diagonal, config.shearStiffness, 'shear');
      if (x - 1 >= 0 && y + 1 < config.height) pushLink(links, i, indexOf(config, x - 1, y + 1), diagonal, config.shearStiffness, 'shear');
      if (x + 2 < config.width) pushLink(links, i, indexOf(config, x + 2, y), bend, config.bendStiffness, 'bend');
      if (y + 2 < config.height) pushLink(links, i, indexOf(config, x, y + 2), bend, config.bendStiffness, 'bend');
    }
  }
  return links;
}

export function buildCells(config: PbdSoftbodyNormalizedConfig): PbdSoftbodyCell[] {
  const cells: PbdSoftbodyCell[] = [];
  const restArea = config.spacing * config.spacing;
  for (let y = 0; y + 1 < config.height; y += 1) {
    for (let x = 0; x + 1 < config.width; x += 1) {
      cells.push({
        indices: [indexOf(config, x, y), indexOf(config, x + 1, y), indexOf(config, x + 1, y + 1), indexOf(config, x, y + 1)],
        restArea,
      });
    }
  }
  return cells;
}

export function polygonArea(points: readonly PbdSharedParticle[]): number {
  let area = 0;
  for (let i = 0; i < points.length; i += 1) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    area += a.x * b.y - b.x * a.y;
  }
  return area * 0.5;
}

export function buildObstacleFields(
  config: Pick<
    PbdSoftbodyNormalizedConfig,
    | 'obstacleFieldX'
    | 'obstacleFieldY'
    | 'obstacleFieldRadius'
    | 'obstacleFieldStrength'
    | 'obstacleField2X'
    | 'obstacleField2Y'
    | 'obstacleField2Radius'
    | 'obstacleField2Strength'
    | 'obstaclePreset'
  >,
  frame: number,
) {
  return buildLayeredObstacleFields(
    [
      { x: config.obstacleFieldX, y: config.obstacleFieldY, radius: config.obstacleFieldRadius, strength: config.obstacleFieldStrength },
      { x: config.obstacleField2X, y: config.obstacleField2Y, radius: config.obstacleField2Radius, strength: config.obstacleField2Strength },
    ],
    { preset: config.obstaclePreset, frame },
  );
}
