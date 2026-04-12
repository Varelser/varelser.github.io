import type { ParticleConfig } from '../types';
import type { AudioSequenceSeedMutationScope } from '../types/audioReactive';
import { buildAudioSeedMutatedConfig } from './audioSeedMutation';
import { buildRandomizedPresetConfig } from './presetRandomizer';

export type ProjectSeedTriggerKind = 'none' | 'preset-randomize' | 'audio-seed-mutation';

export interface ProjectSeedPlan {
  seed: number;
  nextSeedValue: number;
  locked: boolean;
  autoAdvance: boolean;
  step: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function normalizeProjectSeedValue(value: unknown, fallback = 1) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return Math.max(1, Math.trunc(fallback) || 1);
  }
  const normalized = Math.abs(Math.trunc(value)) % 0x7fffffff;
  return normalized === 0 ? 1 : normalized;
}

function hashLabel(value: string) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function resolveFallbackSeed(triggerKind: ProjectSeedTriggerKind) {
  const timeSeed = typeof performance !== 'undefined' && typeof performance.now === 'function'
    ? Math.floor(performance.now() * 1000)
    : Date.now();
  return normalizeProjectSeedValue(timeSeed ^ hashLabel(triggerKind), 1);
}

export function createSeededRandom(seed: number) {
  let state = normalizeProjectSeedValue(seed, 1) >>> 0;
  return () => {
    state = (state + 0x6D2B79F5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function resolveProjectSeedPlan(
  config: Pick<ParticleConfig, 'projectSeedLockEnabled' | 'projectSeedValue' | 'projectSeedAutoAdvance' | 'projectSeedStep'>,
  triggerKind: ProjectSeedTriggerKind,
  explicitSeed?: number,
): ProjectSeedPlan {
  const locked = Boolean(config.projectSeedLockEnabled);
  const seed = normalizeProjectSeedValue(
    explicitSeed ?? (locked ? config.projectSeedValue : resolveFallbackSeed(triggerKind)),
    1,
  );
  const step = normalizeProjectSeedValue(config.projectSeedStep, 1);
  const autoAdvance = locked && Boolean(config.projectSeedAutoAdvance);
  return {
    seed,
    nextSeedValue: autoAdvance ? normalizeProjectSeedValue(seed + step, 1) : normalizeProjectSeedValue(config.projectSeedValue, seed),
    locked,
    autoAdvance,
    step,
  };
}

export function buildProjectSeedRecordedConfig(
  prev: ParticleConfig,
  plan: ProjectSeedPlan,
  triggerKind: ProjectSeedTriggerKind,
  mutationScope: AudioSequenceSeedMutationScope | null,
  mutationIntensity: number | null,
): ParticleConfig {
  return {
    ...prev,
    projectSeedValue: plan.nextSeedValue,
    projectSeedLastApplied: plan.seed,
    projectSeedLastTriggerKind: triggerKind,
    projectSeedLastMutationScope: mutationScope ?? prev.projectSeedLastMutationScope,
    projectSeedLastMutationIntensity: mutationIntensity == null ? 0 : clamp(mutationIntensity, 0, 1.5),
    projectSeedLastRecordedAt: new Date().toISOString(),
  };
}

export function buildSeededRandomizedPresetConfig(
  prev: ParticleConfig,
  explicitSeed?: number,
): ParticleConfig {
  const plan = resolveProjectSeedPlan(prev, 'preset-randomize', explicitSeed);
  const randomized = buildRandomizedPresetConfig(prev, createSeededRandom(plan.seed));
  return buildProjectSeedRecordedConfig(randomized, plan, 'preset-randomize', null, null);
}

export function buildSeededAudioMutationConfig(
  prev: ParticleConfig,
  intensity = 0.72,
  scope: AudioSequenceSeedMutationScope = 'hybrid',
  explicitSeed?: number,
): ParticleConfig {
  const plan = resolveProjectSeedPlan(prev, 'audio-seed-mutation', explicitSeed);
  const mutated = buildAudioSeedMutatedConfig(prev, intensity, scope, createSeededRandom(plan.seed));
  return buildProjectSeedRecordedConfig(mutated, plan, 'audio-seed-mutation', scope, intensity);
}

export function replayProjectSeedConfig(prev: ParticleConfig) {
  const explicitSeed = normalizeProjectSeedValue(prev.projectSeedLastApplied, prev.projectSeedValue);
  if (prev.projectSeedLastTriggerKind === 'audio-seed-mutation') {
    return buildSeededAudioMutationConfig(
      prev,
      clamp(prev.projectSeedLastMutationIntensity, 0.05, 1.5),
      prev.projectSeedLastMutationScope,
      explicitSeed,
    );
  }
  return buildSeededRandomizedPresetConfig(prev, explicitSeed);
}
