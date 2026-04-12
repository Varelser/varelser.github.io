import { getFutureNativeFamilyProgress } from './futureNativeFamiliesProgress';
import { getFutureNativeNonVolumetricBundleCoverage } from './futureNativeNonVolumetricBundleCoverage';
import { buildProjectNonVolumetricRouteHighlights } from './futureNativeNonVolumetricRouteHighlights';

export interface FutureNativeNonVolumetricRouteTrendFamilySummary {
  familyId: string;
  title: string;
  group: string;
  progressPercent: number;
  nextTargetCount: number;
  routeCount: number;
  presetCount: number;
  bindingModes: string[];
  deltaLines: string[];
  primaryPresetIds: string[];
  helperArtifacts: string[];
  bundleArtifacts: string[];
  coverageLabel: string | null;
}


export interface FutureNativeNonVolumetricRouteTrendGroupSummary {
  group: 'mpm' | 'fracture';
  familyCount: number;
  averageProgressPercent: number;
  totalRouteCount: number;
  totalPresetCount: number;
  totalNextTargetCount: number;
  lowBandFamilies: FutureNativeNonVolumetricRouteTrendFamilySummary[];
}

const supportedTrendGroups = ['mpm', 'fracture'] as const;
type SupportedTrendGroup = (typeof supportedTrendGroups)[number];

function unique<T>(values: readonly T[]): T[] {
  return Array.from(new Set(values));
}

export function buildFutureNativeNonVolumetricRouteTrendGroups(): FutureNativeNonVolumetricRouteTrendGroupSummary[] {
  const highlights = buildProjectNonVolumetricRouteHighlights();
  const grouped = new Map<SupportedTrendGroup, FutureNativeNonVolumetricRouteTrendFamilySummary[]>();

  for (const highlight of highlights) {
    const progress = getFutureNativeFamilyProgress(highlight.familyId);
    const group = (highlight.familyId.startsWith('mpm-') ? 'mpm' : highlight.familyId.startsWith('fracture-') ? 'fracture' : null) as SupportedTrendGroup | null;
    if (!group) continue;
    const families = grouped.get(group) ?? [];
    families.push({
      familyId: highlight.familyId,
      title: highlight.title,
      group,
      progressPercent: progress.progressPercent,
      nextTargetCount: progress.nextTargets.length,
      routeCount: highlight.routeCount,
      presetCount: highlight.presetCount,
      bindingModes: [...highlight.bindingModes],
      deltaLines: [...highlight.deltaLines],
      primaryPresetIds: unique(highlight.profiles.map((profile) => profile.primaryPresetId)),
      helperArtifacts: getFutureNativeNonVolumetricBundleCoverage(highlight.familyId)?.helperArtifacts ?? [],
      bundleArtifacts: getFutureNativeNonVolumetricBundleCoverage(highlight.familyId)?.bundleArtifacts ?? [],
      coverageLabel: getFutureNativeNonVolumetricBundleCoverage(highlight.familyId)?.coverageLabel ?? null,
    });
    grouped.set(group, families);
  }

  return supportedTrendGroups.map((group) => {
    const families = [...(grouped.get(group) ?? [])].sort(
      (left, right) => left.progressPercent - right.progressPercent || left.familyId.localeCompare(right.familyId),
    );
    return {
      group,
      familyCount: families.length,
      averageProgressPercent: families.reduce((sum, family) => sum + family.progressPercent, 0) / Math.max(1, families.length),
      totalRouteCount: families.reduce((sum, family) => sum + family.routeCount, 0),
      totalPresetCount: families.reduce((sum, family) => sum + family.presetCount, 0),
      totalNextTargetCount: families.reduce((sum, family) => sum + family.nextTargetCount, 0),
      lowBandFamilies: families.filter((family) => family.progressPercent <= 98),
    };
  });
}
