import type { ParticleConfig } from '../types';
import type { ExportBatchJobKind } from './exportBatchQueue';

export type ExternalControlExportPresetExecution = 'apply' | 'enqueue' | 'start';
export type ExternalControlExportPresetQualityTier = 'draft' | 'balanced' | 'delivery';
export type ExternalControlExportPresetAspectFamily = 'native' | 'square' | 'vertical';
export type ExternalControlExportPresetExpectedCost = 'low' | 'medium' | 'high';
export type ExternalControlExportPresetUseCase =
  | 'preview'
  | 'social-story'
  | 'sequence-proof'
  | 'loop-snippet'
  | 'master-export';

export interface ExternalControlExportPresetDefinition {
  id: string;
  label: string;
  kind: ExportBatchJobKind;
  videoExportMode: 'current' | 'sequence';
  videoDurationSeconds: number;
  videoFps: number;
  exportScale: number;
  exportAspectPreset: ParticleConfig['exportAspectPreset'];
  exportTransparent: boolean;
  tags: string[];
  useCase: ExternalControlExportPresetUseCase;
  qualityTier: ExternalControlExportPresetQualityTier;
  aspectFamily: ExternalControlExportPresetAspectFamily;
  expectedCost: ExternalControlExportPresetExpectedCost;
}


export interface ExternalControlExportPresetCatalogEntry {
  id: ExternalControlExportPresetId;
  label: string;
  kind: ExportBatchJobKind;
  videoExportMode: 'current' | 'sequence';
  videoDurationSeconds: number;
  videoFps: number;
  exportScale: number;
  exportAspectPreset: ParticleConfig['exportAspectPreset'];
  exportTransparent: boolean;
  tags: string[];
  useCase: ExternalControlExportPresetUseCase;
  qualityTier: ExternalControlExportPresetQualityTier;
  aspectFamily: ExternalControlExportPresetAspectFamily;
  expectedCost: ExternalControlExportPresetExpectedCost;
}

export const EXTERNAL_CONTROL_EXPORT_PRESET_DEFINITIONS = [
  {
    id: 'video-preview-square',
    label: 'WebM Preview Square',
    kind: 'video-webm',
    videoExportMode: 'current',
    videoDurationSeconds: 6,
    videoFps: 24,
    exportScale: 1,
    exportAspectPreset: 'square',
    exportTransparent: false,
    tags: ['preview', 'square', 'webm', 'fast-review'],
    useCase: 'preview',
    qualityTier: 'draft',
    aspectFamily: 'square',
    expectedCost: 'low',
  },
  {
    id: 'video-story-vertical',
    label: 'WebM Story Vertical',
    kind: 'video-webm',
    videoExportMode: 'current',
    videoDurationSeconds: 8,
    videoFps: 24,
    exportScale: 2,
    exportAspectPreset: 'story-9-16',
    exportTransparent: false,
    tags: ['story', 'vertical', 'webm', 'social'],
    useCase: 'social-story',
    qualityTier: 'balanced',
    aspectFamily: 'vertical',
    expectedCost: 'medium',
  },
  {
    id: 'video-sequence-pass',
    label: 'WebM Sequence Pass',
    kind: 'video-webm',
    videoExportMode: 'sequence',
    videoDurationSeconds: 6,
    videoFps: 24,
    exportScale: 1,
    exportAspectPreset: 'current',
    exportTransparent: false,
    tags: ['sequence', 'proof', 'webm', 'playback'],
    useCase: 'sequence-proof',
    qualityTier: 'balanced',
    aspectFamily: 'native',
    expectedCost: 'medium',
  },
  {
    id: 'gif-loop-square',
    label: 'GIF Loop Square',
    kind: 'gif',
    videoExportMode: 'current',
    videoDurationSeconds: 4,
    videoFps: 18,
    exportScale: 1,
    exportAspectPreset: 'square',
    exportTransparent: false,
    tags: ['gif', 'loop', 'square', 'snippet'],
    useCase: 'loop-snippet',
    qualityTier: 'draft',
    aspectFamily: 'square',
    expectedCost: 'medium',
  },
  {
    id: 'gif-loop-story',
    label: 'GIF Loop Story',
    kind: 'gif',
    videoExportMode: 'current',
    videoDurationSeconds: 4,
    videoFps: 16,
    exportScale: 1,
    exportAspectPreset: 'story-9-16',
    exportTransparent: false,
    tags: ['gif', 'loop', 'vertical', 'story'],
    useCase: 'loop-snippet',
    qualityTier: 'draft',
    aspectFamily: 'vertical',
    expectedCost: 'medium',
  },
  {
    id: 'png-sequence-master',
    label: 'PNG Sequence Master',
    kind: 'png-sequence',
    videoExportMode: 'current',
    videoDurationSeconds: 6,
    videoFps: 24,
    exportScale: 2,
    exportAspectPreset: 'current',
    exportTransparent: false,
    tags: ['png-sequence', 'master', 'archive', 'high-detail'],
    useCase: 'master-export',
    qualityTier: 'delivery',
    aspectFamily: 'native',
    expectedCost: 'high',
  },
] as const satisfies readonly ExternalControlExportPresetDefinition[];

export type ExternalControlExportPresetId = typeof EXTERNAL_CONTROL_EXPORT_PRESET_DEFINITIONS[number]['id'];

const EXTERNAL_CONTROL_EXPORT_PRESET_ID_SET = new Set<string>(
  EXTERNAL_CONTROL_EXPORT_PRESET_DEFINITIONS.map((preset) => preset.id),
);

export function isExternalControlExportPresetId(value: unknown): value is ExternalControlExportPresetId {
  return typeof value === 'string' && EXTERNAL_CONTROL_EXPORT_PRESET_ID_SET.has(value);
}

export function getExternalControlExportPresetDefinition(
  presetId: ExternalControlExportPresetId,
): ExternalControlExportPresetDefinition {
  const preset = EXTERNAL_CONTROL_EXPORT_PRESET_DEFINITIONS.find((entry) => entry.id === presetId);
  if (!preset) {
    throw new Error(`Unknown external control export preset: ${presetId}`);
  }
  return preset;
}

export function listExternalControlExportPresetIds(): ExternalControlExportPresetId[] {
  return EXTERNAL_CONTROL_EXPORT_PRESET_DEFINITIONS.map((preset) => preset.id);
}


export function listExternalControlExportPresetCatalog(): ExternalControlExportPresetCatalogEntry[] {
  return EXTERNAL_CONTROL_EXPORT_PRESET_DEFINITIONS.map((preset) => ({
    ...preset,
    tags: [...preset.tags],
  }));
}

export function getRecommendedExternalControlExportPresetId(args: {
  videoExportMode: 'current' | 'sequence';
  videoDurationSeconds: number;
  videoFps: number;
  exportScale: number;
  exportAspectPreset: ParticleConfig['exportAspectPreset'];
  exportTransparent: boolean;
}): ExternalControlExportPresetId | null {
  let bestPreset: ExternalControlExportPresetId | null = null;
  let bestScore = Number.POSITIVE_INFINITY;

  for (const preset of EXTERNAL_CONTROL_EXPORT_PRESET_DEFINITIONS) {
    let score = 0;
    score += preset.videoExportMode === args.videoExportMode ? 0 : 120;
    score += preset.exportAspectPreset === args.exportAspectPreset ? 0 : 90;
    score += preset.exportTransparent === args.exportTransparent ? 0 : 60;
    score += Math.abs(preset.videoDurationSeconds - args.videoDurationSeconds) * 8;
    score += Math.abs(preset.videoFps - args.videoFps) * 3;
    score += Math.abs(preset.exportScale - args.exportScale) * 16;
    if (score < bestScore) {
      bestScore = score;
      bestPreset = preset.id;
    }
  }

  return bestPreset;
}
