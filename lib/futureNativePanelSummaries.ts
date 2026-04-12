import type { ParticleConfig, PresetRecord, PresetSequenceItem, ProjectManifest } from '../types';
import { buildProjectExecutionRouting } from './projectExecutionRouting';
import {
  getFutureNativeFamilyLabel,
  getFutureNativeLibraryCounts,
  getFutureNativeSequenceCounts,
  type FutureNativeFamilyLabel,
} from './presetCatalog';

export interface FutureNativeRouteSummary {
  key: string;
  label: string;
  mode: string;
  familyId: string;
  familyLabel: FutureNativeFamilyLabel;
  bindingMode: string | null;
  primaryPresetId: string | null;
  recommendedPresetIds: string[];
  capabilityFlags: string[];
  reason: string;
}

export interface FutureNativeExportAdvice {
  activeRoutes: FutureNativeRouteSummary[];
  libraryCounts: ReturnType<typeof getFutureNativeLibraryCounts>;
  sequenceCounts: ReturnType<typeof getFutureNativeSequenceCounts>;
  preferredVideoMode: 'current' | 'sequence';
  preferredCaptureLabel: 'Browser WebM' | 'PNG ZIP';
  recommendation: string;
}

function buildRouteSummary(entry: {
  key: string;
  label: string;
  mode: string;
  futureNativeFamilyId?: string | null;
  futureNativeBindingMode?: string | null;
  futureNativePrimaryPresetId?: string | null;
  futureNativeRecommendedPresetIds?: string[];
  capabilityFlags: string[];
  reason: string;
}): FutureNativeRouteSummary | null {
  if (!entry.futureNativeFamilyId) return null;

  return {
    key: entry.key,
    label: entry.label,
    mode: entry.mode,
    familyId: entry.futureNativeFamilyId,
    familyLabel: getFutureNativeFamilyLabel(entry.futureNativeFamilyId as any),
    bindingMode: entry.futureNativeBindingMode ?? null,
    primaryPresetId: entry.futureNativePrimaryPresetId ?? null,
    recommendedPresetIds: entry.futureNativeRecommendedPresetIds ?? [],
    capabilityFlags: entry.capabilityFlags,
    reason: entry.reason,
  };
}

export function getFutureNativeActiveRouteSummaries(config: ParticleConfig): FutureNativeRouteSummary[] {
  return buildProjectExecutionRouting(config)
    .filter((entry) => entry.enabled && entry.futureNativeFamilyId)
    .map((entry) => buildRouteSummary(entry))
    .filter((entry): entry is FutureNativeRouteSummary => Boolean(entry));
}

export function getFutureNativeManifestRouteSummaries(projectManifest: ProjectManifest): FutureNativeRouteSummary[] {
  return projectManifest.execution
    .filter((entry) => entry.enabled && entry.futureNativeFamilyId)
    .map((entry) => buildRouteSummary(entry))
    .filter((entry): entry is FutureNativeRouteSummary => Boolean(entry));
}

export function getFutureNativeExportAdvice(
  config: ParticleConfig,
  presets: PresetRecord[],
  presetSequence: PresetSequenceItem[],
): FutureNativeExportAdvice {
  const activeRoutes = getFutureNativeActiveRouteSummaries(config);
  const libraryCounts = getFutureNativeLibraryCounts(presets);
  const sequenceCounts = getFutureNativeSequenceCounts(presetSequence, presets);

  const hasVolumetric = activeRoutes.some((route) => route.familyLabel === 'Volumetric');
  const hasExportOnly = activeRoutes.some((route) => route.capabilityFlags.includes('export-only'));
  const hasQueuedFutureNative = sequenceCounts.futureNativeStepCount > 1;

  const preferredVideoMode: 'current' | 'sequence' = (hasVolumetric || hasQueuedFutureNative) ? 'sequence' : 'current';
  const preferredCaptureLabel: 'Browser WebM' | 'PNG ZIP' = hasExportOnly ? 'PNG ZIP' : 'Browser WebM';

  let recommendation = 'Use current WebM for quick validation passes.';
  if (preferredVideoMode === 'sequence' && preferredCaptureLabel === 'Browser WebM') {
    recommendation = 'Use sequence WebM when you want the family progression to read as one take.';
  } else if (preferredVideoMode === 'sequence' && preferredCaptureLabel === 'PNG ZIP') {
    recommendation = 'Use sequence + PNG ZIP when export-only or heavy future-native branches need cleaner frame output.';
  } else if (preferredVideoMode === 'current' && preferredCaptureLabel === 'PNG ZIP') {
    recommendation = 'Use current + PNG ZIP when the active family is better validated frame-by-frame than as a browser capture.';
  }

  return {
    activeRoutes,
    libraryCounts,
    sequenceCounts,
    preferredVideoMode,
    preferredCaptureLabel,
    recommendation,
  };
}

export interface FutureNativeProjectRouteSummary {
  currentRoutes: FutureNativeRouteSummary[];
  manifestRoutes: FutureNativeRouteSummary[];
  familyCounts: Record<FutureNativeFamilyLabel, number>;
  recommendedPresetIds: string[];
}

export function getFutureNativeProjectRouteSummary(
  currentConfig: ParticleConfig,
  projectManifest: ProjectManifest,
): FutureNativeProjectRouteSummary {
  const currentRoutes = getFutureNativeActiveRouteSummaries(currentConfig);
  const manifestRoutes = getFutureNativeManifestRouteSummaries(projectManifest);
  const familyCounts: Record<FutureNativeFamilyLabel, number> = {
    MPM: 0,
    PBD: 0,
    Fracture: 0,
    Volumetric: 0,
  };

  const recommendedPresetIds = Array.from(new Set(manifestRoutes.flatMap((route) => route.recommendedPresetIds)));
  manifestRoutes.forEach((route) => {
    familyCounts[route.familyLabel] += 1;
  });

  return {
    currentRoutes,
    manifestRoutes,
    familyCounts,
    recommendedPresetIds,
  };
}
