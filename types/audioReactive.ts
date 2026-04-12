export const AUDIO_FEATURE_KEYS = [
  'level',
  'rms',
  'peak',
  'crest',
  'bass',
  'lowMid',
  'mid',
  'highMid',
  'treble',
  'air',
  'bandA',
  'bandB',
  'pulse',
  'onset',
  'beat',
  'centroid',
  'spread',
  'rolloff',
  'flux',
  'flatness',
  'pitch',
  'stereoWidth',
  'pan',
] as const;

export type AudioFeatureKey = typeof AUDIO_FEATURE_KEYS[number];

export const AUDIO_SEQUENCE_SEED_MUTATION_SCOPES = [
  'motion',
  'structure',
  'surface',
  'hybrid',
] as const;

export type AudioSequenceSeedMutationScope = typeof AUDIO_SEQUENCE_SEED_MUTATION_SCOPES[number];


export const AUDIO_LEGACY_SLIDER_VISIBILITY_MODES = [
  'all',
  'review-blocked',
  'retired-safe',
] as const;

export type AudioLegacySliderVisibilityMode = typeof AUDIO_LEGACY_SLIDER_VISIBILITY_MODES[number];

export const AUDIO_REACTIVE_CURVES = [
  'linear',
  'ease-in',
  'ease-out',
  'ease-in-out',
  'exp',
  'log',
  'gate',
] as const;

export type AudioReactiveCurve = typeof AUDIO_REACTIVE_CURVES[number];

export const AUDIO_REACTIVE_MODES = [
  'add',
  'multiply',
  'replace',
  'gate',
  'trigger',
] as const;

export type AudioReactiveMode = typeof AUDIO_REACTIVE_MODES[number];

export interface AudioFeatureFrame {
  level: number;
  rms: number;
  peak: number;
  crest: number;
  bass: number;
  lowMid: number;
  mid: number;
  highMid: number;
  treble: number;
  air: number;
  bandA: number;
  bandB: number;
  pulse: number;
  onset: number;
  beat: number;
  centroid: number;
  spread: number;
  rolloff: number;
  flux: number;
  flatness: number;
  pitch: number;
  stereoWidth: number;
  pan: number;
}

export interface AudioModulationRoute {
  id: string;
  enabled: boolean;
  source: AudioFeatureKey;
  target: string;
  amount: number;
  bias: number;
  curve: AudioReactiveCurve;
  smoothing: number;
  attack: number;
  release: number;
  clampMin: number;
  clampMax: number;
  mode: AudioReactiveMode;
  notes?: string;
}

export interface AudioReactiveCapability {
  system: string;
  label: string;
  targets: string[];
  recommendedSources: AudioFeatureKey[];
  supportsTrigger: boolean;
  supportsContinuous: boolean;
  notes?: string;
}


export const AUDIO_CURATION_HISTORY_SCOPES = [
  'current',
  'stored',
  'everywhere',
] as const;

export type AudioCurationHistoryScope =
  typeof AUDIO_CURATION_HISTORY_SCOPES[number];

export const AUDIO_CURATION_QUEUE_FILTER_MODES = [
  'all',
  'hide-curated',
  'only-curated',
] as const;

export type AudioCurationQueueFilterMode =
  typeof AUDIO_CURATION_QUEUE_FILTER_MODES[number];

export interface AudioCurationHistoryEntry {
  id: string;
  key: string;
  scope: AudioCurationHistoryScope;
  action: string;
  routeId?: string;
  routeSignature?: string;
  createdAt: string;
  note?: string;
}
