import type { ParticleConfig } from "../types";

export type LegacyAudioSliderKey = keyof Pick<
  ParticleConfig,
  | "audioBassMotionScale"
  | "audioBassSizeScale"
  | "audioBassAlphaScale"
  | "audioTrebleMotionScale"
  | "audioTrebleSizeScale"
  | "audioTrebleAlphaScale"
  | "audioPulseScale"
  | "audioBurstScale"
  | "audioScreenScale"
  | "audioMorphScale"
  | "audioShatterScale"
  | "audioTwistScale"
  | "audioBendScale"
  | "audioWarpScale"
  | "audioLineScale"
  | "audioCameraScale"
  | "audioHueShiftScale"
  | "audioBandAMotionScale"
  | "audioBandASizeScale"
  | "audioBandAAlphaScale"
  | "audioBandBMotionScale"
  | "audioBandBSizeScale"
  | "audioBandBAlphaScale"
>;

export interface LegacyAudioSliderDefinition {
  legacyId: string;
  key: LegacyAudioSliderKey;
  label: string;
  min: number;
  max: number;
  step: number;
}

export interface AudioHotspotBatchSummary {
  scope: "current" | "stored" | "everywhere";
  limit: number;
  beforeHotspotCount: number;
  afterHotspotCount: number;
  beforeContextCount: number;
  afterContextCount: number;
  beforePendingHotspotCount: number;
  afterPendingHotspotCount: number;
  beforePendingContextCount: number;
  afterPendingContextCount: number;
  beforePendingSamples: string[];
  afterPendingSamples: string[];
  currentAppliedCount: number;
  currentSamples: string[];
  storedPresetUpdatedCount: number;
  storedKeyframeUpdatedCount: number;
  storedAppliedCount: number;
  storedSamples: string[];
  createdAt: string;
}

export interface AudioManualBatchSummary {
  scope: "current" | "stored" | "everywhere";
  limit: number;
  beforeCurrentManualKeyCount: number;
  afterCurrentManualKeyCount: number;
  beforeStoredManualKeyCount: number;
  afterStoredManualKeyCount: number;
  beforePendingCurrentManualKeyCount: number;
  afterPendingCurrentManualKeyCount: number;
  beforePendingStoredManualKeyCount: number;
  afterPendingStoredManualKeyCount: number;
  beforePendingCurrentSamples: string[];
  afterPendingCurrentSamples: string[];
  beforePendingStoredSamples: string[];
  afterPendingStoredSamples: string[];
  currentAppliedCount: number;
  currentSamples: string[];
  storedAppliedCount: number;
  storedSamples: string[];
  createdAt: string;
  batchLabel?: string;
  previewProfile?: string;
  previewKeyCount?: number;
  previewPresetUpdatedCount?: number;
  previewKeyframeUpdatedCount?: number;
  previewTotalReviewDelta?: number;
  previewTotalBlockedDelta?: number;
  previewTotalResidualDelta?: number;
  previewAppliedKeys?: string[];
  previewSampleUpdatedIds?: string[];
}

export const LEGACY_AUDIO_PRIMARY_SLIDERS: LegacyAudioSliderDefinition[] = [
  {
    legacyId: "legacy-bass-motion",
    key: "audioBassMotionScale",
    label: "Bass -> Motion",
    min: 0,
    max: 4,
    step: 0.1,
  },
  {
    legacyId: "legacy-bass-size",
    key: "audioBassSizeScale",
    label: "Bass -> Size",
    min: 0,
    max: 4,
    step: 0.1,
  },
  {
    legacyId: "legacy-bass-alpha",
    key: "audioBassAlphaScale",
    label: "Bass -> Opacity",
    min: 0,
    max: 4,
    step: 0.1,
  },
  {
    legacyId: "legacy-treble-motion",
    key: "audioTrebleMotionScale",
    label: "Treble -> Motion",
    min: 0,
    max: 4,
    step: 0.1,
  },
  {
    legacyId: "legacy-treble-size",
    key: "audioTrebleSizeScale",
    label: "Treble -> Size",
    min: 0,
    max: 4,
    step: 0.1,
  },
  {
    legacyId: "legacy-treble-alpha",
    key: "audioTrebleAlphaScale",
    label: "Treble -> Opacity",
    min: 0,
    max: 4,
    step: 0.1,
  },
  {
    legacyId: "legacy-pulse-particles",
    key: "audioPulseScale",
    label: "Pulse -> Particles",
    min: 0,
    max: 4,
    step: 0.1,
  },
  {
    legacyId: "legacy-pulse-burst",
    key: "audioBurstScale",
    label: "Pulse -> Burst",
    min: 0,
    max: 4,
    step: 0.1,
  },
  {
    legacyId: "legacy-pulse-screen",
    key: "audioScreenScale",
    label: "Pulse -> Screen FX",
    min: 0,
    max: 4,
    step: 0.1,
  },
  {
    legacyId: "legacy-pulse-morph",
    key: "audioMorphScale",
    label: "Pulse -> Motion Morph",
    min: 0,
    max: 4,
    step: 0.1,
  },
  {
    legacyId: "legacy-treble-shatter",
    key: "audioShatterScale",
    label: "Treble -> Shatter",
    min: 0,
    max: 4,
    step: 0.1,
  },
  {
    legacyId: "legacy-audio-twist",
    key: "audioTwistScale",
    label: "Audio -> Twist",
    min: 0,
    max: 4,
    step: 0.1,
  },
  {
    legacyId: "legacy-audio-bend",
    key: "audioBendScale",
    label: "Audio -> Bend",
    min: 0,
    max: 4,
    step: 0.1,
  },
  {
    legacyId: "legacy-audio-warp",
    key: "audioWarpScale",
    label: "Audio -> Radial Warp",
    min: 0,
    max: 4,
    step: 0.1,
  },
  {
    legacyId: "legacy-audio-lines",
    key: "audioLineScale",
    label: "Audio -> Line Noise",
    min: 0,
    max: 4,
    step: 0.1,
  },
  {
    legacyId: "legacy-audio-camera",
    key: "audioCameraScale",
    label: "Audio -> Camera",
    min: 0,
    max: 4,
    step: 0.1,
  },
  {
    legacyId: "legacy-audio-hue",
    key: "audioHueShiftScale",
    label: "Audio -> Hue Shift",
    min: 0,
    max: 4,
    step: 0.1,
  },
];

export const LEGACY_AUDIO_BAND_A_SLIDERS: LegacyAudioSliderDefinition[] = [
  {
    legacyId: "legacy-bandA-motion",
    key: "audioBandAMotionScale",
    label: "Band A -> Motion",
    min: 0,
    max: 4,
    step: 0.1,
  },
  {
    legacyId: "legacy-bandA-size",
    key: "audioBandASizeScale",
    label: "Band A -> Size",
    min: 0,
    max: 4,
    step: 0.1,
  },
  {
    legacyId: "legacy-bandA-alpha",
    key: "audioBandAAlphaScale",
    label: "Band A -> Alpha",
    min: 0,
    max: 4,
    step: 0.1,
  },
];

export const LEGACY_AUDIO_BAND_B_SLIDERS: LegacyAudioSliderDefinition[] = [
  {
    legacyId: "legacy-bandB-motion",
    key: "audioBandBMotionScale",
    label: "Band B -> Motion",
    min: 0,
    max: 4,
    step: 0.1,
  },
  {
    legacyId: "legacy-bandB-size",
    key: "audioBandBSizeScale",
    label: "Band B -> Size",
    min: 0,
    max: 4,
    step: 0.1,
  },
  {
    legacyId: "legacy-bandB-alpha",
    key: "audioBandBAlphaScale",
    label: "Band B -> Alpha",
    min: 0,
    max: 4,
    step: 0.1,
  },
];
