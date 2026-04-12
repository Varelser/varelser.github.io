import type { ParticleConfig } from '../../types';
import { normalizeConfig } from '../appStateConfig';
import { getFutureNativeNonVolumetricBundleCoverage } from './futureNativeNonVolumetricBundleCoverage';
import { mpmBindingRegistrationSpecs } from './futureNativeNonVolumetricBindingMetadataMpm';
import { buildMpmDedicatedRouteInputSummary } from './futureNativeSceneBridgeMpmDedicatedSummary';

const supportedFamilies = ['mpm-viscoplastic', 'mpm-snow', 'mpm-mud', 'mpm-paste'] as const;
export type FutureNativeMpmDedicatedSurfaceFamilyId = (typeof supportedFamilies)[number];

export interface FutureNativeMpmDedicatedSurfaceRouteReport {
  familyId: FutureNativeMpmDedicatedSurfaceFamilyId;
  modeId: string;
  routeTag: string;
  primaryPresetId: string;
  bindingMode: string;
  materialKind: string;
  particleCount: number;
  cellResolution: number;
  substeps: number;
  cohesion: number;
  friction: number;
  plasticity: number;
  hardening: number;
  kernelRadius: number;
  warmFrameCountMin: number;
  warmFrameCountMax: number;
  previewSignature: string;
}

export interface FutureNativeMpmDedicatedSurfaceFamilyReport {
  familyId: FutureNativeMpmDedicatedSurfaceFamilyId;
  routeCount: number;
  presetCount: number;
  helperArtifacts: string[];
  bundleArtifacts: string[];
  coverageLabel: string | null;
  primaryPresetIds: string[];
  averageWarmFrameCount: number;
  maxWarmFrameCount: number;
  materialKinds: string[];
  previewSignature: string;
  routes: FutureNativeMpmDedicatedSurfaceRouteReport[];
}

export interface FutureNativeMpmDedicatedSurfaceReport {
  generatedAt: string;
  summary: {
    familyCount: number;
    routeCount: number;
    presetCount: number;
    coverageCount: number;
    averageWarmFrameCount: number;
    maxWarmFrameCount: number;
  };
  families: FutureNativeMpmDedicatedSurfaceFamilyReport[];
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function createSampleConfig(modeId: string): ParticleConfig {
  return normalizeConfig({
    layer2Enabled: true,
    layer2Source: 'plane',
    layer2Type: modeId as ParticleConfig['layer2Type'],
    layer2Count: 24000,
    layer2BaseSize: 1.12,
    layer2RadiusScale: 0.78,
    layer2Gravity: 0.22,
    layer2TemporalStrength: 0.46,
    layer2TemporalSpeed: 0.38,
    layer2FlowAmplitude: 0.42,
    layer2FlowFrequency: 34,
  });
}

export function buildFutureNativeMpmDedicatedSurfaceReport(): FutureNativeMpmDedicatedSurfaceReport {
  const families = supportedFamilies.map((familyId) => {
    const coverage = getFutureNativeNonVolumetricBundleCoverage(familyId);
    const routes = mpmBindingRegistrationSpecs
      .filter((entry) => entry.familyId === familyId)
      .map((entry) => {
        const inputSummary = buildMpmDedicatedRouteInputSummary(familyId, entry.routeTag, createSampleConfig(entry.modeId), 2);
        return {
          familyId,
          modeId: entry.modeId,
          routeTag: entry.routeTag,
          primaryPresetId: entry.primaryPresetId,
          bindingMode: entry.bindingMode,
          materialKind: inputSummary.materialKind,
          particleCount: inputSummary.particleCount,
          cellResolution: inputSummary.cellResolution,
          substeps: inputSummary.substeps,
          cohesion: round3(inputSummary.cohesion),
          friction: round3(inputSummary.friction),
          plasticity: round3(inputSummary.plasticity),
          hardening: round3(inputSummary.hardening),
          kernelRadius: round3(inputSummary.kernelRadius),
          warmFrameCountMin: inputSummary.warmFrameCountMin,
          warmFrameCountMax: inputSummary.warmFrameCountMax,
          previewSignature: inputSummary.previewSignature,
        } satisfies FutureNativeMpmDedicatedSurfaceRouteReport;
      });

    const presetIds = routes.map((route) => route.primaryPresetId);
    const averageWarmFrameCount = routes.reduce((sum, route) => sum + (route.warmFrameCountMin + route.warmFrameCountMax) / 2, 0) / Math.max(routes.length, 1);
    const maxWarmFrameCount = routes.reduce((max, route) => Math.max(max, route.warmFrameCountMax), 0);
    const materialKinds = Array.from(new Set(routes.map((route) => route.materialKind)));
    return {
      familyId,
      routeCount: routes.length,
      presetCount: presetIds.length,
      helperArtifacts: coverage?.helperArtifacts ?? [],
      bundleArtifacts: coverage?.bundleArtifacts ?? [],
      coverageLabel: coverage?.coverageLabel ?? null,
      primaryPresetIds: presetIds,
      averageWarmFrameCount: round3(averageWarmFrameCount),
      maxWarmFrameCount,
      materialKinds,
      previewSignature: `${familyId}:${routes.length}:${presetIds.length}:${materialKinds.join('/')}:${coverage?.coverageLabel ?? 'no-coverage'}`,
      routes,
    } satisfies FutureNativeMpmDedicatedSurfaceFamilyReport;
  });

  const allRoutes = families.flatMap((family) => family.routes);
  return {
    generatedAt: new Date().toISOString(),
    summary: {
      familyCount: families.length,
      routeCount: allRoutes.length,
      presetCount: allRoutes.length,
      coverageCount: families.filter((family) => family.coverageLabel && family.helperArtifacts.length > 0 && family.bundleArtifacts.length > 0).length,
      averageWarmFrameCount: round3(families.reduce((sum, family) => sum + family.averageWarmFrameCount, 0) / Math.max(families.length, 1)),
      maxWarmFrameCount: families.reduce((max, family) => Math.max(max, family.maxWarmFrameCount), 0),
    },
    families,
  };
}

export function renderFutureNativeMpmDedicatedSurfaceReportMarkdown(
  report = buildFutureNativeMpmDedicatedSurfaceReport(),
): string {
  const lines: string[] = [
    '# Future-Native MPM Dedicated Surface Report',
    '',
    `- generatedAt: ${report.generatedAt}`,
    `- familyCount: ${report.summary.familyCount}`,
    `- routeCount: ${report.summary.routeCount}`,
    `- presetCount: ${report.summary.presetCount}`,
    `- coverageCount: ${report.summary.coverageCount}`,
    `- averageWarmFrameCount: ${report.summary.averageWarmFrameCount}`,
    `- maxWarmFrameCount: ${report.summary.maxWarmFrameCount}`,
    '',
  ];

  for (const family of report.families) {
    lines.push(`## ${family.familyId}`);
    lines.push(`- routeCount: ${family.routeCount}`);
    lines.push(`- presetCount: ${family.presetCount}`);
    lines.push(`- coverageLabel: ${family.coverageLabel ?? 'none'}`);
    lines.push(`- averageWarmFrameCount: ${family.averageWarmFrameCount}`);
    lines.push(`- maxWarmFrameCount: ${family.maxWarmFrameCount}`);
    lines.push(`- helperArtifacts: ${family.helperArtifacts.join(', ') || 'none'}`);
    lines.push(`- bundleArtifacts: ${family.bundleArtifacts.join(', ') || 'none'}`);
    lines.push(`- primaryPresetIds: ${family.primaryPresetIds.join(', ')}`);
    lines.push(`- materialKinds: ${family.materialKinds.join(', ')}`);
    lines.push(`- previewSignature: ${family.previewSignature}`);
    lines.push('');
    for (const route of family.routes) {
      lines.push(`### ${route.routeTag}`);
      lines.push(`- modeId: ${route.modeId}`);
      lines.push(`- primaryPresetId: ${route.primaryPresetId}`);
      lines.push(`- bindingMode: ${route.bindingMode}`);
      lines.push(`- materialKind: ${route.materialKind}`);
      lines.push(`- particleCount: ${route.particleCount}`);
      lines.push(`- cellResolution: ${route.cellResolution}`);
      lines.push(`- substeps: ${route.substeps}`);
      lines.push(`- cohesion: ${route.cohesion}`);
      lines.push(`- friction: ${route.friction}`);
      lines.push(`- plasticity: ${route.plasticity}`);
      lines.push(`- hardening: ${route.hardening}`);
      lines.push(`- kernelRadius: ${route.kernelRadius}`);
      lines.push(`- warmFrameCountMin: ${route.warmFrameCountMin}`);
      lines.push(`- warmFrameCountMax: ${route.warmFrameCountMax}`);
      lines.push(`- previewSignature: ${route.previewSignature}`);
      lines.push('');
    }
  }

  return lines.join('\n');
}
