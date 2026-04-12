import type { ParticleConfig, ProjectSeedReplaySummary } from '../types';

export function buildProjectSeedReplaySummary(config: ParticleConfig): ProjectSeedReplaySummary {
  return {
    lockEnabled: config.projectSeedLockEnabled,
    currentSeedValue: config.projectSeedValue,
    autoAdvance: config.projectSeedAutoAdvance,
    step: config.projectSeedStep,
    lastAppliedSeed: config.projectSeedLastApplied,
    lastTriggerKind: config.projectSeedLastTriggerKind,
    lastMutationScope: config.projectSeedLastMutationScope,
    lastMutationIntensity: config.projectSeedLastMutationIntensity,
    lastRecordedAt: config.projectSeedLastRecordedAt,
  };
}
