import type { AudioFeatureFrame, AudioFeatureKey } from '../types/audioReactive';
import type { AudioLevels } from './audioControllerTypes';

export const EMPTY_AUDIO_FEATURE_FRAME: AudioFeatureFrame = {
  level: 0,
  rms: 0,
  peak: 0,
  crest: 0,
  bass: 0,
  lowMid: 0,
  mid: 0,
  highMid: 0,
  treble: 0,
  air: 0,
  bandA: 0,
  bandB: 0,
  pulse: 0,
  onset: 0,
  beat: 0,
  centroid: 0,
  spread: 0,
  rolloff: 0,
  flux: 0,
  flatness: 0,
  pitch: 0,
  stereoWidth: 0,
  pan: 0,
};

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

export function createAudioFeatureFrameFromLevels(levels: AudioLevels): AudioFeatureFrame {
  const level = clamp01(Math.max(levels.bass, levels.treble, levels.bandA, levels.bandB));
  const rms = clamp01((levels.bass * 0.42) + (levels.treble * 0.28) + (levels.bandA * 0.15) + (levels.bandB * 0.15));
  const peak = clamp01(Math.max(level, levels.pulse));
  const crest = rms > 0.0001 ? clamp01(peak / Math.max(rms, 0.0001) / 4) : 0;
  const lowMid = clamp01((levels.bass * 0.65) + (levels.bandA * 0.35));
  const mid = clamp01((levels.bandA * 0.5) + (levels.bandB * 0.5));
  const highMid = clamp01((levels.treble * 0.45) + (levels.bandB * 0.55));
  const air = clamp01(levels.treble * 0.75 + levels.bandB * 0.25);
  const onset = clamp01(levels.pulse);
  const beat = clamp01((levels.pulse * 0.7) + (levels.bass * 0.3));
  const centroid = clamp01((levels.treble * 0.7) + (levels.bandB * 0.3));
  const spread = clamp01(Math.abs(levels.treble - levels.bass));
  const rolloff = clamp01((levels.bandB * 0.6) + (levels.treble * 0.4));
  const flux = clamp01(levels.pulse * 0.85 + Math.abs(levels.bandB - levels.bandA) * 0.15);
  const flatness = clamp01(1 - Math.abs(levels.bass - levels.treble));

  return {
    level,
    rms,
    peak,
    crest,
    bass: clamp01(levels.bass),
    lowMid,
    mid,
    highMid,
    treble: clamp01(levels.treble),
    air,
    bandA: clamp01(levels.bandA),
    bandB: clamp01(levels.bandB),
    pulse: clamp01(levels.pulse),
    onset,
    beat,
    centroid,
    spread,
    rolloff,
    flux,
    flatness,
    pitch: 0,
    stereoWidth: 0,
    pan: 0,
  };
}

export function getAudioFeatureValue(frame: AudioFeatureFrame, key: AudioFeatureKey) {
  return frame[key] ?? 0;
}
