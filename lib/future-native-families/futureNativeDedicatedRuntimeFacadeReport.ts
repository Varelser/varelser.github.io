import type { ParticleConfig } from '../../types';
import { normalizeConfig } from '../appStateConfig';
import { getFutureNativeSceneRuntimeBinding } from './futureNativeSceneBindingRuntime';
import { mpmBindingRegistrationSpecs } from './futureNativeNonVolumetricBindingMetadataMpm';
import { nonVolumetricBindingRegistrationSpecs } from './futureNativeNonVolumetricBindingMetadata';
import {
  buildFutureNativeMpmDedicatedRuntimePlan,
  futureNativeMpmDedicatedRuntimeFamilies,
  type FutureNativeMpmDedicatedRuntimeFamilyId,
} from './futureNativeSceneBridgeMpmDedicatedRuntime';
import {
  buildFutureNativeFractureDedicatedRuntimePlan,
  type FutureNativeFractureDedicatedRuntimeFamilyId,
} from './futureNativeSceneBridgeFractureDedicatedRuntime';
import { buildMpmDedicatedRouteInputSummary } from './futureNativeSceneBridgeMpmDedicatedSummary';
import { buildFractureDedicatedRouteInputSummary } from './futureNativeSceneBridgeFractureDedicatedSummary';

const fractureFacadeFamilies = ['fracture-crack-propagation', 'fracture-debris-generation'] as const;

export type FutureNativeDedicatedRuntimeFacadeFamilyId =
  | FutureNativeMpmDedicatedRuntimeFamilyId
  | FutureNativeFractureDedicatedRuntimeFamilyId;

export interface FutureNativeDedicatedRuntimeFacadeRouteEntry {
  familyId: FutureNativeDedicatedRuntimeFacadeFamilyId;
  modeId: string;
  routeTag: string;
  runtimeFacadeId: string;
  routeSignature: string;
  warmFrameCount: number;
  runtimeConfigKeyCount: number;
  runtimeStateKeyCount: number;
  primaryMetric: number;
}

export interface FutureNativeDedicatedRuntimeFacadeFamilyEntry {
  familyId: FutureNativeDedicatedRuntimeFacadeFamilyId;
  routeCount: number;
  averageWarmFrameCount: number;
  maxWarmFrameCount: number;
  averageRuntimeStateKeyCount: number;
  previewSignature: string;
  routes: FutureNativeDedicatedRuntimeFacadeRouteEntry[];
}

export interface FutureNativeDedicatedRuntimeFacadeReport {
  generatedAt: string;
  summary: {
    familyCount: number;
    routeCount: number;
    mpmFamilyCount: number;
    fractureFamilyCount: number;
    coverageCount: number;
    averageWarmFrameCount: number;
    maxWarmFrameCount: number;
  };
  families: FutureNativeDedicatedRuntimeFacadeFamilyEntry[];
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}

let futureNativeDedicatedRuntimeFacadeReportCache: FutureNativeDedicatedRuntimeFacadeReport | null = null;

function createSampleConfig(modeId: string): ParticleConfig {
  return normalizeConfig({
    layer2Enabled: true,
    layer2Source: 'plane',
    layer2Type: modeId as ParticleConfig['layer2Type'],
    layer2Count: 8,
    layer2BaseSize: 0.72,
    layer2RadiusScale: 0.68,
    layer2Gravity: 0.18,
    layer2TemporalStrength: 0.32,
    layer2TemporalSpeed: 0.28,
    layer2FlowAmplitude: 0.28,
    layer2FlowFrequency: 18,
  });
}

export function invalidateFutureNativeDedicatedRuntimeFacadeReportCache(): void {
  futureNativeDedicatedRuntimeFacadeReportCache = null;
}

function buildMpmFamilyEntry(familyId: FutureNativeMpmDedicatedRuntimeFamilyId): FutureNativeDedicatedRuntimeFacadeFamilyEntry {
  const routes = mpmBindingRegistrationSpecs
    .filter((entry) => entry.familyId === familyId)
    .map((entry) => {
      const config = createSampleConfig(entry.modeId);
      const binding = getFutureNativeSceneRuntimeBinding(entry.modeId);
      if (!binding || binding.familyId !== familyId) throw new Error(`Missing runtime binding for ${familyId}:${entry.modeId}`);
      const plan = buildFutureNativeMpmDedicatedRuntimePlan(binding, config, 2);
      if (!plan) throw new Error(`Missing dedicated MPM runtime facade for ${familyId}:${entry.modeId}`);
      const summary = buildMpmDedicatedRouteInputSummary(familyId, entry.routeTag, config, 2);
      return {
        familyId,
        modeId: entry.modeId,
        routeTag: entry.routeTag,
        runtimeFacadeId: plan.runtimeFacadeId,
        routeSignature: plan.routeSignature,
        warmFrameCount: plan.warmFrameCount,
        runtimeConfigKeyCount: Object.keys(plan.baseInput).length,
        runtimeStateKeyCount: Object.keys(summary).length,
        primaryMetric: round3(summary.particleCount),
      } satisfies FutureNativeDedicatedRuntimeFacadeRouteEntry;
    });

  return {
    familyId,
    routeCount: routes.length,
    averageWarmFrameCount: round3(routes.reduce((sum, route) => sum + route.warmFrameCount, 0) / Math.max(routes.length, 1)),
    maxWarmFrameCount: routes.reduce((max, route) => Math.max(max, route.warmFrameCount), 0),
    averageRuntimeStateKeyCount: round3(routes.reduce((sum, route) => sum + route.runtimeStateKeyCount, 0) / Math.max(routes.length, 1)),
    previewSignature: `${familyId}:${routes.length}:${routes.map((route) => route.routeSignature).join('|')}`,
    routes,
  };
}

function buildFractureFamilyEntry(familyId: FutureNativeFractureDedicatedRuntimeFamilyId): FutureNativeDedicatedRuntimeFacadeFamilyEntry {
  const routes = nonVolumetricBindingRegistrationSpecs
    .filter((entry) => entry.familyId === familyId)
    .map((entry) => {
      const config = createSampleConfig(entry.modeId);
      const binding = getFutureNativeSceneRuntimeBinding(entry.modeId);
      if (!binding || binding.familyId !== familyId) throw new Error(`Missing runtime binding for ${familyId}:${entry.modeId}`);
      const plan = buildFutureNativeFractureDedicatedRuntimePlan(binding, config, 2);
      if (!plan) throw new Error(`Missing dedicated fracture runtime facade for ${familyId}:${entry.modeId}`);
      const summary = familyId === 'fracture-voxel' ? null : buildFractureDedicatedRouteInputSummary(familyId, entry.routeTag, entry.modeId);
      return {
        familyId,
        modeId: entry.modeId,
        routeTag: entry.routeTag,
        runtimeFacadeId: plan.runtimeFacadeId,
        routeSignature: plan.routeSignature,
        warmFrameCount: plan.warmFrameCount,
        runtimeConfigKeyCount: Object.keys(plan.baseInput).length,
        runtimeStateKeyCount: summary ? Object.keys(summary).length : Object.keys(plan.baseInput).length + 4,
        primaryMetric: summary ? round3(summary.brokenBondCount + summary.debrisCount) : round3((plan.baseInput.width ?? 0) * (plan.baseInput.height ?? 0)),
      } satisfies FutureNativeDedicatedRuntimeFacadeRouteEntry;
    });

  return {
    familyId,
    routeCount: routes.length,
    averageWarmFrameCount: round3(routes.reduce((sum, route) => sum + route.warmFrameCount, 0) / Math.max(routes.length, 1)),
    maxWarmFrameCount: routes.reduce((max, route) => Math.max(max, route.warmFrameCount), 0),
    averageRuntimeStateKeyCount: round3(routes.reduce((sum, route) => sum + route.runtimeStateKeyCount, 0) / Math.max(routes.length, 1)),
    previewSignature: `${familyId}:${routes.length}:${routes.map((route) => route.routeSignature).join('|')}`,
    routes,
  };
}

export function buildFutureNativeDedicatedRuntimeFacadeReport(
  options: { refresh?: boolean } = {},
): FutureNativeDedicatedRuntimeFacadeReport {
  if (!options.refresh && futureNativeDedicatedRuntimeFacadeReportCache) return futureNativeDedicatedRuntimeFacadeReportCache;

  const families = [
    ...futureNativeMpmDedicatedRuntimeFamilies.map((familyId) => buildMpmFamilyEntry(familyId)),
    ...fractureFacadeFamilies.map((familyId) => buildFractureFamilyEntry(familyId)),
  ];
  const routes = families.flatMap((family) => family.routes);
  const report: FutureNativeDedicatedRuntimeFacadeReport = {
    generatedAt: new Date().toISOString(),
    summary: {
      familyCount: families.length,
      routeCount: routes.length,
      mpmFamilyCount: futureNativeMpmDedicatedRuntimeFamilies.length,
      fractureFamilyCount: fractureFacadeFamilies.length,
      coverageCount: families.filter((family) => family.routeCount > 0 && family.averageRuntimeStateKeyCount > 0).length,
      averageWarmFrameCount: round3(families.reduce((sum, family) => sum + family.averageWarmFrameCount, 0) / Math.max(families.length, 1)),
      maxWarmFrameCount: families.reduce((max, family) => Math.max(max, family.maxWarmFrameCount), 0),
    },
    families,
  };

  futureNativeDedicatedRuntimeFacadeReportCache = report;
  return report;
}

export function renderFutureNativeDedicatedRuntimeFacadeMarkdown(
  report = buildFutureNativeDedicatedRuntimeFacadeReport(),
): string {
  const lines: string[] = [
    '# Future-Native Dedicated Runtime Facade Report',
    '',
    `- generatedAt: ${report.generatedAt}`,
    `- familyCount: ${report.summary.familyCount}`,
    `- routeCount: ${report.summary.routeCount}`,
    `- mpmFamilyCount: ${report.summary.mpmFamilyCount}`,
    `- fractureFamilyCount: ${report.summary.fractureFamilyCount}`,
    `- coverageCount: ${report.summary.coverageCount}`,
    `- averageWarmFrameCount: ${report.summary.averageWarmFrameCount}`,
    `- maxWarmFrameCount: ${report.summary.maxWarmFrameCount}`,
    '',
  ];

  for (const family of report.families) {
    lines.push(`## ${family.familyId}`);
    lines.push(`- routeCount: ${family.routeCount}`);
    lines.push(`- averageWarmFrameCount: ${family.averageWarmFrameCount}`);
    lines.push(`- maxWarmFrameCount: ${family.maxWarmFrameCount}`);
    lines.push(`- averageRuntimeStateKeyCount: ${family.averageRuntimeStateKeyCount}`);
    lines.push(`- previewSignature: ${family.previewSignature}`);
    lines.push('');
    for (const route of family.routes) {
      lines.push(`### ${route.routeTag}`);
      lines.push(`- modeId: ${route.modeId}`);
      lines.push(`- runtimeFacadeId: ${route.runtimeFacadeId}`);
      lines.push(`- routeSignature: ${route.routeSignature}`);
      lines.push(`- warmFrameCount: ${route.warmFrameCount}`);
      lines.push(`- runtimeConfigKeyCount: ${route.runtimeConfigKeyCount}`);
      lines.push(`- runtimeStateKeyCount: ${route.runtimeStateKeyCount}`);
      lines.push(`- primaryMetric: ${route.primaryMetric}`);
      lines.push('');
    }
  }

  return lines.join('\n');
}
