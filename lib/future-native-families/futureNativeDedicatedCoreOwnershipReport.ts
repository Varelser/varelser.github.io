import { buildFutureNativeDedicatedRuntimeFacadeReport } from './futureNativeDedicatedRuntimeFacadeReport';
import { getFutureNativeOwnedKernelMetadata } from './futureNativeOwnedKernelModules';

export type FutureNativeDedicatedCoreOwnershipFamilyId =
  | 'mpm-viscoplastic'
  | 'mpm-snow'
  | 'mpm-mud'
  | 'mpm-paste'
  | 'fracture-voxel'
  | 'fracture-crack-propagation'
  | 'fracture-debris-generation';

export interface FutureNativeDedicatedCoreOwnershipRouteEntry {
  familyId: FutureNativeDedicatedCoreOwnershipFamilyId;
  modeId: string;
  routeTag: string;
  runtimeFacadeId: string;
  configOwnerId: string;
  stateOwnerId: string;
  kernelFacadeId: string;
  sharedKernelBaseId: string;
  ownedKernelModuleId: string;
  routeSignature: string;
  warmFrameCount: number;
  fullyOwnedKernel: boolean;
}

export interface FutureNativeDedicatedCoreOwnershipFamilyEntry {
  familyId: FutureNativeDedicatedCoreOwnershipFamilyId;
  group: 'mpm' | 'fracture';
  routeCount: number;
  configOwnerId: string;
  stateOwnerId: string;
  kernelFacadeId: string;
  sharedKernelBaseId: string;
  ownedKernelModuleId: string;
  fullyOwnedKernel: boolean;
  routes: FutureNativeDedicatedCoreOwnershipRouteEntry[];
}

export interface FutureNativeDedicatedCoreOwnershipReport {
  generatedAt: string;
  summary: {
    familyCount: number;
    routeCount: number;
    coverageCount: number;
    mpmFamilyCount: number;
    fractureFamilyCount: number;
    fullyOwnedKernelFamilyCount: number;
    sharedBaseKernelFamilyCount: number;
    fullyOwnedKernelFamilies: FutureNativeDedicatedCoreOwnershipFamilyId[];
    sharedBaseKernelFamilies: FutureNativeDedicatedCoreOwnershipFamilyId[];
  };
  families: FutureNativeDedicatedCoreOwnershipFamilyEntry[];
}

let futureNativeDedicatedCoreOwnershipReportCache: FutureNativeDedicatedCoreOwnershipReport | null = null;

export function invalidateFutureNativeDedicatedCoreOwnershipReportCache(): void {
  futureNativeDedicatedCoreOwnershipReportCache = null;
}

export function buildFutureNativeDedicatedCoreOwnershipReport(
  options: { refresh?: boolean } = {},
): FutureNativeDedicatedCoreOwnershipReport {
  if (!options.refresh && futureNativeDedicatedCoreOwnershipReportCache) return futureNativeDedicatedCoreOwnershipReportCache;

  const facadeReport = buildFutureNativeDedicatedRuntimeFacadeReport(options);
  const families = facadeReport.families.map((family): FutureNativeDedicatedCoreOwnershipFamilyEntry => {
  const familyId = family.familyId as FutureNativeDedicatedCoreOwnershipFamilyId;
  const metadata = getFutureNativeOwnedKernelMetadata(familyId);
  const configOwnerId = metadata?.configOwnerId ?? `config-owner:${familyId}`;
  const stateOwnerId = metadata?.stateOwnerId ?? `state-owner:${familyId}`;
  const kernelFacadeId = metadata?.kernelFacadeId ?? `kernel-facade:${familyId}`;
  const sharedKernelBaseId = metadata?.sharedKernelBaseId ?? (familyId.startsWith('mpm-') ? 'shared-kernel:mpm-granular' : 'shared-kernel:fracture-lattice');
  const ownedKernelModuleId = metadata?.ownedKernelModuleId ?? '';
  const fullyOwnedKernel = metadata?.fullyOwnedKernel ?? false;
  return {
    familyId,
    group: metadata?.group ?? (familyId.startsWith('mpm-') ? 'mpm' : 'fracture'),
    routeCount: family.routeCount,
    configOwnerId,
    stateOwnerId,
    kernelFacadeId,
    sharedKernelBaseId,
    ownedKernelModuleId,
    fullyOwnedKernel,
    routes: family.routes.map((route) => ({
      familyId,
      modeId: route.modeId,
      routeTag: route.routeTag,
      runtimeFacadeId: route.runtimeFacadeId,
      configOwnerId,
      stateOwnerId,
      kernelFacadeId,
      sharedKernelBaseId,
      ownedKernelModuleId,
      routeSignature: route.routeSignature,
      warmFrameCount: route.warmFrameCount,
      fullyOwnedKernel,
    })),
  };
});

  const report: FutureNativeDedicatedCoreOwnershipReport = {
    generatedAt: new Date().toISOString(),
    summary: {
      familyCount: families.length,
      routeCount: families.reduce((sum, family) => sum + family.routeCount, 0),
      coverageCount: families.filter((family) => family.routeCount > 0 && family.ownedKernelModuleId.length > 0 && family.routes.every((route) => route.runtimeFacadeId.length > 0)).length,
      mpmFamilyCount: families.filter((family) => family.group === 'mpm').length,
      fractureFamilyCount: families.filter((family) => family.group === 'fracture').length,
      fullyOwnedKernelFamilyCount: families.filter((family) => family.fullyOwnedKernel).length,
      sharedBaseKernelFamilyCount: families.filter((family) => !family.fullyOwnedKernel).length,
      fullyOwnedKernelFamilies: families.filter((family) => family.fullyOwnedKernel).map((family) => family.familyId),
      sharedBaseKernelFamilies: families.filter((family) => !family.fullyOwnedKernel).map((family) => family.familyId),
    },
    families,
  };

  futureNativeDedicatedCoreOwnershipReportCache = report;
  return report;
}

export function renderFutureNativeDedicatedCoreOwnershipMarkdown(
  report = buildFutureNativeDedicatedCoreOwnershipReport(),
): string {
  const lines: string[] = [
    '# Future-Native Dedicated Core Ownership',
    '',
    `- generatedAt: ${report.generatedAt}`,
    `- familyCount: ${report.summary.familyCount}`,
    `- routeCount: ${report.summary.routeCount}`,
    `- coverageCount: ${report.summary.coverageCount}`,
    `- mpmFamilyCount: ${report.summary.mpmFamilyCount}`,
    `- fractureFamilyCount: ${report.summary.fractureFamilyCount}`,
    `- fullyOwnedKernelFamilyCount: ${report.summary.fullyOwnedKernelFamilyCount}`,
    `- sharedBaseKernelFamilyCount: ${report.summary.sharedBaseKernelFamilyCount}`,
    '',
  ];

  for (const family of report.families) {
    lines.push(`## ${family.familyId}`);
    lines.push(`- group: ${family.group}`);
    lines.push(`- routeCount: ${family.routeCount}`);
    lines.push(`- configOwnerId: ${family.configOwnerId}`);
    lines.push(`- stateOwnerId: ${family.stateOwnerId}`);
    lines.push(`- kernelFacadeId: ${family.kernelFacadeId}`);
    lines.push(`- sharedKernelBaseId: ${family.sharedKernelBaseId}`);
    lines.push(`- ownedKernelModuleId: ${family.ownedKernelModuleId}`);
    lines.push(`- fullyOwnedKernel: ${family.fullyOwnedKernel}`);
    lines.push('');
    for (const route of family.routes) {
      lines.push(`### ${route.routeTag}`);
      lines.push(`- modeId: ${route.modeId}`);
      lines.push(`- runtimeFacadeId: ${route.runtimeFacadeId}`);
      lines.push(`- routeSignature: ${route.routeSignature}`);
      lines.push(`- warmFrameCount: ${route.warmFrameCount}`);
      lines.push('');
    }
  }

  return lines.join('\n');
}
