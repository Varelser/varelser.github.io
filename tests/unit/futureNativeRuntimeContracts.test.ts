import assert from 'node:assert/strict';
import { sanitizeFutureNativeRenderPayload, type FutureNativeRenderPayload } from '../../lib/future-native-families/starter-runtime/runtimeContracts';

export async function main() {
  const validPayload: FutureNativeRenderPayload = {
    familyId: 'pbd-softbody',
    summary: 'softbody:test',
    points: [{ x: 1, y: 2, z: 3 }],
    lines: [{ a: { x: 0, y: 0, z: 0 }, b: { x: 1, y: 1, z: 1 } }],
    scalarSamples: [0.1, 0.2, 0.3],
    stats: { energy: 0.5, contacts: 2 },
  };

  const samePayload = sanitizeFutureNativeRenderPayload(validPayload, {
    maxPoints: 8,
    maxLines: 8,
    maxScalarSamples: 8,
    maxStatsEntries: 8,
  });
  assert.equal(samePayload, validPayload);

  const oversizedPayload: FutureNativeRenderPayload = {
    ...validPayload,
    points: Array.from({ length: 40 }, (_, index) => ({ x: index, y: index + 1, z: index + 2 })),
  };
  const sanitizedOversized = sanitizeFutureNativeRenderPayload(oversizedPayload, {
    maxPoints: 32,
    maxLines: 8,
    maxScalarSamples: 8,
    maxStatsEntries: 8,
  });
  assert.notEqual(sanitizedOversized, oversizedPayload);
  assert.equal(sanitizedOversized.points?.length, 32);

  const invalidPayload: FutureNativeRenderPayload = {
    ...validPayload,
    stats: { energy: Number.NaN, contacts: 2 },
  };
  const sanitizedInvalid = sanitizeFutureNativeRenderPayload(invalidPayload, {
    maxPoints: 8,
    maxLines: 8,
    maxScalarSamples: 8,
    maxStatsEntries: 8,
  });
  assert.notEqual(sanitizedInvalid, invalidPayload);
  assert.deepEqual(sanitizedInvalid.stats, { contacts: 2 });
}
