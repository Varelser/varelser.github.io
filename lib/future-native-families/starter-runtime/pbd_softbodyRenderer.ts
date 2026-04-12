import type { FutureNativeRenderPayload } from './runtimeContracts';
import {
  getOrCreateCachedPayload,
  syncParticleLinkLines,
  syncParticlePoints,
  syncStatsObject,
} from './pbdPayloadCache';
import { getPbdSoftbodyStats, type PbdSoftbodyRuntimeState } from './pbd_softbodySolver';

const softbodyPayloadCache = new WeakMap<object, FutureNativeRenderPayload & {
  points: { x: number; y: number }[];
  lines: { a: { x: number; y: number }; b: { x: number; y: number } }[];
  scalarSamples: number[];
  stats: Record<string, number>;
}>();

export function buildPbdSoftbodyDebugRenderPayload(runtime: PbdSoftbodyRuntimeState): FutureNativeRenderPayload {
  const stats = getPbdSoftbodyStats(runtime);
  const payload = getOrCreateCachedPayload(
    softbodyPayloadCache,
    runtime.config,
    'pbd-softbody',
    `softbody:${runtime.config.width}x${runtime.config.height}@${runtime.frame}`,
  );
  syncParticlePoints(payload.points, runtime.particles);
  syncParticleLinkLines(payload.lines, runtime.particles, runtime.links);
  payload.scalarSamples[0] = stats.centerY;
  payload.scalarSamples[1] = stats.minY;
  payload.scalarSamples[2] = stats.maxY;
  payload.scalarSamples[3] = stats.averageStretch;
  payload.scalarSamples[4] = stats.volumeRatio;
  payload.scalarSamples[5] = stats.shellSpanX;
  payload.scalarSamples[6] = stats.shellSpanY;
  payload.scalarSamples[7] = stats.maxCellAreaError;
  payload.scalarSamples[8] = stats.impactResponse;
  payload.scalarSamples[9] = stats.windImpulse;
  payload.scalarSamples[10] = stats.pressureImpulse;
  payload.scalarSamples[11] = stats.obstacleImpulse;
  payload.scalarSamples[12] = stats.obstacleContacts;
  payload.scalarSamples.length = 13;
  syncStatsObject(payload.stats, stats);
  return payload;
}
