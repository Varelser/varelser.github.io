import type { ParticleConfig } from '../types';
import type { AudioSequenceSeedMutationScope } from '../types/audioReactive';

export type AudioSequenceTriggerTuningPresetId =
  | 'balanced'
  | 'percussive'
  | 'cinematic'
  | 'drift';

export interface AudioSequenceTriggerTuningPresetDefinition {
  id: AudioSequenceTriggerTuningPresetId;
  label: string;
  description: string;
  patch: {
    audioSequenceEnterThreshold: number;
    audioSequenceExitThreshold: number;
    audioSequenceStepAdvanceCooldownMs: number;
    audioSequenceCrossfadeCooldownMs: number;
    audioSequenceRandomizeSeedCooldownMs: number;
    audioSequenceSeedMutationStrength: number;
    audioSequenceSeedMutationScope: AudioSequenceSeedMutationScope;
  };
}

export const AUDIO_SEQUENCE_TRIGGER_TUNING_PRESETS: AudioSequenceTriggerTuningPresetDefinition[] = [
  {
    id: 'balanced',
    label: 'Balanced',
    description: 'Default multipurpose tuning for mixed material + sequence work.',
    patch: {
      audioSequenceEnterThreshold: 0.6,
      audioSequenceExitThreshold: 0.28,
      audioSequenceStepAdvanceCooldownMs: 320,
      audioSequenceCrossfadeCooldownMs: 420,
      audioSequenceRandomizeSeedCooldownMs: 900,
      audioSequenceSeedMutationStrength: 0.72,
      audioSequenceSeedMutationScope: 'hybrid',
    },
  },
  {
    id: 'percussive',
    label: 'Percussive',
    description: 'Faster response for onset / beat driven stepping with tighter cooldowns.',
    patch: {
      audioSequenceEnterThreshold: 0.48,
      audioSequenceExitThreshold: 0.18,
      audioSequenceStepAdvanceCooldownMs: 180,
      audioSequenceCrossfadeCooldownMs: 240,
      audioSequenceRandomizeSeedCooldownMs: 760,
      audioSequenceSeedMutationStrength: 0.58,
      audioSequenceSeedMutationScope: 'motion',
    },
  },
  {
    id: 'cinematic',
    label: 'Cinematic',
    description: 'Slower gating for longer morph phrases and broader seed mutation.',
    patch: {
      audioSequenceEnterThreshold: 0.74,
      audioSequenceExitThreshold: 0.36,
      audioSequenceStepAdvanceCooldownMs: 560,
      audioSequenceCrossfadeCooldownMs: 760,
      audioSequenceRandomizeSeedCooldownMs: 1400,
      audioSequenceSeedMutationStrength: 0.92,
      audioSequenceSeedMutationScope: 'hybrid',
    },
  },
  {
    id: 'drift',
    label: 'Drift',
    description: 'Loose, sparse trigger behavior for ambient or slow-evolving scenes.',
    patch: {
      audioSequenceEnterThreshold: 0.86,
      audioSequenceExitThreshold: 0.44,
      audioSequenceStepAdvanceCooldownMs: 980,
      audioSequenceCrossfadeCooldownMs: 1180,
      audioSequenceRandomizeSeedCooldownMs: 2200,
      audioSequenceSeedMutationStrength: 1.08,
      audioSequenceSeedMutationScope: 'surface',
    },
  },
];

export function getAudioSequenceTriggerTuningPreset(
  presetId: AudioSequenceTriggerTuningPresetId,
): AudioSequenceTriggerTuningPresetDefinition | null {
  return AUDIO_SEQUENCE_TRIGGER_TUNING_PRESETS.find((preset) => preset.id === presetId) ?? null;
}

export function createAudioSequenceTriggerTuningPatch(
  config: ParticleConfig,
  presetId: AudioSequenceTriggerTuningPresetId,
): AudioSequenceTriggerTuningPresetDefinition['patch'] {
  const preset = getAudioSequenceTriggerTuningPreset(presetId);
  if (!preset) {
    return {
      audioSequenceEnterThreshold: config.audioSequenceEnterThreshold,
      audioSequenceExitThreshold: config.audioSequenceExitThreshold,
      audioSequenceStepAdvanceCooldownMs: config.audioSequenceStepAdvanceCooldownMs,
      audioSequenceCrossfadeCooldownMs: config.audioSequenceCrossfadeCooldownMs,
      audioSequenceRandomizeSeedCooldownMs: config.audioSequenceRandomizeSeedCooldownMs,
      audioSequenceSeedMutationStrength: config.audioSequenceSeedMutationStrength,
      audioSequenceSeedMutationScope: config.audioSequenceSeedMutationScope,
    };
  }
  return preset.patch;
}
