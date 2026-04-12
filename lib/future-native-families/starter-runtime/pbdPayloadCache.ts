import type {
  FutureNativeDebugLine,
  FutureNativeDebugPoint,
  FutureNativeRenderPayload,
} from './runtimeContracts';

type PointLike = { x: number; y: number };
type LinkLike = { a: number; b: number };

export type MutableFutureNativeRenderPayload = FutureNativeRenderPayload & {
  points: FutureNativeDebugPoint[];
  lines: FutureNativeDebugLine[];
  scalarSamples: number[];
  stats: Record<string, number>;
};

export function getOrCreateCachedPayload(
  cache: WeakMap<object, MutableFutureNativeRenderPayload>,
  key: object,
  familyId: string,
  summary: string,
) {
  let payload = cache.get(key);
  if (!payload) {
    payload = {
      familyId,
      summary,
      points: [],
      lines: [],
      scalarSamples: [],
      stats: {},
    };
    cache.set(key, payload);
  }
  payload.familyId = familyId;
  payload.summary = summary;
  return payload;
}

function ensurePoint(points: FutureNativeDebugPoint[], index: number) {
  while (points.length <= index) {
    points.push({ x: 0, y: 0 });
  }
  return points[index];
}

function ensureLine(lines: FutureNativeDebugLine[], index: number) {
  while (lines.length <= index) {
    lines.push({
      a: { x: 0, y: 0 },
      b: { x: 0, y: 0 },
    });
  }
  return lines[index];
}

export function syncParticlePoints(
  points: FutureNativeDebugPoint[],
  particles: readonly PointLike[],
) {
  for (let index = 0; index < particles.length; index += 1) {
    const point = ensurePoint(points, index);
    const particle = particles[index];
    point.x = particle.x;
    point.y = particle.y;
    delete point.z;
  }
  points.length = particles.length;
}

export function syncParticleLinkLines<TParticle extends PointLike, TLink extends LinkLike>(
  lines: FutureNativeDebugLine[],
  particles: readonly TParticle[],
  links: readonly TLink[],
  include: (link: TLink) => boolean = () => true,
) {
  let cursor = 0;
  for (let index = 0; index < links.length; index += 1) {
    const link = links[index];
    if (!include(link)) continue;
    const target = ensureLine(lines, cursor);
    const a = particles[link.a];
    const b = particles[link.b];
    target.a.x = a.x;
    target.a.y = a.y;
    delete target.a.z;
    target.b.x = b.x;
    target.b.y = b.y;
    delete target.b.z;
    cursor += 1;
  }
  lines.length = cursor;
}

export function syncStatsObject<T extends object>(
  target: Record<string, number>,
  source: T,
) {
  for (const key of Object.keys(target)) {
    if (!(key in source)) {
      delete target[key];
    }
  }
  for (const [key, value] of Object.entries(source)) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      target[key] = value;
    }
  }
}
