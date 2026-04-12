import { getFutureNativeFamilyProgress } from './futureNativeFamiliesProgress';
import { getFutureNativeVolumetricBundleCoverage } from './futureNativeVolumetricBundleCoverage';
import { getVolumetricFamilyUiSpecByFamilyId } from './futureNativeVolumetricFamilyMetadata';
import { buildProjectVolumetricRouteHighlights } from './futureNativeVolumetricRouteHighlights';

export interface FutureNativeVolumetricRouteTrendFamilySummary {
  familyId: string;
  title: string;
  progressPercent: number;
  nextTargetCount: number;
  routeCount: number;
  presetCount: number;
  bindingModes: string[];
  deltaLines: string[];
  primaryPresetIds: string[];
  authoringDescription: string;
  helperArtifacts: string[];
  bundleArtifacts: string[];
  coverageLabel: string | null;
}

export interface FutureNativeVolumetricRouteTrendSummary {
  group: 'volumetric';
  familyCount: number;
  averageProgressPercent: number;
  totalRouteCount: number;
  totalPresetCount: number;
  totalNextTargetCount: number;
  lowBandFamilies: FutureNativeVolumetricRouteTrendFamilySummary[];
}

function unique<T>(values: readonly T[]): T[] { return Array.from(new Set(values)); }

export function buildFutureNativeVolumetricRouteTrendSummary(): FutureNativeVolumetricRouteTrendSummary {
  const families = buildProjectVolumetricRouteHighlights().map((highlight) => {
    const progress = getFutureNativeFamilyProgress(highlight.familyId as Parameters<typeof getFutureNativeFamilyProgress>[0]);
    const spec = getVolumetricFamilyUiSpecByFamilyId(highlight.familyId as Parameters<typeof getVolumetricFamilyUiSpecByFamilyId>[0]);
    const coverage = getFutureNativeVolumetricBundleCoverage(highlight.familyId as Parameters<typeof getFutureNativeVolumetricBundleCoverage>[0]);
    return {
      familyId: highlight.familyId,
      title: spec.authoringTitle,
      progressPercent: progress.progressPercent,
      nextTargetCount: progress.nextTargets.length,
      routeCount: highlight.profiles.length,
      presetCount: highlight.profiles.length,
      bindingModes: ['native-volume'],
      deltaLines: [...highlight.deltaLines],
      primaryPresetIds: unique(highlight.profiles.map((profile) => profile.presetId)),
      authoringDescription: spec.authoringDescription,
      helperArtifacts: coverage?.helperArtifacts ?? [],
      bundleArtifacts: coverage?.bundleArtifacts ?? [],
      coverageLabel: coverage?.coverageLabel ?? null,
    };
  }).sort((a,b)=>a.progressPercent-b.progressPercent || a.familyId.localeCompare(b.familyId));
  return {
    group: 'volumetric',
    familyCount: families.length,
    averageProgressPercent: families.reduce((sum, f) => sum + f.progressPercent, 0) / Math.max(1, families.length),
    totalRouteCount: families.reduce((sum, f) => sum + f.routeCount, 0),
    totalPresetCount: families.reduce((sum, f) => sum + f.presetCount, 0),
    totalNextTargetCount: families.reduce((sum, f) => sum + f.nextTargetCount, 0),
    lowBandFamilies: families.filter((family) => family.progressPercent <= 98),
  };
}
