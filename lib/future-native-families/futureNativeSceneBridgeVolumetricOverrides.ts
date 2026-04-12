import type { ParticleConfig } from '../../types';
import { clamp } from './futureNativeSceneBridgeShared';
import {
  buildVolumetricDensityTransportInput,
  buildVolumetricLightShadowCouplingInput,
  buildVolumetricPressureCouplingInput,
  buildVolumetricSmokeInput,
} from './futureNativeSceneBridgeVolumetricInputs';
import { buildFutureNativeVolumetricAdvectionInput } from './futureNativeSceneBridgeVolumetricAdvection';
import { normalizeVolumetricDensityTransportConfig, type VolumetricDensityTransportInputConfig } from './starter-runtime/volumetric_density_transportAdapter';
import type { VolumetricDensityTransportNormalizedConfig } from './starter-runtime/volumetric_density_transportSchema';
import { volumetricDensityTransportUiSections } from './starter-runtime/volumetric_density_transportUi';
import { volumetricSmokeUiSections } from './starter-runtime/volumetric_smokeUi';

export type VolumetricUiOverrideValue = boolean | number | string | null | undefined;
export type VolumetricUiOverrides = Record<string, VolumetricUiOverrideValue>;
type VolumetricConfigPrefix = 'layer2' | 'layer3';

function getVolumetricConfigPrefix(layerIndex: 2 | 3): VolumetricConfigPrefix {
  return layerIndex === 2 ? 'layer2' : 'layer3';
}

function applyVolumetricUiOverrides(
  input: VolumetricDensityTransportInputConfig,
  controls: readonly { controls: readonly { key: string; kind: string; min?: number; max?: number; options?: readonly string[] }[] }[],
  overrides?: VolumetricUiOverrides,
): VolumetricDensityTransportInputConfig {
  if (!overrides) return { ...input };
  const next: VolumetricDensityTransportInputConfig = { ...input };
  for (const section of controls) {
    for (const control of section.controls) {
      const value = overrides[control.key];
      if (value === null || value === undefined) continue;
      if (control.kind === 'slider' && typeof value === 'number' && Number.isFinite(value)) {
        next[control.key as keyof VolumetricDensityTransportInputConfig] = clamp(value, control.min ?? value, control.max ?? value) as never;
        continue;
      }
      if (control.kind === 'toggle' && typeof value === 'boolean') {
        next[control.key as keyof VolumetricDensityTransportInputConfig] = value as never;
        continue;
      }
      if (control.kind === 'select' && typeof value === 'string' && control.options?.includes(value)) {
        next[control.key as keyof VolumetricDensityTransportInputConfig] = value as never;
      }
    }
  }
  return next;
}

export function isVolumetricSmokeOverrideEnabled(config: ParticleConfig, layerIndex: 2 | 3): boolean {
  const prefix = getVolumetricConfigPrefix(layerIndex);
  return Boolean(config[`${prefix}SmokeOverrideEnabled` as keyof ParticleConfig]);
}

function getVolumetricSmokeConfigOverrides(config: ParticleConfig, layerIndex: 2 | 3): VolumetricUiOverrides | undefined {
  const prefix = getVolumetricConfigPrefix(layerIndex);
  if (!isVolumetricSmokeOverrideEnabled(config, layerIndex)) return undefined;
  return {
    smokeInjectorBias: config[`${prefix}SmokeInjectorBiasOverride` as keyof ParticleConfig] as number,
    smokePrismSeparation: config[`${prefix}SmokePrismSeparationOverride` as keyof ParticleConfig] as number,
    smokePersistence: config[`${prefix}SmokePersistenceOverride` as keyof ParticleConfig] as number,
    smokeDensityGain: config[`${prefix}SmokeDensityGainOverride` as keyof ParticleConfig] as number,
    smokeLiftBias: config[`${prefix}SmokeLiftBiasOverride` as keyof ParticleConfig] as number,
    smokeLightScatter: config[`${prefix}SmokeLightScatterOverride` as keyof ParticleConfig] as number,
    smokeScatterAnisotropy: config[`${prefix}SmokeScatterAnisotropyOverride` as keyof ParticleConfig] as number,
    smokeRimBoost: config[`${prefix}SmokeRimBoostOverride` as keyof ParticleConfig] as number,
  };
}

export function buildEditableVolumetricSmokeRuntimeConfig(
  config: ParticleConfig,
  layerIndex: 2 | 3,
  overrides?: VolumetricUiOverrides,
): VolumetricDensityTransportNormalizedConfig {
  return normalizeVolumetricDensityTransportConfig(
    applyVolumetricUiOverrides(buildVolumetricSmokeInput(config, layerIndex), volumetricSmokeUiSections, {
      ...(getVolumetricSmokeConfigOverrides(config, layerIndex) ?? {}),
      ...(overrides ?? {}),
    }),
  );
}

export function isVolumetricAdvectionOverrideEnabled(config: ParticleConfig, layerIndex: 2 | 3): boolean {
  const prefix = getVolumetricConfigPrefix(layerIndex);
  return Boolean(config[`${prefix}AdvectionOverrideEnabled` as keyof ParticleConfig]);
}

function getVolumetricAdvectionConfigOverrides(config: ParticleConfig, layerIndex: 2 | 3): VolumetricUiOverrides | undefined {
  const prefix = getVolumetricConfigPrefix(layerIndex);
  if (!isVolumetricAdvectionOverrideEnabled(config, layerIndex)) return undefined;
  return {
    advectionStrength: config[`${prefix}AdvectionStrengthOverride` as keyof ParticleConfig] as number,
    buoyancy: config[`${prefix}AdvectionBuoyancyOverride` as keyof ParticleConfig] as number,
    swirlStrength: config[`${prefix}AdvectionSwirlStrengthOverride` as keyof ParticleConfig] as number,
    lightAbsorption: config[`${prefix}AdvectionLightAbsorptionOverride` as keyof ParticleConfig] as number,
    shadowStrength: config[`${prefix}AdvectionShadowStrengthOverride` as keyof ParticleConfig] as number,
    obstacleStrength: config[`${prefix}AdvectionObstacleStrengthOverride` as keyof ParticleConfig] as number,
    depthLayers: config[`${prefix}AdvectionDepthLayersOverride` as keyof ParticleConfig] as number,
    volumeDepthScale: config[`${prefix}AdvectionVolumeDepthScaleOverride` as keyof ParticleConfig] as number,
  };
}

export function buildEditableVolumetricAdvectionRuntimeConfig(
  config: ParticleConfig,
  layerIndex: 2 | 3,
  overrides?: VolumetricUiOverrides,
): VolumetricDensityTransportNormalizedConfig {
  return normalizeVolumetricDensityTransportConfig(
    applyVolumetricUiOverrides(buildFutureNativeVolumetricAdvectionInput(config, layerIndex), volumetricDensityTransportUiSections, {
      ...(getVolumetricAdvectionConfigOverrides(config, layerIndex) ?? {}),
      ...(overrides ?? {}),
    }),
  );
}

export function isVolumetricPressureOverrideEnabled(config: ParticleConfig, layerIndex: 2 | 3): boolean {
  const prefix = getVolumetricConfigPrefix(layerIndex);
  return Boolean(config[`${prefix}PressureOverrideEnabled` as keyof ParticleConfig]);
}

function getVolumetricPressureConfigOverrides(config: ParticleConfig, layerIndex: 2 | 3): VolumetricUiOverrides | undefined {
  const prefix = getVolumetricConfigPrefix(layerIndex);
  if (!isVolumetricPressureOverrideEnabled(config, layerIndex)) return undefined;
  return {
    pressureRelaxation: config[`${prefix}PressureRelaxationOverride` as keyof ParticleConfig] as number,
    pressureIterations: config[`${prefix}PressureIterationsOverride` as keyof ParticleConfig] as number,
    boundaryFade: config[`${prefix}PressureBoundaryFadeOverride` as keyof ParticleConfig] as number,
    swirlStrength: config[`${prefix}PressureSwirlStrengthOverride` as keyof ParticleConfig] as number,
    obstacleStrength: config[`${prefix}PressureObstacleStrengthOverride` as keyof ParticleConfig] as number,
    obstacleSoftness: config[`${prefix}PressureObstacleSoftnessOverride` as keyof ParticleConfig] as number,
    depthLayers: config[`${prefix}PressureDepthLayersOverride` as keyof ParticleConfig] as number,
    volumeDepthScale: config[`${prefix}PressureVolumeDepthScaleOverride` as keyof ParticleConfig] as number,
  };
}

export function buildEditableVolumetricPressureRuntimeConfig(
  config: ParticleConfig,
  layerIndex: 2 | 3,
  overrides?: VolumetricUiOverrides,
): VolumetricDensityTransportNormalizedConfig {
  return normalizeVolumetricDensityTransportConfig(
    applyVolumetricUiOverrides(buildVolumetricPressureCouplingInput(config, layerIndex), volumetricDensityTransportUiSections, {
      ...(getVolumetricPressureConfigOverrides(config, layerIndex) ?? {}),
      ...(overrides ?? {}),
    }),
  );
}

export function isVolumetricLightShadowOverrideEnabled(config: ParticleConfig, layerIndex: 2 | 3): boolean {
  const prefix = getVolumetricConfigPrefix(layerIndex);
  return Boolean(config[`${prefix}LightShadowOverrideEnabled` as keyof ParticleConfig]);
}

function getVolumetricLightShadowConfigOverrides(config: ParticleConfig, layerIndex: 2 | 3): VolumetricUiOverrides | undefined {
  const prefix = getVolumetricConfigPrefix(layerIndex);
  if (!isVolumetricLightShadowOverrideEnabled(config, layerIndex)) return undefined;
  return {
    lightAbsorption: config[`${prefix}LightAbsorptionOverride` as keyof ParticleConfig] as number,
    shadowStrength: config[`${prefix}LightShadowStrengthOverride` as keyof ParticleConfig] as number,
    lightMarchSteps: config[`${prefix}LightMarchStepsOverride` as keyof ParticleConfig] as number,
    obstacleStrength: config[`${prefix}LightObstacleStrengthOverride` as keyof ParticleConfig] as number,
    depthLayers: config[`${prefix}LightDepthLayersOverride` as keyof ParticleConfig] as number,
    volumeDepthScale: config[`${prefix}LightVolumeDepthScaleOverride` as keyof ParticleConfig] as number,
  };
}

export function buildEditableVolumetricLightShadowRuntimeConfig(
  config: ParticleConfig,
  layerIndex: 2 | 3,
  overrides?: VolumetricUiOverrides,
): VolumetricDensityTransportNormalizedConfig {
  return normalizeVolumetricDensityTransportConfig(
    applyVolumetricUiOverrides(buildVolumetricLightShadowCouplingInput(config, layerIndex), volumetricDensityTransportUiSections, {
      ...(getVolumetricLightShadowConfigOverrides(config, layerIndex) ?? {}),
      ...(overrides ?? {}),
    }),
  );
}
