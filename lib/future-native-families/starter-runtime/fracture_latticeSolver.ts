import type { FractureLatticeNormalizedConfig } from './fracture_latticeSchema';

export interface FractureLatticeNode {
  id: number;
  x: number;
  y: number;
}

export type FractureBondOrientation = 'horizontal' | 'vertical';

export interface FractureLatticeBond {
  id: number;
  a: number;
  b: number;
  intact: boolean;
  damage: number;
  midpointX: number;
  midpointY: number;
  orientation: FractureBondOrientation;
  breakFrame: number | null;
}

export interface FractureLatticeDebris {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  energy: number;
}

export interface FractureLatticeFragment {
  id: number;
  nodeIds: readonly number[];
  centroidX: number;
  centroidY: number;
  detached: boolean;
}

export interface FractureLatticeRuntimeState {
  familyId: 'fracture-lattice';
  config: FractureLatticeNormalizedConfig;
  frame: number;
  nodes: readonly FractureLatticeNode[];
  bonds: readonly FractureLatticeBond[];
  debris: readonly FractureLatticeDebris[];
  brokenBondIds: readonly number[];
}

function createLcg(seed: number): () => number {
  let state = (seed >>> 0) || 1;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}

function getPropagationVector(config: FractureLatticeNormalizedConfig): { x: number; y: number } {
  const length = Math.hypot(config.propagationDirectionX, config.propagationDirectionY);
  if (length <= 1e-6) return { x: 1, y: 0 };
  return { x: config.propagationDirectionX / length, y: config.propagationDirectionY / length };
}

export function createFractureLatticeNodes(config: FractureLatticeNormalizedConfig): FractureLatticeNode[] {
  const nodes: FractureLatticeNode[] = [];
  const widthDenom = Math.max(1, config.width - 1);
  const heightDenom = Math.max(1, config.height - 1);
  for (let y = 0; y < config.height; y += 1) {
    for (let x = 0; x < config.width; x += 1) {
      nodes.push({ id: y * config.width + x, x: x / widthDenom, y: y / heightDenom });
    }
  }
  return nodes;
}

export function createFractureLatticeBonds(config: FractureLatticeNormalizedConfig): FractureLatticeBond[] {
  const bonds: FractureLatticeBond[] = [];
  const nodes = createFractureLatticeNodes(config);
  let bondId = 0;
  for (let y = 0; y < config.height; y += 1) {
    for (let x = 0; x < config.width; x += 1) {
      const index = y * config.width + x;
      if (x + 1 < config.width) {
        const a = nodes[index];
        const b = nodes[index + 1];
        bonds.push({ id: bondId++, a: index, b: index + 1, intact: true, damage: 0, midpointX: (a.x + b.x) * 0.5, midpointY: (a.y + b.y) * 0.5, orientation: 'horizontal', breakFrame: null });
      }
      if (y + 1 < config.height) {
        const a = nodes[index];
        const b = nodes[index + config.width];
        bonds.push({ id: bondId++, a: index, b: index + config.width, intact: true, damage: 0, midpointX: (a.x + b.x) * 0.5, midpointY: (a.y + b.y) * 0.5, orientation: 'vertical', breakFrame: null });
      }
    }
  }
  return bonds;
}

export function createFractureLatticeRuntimeState(config: FractureLatticeNormalizedConfig): FractureLatticeRuntimeState {
  return {
    familyId: 'fracture-lattice',
    config,
    frame: 0,
    nodes: createFractureLatticeNodes(config),
    bonds: createFractureLatticeBonds(config),
    debris: [],
    brokenBondIds: [],
  };
}

function sampleImpulse(bond: FractureLatticeBond, config: FractureLatticeNormalizedConfig): number {
  const dx = bond.midpointX - config.impactX;
  const dy = bond.midpointY - config.impactY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const normalized = Math.max(0, 1 - distance / config.impactRadius);
  return normalized * config.impulseMagnitude;
}

function getDirectionalBoost(bond: FractureLatticeBond, config: FractureLatticeNormalizedConfig): number {
  const propagation = getPropagationVector(config);
  const fromImpactX = bond.midpointX - config.impactX;
  const fromImpactY = bond.midpointY - config.impactY;
  const radialLength = Math.hypot(fromImpactX, fromImpactY);
  const radialDot = radialLength <= 1e-6 ? 1 : (fromImpactX * propagation.x + fromImpactY * propagation.y) / radialLength;
  const orientationDot = Math.abs(bond.orientation === 'horizontal' ? propagation.x : propagation.y);
  const directionalGain = Math.max(0, radialDot) * 0.65 + orientationDot * 0.35;
  return directionalGain * config.directionalBias;
}

function getNeighborPropagationBoost(bond: FractureLatticeBond, brokenBonds: readonly FractureLatticeBond[], config: FractureLatticeNormalizedConfig): number {
  if (brokenBonds.length === 0) return 0;
  const propagation = getPropagationVector(config);
  let maxBoost = 0;
  for (const broken of brokenBonds) {
    const dx = bond.midpointX - broken.midpointX;
    const dy = bond.midpointY - broken.midpointY;
    const distance = Math.hypot(dx, dy);
    if (distance > config.impactRadius * 1.8) continue;
    const normalizedDistance = 1 - distance / (config.impactRadius * 1.8);
    const forwardProjection = Math.max(0, dx * propagation.x + dy * propagation.y);
    const directionalAlignment = Math.min(1, forwardProjection / Math.max(config.impactRadius, 1e-6));
    const orientationBoost = broken.orientation === bond.orientation ? 1 : 0.72;
    const localBoost = normalizedDistance * (0.55 + directionalAlignment * 0.45) * orientationBoost;
    if (localBoost > maxBoost) maxBoost = localBoost;
  }
  return maxBoost * config.propagationFalloff;
}

function getSharedEndpointCount(a: FractureLatticeBond, b: FractureLatticeBond): number {
  const setA = [a.a, a.b];
  const setB = [b.a, b.b];
  let count = 0;
  for (const left of setA) {
    if (left === setB[0] || left === setB[1]) count += 1;
  }
  return count;
}

export function getFractureLatticeFragments(state: FractureLatticeRuntimeState): FractureLatticeFragment[] {
  const adjacency = new Map<number, number[]>();
  for (const node of state.nodes) adjacency.set(node.id, []);
  for (const bond of state.bonds) {
    if (!bond.intact) continue;
    adjacency.get(bond.a)?.push(bond.b);
    adjacency.get(bond.b)?.push(bond.a);
  }

  const visited = new Set<number>();
  const fragments: FractureLatticeFragment[] = [];
  for (const node of state.nodes) {
    if (visited.has(node.id)) continue;
    const stack = [node.id];
    const nodeIds: number[] = [];
    visited.add(node.id);
    while (stack.length > 0) {
      const current = stack.pop();
      if (current === undefined) continue;
      nodeIds.push(current);
      for (const next of adjacency.get(current) ?? []) {
        if (visited.has(next)) continue;
        visited.add(next);
        stack.push(next);
      }
    }
    let centroidX = 0;
    let centroidY = 0;
    for (const nodeId of nodeIds) {
      centroidX += state.nodes[nodeId].x;
      centroidY += state.nodes[nodeId].y;
    }
    centroidX /= Math.max(1, nodeIds.length);
    centroidY /= Math.max(1, nodeIds.length);
    fragments.push({
      id: fragments.length,
      nodeIds,
      centroidX,
      centroidY,
      detached: false,
    });
  }

  let rootIndex = 0;
  let rootSize = -1;
  for (let index = 0; index < fragments.length; index += 1) {
    if (fragments[index].nodeIds.length > rootSize) {
      rootSize = fragments[index].nodeIds.length;
      rootIndex = index;
    }
  }
  return fragments.map((fragment, index) => ({ ...fragment, detached: index !== rootIndex }));
}

export function stepFractureLatticeRuntime(state: FractureLatticeRuntimeState): FractureLatticeRuntimeState {
  const rng = createLcg(state.config.seed + state.frame + 1);
  const newlyBroken: number[] = [];
  const debris: FractureLatticeDebris[] = state.debris.map((piece) => ({
    ...piece,
    x: piece.x + piece.vx,
    y: piece.y + piece.vy,
    vy: piece.vy - 0.0025,
    energy: piece.energy * 0.97,
  })).filter((piece) => piece.energy > 0.02);
  const brokenBonds = state.bonds.filter((bond) => !bond.intact);
  const propagation = getPropagationVector(state.config);

  const bonds = state.bonds.map((bond) => {
    if (!bond.intact) return bond;
    const impulse = sampleImpulse(bond, state.config);
    const directionBoost = getDirectionalBoost(bond, state.config);
    const neighborBoost = getNeighborPropagationBoost(bond, brokenBonds, state.config);
    const damage = bond.damage
      + impulse / Math.max(0.0001, state.config.bondStrength)
      + directionBoost
      + neighborBoost;
    if (damage >= state.config.impulseThreshold) {
      newlyBroken.push(bond.id);
      const shouldSpawnDebris = rng() < state.config.debrisSpawnRate;
      if (shouldSpawnDebris) {
        const awayX = bond.midpointX - state.config.impactX;
        const awayY = bond.midpointY - state.config.impactY;
        const awayLength = Math.hypot(awayX, awayY) || 1;
        const debrisDirectionX = awayX / awayLength * 0.6 + propagation.x * 0.4;
        const debrisDirectionY = awayY / awayLength * 0.6 + propagation.y * 0.4;
        debris.push({
          id: debris.length + newlyBroken.length,
          x: bond.midpointX,
          y: bond.midpointY,
          vx: debrisDirectionX * (0.012 + rng() * 0.02) * state.config.debrisImpulseScale,
          vy: debrisDirectionY * (0.012 + rng() * 0.02) * state.config.debrisImpulseScale,
          energy: 0.4 + rng() * 0.6,
        });
      }
      return { ...bond, intact: false, damage, breakFrame: state.frame + 1 };
    }
    return { ...bond, damage };
  });

  const nextState = {
    ...state,
    frame: state.frame + 1,
    bonds,
    debris,
    brokenBondIds: [...state.brokenBondIds, ...newlyBroken],
  };

  const fragments = getFractureLatticeFragments(nextState);
  const detachedFragments = fragments.filter((fragment) => fragment.detached && fragment.nodeIds.length >= 2);
  const detachedDebris: FractureLatticeDebris[] = [];
  for (const fragment of detachedFragments) {
    const centerDx = fragment.centroidX - state.config.impactX;
    const centerDy = fragment.centroidY - state.config.impactY;
    const radialLength = Math.hypot(centerDx, centerDy) || 1;
    const radialX = centerDx / radialLength;
    const radialY = centerDy / radialLength;
    const directionalPush = Math.max(0, radialX * propagation.x + radialY * propagation.y);
    const sizeFactor = Math.min(1, fragment.nodeIds.length / Math.max(1, nextState.nodes.length * 0.4));
    const detachEnergy = (directionalPush * 0.5 + sizeFactor * 0.5) * state.config.splitAffinity;
    if (detachEnergy < state.config.fragmentDetachThreshold) continue;
    detachedDebris.push({
      id: debris.length + detachedDebris.length + 1,
      x: fragment.centroidX,
      y: fragment.centroidY,
      vx: (radialX * 0.009 + propagation.x * 0.004) * (1 + detachEnergy) * state.config.debrisImpulseScale,
      vy: (radialY * 0.009 + propagation.y * 0.004) * (1 + detachEnergy) * state.config.debrisImpulseScale,
      energy: 0.28 + detachEnergy * 0.72,
    });
  }

  return detachedDebris.length === 0
    ? nextState
    : { ...nextState, debris: [...nextState.debris, ...detachedDebris] };
}

export function simulateFractureLatticeRuntime(
  initialState: FractureLatticeRuntimeState,
  frameCount: number,
): FractureLatticeRuntimeState {
  let runtime = initialState;
  for (let frame = 0; frame < frameCount; frame += 1) runtime = stepFractureLatticeRuntime(runtime);
  return runtime;
}

function getLargestBrokenClusterSize(state: FractureLatticeRuntimeState): number {
  const brokenIds = new Set(state.bonds.filter((bond) => !bond.intact).map((bond) => bond.id));
  if (brokenIds.size === 0) return 0;
  const adjacency = new Map<number, number[]>();
  for (const bond of state.bonds) {
    if (bond.intact) continue;
    adjacency.set(bond.id, []);
  }
  const brokenBonds = state.bonds.filter((bond) => !bond.intact);
  for (let i = 0; i < brokenBonds.length; i += 1) {
    for (let j = i + 1; j < brokenBonds.length; j += 1) {
      const a = brokenBonds[i];
      const b = brokenBonds[j];
      const sharedEndpointCount = getSharedEndpointCount(a, b);
      if (sharedEndpointCount === 0) continue;
      adjacency.get(a.id)?.push(b.id);
      adjacency.get(b.id)?.push(a.id);
    }
  }
  let maxCluster = 0;
  const visited = new Set<number>();
  for (const bondId of brokenIds) {
    if (visited.has(bondId)) continue;
    const stack = [bondId];
    let cluster = 0;
    visited.add(bondId);
    while (stack.length > 0) {
      const current = stack.pop();
      if (current === undefined) continue;
      cluster += 1;
      for (const next of adjacency.get(current) ?? []) {
        if (visited.has(next)) continue;
        visited.add(next);
        stack.push(next);
      }
    }
    if (cluster > maxCluster) maxCluster = cluster;
  }
  return maxCluster;
}

export function getFractureLatticeStats(state: FractureLatticeRuntimeState): Record<string, number> {
  const intact = state.bonds.filter((bond) => bond.intact).length;
  const broken = state.bonds.length - intact;
  const meanDamage = state.bonds.reduce((sum, bond) => sum + bond.damage, 0) / Math.max(1, state.bonds.length);
  const propagation = getPropagationVector(state.config);
  const recentFrameWindow = 3;
  let maxRadius = 0;
  let propagationAdvance = 0;
  let recentBreaks = 0;
  let crackFrontRadius = 0;
  let collapseEnvelopeRadius = 0;
  for (const bond of state.bonds) {
    if (bond.intact) continue;
    const dx = bond.midpointX - state.config.impactX;
    const dy = bond.midpointY - state.config.impactY;
    const radius = Math.sqrt(dx * dx + dy * dy);
    const advance = Math.max(0, dx * propagation.x + dy * propagation.y);
    if (radius > maxRadius) maxRadius = radius;
    if (advance > propagationAdvance) propagationAdvance = advance;
    if (bond.breakFrame !== null) {
      const age = state.frame - bond.breakFrame;
      const freshness = Math.max(0, 1 - age / Math.max(1, recentFrameWindow));
      if (age <= recentFrameWindow) recentBreaks += 1;
      collapseEnvelopeRadius = Math.max(collapseEnvelopeRadius, radius + freshness * state.config.impactRadius * 0.28);
      if (freshness > 0.2) crackFrontRadius = Math.max(crackFrontRadius, radius);
    }
  }
  const fragments = getFractureLatticeFragments(state);
  const detachedFragments = fragments.filter((fragment) => fragment.detached);
  const largestFragmentNodes = fragments.reduce((maxCount, fragment) => Math.max(maxCount, fragment.nodeIds.length), 0);
  const detachedFragmentNodes = detachedFragments.reduce((sum, fragment) => sum + fragment.nodeIds.length, 0);
  const largestBrokenCluster = getLargestBrokenClusterSize(state);
  const breakProgress = broken / Math.max(1, state.bonds.length);
  return {
    frame: state.frame,
    bonds: state.bonds.length,
    intact,
    broken,
    brokenRatio: breakProgress,
    breakProgress,
    debris: state.debris.length,
    meanDamage,
    fractureRadius: maxRadius,
    crackFrontRadius,
    recentBreaks,
    collapseEnvelopeRadius,
    propagationAdvance,
    largestBrokenCluster,
    fragments: fragments.length,
    detachedFragments: detachedFragments.length,
    detachedFragmentNodes,
    largestFragmentNodes,
  };
}
