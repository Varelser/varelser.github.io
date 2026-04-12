import assert from 'node:assert/strict';
import { DEFAULT_CONFIG } from '../../lib/appStateConfigDefaults';
import {
  buildSeededAudioMutationConfig,
  buildSeededRandomizedPresetConfig,
  replayProjectSeedConfig,
} from '../../lib/projectSeedRuntime';

function stripRuntimeFields<T extends object>(config: T) {
  const {
    projectSeedLastRecordedAt,
    ...rest
  } = config as T & { projectSeedLastRecordedAt?: string };
  void projectSeedLastRecordedAt;
  return rest;
}

export async function main() {
  const base = {
    ...DEFAULT_CONFIG,
    projectSeedLockEnabled: true,
    projectSeedValue: 4101,
    projectSeedAutoAdvance: false,
    projectSeedStep: 7,
  };

  const randomizedA = buildSeededRandomizedPresetConfig(base, 4101);
  const randomizedB = buildSeededRandomizedPresetConfig(base, 4101);
  assert.deepEqual(stripRuntimeFields(randomizedA), stripRuntimeFields(randomizedB));
  assert.equal(randomizedA.projectSeedLastApplied, 4101);
  assert.equal(randomizedA.projectSeedLastTriggerKind, 'preset-randomize');

  const mutatedA = buildSeededAudioMutationConfig(base, 0.86, 'structure', 8217);
  const mutatedB = buildSeededAudioMutationConfig(base, 0.86, 'structure', 8217);
  assert.deepEqual(stripRuntimeFields(mutatedA), stripRuntimeFields(mutatedB));
  assert.equal(mutatedA.projectSeedLastApplied, 8217);
  assert.equal(mutatedA.projectSeedLastTriggerKind, 'audio-seed-mutation');
  assert.equal(mutatedA.projectSeedLastMutationScope, 'structure');

  const replayPreset = replayProjectSeedConfig({
    ...base,
    projectSeedLastApplied: 1733,
    projectSeedLastTriggerKind: 'preset-randomize',
  });
  const expectedPresetReplay = buildSeededRandomizedPresetConfig({
    ...base,
    projectSeedLastApplied: 1733,
    projectSeedLastTriggerKind: 'preset-randomize',
  }, 1733);
  assert.deepEqual(stripRuntimeFields(replayPreset), stripRuntimeFields(expectedPresetReplay));

  const replayAudio = replayProjectSeedConfig({
    ...base,
    projectSeedLastApplied: 1931,
    projectSeedLastTriggerKind: 'audio-seed-mutation',
    projectSeedLastMutationScope: 'surface',
    projectSeedLastMutationIntensity: 0.94,
  });
  const expectedAudioReplay = buildSeededAudioMutationConfig({
    ...base,
    projectSeedLastApplied: 1931,
    projectSeedLastTriggerKind: 'audio-seed-mutation',
    projectSeedLastMutationScope: 'surface',
    projectSeedLastMutationIntensity: 0.94,
  }, 0.94, 'surface', 1931);
  assert.deepEqual(stripRuntimeFields(replayAudio), stripRuntimeFields(expectedAudioReplay));
}
