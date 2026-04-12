import { getFutureNativeNonVolumetricBundleCoverage } from './futureNativeNonVolumetricBundleCoverage';
import { nonVolumetricBindingRegistrationSpecs } from './futureNativeNonVolumetricBindingMetadata';
import {
  buildFractureDedicatedRouteInputSummary,
  type FutureNativeFractureDedicatedSurfaceFamilyId,
} from './futureNativeSceneBridgeFractureDedicatedSummary';

const supportedFamilies = ['fracture-crack-propagation', 'fracture-debris-generation'] as const;

export interface FutureNativeFractureDedicatedSurfaceRouteReport {
  familyId: FutureNativeFractureDedicatedSurfaceFamilyId;
  modeId: string;
  routeTag: string;
  primaryPresetId: string;
  bindingMode: string;
  width: number;
  height: number;
  impulseThreshold: number;
  debrisSpawnRate: number;
  impactRadius: number;
  impulseMagnitude: number;
  propagationFalloff: number;
  directionalBias: number;
  splitAffinity: number;
  fragmentDetachThreshold: number;
  brokenBondCount: number;
  debrisCount: number;
  detachedFragmentCount: number;
  fractureRadius: number;
  crackFrontRadius: number;
  simulationSteps: number;
  previewSignature: string;
}

export interface FutureNativeFractureDedicatedSurfaceFamilyReport {
  familyId: FutureNativeFractureDedicatedSurfaceFamilyId;
  routeCount: number;
  presetCount: number;
  helperArtifacts: string[];
  bundleArtifacts: string[];
  coverageLabel: string | null;
  primaryPresetIds: string[];
  averageBrokenBondCount: number;
  averageDebrisCount: number;
  maxCrackFrontRadius: number;
  previewSignature: string;
  routes: FutureNativeFractureDedicatedSurfaceRouteReport[];
}

export interface FutureNativeFractureDedicatedSurfaceReport {
  generatedAt: string;
  summary: {
    familyCount: number;
    routeCount: number;
    presetCount: number;
    coverageCount: number;
    averageBrokenBondCount: number;
    averageDebrisCount: number;
    maxCrackFrontRadius: number;
  };
  families: FutureNativeFractureDedicatedSurfaceFamilyReport[];
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}

export function buildFutureNativeFractureDedicatedSurfaceReport(): FutureNativeFractureDedicatedSurfaceReport {
  const families = supportedFamilies.map((familyId) => {
    const coverage = getFutureNativeNonVolumetricBundleCoverage(familyId);
    const routes = nonVolumetricBindingRegistrationSpecs
      .filter((entry) => entry.familyId === familyId)
      .map((entry) => {
        const summary = buildFractureDedicatedRouteInputSummary(familyId, entry.routeTag, entry.modeId);
        return {
          familyId,
          modeId: entry.modeId,
          routeTag: entry.routeTag,
          primaryPresetId: entry.primaryPresetId,
          bindingMode: entry.bindingMode,
          width: summary.width,
          height: summary.height,
          impulseThreshold: summary.impulseThreshold,
          debrisSpawnRate: summary.debrisSpawnRate,
          impactRadius: summary.impactRadius,
          impulseMagnitude: summary.impulseMagnitude,
          propagationFalloff: summary.propagationFalloff,
          directionalBias: summary.directionalBias,
          splitAffinity: summary.splitAffinity,
          fragmentDetachThreshold: summary.fragmentDetachThreshold,
          brokenBondCount: summary.brokenBondCount,
          debrisCount: summary.debrisCount,
          detachedFragmentCount: summary.detachedFragmentCount,
          fractureRadius: summary.fractureRadius,
          crackFrontRadius: summary.crackFrontRadius,
          simulationSteps: summary.simulationSteps,
          previewSignature: summary.previewSignature,
        } satisfies FutureNativeFractureDedicatedSurfaceRouteReport;
      });

    const presetIds = routes.map((route) => route.primaryPresetId);
    const averageBrokenBondCount = routes.reduce((sum, route) => sum + route.brokenBondCount, 0) / Math.max(routes.length, 1);
    const averageDebrisCount = routes.reduce((sum, route) => sum + route.debrisCount, 0) / Math.max(routes.length, 1);
    const maxCrackFrontRadius = routes.reduce((max, route) => Math.max(max, route.crackFrontRadius), 0);

    return {
      familyId,
      routeCount: routes.length,
      presetCount: presetIds.length,
      helperArtifacts: coverage?.helperArtifacts ?? [],
      bundleArtifacts: coverage?.bundleArtifacts ?? [],
      coverageLabel: coverage?.coverageLabel ?? null,
      primaryPresetIds: presetIds,
      averageBrokenBondCount: round3(averageBrokenBondCount),
      averageDebrisCount: round3(averageDebrisCount),
      maxCrackFrontRadius: round3(maxCrackFrontRadius),
      previewSignature: `${familyId}:${routes.length}:${presetIds.length}:broken${round3(averageBrokenBondCount)}:debris${round3(averageDebrisCount)}:${coverage?.coverageLabel ?? 'no-coverage'}`,
      routes,
    } satisfies FutureNativeFractureDedicatedSurfaceFamilyReport;
  });

  const allRoutes = families.flatMap((family) => family.routes);
  return {
    generatedAt: new Date().toISOString(),
    summary: {
      familyCount: families.length,
      routeCount: allRoutes.length,
      presetCount: allRoutes.length,
      coverageCount: families.filter((family) => family.coverageLabel && family.helperArtifacts.length > 0 && family.bundleArtifacts.length > 0).length,
      averageBrokenBondCount: round3(families.reduce((sum, family) => sum + family.averageBrokenBondCount, 0) / Math.max(families.length, 1)),
      averageDebrisCount: round3(families.reduce((sum, family) => sum + family.averageDebrisCount, 0) / Math.max(families.length, 1)),
      maxCrackFrontRadius: round3(families.reduce((max, family) => Math.max(max, family.maxCrackFrontRadius), 0)),
    },
    families,
  };
}

export function renderFutureNativeFractureDedicatedSurfaceReportMarkdown(
  report = buildFutureNativeFractureDedicatedSurfaceReport(),
): string {
  const lines: string[] = [
    '# Future-Native Fracture Dedicated Surface Report',
    '',
    `- generatedAt: ${report.generatedAt}`,
    `- familyCount: ${report.summary.familyCount}`,
    `- routeCount: ${report.summary.routeCount}`,
    `- presetCount: ${report.summary.presetCount}`,
    `- coverageCount: ${report.summary.coverageCount}`,
    `- averageBrokenBondCount: ${report.summary.averageBrokenBondCount}`,
    `- averageDebrisCount: ${report.summary.averageDebrisCount}`,
    `- maxCrackFrontRadius: ${report.summary.maxCrackFrontRadius}`,
    '',
  ];

  for (const family of report.families) {
    lines.push(`## ${family.familyId}`);
    lines.push(`- routeCount: ${family.routeCount}`);
    lines.push(`- presetCount: ${family.presetCount}`);
    lines.push(`- coverageLabel: ${family.coverageLabel ?? 'none'}`);
    lines.push(`- averageBrokenBondCount: ${family.averageBrokenBondCount}`);
    lines.push(`- averageDebrisCount: ${family.averageDebrisCount}`);
    lines.push(`- maxCrackFrontRadius: ${family.maxCrackFrontRadius}`);
    lines.push(`- helperArtifacts: ${family.helperArtifacts.join(', ') || 'none'}`);
    lines.push(`- bundleArtifacts: ${family.bundleArtifacts.join(', ') || 'none'}`);
    lines.push(`- primaryPresetIds: ${family.primaryPresetIds.join(', ')}`);
    lines.push(`- previewSignature: ${family.previewSignature}`);
    lines.push('');
    for (const route of family.routes) {
      lines.push(`### ${route.routeTag}`);
      lines.push(`- modeId: ${route.modeId}`);
      lines.push(`- primaryPresetId: ${route.primaryPresetId}`);
      lines.push(`- bindingMode: ${route.bindingMode}`);
      lines.push(`- width: ${route.width}`);
      lines.push(`- height: ${route.height}`);
      lines.push(`- impulseThreshold: ${route.impulseThreshold}`);
      lines.push(`- debrisSpawnRate: ${route.debrisSpawnRate}`);
      lines.push(`- impactRadius: ${route.impactRadius}`);
      lines.push(`- impulseMagnitude: ${route.impulseMagnitude}`);
      lines.push(`- propagationFalloff: ${route.propagationFalloff}`);
      lines.push(`- directionalBias: ${route.directionalBias}`);
      lines.push(`- splitAffinity: ${route.splitAffinity}`);
      lines.push(`- fragmentDetachThreshold: ${route.fragmentDetachThreshold}`);
      lines.push(`- brokenBondCount: ${route.brokenBondCount}`);
      lines.push(`- debrisCount: ${route.debrisCount}`);
      lines.push(`- detachedFragmentCount: ${route.detachedFragmentCount}`);
      lines.push(`- fractureRadius: ${route.fractureRadius}`);
      lines.push(`- crackFrontRadius: ${route.crackFrontRadius}`);
      lines.push(`- simulationSteps: ${route.simulationSteps}`);
      lines.push(`- previewSignature: ${route.previewSignature}`);
      lines.push('');
    }
  }

  return lines.join('\n');
}
