import type { FutureNativeRenderPayload } from './runtimeContracts';
import {
  getOrCreateCachedPayload,
  syncParticleLinkLines,
  syncParticlePoints,
  syncStatsObject,
} from './pbdPayloadCache';
import { getPbdClothStats, type PbdClothRuntimeState } from './pbd_clothSolver';

const clothPayloadCache = new WeakMap<object, FutureNativeRenderPayload & {
  points: { x: number; y: number }[];
  lines: { a: { x: number; y: number }; b: { x: number; y: number } }[];
  scalarSamples: number[];
  stats: Record<string, number>;
}>();

export function buildPbdClothDebugRenderPayload(runtime: PbdClothRuntimeState): FutureNativeRenderPayload {
  const stats = getPbdClothStats(runtime);
  const payload = getOrCreateCachedPayload(
    clothPayloadCache,
    runtime.config,
    'pbd-cloth',
    `cloth:${runtime.config.width}x${runtime.config.height}@${runtime.frame}`,
  );
  syncParticlePoints(payload.points, runtime.particles);
  syncParticleLinkLines(payload.lines, runtime.particles, runtime.links, (link) => link.active !== false);
  payload.scalarSamples[0] = stats.centerY;
  payload.scalarSamples[1] = stats.minY;
  payload.scalarSamples[2] = stats.maxY;
  payload.scalarSamples[3] = stats.averageStretch;
  payload.scalarSamples[4] = stats.floorContacts;
  payload.scalarSamples[5] = stats.circleContacts;
  payload.scalarSamples[6] = stats.capsuleContacts;
  payload.scalarSamples[7] = stats.brokenLinks;
  payload.scalarSamples[8] = stats.tornFrontLinks;
  payload.scalarSamples[9] = stats.pinGroupCount;
  payload.scalarSamples[10] = stats.windImpulse;
  payload.scalarSamples[11] = stats.pressureImpulse;
  payload.scalarSamples[12] = stats.obstacleImpulse;
  payload.scalarSamples[13] = stats.obstacleContacts;
  payload.scalarSamples.length = 14;
  syncStatsObject(payload.stats, stats);
  return payload;
}
