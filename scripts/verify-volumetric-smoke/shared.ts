import { normalizeConfig } from '../../lib/appStateConfig';
import {
  buildFutureNativeSceneBridgeDescriptor,
  createFutureNativeSceneBridgeRuntime,
} from '../../lib/future-native-families/futureNativeSceneRendererBridge';
import { buildEditableVolumetricSmokeRuntimeConfig } from '../../lib/future-native-families/futureNativeSceneBridgeVolumetricOverrides';
import type { VolumetricDensityTransportNormalizedConfig } from '../../lib/future-native-families/starter-runtime/volumetric_density_transportSchema';
import type { Layer2Type, ParticleConfig } from '../../types';
import { assert, assertApproxEqual, buildVerificationProject } from '../verify-volumetric-family-shared';

export const smokeCases: Array<{ mode: Layer2Type; source: string }> = [
  { mode: 'prism_smoke', source: 'video' },
  { mode: 'static_smoke', source: 'grid' },
];

export interface SmokeVerificationBundle {
  mode: Layer2Type;
  source: string;
  config: ParticleConfig;
  runtime: NonNullable<ReturnType<typeof createFutureNativeSceneBridgeRuntime>>;
  runtimeConfig: VolumetricDensityTransportNormalizedConfig;
  descriptor: ReturnType<typeof buildFutureNativeSceneBridgeDescriptor>;
}

export function createSmokeVerificationBundle(mode: Layer2Type, source: string): SmokeVerificationBundle {
  const config = normalizeConfig({
    layer2Enabled: true,
    layer2Type: mode,
    layer2Source: source as never,
    layer2Count: mode === 'static_smoke' ? 7200 : 7800,
    layer2BaseSize: mode === 'static_smoke' ? 1.08 : 1.04,
    layer2RadiusScale: mode === 'static_smoke' ? 1.0 : 1.02,
    layer2TemporalStrength: mode === 'static_smoke' ? 0.2 : 0.26,
    layer2TemporalSpeed: mode === 'static_smoke' ? 0.14 : 0.22,
    layer2FogOpacity: mode === 'static_smoke' ? 0.28 : 0.26,
    layer2FogDensity: mode === 'static_smoke' ? 0.5 : 0.42,
    layer2FogDepth: mode === 'static_smoke' ? 0.76 : 0.82,
    layer2FogScale: mode === 'static_smoke' ? 0.94 : 1.0,
    layer2FogDrift: mode === 'static_smoke' ? 0.1 : 0.18,
    layer2FogSlices: mode === 'static_smoke' ? 22 : 24,
    layer2FogGlow: mode === 'static_smoke' ? 0.08 : 0.16,
    layer2FogAnisotropy: mode === 'static_smoke' ? 0.18 : 0.34,
    layer2ConnectionEnabled: true,
    layer2GlyphOutlineEnabled: true,
    layer2AuxEnabled: true,
    layer2SparkEnabled: true,
  });
  const runtime = createFutureNativeSceneBridgeRuntime(config, 2);
  assert(runtime, `${mode}: runtime missing`);
  assert(runtime.familyId === 'volumetric-smoke', `${mode}: family mismatch`);
  const descriptor = buildFutureNativeSceneBridgeDescriptor(runtime, config, 2);
  return {
    mode,
    source,
    config,
    runtime,
    runtimeConfig: runtime.runtime.config as VolumetricDensityTransportNormalizedConfig,
    descriptor,
  };
}

export function buildEditableSmokeVerificationConfig(config: ParticleConfig): VolumetricDensityTransportNormalizedConfig {
  return buildEditableVolumetricSmokeRuntimeConfig(config, 2, {
    smokeLightScatter: 1.24,
    smokeScatterAnisotropy: 1.36,
    smokeRimBoost: 1.08,
    smokePersistence: 1.18,
  });
}

export function buildSmokeOverrideConfig(mode: Layer2Type, config: ParticleConfig): ParticleConfig {
  return normalizeConfig({
    ...config,
    layer2SmokeOverrideEnabled: true,
    layer2SmokeInjectorBiasOverride: 1.04,
    layer2SmokePrismSeparationOverride: mode === 'prism_smoke' ? 1.22 : 0.42,
    layer2SmokePersistenceOverride: 1.12,
    layer2SmokeDensityGainOverride: 1.46,
    layer2SmokeLiftBiasOverride: 1.08,
    layer2SmokeLightScatterOverride: 1.18,
    layer2SmokeScatterAnisotropyOverride: 1.26,
    layer2SmokeRimBoostOverride: 1.02,
  });
}

export function createSmokeOverrideProject(mode: Layer2Type, config: ParticleConfig) {
  const overrideConfig = buildSmokeOverrideConfig(mode, config);
  const overrideRuntime = createFutureNativeSceneBridgeRuntime(overrideConfig, 2);
  assert(overrideRuntime, `${mode}: override runtime missing`);
  assert(overrideRuntime.familyId === 'volumetric-smoke', `${mode}: override family mismatch`);
  return {
    overrideConfig,
    overrideRuntimeConfig: overrideRuntime.runtime.config as VolumetricDensityTransportNormalizedConfig,
    overrideProject: buildVerificationProject(`${mode} smoke override project`, overrideConfig),
  };
}

export function assertSmokeEditableConfig(mode: Layer2Type, config: ParticleConfig): void {
  const editedRuntimeConfig = buildEditableSmokeVerificationConfig(config);
  assertApproxEqual(editedRuntimeConfig.smokeLightScatter, 1.24, `${mode}: editable smoke scatter override missing`);
  assertApproxEqual(editedRuntimeConfig.smokeScatterAnisotropy, 1.36, `${mode}: editable smoke anisotropy override missing`);
  assertApproxEqual(editedRuntimeConfig.smokeRimBoost, 1.08, `${mode}: editable smoke rim override missing`);
  assertApproxEqual(editedRuntimeConfig.smokePersistence, 1.18, `${mode}: editable smoke persistence override missing`);
}
