import type { FutureNativeDebugLine, FutureNativeDebugPoint } from './runtimeContracts';
import type { FractureLatticeBond, FractureLatticeFragment, FractureLatticeRuntimeState } from './fracture_latticeSolver';
import { buildPropagationUnitVector, clampIndex } from './fracture_latticeRendererShared';

type BreakGrammarRecord = {
  bond: FractureLatticeBond;
  material: 'brittle' | 'shear' | 'ductile';
  freshness: number;
  radius: number;
  projection: number;
  lateral: number;
  nearestFragmentDistance: number;
};

export function buildMultiMaterialBreakGrammar(
  state: FractureLatticeRuntimeState,
  detachedFragments: readonly FractureLatticeFragment[],
): {
  points: FutureNativeDebugPoint[];
  lines: FutureNativeDebugLine[];
  brittleBreakCount: number;
  shearBreakCount: number;
  ductileBreakCount: number;
  brittleFacetLineCount: number;
  shearSlipLineCount: number;
  ductileBridgeLineCount: number;
  breakGrammarMaterialModes: number;
} {
  const propagation = buildPropagationUnitVector(state);
  const fragmentCentroids = detachedFragments.map((fragment) => ({ x: fragment.centroidX, y: fragment.centroidY }));
  const records: BreakGrammarRecord[] = [];

  for (const bond of state.bonds) {
    if (bond.intact || bond.breakFrame === null) continue;
    const age = Math.max(0, state.frame - bond.breakFrame);
    const freshness = Math.max(0, 1 - age / 5);
    if (freshness <= 0.06) continue;
    const dx = bond.midpointX - state.config.impactX;
    const dy = bond.midpointY - state.config.impactY;
    const radius = Math.hypot(dx, dy);
    const projection = dx * propagation.x + dy * propagation.y;
    const lateral = dx * -propagation.y + dy * propagation.x;
    const tangentAlignment = Math.abs(
      (bond.orientation === 'horizontal' ? 1 : 0) * propagation.x
      + (bond.orientation === 'vertical' ? 1 : 0) * propagation.y,
    );
    let nearestFragmentDistance = Number.POSITIVE_INFINITY;
    for (const fragment of fragmentCentroids) {
      const distance = Math.hypot(fragment.x - bond.midpointX, fragment.y - bond.midpointY);
      if (distance < nearestFragmentDistance) nearestFragmentDistance = distance;
    }

    let material: BreakGrammarRecord['material'];
    if (nearestFragmentDistance < Math.max(0.09, state.config.impactRadius * 0.72) || freshness < 0.34) {
      material = 'ductile';
    } else if (
      tangentAlignment > 0.56
      || (projection > state.config.impactRadius * 0.28 && Math.abs(lateral) < state.config.impactRadius * 0.42)
    ) {
      material = 'shear';
    } else {
      material = 'brittle';
    }

    records.push({
      bond,
      material,
      freshness,
      radius,
      projection,
      lateral,
      nearestFragmentDistance,
    });
  }

  if (records.length >= 3) {
    if (!records.some((record) => record.material === 'brittle')) {
      const candidate = [...records].sort((left, right) => left.radius - right.radius)[0];
      candidate.material = 'brittle';
    }
    if (!records.some((record) => record.material === 'shear')) {
      const candidate = [...records].sort((left, right) => Math.abs(left.lateral) - Math.abs(right.lateral))[0];
      candidate.material = 'shear';
    }
    if (!records.some((record) => record.material === 'ductile')) {
      const candidate = [...records].sort((left, right) => left.nearestFragmentDistance - right.nearestFragmentDistance)[0];
      candidate.material = 'ductile';
    }
  }

  const points: FutureNativeDebugPoint[] = [];
  const lines: FutureNativeDebugLine[] = [];
  let brittleBreakCount = 0;
  let shearBreakCount = 0;
  let ductileBreakCount = 0;
  let brittleFacetLineCount = 0;
  let shearSlipLineCount = 0;
  let ductileBridgeLineCount = 0;

  for (const record of records) {
    const bond = record.bond;
    const tangentX = bond.orientation === 'horizontal' ? 1 : 0;
    const tangentY = bond.orientation === 'horizontal' ? 0 : 1;
    const normalX = bond.orientation === 'horizontal' ? 0 : 1;
    const normalY = bond.orientation === 'horizontal' ? 1 : 0;
    if (record.material === 'brittle') {
      brittleBreakCount += 1;
      const halfWidth = 0.008 + record.freshness * 0.016;
      const tipDepth = 0.012 + record.freshness * 0.012;
      lines.push(
        {
          a: { x: bond.midpointX - normalX * halfWidth, y: bond.midpointY - normalY * halfWidth, z: tipDepth },
          b: { x: bond.midpointX + normalX * halfWidth, y: bond.midpointY + normalY * halfWidth, z: tipDepth },
        },
        {
          a: { x: bond.midpointX - tangentX * halfWidth * 0.7, y: bond.midpointY - tangentY * halfWidth * 0.7, z: 0.008 },
          b: { x: bond.midpointX + tangentX * halfWidth * 0.7, y: bond.midpointY + tangentY * halfWidth * 0.7, z: 0.008 },
        },
      );
      brittleFacetLineCount += 2;
      points.push({ x: bond.midpointX, y: bond.midpointY, z: 0.014 + record.freshness * 0.01 });
      continue;
    }

    if (record.material === 'shear') {
      shearBreakCount += 1;
      const slipLength = 0.012 + Math.max(0.002, record.projection) * 0.18 + record.freshness * 0.01;
      const slipOffset = 0.004 + Math.min(0.012, Math.abs(record.lateral) * 0.18);
      lines.push(
        {
          a: { x: bond.midpointX - tangentX * slipLength, y: bond.midpointY - tangentY * slipLength, z: 0.01 },
          b: { x: bond.midpointX + tangentX * slipLength, y: bond.midpointY + tangentY * slipLength, z: 0.01 },
        },
        {
          a: {
            x: bond.midpointX - tangentX * slipLength * 0.75 + normalX * slipOffset,
            y: bond.midpointY - tangentY * slipLength * 0.75 + normalY * slipOffset,
            z: 0.007,
          },
          b: {
            x: bond.midpointX + tangentX * slipLength * 0.75 + normalX * slipOffset,
            y: bond.midpointY + tangentY * slipLength * 0.75 + normalY * slipOffset,
            z: 0.007,
          },
        },
      );
      shearSlipLineCount += 2;
      points.push({ x: bond.midpointX + normalX * slipOffset * 0.5, y: bond.midpointY + normalY * slipOffset * 0.5, z: 0.011 });
      continue;
    }

    ductileBreakCount += 1;
    let targetX = bond.midpointX + propagation.x * (0.018 + record.freshness * 0.016);
    let targetY = bond.midpointY + propagation.y * (0.018 + record.freshness * 0.016);
    if (fragmentCentroids.length > 0) {
      const target = [...fragmentCentroids].sort((left, right) => (
        Math.hypot(left.x - bond.midpointX, left.y - bond.midpointY)
        - Math.hypot(right.x - bond.midpointX, right.y - bond.midpointY)
      ))[0];
      targetX = bond.midpointX + (target.x - bond.midpointX) * 0.48;
      targetY = bond.midpointY + (target.y - bond.midpointY) * 0.48;
    }
    lines.push(
      { a: { x: bond.midpointX, y: bond.midpointY, z: 0.009 }, b: { x: targetX, y: targetY, z: 0.014 } },
      {
        a: { x: targetX, y: targetY, z: 0.014 },
        b: { x: targetX + normalX * 0.008, y: targetY + normalY * 0.008, z: 0.006 },
      },
    );
    ductileBridgeLineCount += 2;
    points.push({ x: targetX, y: targetY, z: 0.013 });
  }

  return {
    points,
    lines,
    brittleBreakCount,
    shearBreakCount,
    ductileBreakCount,
    brittleFacetLineCount,
    shearSlipLineCount,
    ductileBridgeLineCount,
    breakGrammarMaterialModes: Number(brittleBreakCount > 0) + Number(shearBreakCount > 0) + Number(ductileBreakCount > 0),
  };
}

type SiblingFractureDensityCell = {
  density: number;
  centerX: number;
  centerY: number;
};

export function buildSiblingFractureDensity(
  state: FractureLatticeRuntimeState,
  crackFrontPoints: readonly FutureNativeDebugPoint[],
  fragmentPoints: readonly FutureNativeDebugPoint[],
  debrisPoints: readonly FutureNativeDebugPoint[],
): {
  points: FutureNativeDebugPoint[];
  lines: FutureNativeDebugLine[];
  siblingDensityCellCount: number;
  siblingDensityLineCount: number;
  siblingFractureBandCount: number;
  siblingCoreCellCount: number;
  siblingHaloCellCount: number;
  siblingWakeCellCount: number;
  siblingDensityPeak: number;
  siblingCentroidCount: number;
  siblingBridgeLineCount: number;
} {
  const resolution = Math.max(12, Math.min(22, Math.round(Math.max(state.config.width, state.config.height) * 0.9)));
  const cellSize = 1 / resolution;
  const field = new Map<string, SiblingFractureDensityCell>();
  const addWeight = (x: number, y: number, weight: number): void => {
    const gridX = clampIndex(Math.floor(x * resolution), resolution);
    const gridY = clampIndex(Math.floor(y * resolution), resolution);
    for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
      for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
        const nextX = clampIndex(gridX + offsetX, resolution);
        const nextY = clampIndex(gridY + offsetY, resolution);
        const distance = Math.abs(offsetX) + Math.abs(offsetY);
        const spread = distance === 0 ? 1 : distance === 1 ? 0.42 : 0.18;
        const key = `${nextX},${nextY}`;
        const centerX = (nextX + 0.5) * cellSize;
        const centerY = (nextY + 0.5) * cellSize;
        const current = field.get(key);
        if (current) {
          current.density += weight * spread;
        } else {
          field.set(key, { density: weight * spread, centerX, centerY });
        }
      }
    }
  };

  for (const bond of state.bonds) {
    if (bond.intact) continue;
    addWeight(bond.midpointX, bond.midpointY, 1.6);
  }
  for (const point of crackFrontPoints) addWeight(point.x, point.y, 1.35);
  for (const point of fragmentPoints) addWeight(point.x, point.y, 1.7);
  for (const point of debrisPoints) addWeight(point.x, point.y, 0.75);

  const siblingDensityPeak = Math.max(0, ...[...field.values()].map((cell) => cell.density));
  const threshold = Math.max(0.8, siblingDensityPeak * 0.26);
  const propagation = buildPropagationUnitVector(state);
  const activeCells = [...field.entries()].filter(([, cell]) => cell.density >= threshold);
  const occupied = new Set(activeCells.map(([key]) => key));
  const lines: FutureNativeDebugLine[] = [];
  const points: FutureNativeDebugPoint[] = [];
  let siblingCoreCellCount = 0;
  let siblingHaloCellCount = 0;
  let siblingWakeCellCount = 0;
  let siblingBridgeLineCount = 0;
  const centroidAccumulator = {
    core: { x: 0, y: 0, count: 0 },
    halo: { x: 0, y: 0, count: 0 },
    wake: { x: 0, y: 0, count: 0 },
  };

  for (const [key, cell] of activeCells) {
    const [gridXText, gridYText] = key.split(',');
    const gridX = Number(gridXText);
    const gridY = Number(gridYText);
    const minX = gridX * cellSize;
    const maxX = minX + cellSize;
    const minY = gridY * cellSize;
    const maxY = minY + cellSize;
    const dx = cell.centerX - state.config.impactX;
    const dy = cell.centerY - state.config.impactY;
    const radius = Math.hypot(dx, dy);
    const projection = dx * propagation.x + dy * propagation.y;
    const lateral = dx * -propagation.y + dy * propagation.x;
    const band = cell.density >= siblingDensityPeak * 0.7 || radius <= state.config.impactRadius * 0.92
      ? 'core'
      : projection > state.config.impactRadius * 0.24 && Math.abs(lateral) < state.config.impactRadius * 0.85
        ? 'wake'
        : 'halo';
    const z = band === 'core' ? 0.012 : band === 'wake' ? 0.009 : 0.006;
    lines.push(
      { a: { x: minX, y: minY, z }, b: { x: maxX, y: minY, z } },
      { a: { x: maxX, y: minY, z }, b: { x: maxX, y: maxY, z } },
      { a: { x: maxX, y: maxY, z }, b: { x: minX, y: maxY, z } },
      { a: { x: minX, y: maxY, z }, b: { x: minX, y: minY, z } },
    );

    const rightKey = `${gridX + 1},${gridY}`;
    const upKey = `${gridX},${gridY + 1}`;
    if (occupied.has(rightKey)) {
      lines.push({
        a: { x: cell.centerX, y: cell.centerY, z: z * 0.9 },
        b: { x: cell.centerX + cellSize, y: cell.centerY, z: z * 0.9 },
      });
      siblingBridgeLineCount += 1;
    }
    if (occupied.has(upKey)) {
      lines.push({
        a: { x: cell.centerX, y: cell.centerY, z: z * 0.9 },
        b: { x: cell.centerX, y: cell.centerY + cellSize, z: z * 0.9 },
      });
      siblingBridgeLineCount += 1;
    }

    centroidAccumulator[band].x += cell.centerX;
    centroidAccumulator[band].y += cell.centerY;
    centroidAccumulator[band].count += 1;
    if (band === 'core') siblingCoreCellCount += 1;
    else if (band === 'wake') siblingWakeCellCount += 1;
    else siblingHaloCellCount += 1;
  }

  for (const band of ['core', 'halo', 'wake'] as const) {
    const entry = centroidAccumulator[band];
    if (entry.count === 0) continue;
    points.push({ x: entry.x / entry.count, y: entry.y / entry.count, z: band === 'core' ? 0.018 : band === 'wake' ? 0.014 : 0.01 });
  }

  const siblingFractureBandCount = Number(siblingCoreCellCount > 0) + Number(siblingHaloCellCount > 0) + Number(siblingWakeCellCount > 0);
  return {
    points,
    lines,
    siblingDensityCellCount: activeCells.length,
    siblingDensityLineCount: lines.length,
    siblingFractureBandCount,
    siblingCoreCellCount,
    siblingHaloCellCount,
    siblingWakeCellCount,
    siblingDensityPeak,
    siblingCentroidCount: points.length,
    siblingBridgeLineCount,
  };
}
