import assert from 'node:assert/strict';
import { DEFAULT_CONFIG } from '../../lib/appStateConfigDefaults';
import {
  normalizeConfig,
  normalizeSequenceDriveMultiplier,
  normalizeSynthPattern,
  resolveSynthSemitoneOffset,
} from '../../lib/appStateConfigNormalization';

export async function main() {
  const normalizedPattern = normalizeSynthPattern([-10, 0.6, 20, 'x']);
  assert.deepEqual(normalizedPattern.slice(0, 4), [0, 1, 15, DEFAULT_CONFIG.synthPattern[3]]);
  assert.equal(normalizedPattern.length, DEFAULT_CONFIG.synthPattern.length);
  assert.equal(resolveSynthSemitoneOffset('major', 7), 12);
  assert.equal(normalizeSequenceDriveMultiplier(9), 2);
  assert.equal(normalizeSequenceDriveMultiplier(undefined), 1);

  const normalized = normalizeConfig({
    particleColor: 'black',
    backgroundColor: 'black',
    synthPattern: [-1, 0.6, 20],
    audioRoutes: [{ source: 'invalid-source', amount: 999, target: '' }],
    layer2Counts: [1, 2, 3],
  } as any);

  assert.equal(normalized.backgroundColor, 'white');
  assert.deepEqual(normalized.synthPattern.slice(0, 3), [0, 1, 15]);
  assert.equal(normalized.audioRoutes.length, 1);
  assert.equal(normalized.audioRoutes[0]?.source, 'pulse');
  assert.equal(normalized.audioRoutes[0]?.amount, 8);
  assert.equal(normalized.audioRoutes[0]?.target, 'particle.pulse');
  assert.notStrictEqual(normalized.layer2Counts, DEFAULT_CONFIG.layer2Counts);
  assert.deepEqual(normalized.layer2Counts.slice(0, 3), [1, 2, 3]);
}
