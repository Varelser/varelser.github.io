export interface FutureNativeUiControlSpec {
  key: string;
  label: string;
  kind: 'slider' | 'toggle' | 'select';
  min?: number;
  max?: number;
  step?: number;
  options?: readonly string[];
}

export interface FutureNativeUiSectionSpec {
  id: string;
  title: string;
  controls: readonly FutureNativeUiControlSpec[];
}

export interface FutureNativeDebugPoint {
  x: number;
  y: number;
  z?: number;
}

export interface FutureNativeDebugLine {
  a: FutureNativeDebugPoint;
  b: FutureNativeDebugPoint;
}

export interface FutureNativeRenderPayload {
  familyId: string;
  summary: string;
  points?: readonly FutureNativeDebugPoint[];
  lines?: readonly FutureNativeDebugLine[];
  scalarSamples?: readonly number[];
  stats: Record<string, number>;
}

export interface FutureNativeRenderPayloadGuardrailOptions {
  maxPoints?: number;
  maxLines?: number;
  maxScalarSamples?: number;
  maxStatsEntries?: number;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function sanitizePoint(point: FutureNativeDebugPoint): FutureNativeDebugPoint | null {
  if (!isFiniteNumber(point.x) || !isFiniteNumber(point.y)) return null;
  if (point.z !== undefined && !isFiniteNumber(point.z)) return null;
  return point.z === undefined ? { x: point.x, y: point.y } : { x: point.x, y: point.y, z: point.z };
}

function sanitizeLine(line: FutureNativeDebugLine): FutureNativeDebugLine | null {
  const a = sanitizePoint(line.a);
  const b = sanitizePoint(line.b);
  if (!a || !b) return null;
  return { a, b };
}

function pointIsFinite(point: FutureNativeDebugPoint) {
  return isFiniteNumber(point.x) && isFiniteNumber(point.y) && (point.z === undefined || isFiniteNumber(point.z));
}

function lineIsFinite(line: FutureNativeDebugLine) {
  return pointIsFinite(line.a) && pointIsFinite(line.b);
}

function payloadCanBypassSanitize(
  payload: FutureNativeRenderPayload,
  options: {
    maxPoints: number;
    maxLines: number;
    maxScalarSamples: number;
    maxStatsEntries: number;
  },
) {
  if (typeof payload.familyId !== 'string' || payload.familyId.length === 0) return false;
  if (typeof payload.summary !== 'string' || payload.summary.length === 0) return false;

  const points = payload.points;
  if (points) {
    if (points.length > options.maxPoints) return false;
    for (let index = 0; index < points.length; index += 1) {
      if (!pointIsFinite(points[index])) return false;
    }
  }

  const lines = payload.lines;
  if (lines) {
    if (lines.length > options.maxLines) return false;
    for (let index = 0; index < lines.length; index += 1) {
      if (!lineIsFinite(lines[index])) return false;
    }
  }

  const scalarSamples = payload.scalarSamples;
  if (scalarSamples) {
    if (scalarSamples.length > options.maxScalarSamples) return false;
    for (let index = 0; index < scalarSamples.length; index += 1) {
      if (!isFiniteNumber(scalarSamples[index])) return false;
    }
  }

  const statsEntries = Object.entries(payload.stats ?? {});
  if (statsEntries.length > options.maxStatsEntries) return false;
  for (let index = 0; index < statsEntries.length; index += 1) {
    if (!isFiniteNumber(statsEntries[index][1])) return false;
  }

  return true;
}

export function sanitizeFutureNativeRenderPayload(
  payload: FutureNativeRenderPayload,
  options?: FutureNativeRenderPayloadGuardrailOptions,
): FutureNativeRenderPayload {
  const maxPoints = Math.max(32, Math.floor(options?.maxPoints ?? 12000));
  const maxLines = Math.max(32, Math.floor(options?.maxLines ?? 24000));
  const maxScalarSamples = Math.max(0, Math.floor(options?.maxScalarSamples ?? 64));
  const maxStatsEntries = Math.max(4, Math.floor(options?.maxStatsEntries ?? 64));

  if (payloadCanBypassSanitize(payload, { maxPoints, maxLines, maxScalarSamples, maxStatsEntries })) {
    return payload;
  }

  const points = (payload.points ?? [])
    .slice(0, maxPoints)
    .map((point) => sanitizePoint(point))
    .filter((point): point is FutureNativeDebugPoint => point !== null);

  const lines = (payload.lines ?? [])
    .slice(0, maxLines)
    .map((line) => sanitizeLine(line))
    .filter((line): line is FutureNativeDebugLine => line !== null);

  const scalarSamples = (payload.scalarSamples ?? [])
    .slice(0, maxScalarSamples)
    .filter((value): value is number => isFiniteNumber(value));

  const stats: Record<string, number> = {};
  for (const [key, value] of Object.entries(payload.stats ?? {})) {
    if (!isFiniteNumber(value)) continue;
    stats[key] = value;
    if (Object.keys(stats).length >= maxStatsEntries) break;
  }

  return {
    familyId: typeof payload.familyId === 'string' && payload.familyId.length > 0 ? payload.familyId : 'unknown-family',
    summary: typeof payload.summary === 'string' && payload.summary.length > 0 ? payload.summary : 'future-native-payload',
    points,
    lines,
    scalarSamples,
    stats,
  };
}

export function futureNativePayloadHasOnlyFiniteValues(payload: FutureNativeRenderPayload): boolean {
  for (const point of payload.points ?? []) {
    if (!isFiniteNumber(point.x) || !isFiniteNumber(point.y) || (point.z !== undefined && !isFiniteNumber(point.z))) return false;
  }
  for (const line of payload.lines ?? []) {
    const { a, b } = line;
    if (!isFiniteNumber(a.x) || !isFiniteNumber(a.y) || (a.z !== undefined && !isFiniteNumber(a.z))) return false;
    if (!isFiniteNumber(b.x) || !isFiniteNumber(b.y) || (b.z !== undefined && !isFiniteNumber(b.z))) return false;
  }
  for (const value of payload.scalarSamples ?? []) {
    if (!isFiniteNumber(value)) return false;
  }
  for (const value of Object.values(payload.stats ?? {})) {
    if (!isFiniteNumber(value)) return false;
  }
  return true;
}
