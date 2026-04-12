import type { ParticleConfig } from '../../types';
import { normalizeMpmGranularConfig, type MpmGranularInputConfig } from './starter-runtime/mpm_granularAdapter';
import { buildMpmMudInput, buildMpmPasteInput, resolveMpmMudWarmFrameCount, resolveMpmPasteWarmFrameCount } from './futureNativeSceneBridgeMpmMudPaste';
import { buildMpmSnowInput, buildMpmViscoplasticInput, resolveMpmSnowWarmFrameCount, resolveMpmViscoplasticWarmFrameCount } from './futureNativeSceneBridgeMpmSnowViscoplastic';
import type { SupportedLayerIndex } from './futureNativeSceneBridgeShared';

const supportedFamilies = ['mpm-viscoplastic', 'mpm-snow', 'mpm-mud', 'mpm-paste'] as const;
export type FutureNativeMpmDedicatedSummaryFamilyId = (typeof supportedFamilies)[number];

export interface FutureNativeMpmDedicatedRouteInputSummary {
  familyId: FutureNativeMpmDedicatedSummaryFamilyId;
  routeTag: string;
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

function buildInputConfig(
  familyId: FutureNativeMpmDedicatedSummaryFamilyId,
  config: ParticleConfig,
  layerIndex: SupportedLayerIndex,
): MpmGranularInputConfig {
  switch (familyId) {
    case 'mpm-viscoplastic':
      return buildMpmViscoplasticInput(config, layerIndex);
    case 'mpm-snow':
      return buildMpmSnowInput(config, layerIndex);
    case 'mpm-mud':
      return buildMpmMudInput(config, layerIndex);
    case 'mpm-paste':
      return buildMpmPasteInput(config, layerIndex);
  }
}

function resolveWarmFrameCount(familyId: FutureNativeMpmDedicatedSummaryFamilyId, routeTag: string, temporalStrength: number): number {
  switch (familyId) {
    case 'mpm-viscoplastic':
      return resolveMpmViscoplasticWarmFrameCount(routeTag, temporalStrength);
    case 'mpm-snow':
      return resolveMpmSnowWarmFrameCount(routeTag, temporalStrength);
    case 'mpm-mud':
      return resolveMpmMudWarmFrameCount(routeTag, temporalStrength);
    case 'mpm-paste':
      return resolveMpmPasteWarmFrameCount(routeTag, temporalStrength);
  }
}

export function buildMpmDedicatedRouteInputSummary(
  familyId: FutureNativeMpmDedicatedSummaryFamilyId,
  routeTag: string,
  config: ParticleConfig,
  layerIndex: SupportedLayerIndex,
): FutureNativeMpmDedicatedRouteInputSummary {
  const normalized = normalizeMpmGranularConfig(buildInputConfig(familyId, config, layerIndex));
  const warmFrameCountMin = resolveWarmFrameCount(familyId, routeTag, 0);
  const warmFrameCountMax = resolveWarmFrameCount(familyId, routeTag, 1);
  return {
    familyId,
    routeTag,
    materialKind: normalized.materialKind,
    particleCount: normalized.particleCount,
    cellResolution: normalized.cellResolution,
    substeps: normalized.substeps,
    cohesion: normalized.cohesion,
    friction: normalized.friction,
    plasticity: normalized.plasticity,
    hardening: normalized.hardening,
    kernelRadius: normalized.kernelRadius,
    warmFrameCountMin,
    warmFrameCountMax,
    previewSignature: [
      familyId,
      routeTag,
      normalized.materialKind,
      `p${normalized.particleCount}`,
      `grid${normalized.cellResolution}`,
      `sub${normalized.substeps}`,
      `warm${warmFrameCountMin}-${warmFrameCountMax}`,
    ].join('|'),
  };
}
