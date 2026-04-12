import { MathUtils } from 'three';
import type { BufferGeometry, ShaderMaterial } from 'three';
import type { ParticleConfig } from '../types';
import { syncFloat32GeometryAttribute } from '../lib/geometryBufferSync';
import { ParticleData, getSpatialCellKey } from './particleData';
import { estimateLayerPositionApprox } from './sceneMotionEstimator';
import { BRUSH_LINE_FRAGMENT_SHADER, BRUSH_LINE_VERTEX_SHADER, LINE_FRAGMENT_SHADER, LINE_VERTEX_SHADER } from './sceneShaders';
import { getLineBlendMode, ShaderUniformMap } from './sceneShared';
import { withCrossFamilyLineProfile, withSourceAwareLineProfile } from '../lib/sourceAwareShaping';
import { getLayerRuntimeLineSnapshot, getLayerRuntimeMode } from '../lib/sceneRenderRoutingRuntime';
import type { ParticleSystemAudioRef } from './sceneParticleSystemRuntime';

export type LineSystemProps = {
  config: ParticleConfig;
  layerIndex: 2 | 3;
  particleData: ParticleData;
  uniforms: ShaderUniformMap;
  globalRadius: number;
  connectionDistance: number;
  connectionOpacity: number;
  contactAmount: number;
  isPlaying: boolean;
  audioRef: ParticleSystemAudioRef;
};

export type LineProfile = {
  searchMul: number;
  budgetMul: number;
  sampleMul: number;
  neighborBonus: number;
  planarBias: number;
  radialBias: number;
  gateFreq: number;
  gateThreshold: number;
  dropout: number;
  widthMul: number;
  softnessMul: number;
  opacityMul: number;
  glowMul: number;
  alphaMul: number;
  pulseMul: number;
  shimmerMul: number;
  flickerMul: number;
  hueShiftAdd: number;
};

export type LineData = {
  classic: {
    aPosA: Float32Array;
    aOffA: Float32Array;
    aData1A: Float32Array;
    aData2A: Float32Array;
    aData3A: Float32Array;
    aPosB: Float32Array;
    aOffB: Float32Array;
    aData1B: Float32Array;
    aData2B: Float32Array;
    aData3B: Float32Array;
    aMix: Float32Array;
    count: number;
  };
  brush: {
    aPosA: Float32Array;
    aOffA: Float32Array;
    aData1A: Float32Array;
    aData2A: Float32Array;
    aData3A: Float32Array;
    aPosB: Float32Array;
    aOffB: Float32Array;
    aData1B: Float32Array;
    aData2B: Float32Array;
    aData3B: Float32Array;
    aLineCoord: Float32Array;
    count: number;
  };
};

const DEFAULT_LINE_PROFILE: LineProfile = {
  searchMul: 1,
  budgetMul: 1,
  sampleMul: 1,
  neighborBonus: 0,
  planarBias: 0,
  radialBias: 0,
  gateFreq: 0,
  gateThreshold: 0,
  dropout: 0,
  widthMul: 1,
  softnessMul: 1,
  opacityMul: 1,
  glowMul: 1,
  alphaMul: 1,
  pulseMul: 1,
  shimmerMul: 1,
  flickerMul: 1,
  hueShiftAdd: 0,
};

const EMPTY_FLOAT32 = new Float32Array(0);

const LINE_MODE_PROFILES: Partial<Record<ParticleConfig['layer2Type'], Partial<LineProfile>>> = {
  contour_echo: { searchMul: 0.84, budgetMul: 0.9, sampleMul: 0.88, neighborBonus: -1, planarBias: 1.18, radialBias: 0.34, gateFreq: 0.58, gateThreshold: 0.18, widthMul: 1.08, softnessMul: 0.94, opacityMul: 0.9, glowMul: 0.76, alphaMul: 0.82, pulseMul: 0.84, shimmerMul: 0.78, flickerMul: 0.86, hueShiftAdd: 0.01 },
  shell_script: { searchMul: 0.78, budgetMul: 0.76, sampleMul: 0.86, neighborBonus: -1, planarBias: 0.82, radialBias: 0.92, gateFreq: 0.94, gateThreshold: 0.34, dropout: 0.08, widthMul: 0.84, softnessMul: 0.78, opacityMul: 0.78, glowMul: 0.64, alphaMul: 0.72, pulseMul: 0.72, shimmerMul: 0.8, flickerMul: 1.18, hueShiftAdd: 0.03 },
  sigil_dust: { searchMul: 0.76, budgetMul: 0.72, sampleMul: 0.8, neighborBonus: -1, planarBias: 1.02, radialBias: 0.42, gateFreq: 1.18, gateThreshold: 0.46, dropout: 0.16, widthMul: 0.78, softnessMul: 0.72, opacityMul: 0.72, glowMul: 0.58, alphaMul: 0.66, pulseMul: 0.68, shimmerMul: 0.76, flickerMul: 1.1, hueShiftAdd: 0.02 },
  drift_glyph_dust: { searchMul: 0.82, budgetMul: 0.64, sampleMul: 0.74, neighborBonus: -2, planarBias: 0.7, radialBias: 0.26, gateFreq: 1.08, gateThreshold: 0.52, dropout: 0.24, widthMul: 0.74, softnessMul: 0.7, opacityMul: 0.58, glowMul: 0.5, alphaMul: 0.6, pulseMul: 0.64, shimmerMul: 0.72, flickerMul: 1.06, hueShiftAdd: -0.01 },
  glyph_weave: { searchMul: 1.12, budgetMul: 1.22, sampleMul: 1.14, neighborBonus: 1, planarBias: 0.62, radialBias: 0.34, gateFreq: 0.78, gateThreshold: 0.22, dropout: 0.04, widthMul: 0.94, softnessMul: 0.58, opacityMul: 0.9, glowMul: 1.1, alphaMul: 1.08, pulseMul: 0.96, shimmerMul: 1.1, flickerMul: 1.18, hueShiftAdd: 0.04 },
  mesh_weave: { searchMul: 1.08, budgetMul: 1.14, sampleMul: 1.1, neighborBonus: 1, planarBias: 0.3, radialBias: 0.24, gateFreq: 0.34, gateThreshold: 0.08, widthMul: 0.9, softnessMul: 0.66, opacityMul: 0.88, glowMul: 0.96, alphaMul: 0.96, pulseMul: 0.9, shimmerMul: 0.96, flickerMul: 0.96, hueShiftAdd: 0.01 },
  static_lace: { searchMul: 1.02, budgetMul: 1.04, sampleMul: 1.0, neighborBonus: 1, planarBias: 0.72, radialBias: 0.18, gateFreq: 1.22, gateThreshold: 0.4, dropout: 0.14, widthMul: 0.82, softnessMul: 0.56, opacityMul: 0.78, glowMul: 0.7, alphaMul: 0.74, pulseMul: 0.86, shimmerMul: 1.04, flickerMul: 1.34, hueShiftAdd: 0.02 },
  signal_braid: { searchMul: 1.18, budgetMul: 1.24, sampleMul: 1.12, neighborBonus: 1, planarBias: 0.26, radialBias: 0.32, gateFreq: 1.08, gateThreshold: 0.18, dropout: 0.08, widthMul: 0.9, softnessMul: 0.56, opacityMul: 0.9, glowMul: 1.18, alphaMul: 1.06, pulseMul: 1.16, shimmerMul: 1.18, flickerMul: 1.24, hueShiftAdd: 0.06 },
  cinder_web: { searchMul: 0.94, budgetMul: 0.98, sampleMul: 0.96, neighborBonus: 0, planarBias: 0.44, radialBias: 0.16, gateFreq: 0.72, gateThreshold: 0.22, dropout: 0.12, widthMul: 0.92, softnessMul: 0.68, opacityMul: 0.82, glowMul: 0.74, alphaMul: 0.8, pulseMul: 0.86, shimmerMul: 0.92, flickerMul: 1.02, hueShiftAdd: -0.02 },
  spectral_mesh: { searchMul: 1.14, budgetMul: 1.22, sampleMul: 1.14, neighborBonus: 1, planarBias: 0.22, radialBias: 0.24, gateFreq: 0.54, gateThreshold: 0.06, widthMul: 0.86, softnessMul: 0.58, opacityMul: 0.94, glowMul: 1.24, alphaMul: 1.1, pulseMul: 1.08, shimmerMul: 1.22, flickerMul: 1.24, hueShiftAdd: 0.06 },
  aurora_threads: { searchMul: 1.14, budgetMul: 1.2, sampleMul: 1.12, neighborBonus: 1, planarBias: 0.22, radialBias: 0.28, gateFreq: 0.42, gateThreshold: 0.05, widthMul: 0.9, softnessMul: 0.6, opacityMul: 0.9, glowMul: 1.22, alphaMul: 1.12, pulseMul: 1.08, shimmerMul: 1.18, flickerMul: 1.22, hueShiftAdd: 0.06 },
  prism_threads: { searchMul: 1.1, budgetMul: 1.18, sampleMul: 1.1, neighborBonus: 1, planarBias: 0.24, radialBias: 0.24, gateFreq: 0.66, gateThreshold: 0.12, widthMul: 0.88, softnessMul: 0.58, opacityMul: 0.88, glowMul: 1.2, alphaMul: 1.08, pulseMul: 1.06, shimmerMul: 1.22, flickerMul: 1.18, hueShiftAdd: 0.08 },
  branch_propagation: { searchMul: 1.16, budgetMul: 0.92, sampleMul: 1.08, neighborBonus: 0, planarBias: 0.12, radialBias: 0.18, gateFreq: 0.26, gateThreshold: 0.02, widthMul: 0.86, softnessMul: 0.68, opacityMul: 0.84, glowMul: 0.9, alphaMul: 0.94, pulseMul: 0.88, shimmerMul: 0.92, flickerMul: 0.94, hueShiftAdd: 0.01 },
};

export function getLineRefreshInterval(quality: ParticleConfig['renderQuality'], particleCount: number) {
  if (quality === 'draft') return particleCount > 12000 ? 0.4 : 0.3;
  if (quality === 'cinematic') return particleCount > 18000 ? 0.2 : 0.14;
  return particleCount > 12000 ? 0.28 : 0.2;
}

export function getLineBudget(quality: ParticleConfig['renderQuality'], particleCount: number) {
  if (quality === 'draft') return Math.min(2200, Math.floor(particleCount * 0.45));
  if (quality === 'cinematic') return Math.min(10000, Math.floor(particleCount * 1.4));
  return Math.min(6000, Math.floor(particleCount * 0.9));
}

export function getLineSampleLimit(quality: ParticleConfig['renderQuality']) {
  if (quality === 'draft') return 900;
  if (quality === 'cinematic') return 2600;
  return 1600;
}

export function getLineNeighborLimit(quality: ParticleConfig['renderQuality']) {
  if (quality === 'draft') return 3;
  if (quality === 'cinematic') return 5;
  return 4;
}

export function getResolvedLineProfile(config: ParticleConfig, layerIndex: 2 | 3): LineProfile {
  const runtime = getLayerRuntimeLineSnapshot(config, layerIndex);
  const layerType = getLayerRuntimeMode(config, layerIndex, runtime.route);
  const layerSource = runtime.source;
  return withCrossFamilyLineProfile(withSourceAwareLineProfile({ ...DEFAULT_LINE_PROFILE, ...(LINE_MODE_PROFILES[layerType] ?? {}) }, layerSource), layerType, layerSource);
}

function getPairHash(a: number, b: number, seed: number) {
  const value = Math.sin(a * 12.9898 + b * 78.233 + seed * 37.719) * 43758.5453123;
  return value - Math.floor(value);
}

function getCandidateScore(profile: LineProfile, point: { x: number; y: number; z: number }, candidate: { x: number; y: number; z: number }, distSq: number, searchDistance: number, globalRadius: number) {
  const dist = Math.sqrt(distSq);
  const planeDelta = Math.abs(point.y - candidate.y) / Math.max(searchDistance, 1e-3);
  const radialA = Math.hypot(point.x, point.z);
  const radialB = Math.hypot(candidate.x, candidate.z);
  const radialDelta = Math.abs(radialA - radialB) / Math.max(globalRadius, 1e-3);
  const midX = (point.x + candidate.x) * 0.5;
  const midY = (point.y + candidate.y) * 0.5;
  const midZ = (point.z + candidate.z) * 0.5;
  const gate = Math.abs(Math.sin(midX * (0.035 + profile.gateFreq * 0.05) + midY * (0.028 + profile.gateFreq * 0.03) + midZ * (0.041 + profile.gateFreq * 0.04)));
  return { gate, score: dist * (1 + planeDelta * profile.planarBias + radialDelta * profile.radialBias) + (1 - gate) * searchDistance * (0.12 + profile.gateFreq * 0.36) };
}

export function buildLineData(
  config: ParticleConfig,
  layerIndex: 2 | 3,
  particleData: ParticleData,
  globalRadius: number,
  connectionDistance: number,
  sampleTime: number,
  layerConnectionStyle: ParticleConfig['layer2ConnectionStyle'],
): LineData | null {
  if (!particleData || particleData.count === 0) return null;
  const lineProfile = getResolvedLineProfile(config, layerIndex);
  const getEstimatedLinePosition = (index: number) => estimateLayerPositionApprox({ config, layerIndex, particleData, index, globalRadius, time: sampleTime });
  const maxLines = Math.max(40, Math.floor(getLineBudget(config.renderQuality, particleData.count) * lineProfile.budgetMul));
  const searchDistance = Math.max(1, connectionDistance * lineProfile.searchMul);
  const cellSize = Math.max(searchDistance, 1);
  const cells = new Map<string, number[]>();
  const sampleLimit = Math.max(180, Math.floor(getLineSampleLimit(config.renderQuality) * lineProfile.sampleMul));
  const sampleStep = Math.max(1, Math.ceil(particleData.count / sampleLimit));
  const maxNeighborsPerParticle = Math.max(1, getLineNeighborLimit(config.renderQuality) + lineProfile.neighborBonus);
  const sampledPoints: Array<{ particleIndex: number; point: ReturnType<typeof getEstimatedLinePosition> }> = [];
  for (let particleIndex = 0; particleIndex < particleData.count; particleIndex += sampleStep) {
    const point = getEstimatedLinePosition(particleIndex);
    const key = getSpatialCellKey(point.x, point.y, point.z, cellSize);
    const bucket = cells.get(key) || [];
    bucket.push(sampledPoints.length);
    cells.set(key, bucket);
    sampledPoints.push({ particleIndex, point });
  }
  if (sampledPoints.length < 2) return null;
  const points = sampledPoints.map(({ point }) => point);
  const pairs: Array<[number, number]> = [];
  const seen = new Set<string>();
  for (let index = 0; index < sampledPoints.length && pairs.length < maxLines; index += 1) {
    const point = points[index];
    if (!point) continue;
    const sourceParticleIndex = sampledPoints[index]?.particleIndex;
    if (sourceParticleIndex === undefined) continue;
    const baseCellX = Math.floor(point.x / cellSize);
    const baseCellY = Math.floor(point.y / cellSize);
    const baseCellZ = Math.floor(point.z / cellSize);
    const candidates: Array<{ index: number; distSq: number; score: number }> = [];
    for (let dx = -1; dx <= 1; dx += 1) for (let dy = -1; dy <= 1; dy += 1) for (let dz = -1; dz <= 1; dz += 1) {
      const bucket = cells.get(`${baseCellX + dx}:${baseCellY + dy}:${baseCellZ + dz}`);
      if (!bucket) continue;
      for (const candidateIndex of bucket) {
        if (candidateIndex <= index) continue;
        const candidate = points[candidateIndex];
        if (!candidate) continue;
        const distSq = (point.x - candidate.x) ** 2 + (point.y - candidate.y) ** 2 + (point.z - candidate.z) ** 2;
        if (distSq > searchDistance * searchDistance) continue;
        const targetParticleIndex = sampledPoints[candidateIndex]?.particleIndex;
        if (targetParticleIndex === undefined) continue;
        const hash = getPairHash(sourceParticleIndex, targetParticleIndex, lineProfile.gateFreq + lineProfile.dropout);
        if (hash < lineProfile.dropout) continue;
        const scored = getCandidateScore(lineProfile, point, candidate, distSq, searchDistance, globalRadius);
        if (scored.gate < lineProfile.gateThreshold) continue;
        candidates.push({ index: candidateIndex, distSq, score: scored.score });
      }
    }
    candidates.sort((left, right) => left.score - right.score).slice(0, maxNeighborsPerParticle).forEach((candidate) => {
      if (pairs.length >= maxLines) return;
      const targetParticleIndex = sampledPoints[candidate.index]?.particleIndex;
      if (targetParticleIndex === undefined) return;
      const pairKey = `${sourceParticleIndex}:${targetParticleIndex}`;
      if (seen.has(pairKey)) return;
      seen.add(pairKey);
      pairs.push([sourceParticleIndex, targetParticleIndex]);
    });
  }
  const lineCount = pairs.length;
  if (lineCount === 0) return null;
  const wantsClassic = layerConnectionStyle === 'classic';
  const wantsBrush = !wantsClassic;
  const aPosA = wantsClassic ? new Float32Array(lineCount * 2 * 3) : EMPTY_FLOAT32;
  const aOffA = wantsClassic ? new Float32Array(lineCount * 2 * 3) : EMPTY_FLOAT32;
  const aData1A = wantsClassic ? new Float32Array(lineCount * 2 * 4) : EMPTY_FLOAT32;
  const aData2A = wantsClassic ? new Float32Array(lineCount * 2 * 4) : EMPTY_FLOAT32;
  const aData3A = wantsClassic ? new Float32Array(lineCount * 2 * 4) : EMPTY_FLOAT32;
  const aPosB = wantsClassic ? new Float32Array(lineCount * 2 * 3) : EMPTY_FLOAT32;
  const aOffB = wantsClassic ? new Float32Array(lineCount * 2 * 3) : EMPTY_FLOAT32;
  const aData1B = wantsClassic ? new Float32Array(lineCount * 2 * 4) : EMPTY_FLOAT32;
  const aData2B = wantsClassic ? new Float32Array(lineCount * 2 * 4) : EMPTY_FLOAT32;
  const aData3B = wantsClassic ? new Float32Array(lineCount * 2 * 4) : EMPTY_FLOAT32;
  const aMix = wantsClassic ? new Float32Array(lineCount * 2) : EMPTY_FLOAT32;
  const brushVertexCount = wantsBrush ? lineCount * 6 : 0;
  const bPosA = wantsBrush ? new Float32Array(brushVertexCount * 3) : EMPTY_FLOAT32;
  const bOffA = wantsBrush ? new Float32Array(brushVertexCount * 3) : EMPTY_FLOAT32;
  const bData1A = wantsBrush ? new Float32Array(brushVertexCount * 4) : EMPTY_FLOAT32;
  const bData2A = wantsBrush ? new Float32Array(brushVertexCount * 4) : EMPTY_FLOAT32;
  const bData3A = wantsBrush ? new Float32Array(brushVertexCount * 4) : EMPTY_FLOAT32;
  const bPosB = wantsBrush ? new Float32Array(brushVertexCount * 3) : EMPTY_FLOAT32;
  const bOffB = wantsBrush ? new Float32Array(brushVertexCount * 3) : EMPTY_FLOAT32;
  const bData1B = wantsBrush ? new Float32Array(brushVertexCount * 4) : EMPTY_FLOAT32;
  const bData2B = wantsBrush ? new Float32Array(brushVertexCount * 4) : EMPTY_FLOAT32;
  const bData3B = wantsBrush ? new Float32Array(brushVertexCount * 4) : EMPTY_FLOAT32;
  const bLineCoord = wantsBrush ? new Float32Array(brushVertexCount * 2) : EMPTY_FLOAT32;
  const brushTemplate: Array<[number, number]> = [[0, -1], [0, 1], [1, 1], [0, -1], [1, 1], [1, -1]];
  for (let index = 0; index < lineCount; index += 1) {
    const pair = pairs[index];
    if (!pair) continue;
    const [idxA, idxB] = pair;
    if (wantsClassic) {
      aMix[index * 2 + 0] = 0.0;
      aMix[index * 2 + 1] = 1.0;
      for (let v = 0; v < 2; v += 1) {
        const vi = index * 2 + v;
        aPosA.set(particleData.pos.subarray(idxA * 3, idxA * 3 + 3), vi * 3);
        aOffA.set(particleData.off.subarray(idxA * 3, idxA * 3 + 3), vi * 3);
        aData1A.set(particleData.d1.subarray(idxA * 4, idxA * 4 + 4), vi * 4);
        aData2A.set(particleData.d2.subarray(idxA * 4, idxA * 4 + 4), vi * 4);
        aData3A.set(particleData.d3.subarray(idxA * 4, idxA * 4 + 4), vi * 4);
        aPosB.set(particleData.pos.subarray(idxB * 3, idxB * 3 + 3), vi * 3);
        aOffB.set(particleData.off.subarray(idxB * 3, idxB * 3 + 3), vi * 3);
        aData1B.set(particleData.d1.subarray(idxB * 4, idxB * 4 + 4), vi * 4);
        aData2B.set(particleData.d2.subarray(idxB * 4, idxB * 4 + 4), vi * 4);
        aData3B.set(particleData.d3.subarray(idxB * 4, idxB * 4 + 4), vi * 4);
      }
    }
    if (wantsBrush) {
      for (let v = 0; v < 6; v += 1) {
        const vi = index * 6 + v;
        bPosA.set(particleData.pos.subarray(idxA * 3, idxA * 3 + 3), vi * 3);
        bOffA.set(particleData.off.subarray(idxA * 3, idxA * 3 + 3), vi * 3);
        bData1A.set(particleData.d1.subarray(idxA * 4, idxA * 4 + 4), vi * 4);
        bData2A.set(particleData.d2.subarray(idxA * 4, idxA * 4 + 4), vi * 4);
        bData3A.set(particleData.d3.subarray(idxA * 4, idxA * 4 + 4), vi * 4);
        bPosB.set(particleData.pos.subarray(idxB * 3, idxB * 3 + 3), vi * 3);
        bOffB.set(particleData.off.subarray(idxB * 3, idxB * 3 + 3), vi * 3);
        bData1B.set(particleData.d1.subarray(idxB * 4, idxB * 4 + 4), vi * 4);
        bData2B.set(particleData.d2.subarray(idxB * 4, idxB * 4 + 4), vi * 4);
        bData3B.set(particleData.d3.subarray(idxB * 4, idxB * 4 + 4), vi * 4);
        const tpl = brushTemplate[v]!;
        bLineCoord[vi * 2 + 0] = tpl[0];
        bLineCoord[vi * 2 + 1] = tpl[1];
      }
    }
  }
  return { classic: { aPosA, aOffA, aData1A, aData2A, aData3A, aPosB, aOffB, aData1B, aData2B, aData3B, aMix, count: lineCount }, brush: { aPosA: bPosA, aOffA: bOffA, aData1A: bData1A, aData2A: bData2A, aData3A: bData3A, aPosB: bPosB, aOffB: bOffB, aData1B: bData1B, aData2B: bData2B, aData3B: bData3B, aLineCoord: bLineCoord, count: brushVertexCount } };
}

export function syncClassicLineGeometry(geometry: BufferGeometry, classic: LineData['classic'] | null) {
  syncFloat32GeometryAttribute(geometry, 'position', classic?.aPosA ?? EMPTY_FLOAT32, 3);
  syncFloat32GeometryAttribute(geometry, 'aPosA', classic?.aPosA ?? EMPTY_FLOAT32, 3);
  syncFloat32GeometryAttribute(geometry, 'aOffA', classic?.aOffA ?? EMPTY_FLOAT32, 3);
  syncFloat32GeometryAttribute(geometry, 'aData1A', classic?.aData1A ?? EMPTY_FLOAT32, 4);
  syncFloat32GeometryAttribute(geometry, 'aData2A', classic?.aData2A ?? EMPTY_FLOAT32, 4);
  syncFloat32GeometryAttribute(geometry, 'aData3A', classic?.aData3A ?? EMPTY_FLOAT32, 4);
  syncFloat32GeometryAttribute(geometry, 'aPosB', classic?.aPosB ?? EMPTY_FLOAT32, 3);
  syncFloat32GeometryAttribute(geometry, 'aOffB', classic?.aOffB ?? EMPTY_FLOAT32, 3);
  syncFloat32GeometryAttribute(geometry, 'aData1B', classic?.aData1B ?? EMPTY_FLOAT32, 4);
  syncFloat32GeometryAttribute(geometry, 'aData2B', classic?.aData2B ?? EMPTY_FLOAT32, 4);
  syncFloat32GeometryAttribute(geometry, 'aData3B', classic?.aData3B ?? EMPTY_FLOAT32, 4);
  syncFloat32GeometryAttribute(geometry, 'aMix', classic?.aMix ?? EMPTY_FLOAT32, 1);
  geometry.setDrawRange(0, (classic?.count ?? 0) * 2);
  geometry.computeBoundingSphere();
}

export function syncBrushLineGeometry(geometry: BufferGeometry, brush: LineData['brush'] | null) {
  syncFloat32GeometryAttribute(geometry, 'position', brush?.aPosA ?? EMPTY_FLOAT32, 3);
  syncFloat32GeometryAttribute(geometry, 'aPosA', brush?.aPosA ?? EMPTY_FLOAT32, 3);
  syncFloat32GeometryAttribute(geometry, 'aOffA', brush?.aOffA ?? EMPTY_FLOAT32, 3);
  syncFloat32GeometryAttribute(geometry, 'aData1A', brush?.aData1A ?? EMPTY_FLOAT32, 4);
  syncFloat32GeometryAttribute(geometry, 'aData2A', brush?.aData2A ?? EMPTY_FLOAT32, 4);
  syncFloat32GeometryAttribute(geometry, 'aData3A', brush?.aData3A ?? EMPTY_FLOAT32, 4);
  syncFloat32GeometryAttribute(geometry, 'aPosB', brush?.aPosB ?? EMPTY_FLOAT32, 3);
  syncFloat32GeometryAttribute(geometry, 'aOffB', brush?.aOffB ?? EMPTY_FLOAT32, 3);
  syncFloat32GeometryAttribute(geometry, 'aData1B', brush?.aData1B ?? EMPTY_FLOAT32, 4);
  syncFloat32GeometryAttribute(geometry, 'aData2B', brush?.aData2B ?? EMPTY_FLOAT32, 4);
  syncFloat32GeometryAttribute(geometry, 'aData3B', brush?.aData3B ?? EMPTY_FLOAT32, 4);
  syncFloat32GeometryAttribute(geometry, 'aLineCoord', brush?.aLineCoord ?? EMPTY_FLOAT32, 2);
  geometry.setDrawRange(0, brush?.count ?? 0);
  geometry.computeBoundingSphere();
}

export function updateLineMaterial(mat: ShaderMaterial | null | undefined, config: ParticleConfig, layerIndex: 2 | 3, uniforms: ShaderUniformMap, connectionDistance: number, connectionOpacity: number, contactAmount: number, lineProfile: LineProfile, audioDrive?: { width: number; shimmer: number; flickerSpeed: number; velocityGlow: number; velocityAlpha: number; burstPulse: number }) {
  if (!mat) return;
  const runtime = getLayerRuntimeLineSnapshot(config, layerIndex);
  const layerVelocityGlow = runtime.velocityGlow;
  const layerVelocityAlpha = runtime.velocityAlpha;
  const layerBurstPulse = runtime.burstPulse;
  const layerLineShimmer = runtime.shimmer;
  const layerLineFlickerSpeed = runtime.flickerSpeed;
  const layerConnectionStyle = runtime.connectionStyle;
  const layerConnectionWidth = runtime.width;
  const layerConnectionSoftness = runtime.softness;
  const lineImpactBoost = config.interLayerContactFxEnabled && config.interLayerCollisionEnabled ? 1 + contactAmount * config.interLayerContactLineBoost : 1;
  Object.assign(mat.uniforms, {
    uTime: { value: uniforms.uTime.value },
    uAudioBassMotion: { value: uniforms.uAudioBassMotion.value },
    uAudioTrebleMotion: { value: uniforms.uAudioTrebleMotion.value },
    uAudioBassLine: { value: uniforms.uAudioBassLine.value },
    uAudioTrebleLine: { value: uniforms.uAudioTrebleLine.value },
    uAudioPulse: { value: uniforms.uAudioPulse.value },
    uAudioMorph: { value: uniforms.uAudioMorph.value },
    uAudioShatter: { value: uniforms.uAudioShatter.value },
    uAudioTwist: { value: uniforms.uAudioTwist.value },
    uAudioBend: { value: uniforms.uAudioBend.value },
    uAudioWarp: { value: uniforms.uAudioWarp.value },
  });
  mat.uniforms.uConnectDistance.value = connectionDistance;
  mat.uniforms.uOpacity.value = Math.min(1, connectionOpacity * lineImpactBoost * lineProfile.opacityMul);
  mat.uniforms.uLineVelocityGlow.value = MathUtils.clamp((audioDrive?.velocityGlow ?? (layerVelocityGlow * lineProfile.glowMul)), 0, 4);
  mat.uniforms.uLineVelocityAlpha.value = MathUtils.clamp((audioDrive?.velocityAlpha ?? (layerVelocityAlpha * lineProfile.alphaMul)), 0, 4);
  mat.uniforms.uLineBurstPulse.value = MathUtils.clamp((audioDrive?.burstPulse ?? (layerBurstPulse * lineProfile.pulseMul)), 0, 4);
  mat.uniforms.uLineShimmer.value = MathUtils.clamp((audioDrive?.shimmer ?? (layerLineShimmer * lineProfile.shimmerMul)), 0, 4);
  mat.uniforms.uLineFlickerSpeed.value = MathUtils.clamp((audioDrive?.flickerSpeed ?? (layerLineFlickerSpeed * lineProfile.flickerMul)), 0.05, 6);
  mat.uniforms.uGlobalSpeed.value = uniforms.uGlobalSpeed.value;
  mat.uniforms.uGlobalAmp.value = uniforms.uGlobalAmp.value;
  mat.uniforms.uGlobalNoiseScale.value = uniforms.uGlobalNoiseScale.value;
  mat.uniforms.uGlobalComplexity.value = uniforms.uGlobalComplexity.value;
  mat.uniforms.uGlobalEvolution.value = uniforms.uGlobalEvolution.value;
  mat.uniforms.uGlobalFidelity.value = uniforms.uGlobalFidelity.value;
  mat.uniforms.uGlobalOctaveMult.value = uniforms.uGlobalOctaveMult.value;
  mat.uniforms.uGlobalFreq.value = uniforms.uGlobalFreq.value;
  mat.uniforms.uGlobalRadius.value = uniforms.uGlobalRadius.value;
  mat.uniforms.uGravity.value = uniforms.uGravity.value;
  mat.uniforms.uViscosity.value = uniforms.uViscosity.value;
  mat.uniforms.uFluidForce.value = uniforms.uFluidForce.value;
  mat.uniforms.uResistance.value = uniforms.uResistance.value;
  mat.uniforms.uMoveWithWind.value = uniforms.uMoveWithWind.value;
  mat.uniforms.uNeighborForce.value = uniforms.uNeighborForce.value;
  mat.uniforms.uCollisionMode.value = uniforms.uCollisionMode.value;
  mat.uniforms.uCollisionRadius.value = uniforms.uCollisionRadius.value;
  mat.uniforms.uRepulsion.value = uniforms.uRepulsion.value;
  mat.uniforms.uAffectPos.value = uniforms.uAffectPos.value;
  mat.uniforms.uWind.value = uniforms.uWind.value;
  mat.uniforms.uSpin.value = uniforms.uSpin.value;
  mat.uniforms.uBoundaryY.value = uniforms.uBoundaryY.value;
  mat.uniforms.uBoundaryEnabled.value = uniforms.uBoundaryEnabled.value;
  mat.uniforms.uBoundaryBounce.value = uniforms.uBoundaryBounce.value;
  mat.uniforms.uMouse.value = uniforms.uMouse.value;
  mat.uniforms.uMouseForce.value = uniforms.uMouseForce.value;
  mat.uniforms.uMouseRadius.value = uniforms.uMouseRadius.value;
  mat.uniforms.uInterLayerEnabled.value = uniforms.uInterLayerEnabled.value;
  mat.uniforms.uInterLayerColliderCount.value = uniforms.uInterLayerColliderCount.value;
  mat.uniforms.uInterLayerColliders.value = uniforms.uInterLayerColliders.value;
  mat.uniforms.uInterLayerStrength.value = uniforms.uInterLayerStrength.value;
  mat.uniforms.uInterLayerPadding.value = uniforms.uInterLayerPadding.value;
  mat.uniforms.uHueShift.value = (uniforms.uHueShift?.value ?? 0) + lineProfile.hueShiftAdd;
  if (mat.uniforms.uLineWidth) mat.uniforms.uLineWidth.value = MathUtils.clamp((audioDrive?.width ?? (layerConnectionWidth * lineProfile.widthMul)), 0.05, 4);
  if (mat.uniforms.uLineSoftness) mat.uniforms.uLineSoftness.value = MathUtils.clamp(layerConnectionSoftness * lineProfile.softnessMul, 0.05, 2);
  if (mat.uniforms.uBrushStyle) mat.uniforms.uBrushStyle.value = layerConnectionStyle === 'filament' ? 1 : 0;
}

export function createBrushLineUniforms(config: ParticleConfig, uniforms: ShaderUniformMap, layerConnectionStyle: ParticleConfig['layer2ConnectionStyle']) {
  return { ...uniforms, uConnectDistance: { value: 50 }, uOpacity: { value: 0.2 }, uAudioBassMotion: { value: 0 }, uAudioTrebleMotion: { value: 0 }, uAudioBassLine: { value: 0 }, uAudioTrebleLine: { value: 0 }, uAudioPulse: { value: 0 }, uAudioMorph: { value: 0 }, uAudioShatter: { value: 0 }, uAudioTwist: { value: 0 }, uAudioBend: { value: 0 }, uAudioWarp: { value: 0 }, uLineVelocityGlow: { value: 0 }, uLineVelocityAlpha: { value: 0 }, uLineBurstPulse: { value: 0 }, uLineShimmer: { value: 0 }, uLineFlickerSpeed: { value: 1 }, uHueShift: { value: 0 }, uLineWidth: { value: 0.7 }, uLineSoftness: { value: 0.65 }, uBrushStyle: { value: layerConnectionStyle === 'filament' ? 1 : 0 } };
}

export function createClassicLineUniforms(uniforms: ShaderUniformMap) {
  return { ...uniforms, uConnectDistance: { value: 50 }, uOpacity: { value: 0.2 }, uAudioBassMotion: { value: 0 }, uAudioTrebleMotion: { value: 0 }, uAudioBassLine: { value: 0 }, uAudioTrebleLine: { value: 0 }, uAudioPulse: { value: 0 }, uAudioMorph: { value: 0 }, uAudioShatter: { value: 0 }, uAudioTwist: { value: 0 }, uAudioBend: { value: 0 }, uAudioWarp: { value: 0 }, uLineVelocityGlow: { value: 0 }, uLineVelocityAlpha: { value: 0 }, uLineBurstPulse: { value: 0 }, uLineShimmer: { value: 0 }, uLineFlickerSpeed: { value: 1 }, uHueShift: { value: 0 } };
}

export { BRUSH_LINE_FRAGMENT_SHADER, BRUSH_LINE_VERTEX_SHADER, LINE_FRAGMENT_SHADER, LINE_VERTEX_SHADER, getLineBlendMode };
