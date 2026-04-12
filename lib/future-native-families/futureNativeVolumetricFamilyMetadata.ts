import { type ParticleConfig } from '../../types';
import {
  buildEditableVolumetricAdvectionRuntimeConfig,
  buildEditableVolumetricLightShadowRuntimeConfig,
  buildEditableVolumetricPressureRuntimeConfig,
  buildEditableVolumetricSmokeRuntimeConfig,
  isVolumetricAdvectionOverrideEnabled,
  isVolumetricLightShadowOverrideEnabled,
  isVolumetricPressureOverrideEnabled,
  isVolumetricSmokeOverrideEnabled,
} from './futureNativeSceneBridgeVolumetricOverrides';
import type {
  VolumetricNumericFieldDescriptor,
  VolumetricRouteDefinition,
} from './futureNativeVolumetricRouteTypes';

export type VolumetricRouteHighlightFamilyId =
  | 'volumetric-smoke'
  | 'volumetric-advection'
  | 'volumetric-pressure-coupling'
  | 'volumetric-light-shadow-coupling';

export const smokeModes = ['prism_smoke', 'static_smoke'] as const;
export const advectionModes = ['condense_field', 'sublimate_cloud'] as const;
export const pressureModes = ['vortex_transport', 'pressure_cells'] as const;
export const lightShadowModes = ['charge_veil', 'velvet_ash'] as const;

export const smokeValueFields: readonly VolumetricNumericFieldDescriptor<any>[] = [
  { label: 'injectorBias', key: 'smokeInjectorBias' },
  { label: 'prismSeparation', key: 'smokePrismSeparation' },
  { label: 'persistence', key: 'smokePersistence' },
  { label: 'densityGain', key: 'smokeDensityGain' },
  { label: 'liftBias', key: 'smokeLiftBias' },
  { label: 'lightScatter', key: 'smokeLightScatter' },
  { label: 'scatterAnisotropy', key: 'smokeScatterAnisotropy' },
  { label: 'rimBoost', key: 'smokeRimBoost' },
];

export const smokeFocusFields: readonly VolumetricNumericFieldDescriptor<any>[] = [
  { label: 'density', key: 'smokeDensityGain' },
  { label: 'lift', key: 'smokeLiftBias' },
  { label: 'scatter', key: 'smokeLightScatter' },
  { label: 'rim', key: 'smokeRimBoost' },
];

export const advectionValueFields: readonly VolumetricNumericFieldDescriptor<any>[] = [
  { label: 'advection', key: 'advectionStrength' },
  { label: 'buoyancy', key: 'buoyancy' },
  { label: 'swirl', key: 'swirlStrength' },
  { label: 'absorption', key: 'lightAbsorption' },
  { label: 'shadow', key: 'shadowStrength' },
  { label: 'obstacle', key: 'obstacleStrength' },
  { label: 'depthLayers', key: 'depthLayers' },
  { label: 'volumeDepth', key: 'volumeDepthScale' },
];

export const advectionFocusFields: readonly VolumetricNumericFieldDescriptor<any>[] = [
  { label: 'advection', key: 'advectionStrength' },
  { label: 'buoyancy', key: 'buoyancy' },
  { label: 'obstacle', key: 'obstacleStrength' },
  { label: 'depth', key: 'volumeDepthScale' },
];

export const pressureValueFields: readonly VolumetricNumericFieldDescriptor<any>[] = [
  { label: 'pressureRelax', key: 'pressureRelaxation' },
  { label: 'pressureIterations', key: 'pressureIterations' },
  { label: 'boundaryFade', key: 'boundaryFade' },
  { label: 'swirl', key: 'swirlStrength' },
  { label: 'obstacle', key: 'obstacleStrength' },
  { label: 'softness', key: 'obstacleSoftness' },
  { label: 'depthLayers', key: 'depthLayers' },
  { label: 'volumeDepth', key: 'volumeDepthScale' },
];

export const pressureFocusFields: readonly VolumetricNumericFieldDescriptor<any>[] = [
  { label: 'projection', key: 'pressureRelaxation' },
  { label: 'iterations', key: 'pressureIterations' },
  { label: 'obstacle', key: 'obstacleStrength' },
  { label: 'depth', key: 'volumeDepthScale' },
];

export const lightShadowValueFields: readonly VolumetricNumericFieldDescriptor<any>[] = [
  { label: 'lightAbsorption', key: 'lightAbsorption' },
  { label: 'shadow', key: 'shadowStrength' },
  { label: 'lightMarch', key: 'lightMarchSteps' },
  { label: 'obstacle', key: 'obstacleStrength' },
  { label: 'depthLayers', key: 'depthLayers' },
  { label: 'volumeDepth', key: 'volumeDepthScale' },
];

export const lightShadowFocusFields: readonly VolumetricNumericFieldDescriptor<any>[] = [
  { label: 'absorption', key: 'lightAbsorption' },
  { label: 'shadow', key: 'shadowStrength' },
  { label: 'march', key: 'lightMarchSteps' },
  { label: 'depth', key: 'volumeDepthScale' },
];

export interface VolumetricRouteHighlightSpec<T extends object> {
  buildRuntimeConfig: (config: ParticleConfig, layerIndex: 2 | 3) => T;
  routeDefinitions: readonly VolumetricRouteDefinition[];
  routeFields: readonly VolumetricNumericFieldDescriptor<T>[];
  routeHighlightPrefixes: readonly string[];
  runtimeConfigPrefixes: readonly string[];
}

export interface VolumetricOverrideFieldSpec {
  configSuffix: string;
  derivedKey: string;
  label: string;
  min: number;
  max: number;
  step: number;
}

export interface VolumetricFamilyUiSpec {
  familyId: VolumetricRouteHighlightFamilyId;
  modes: readonly string[];
  authoringEntryKey: string;
  currentTuningKey: string;
  overrideEnabledKey: string;
  presetPreviewKey: string;
  runtimeValueFields: readonly VolumetricNumericFieldDescriptor<any>[];
  runtimeFocusFields: readonly VolumetricNumericFieldDescriptor<any>[];
  diagnosticsLabel: string;
  authoringTitle: string;
  authoringDescription: string;
  projectIoTitle: string;
  projectIoDerivedLabel: string;
  overrideTitle: string;
  overrideDescription: string;
  overrideToggleSuffix: string;
  isOverrideEnabled: (config: ParticleConfig, layerIndex: 2 | 3) => boolean;
  diagnosticsFilters: readonly string[];
  diagnosticsReplacements: readonly (readonly [string, string])[];
  focusFormatter: (tuning: any) => string | null;
  overrideFields: readonly VolumetricOverrideFieldSpec[];
}

export const volumetricRouteHighlightSpecs = {
  'volumetric-smoke': {
    buildRuntimeConfig: buildEditableVolumetricSmokeRuntimeConfig,
    routeDefinitions: [
      { routeId: 'prism', presetId: 'future-native-volumetric-smoke-prism', mode: 'prism_smoke' },
      { routeId: 'static', presetId: 'future-native-volumetric-smoke-static-slab', mode: 'static_smoke' },
    ],
    routeFields: [
      { label: 'density', key: 'smokeDensityGain' },
      { label: 'lift', key: 'smokeLiftBias' },
      { label: 'injector', key: 'smokeInjectorBias' },
      { label: 'prism', key: 'smokePrismSeparation' },
      { label: 'persistence', key: 'smokePersistence' },
      { label: 'scatter', key: 'smokeLightScatter' },
      { label: 'aniso', key: 'smokeScatterAnisotropy' },
      { label: 'rim', key: 'smokeRimBoost' },
    ],
    routeHighlightPrefixes: ['injector=', 'scatter=', 'rim='],
    runtimeConfigPrefixes: ['routeProfiles:', 'injectorBias:', 'lightScatter:', 'rimBoost:'],
  } satisfies VolumetricRouteHighlightSpec<any>,
  'volumetric-advection': {
    buildRuntimeConfig: buildEditableVolumetricAdvectionRuntimeConfig,
    routeDefinitions: [
      { routeId: 'condense', presetId: 'future-native-volumetric-condense-field', mode: 'condense_field' },
      { routeId: 'sublimate', presetId: 'future-native-volumetric-sublimate-cloud', mode: 'sublimate_cloud' },
    ],
    routeFields: [
      { label: 'advection', key: 'advectionStrength' },
      { label: 'buoyancy', key: 'buoyancy' },
      { label: 'swirl', key: 'swirlStrength' },
      { label: 'absorption', key: 'lightAbsorption' },
      { label: 'shadow', key: 'shadowStrength' },
      { label: 'obstacle', key: 'obstacleStrength' },
      { label: 'depthLayers', key: 'depthLayers' },
      { label: 'volumeDepth', key: 'volumeDepthScale' },
    ],
    routeHighlightPrefixes: ['buoyancy=', 'obstacle='],
    runtimeConfigPrefixes: ['routeProfiles:', 'volumeDepth:'],
  } satisfies VolumetricRouteHighlightSpec<any>,
  'volumetric-pressure-coupling': {
    buildRuntimeConfig: buildEditableVolumetricPressureRuntimeConfig,
    routeDefinitions: [
      { routeId: 'vortex', presetId: 'future-native-volumetric-pressure-vortex-column', mode: 'vortex_transport' },
      { routeId: 'cells', presetId: 'future-native-volumetric-pressure-cells-basin', mode: 'pressure_cells' },
    ],
    routeFields: [
      { label: 'pressureRelax', key: 'pressureRelaxation' },
      { label: 'pressureIterations', key: 'pressureIterations' },
      { label: 'boundaryFade', key: 'boundaryFade' },
      { label: 'swirl', key: 'swirlStrength' },
      { label: 'obstacle', key: 'obstacleStrength' },
      { label: 'softness', key: 'obstacleSoftness' },
      { label: 'depthLayers', key: 'depthLayers' },
      { label: 'volumeDepth', key: 'volumeDepthScale' },
    ],
    routeHighlightPrefixes: ['pressureRelax=', 'obstacle='],
    runtimeConfigPrefixes: ['routeProfiles:', 'volumeDepth:'],
  } satisfies VolumetricRouteHighlightSpec<any>,
  'volumetric-light-shadow-coupling': {
    buildRuntimeConfig: buildEditableVolumetricLightShadowRuntimeConfig,
    routeDefinitions: [
      { routeId: 'charge', presetId: 'future-native-volumetric-light-charge-veil', mode: 'charge_veil' },
      { routeId: 'velvet', presetId: 'future-native-volumetric-shadow-velvet-ash', mode: 'velvet_ash' },
    ],
    routeFields: [
      { label: 'lightAbsorption', key: 'lightAbsorption' },
      { label: 'shadow', key: 'shadowStrength' },
      { label: 'lightMarch', key: 'lightMarchSteps' },
      { label: 'obstacle', key: 'obstacleStrength' },
      { label: 'depthLayers', key: 'depthLayers' },
      { label: 'volumeDepth', key: 'volumeDepthScale' },
    ],
    routeHighlightPrefixes: ['lightAbsorption=', 'shadow='],
    runtimeConfigPrefixes: ['routeProfiles:', 'volumeDepth:'],
  } satisfies VolumetricRouteHighlightSpec<any>,
} as const;

const volumetricFamilyUiSpecs: readonly VolumetricFamilyUiSpec[] = [
  {
    familyId: 'volumetric-smoke',
    modes: smokeModes,
    authoringEntryKey: 'futureNativeSmokeAuthoring',
    currentTuningKey: 'futureNativeSmokeCurrentTuning',
    overrideEnabledKey: 'futureNativeSmokeOverrideEnabled',
    presetPreviewKey: 'futureNativeSmokePresetPreviews',
    runtimeValueFields: smokeValueFields,
    runtimeFocusFields: smokeFocusFields,
    diagnosticsLabel: 'smoke tuning',
    authoringTitle: 'Smoke authoring snapshot',
    authoringDescription: 'session persistence carries the current recommended bundles and editable runtime values for this smoke route.',
    projectIoTitle: 'Smoke authoring in project IO',
    projectIoDerivedLabel: 'derived route values',
    overrideTitle: 'Explicit smoke runtime override',
    overrideDescription: 'derived values follow route, fog, and source. enabling override pins the smoke runtime to explicit authoring values and persists through project export.',
    overrideToggleSuffix: 'SmokeOverrideEnabled',
    isOverrideEnabled: isVolumetricSmokeOverrideEnabled,
    diagnosticsFilters: ['densityGain', 'liftBias', 'lightScatter', 'rimBoost'],
    diagnosticsReplacements: [['densityGain', 'density'], ['lightScatter', 'scatter']],
    focusFormatter: (tuning) => null,
    overrideFields: [
      { configSuffix: 'SmokeInjectorBiasOverride', derivedKey: 'smokeInjectorBias', label: 'Injector bias', min: 0, max: 1.5, step: 0.01 },
      { configSuffix: 'SmokePrismSeparationOverride', derivedKey: 'smokePrismSeparation', label: 'Prism separation', min: 0, max: 1.5, step: 0.01 },
      { configSuffix: 'SmokePersistenceOverride', derivedKey: 'smokePersistence', label: 'Persistence', min: 0, max: 1.5, step: 0.01 },
      { configSuffix: 'SmokeDensityGainOverride', derivedKey: 'smokeDensityGain', label: 'Density gain', min: 0.2, max: 2.5, step: 0.01 },
      { configSuffix: 'SmokeLiftBiasOverride', derivedKey: 'smokeLiftBias', label: 'Lift bias', min: 0, max: 1.5, step: 0.01 },
      { configSuffix: 'SmokeLightScatterOverride', derivedKey: 'smokeLightScatter', label: 'Light scatter', min: 0, max: 1.5, step: 0.01 },
      { configSuffix: 'SmokeScatterAnisotropyOverride', derivedKey: 'smokeScatterAnisotropy', label: 'Scatter anisotropy', min: 0, max: 1.5, step: 0.01 },
      { configSuffix: 'SmokeRimBoostOverride', derivedKey: 'smokeRimBoost', label: 'Rim boost', min: 0, max: 1.5, step: 0.01 },
    ],
  },
  {
    familyId: 'volumetric-advection',
    modes: advectionModes,
    authoringEntryKey: 'futureNativeAdvectionAuthoring',
    currentTuningKey: 'futureNativeAdvectionCurrentTuning',
    overrideEnabledKey: 'futureNativeAdvectionOverrideEnabled',
    presetPreviewKey: 'futureNativeAdvectionPresetPreviews',
    runtimeValueFields: advectionValueFields,
    runtimeFocusFields: advectionFocusFields,
    diagnosticsLabel: 'advection tuning',
    authoringTitle: 'Advection authoring snapshot',
    authoringDescription: 'route-aware advection bundle selection and runtime transport values persist into project session state for condense/sublimate routes.',
    projectIoTitle: 'Volumetric advection authoring in project IO',
    projectIoDerivedLabel: 'route-aware derived values',
    overrideTitle: 'Explicit advection runtime override',
    overrideDescription: 'derived values follow route, fog, and source. enabling override pins the transport runtime to explicit advection tuning and persists through project export.',
    overrideToggleSuffix: 'AdvectionOverrideEnabled',
    isOverrideEnabled: isVolumetricAdvectionOverrideEnabled,
    diagnosticsFilters: ['advection', 'buoyancy', 'obstacle', 'volumeDepth'],
    diagnosticsReplacements: [['volumeDepth', 'depth']],
    focusFormatter: (tuning) => `focus: advection ${tuning.advectionStrength.toFixed(3)} · buoyancy ${tuning.buoyancy.toFixed(3)} · obstacle ${tuning.obstacleStrength.toFixed(3)} · depth ${tuning.volumeDepthScale.toFixed(3)}`,
    overrideFields: [
      { configSuffix: 'AdvectionStrengthOverride', derivedKey: 'advectionStrength', label: 'Advection', min: 0, max: 1.25, step: 0.01 },
      { configSuffix: 'AdvectionBuoyancyOverride', derivedKey: 'buoyancy', label: 'Buoyancy', min: -0.25, max: 0.75, step: 0.01 },
      { configSuffix: 'AdvectionSwirlStrengthOverride', derivedKey: 'swirlStrength', label: 'Swirl', min: 0, max: 1.5, step: 0.01 },
      { configSuffix: 'AdvectionLightAbsorptionOverride', derivedKey: 'lightAbsorption', label: 'Light absorption', min: 0, max: 1.5, step: 0.01 },
      { configSuffix: 'AdvectionShadowStrengthOverride', derivedKey: 'shadowStrength', label: 'Shadow strength', min: 0, max: 1.5, step: 0.01 },
      { configSuffix: 'AdvectionObstacleStrengthOverride', derivedKey: 'obstacleStrength', label: 'Obstacle strength', min: 0, max: 1, step: 0.01 },
      { configSuffix: 'AdvectionDepthLayersOverride', derivedKey: 'depthLayers', label: 'Depth layers', min: 2, max: 8, step: 1 },
      { configSuffix: 'AdvectionVolumeDepthScaleOverride', derivedKey: 'volumeDepthScale', label: 'Depth scale', min: 0.1, max: 1.6, step: 0.01 },
    ],
  },
  {
    familyId: 'volumetric-pressure-coupling',
    modes: pressureModes,
    authoringEntryKey: 'futureNativePressureAuthoring',
    currentTuningKey: 'futureNativePressureCurrentTuning',
    overrideEnabledKey: 'futureNativePressureOverrideEnabled',
    presetPreviewKey: 'futureNativePressurePresetPreviews',
    runtimeValueFields: pressureValueFields,
    runtimeFocusFields: pressureFocusFields,
    diagnosticsLabel: 'pressure tuning',
    authoringTitle: 'Pressure authoring snapshot',
    authoringDescription: 'route-aware projection bundle selection and pressure-centric runtime values persist into project session state for vortex/cells routes.',
    projectIoTitle: 'Volumetric pressure authoring in project IO',
    projectIoDerivedLabel: 'route-aware projection values',
    overrideTitle: 'Explicit pressure runtime override',
    overrideDescription: 'derived values follow route, fog, and source. enabling override pins projection, obstacle, and depth shaping to explicit pressure tuning and persists through project export.',
    overrideToggleSuffix: 'PressureOverrideEnabled',
    isOverrideEnabled: isVolumetricPressureOverrideEnabled,
    diagnosticsFilters: ['pressureRelax', 'pressureIterations', 'obstacle', 'volumeDepth'],
    diagnosticsReplacements: [['pressureRelax', 'projection'], ['pressureIterations', 'iterations'], ['volumeDepth', 'depth']],
    focusFormatter: (tuning) => `focus: projection ${tuning.pressureRelaxation.toFixed(3)} · iterations ${tuning.pressureIterations.toFixed(3)} · obstacle ${tuning.obstacleStrength.toFixed(3)} · depth ${tuning.volumeDepthScale.toFixed(3)}`,
    overrideFields: [
      { configSuffix: 'PressureRelaxationOverride', derivedKey: 'pressureRelaxation', label: 'Pressure relax', min: 0, max: 1, step: 0.01 },
      { configSuffix: 'PressureIterationsOverride', derivedKey: 'pressureIterations', label: 'Pressure iterations', min: 1, max: 12, step: 1 },
      { configSuffix: 'PressureBoundaryFadeOverride', derivedKey: 'boundaryFade', label: 'Boundary fade', min: 0, max: 1, step: 0.01 },
      { configSuffix: 'PressureSwirlStrengthOverride', derivedKey: 'swirlStrength', label: 'Swirl', min: 0, max: 1.5, step: 0.01 },
      { configSuffix: 'PressureObstacleStrengthOverride', derivedKey: 'obstacleStrength', label: 'Obstacle strength', min: 0, max: 1, step: 0.01 },
      { configSuffix: 'PressureObstacleSoftnessOverride', derivedKey: 'obstacleSoftness', label: 'Obstacle softness', min: 0.02, max: 0.6, step: 0.01 },
      { configSuffix: 'PressureDepthLayersOverride', derivedKey: 'depthLayers', label: 'Depth layers', min: 2, max: 8, step: 1 },
      { configSuffix: 'PressureVolumeDepthScaleOverride', derivedKey: 'volumeDepthScale', label: 'Depth scale', min: 0.1, max: 1.6, step: 0.01 },
    ],
  },
  {
    familyId: 'volumetric-light-shadow-coupling',
    modes: lightShadowModes,
    authoringEntryKey: 'futureNativeLightShadowAuthoring',
    currentTuningKey: 'futureNativeLightShadowCurrentTuning',
    overrideEnabledKey: 'futureNativeLightShadowOverrideEnabled',
    presetPreviewKey: 'futureNativeLightShadowPresetPreviews',
    runtimeValueFields: lightShadowValueFields,
    runtimeFocusFields: lightShadowFocusFields,
    diagnosticsLabel: 'light/shadow tuning',
    authoringTitle: 'Light/shadow authoring snapshot',
    authoringDescription: 'route-aware lighting bundles and attenuation values persist into project session state for charge/shadow routes.',
    projectIoTitle: 'Volumetric light/shadow authoring in project IO',
    projectIoDerivedLabel: 'route-aware lighting values',
    overrideTitle: 'Explicit light/shadow runtime override',
    overrideDescription: 'derived values follow route, fog, and source. enabling override pins attenuation, shadow, march steps, obstacle shaping, and depth layering to explicit lighting values.',
    overrideToggleSuffix: 'LightShadowOverrideEnabled',
    isOverrideEnabled: isVolumetricLightShadowOverrideEnabled,
    diagnosticsFilters: ['lightAbsorption', 'shadow', 'lightMarch', 'volumeDepth', 'lightExtinction', 'occlusion'],
    diagnosticsReplacements: [['lightAbsorption', 'absorption'], ['lightMarch', 'march'], ['volumeDepth', 'depth'], ['lightExtinction', 'extinction']],
    focusFormatter: (tuning) => `focus: absorption ${tuning.lightAbsorption.toFixed(3)} · shadow ${tuning.shadowStrength.toFixed(3)} · march ${tuning.lightMarchSteps.toFixed(3)} · depth ${tuning.volumeDepthScale.toFixed(3)}`,
    overrideFields: [
      { configSuffix: 'LightAbsorptionOverride', derivedKey: 'lightAbsorption', label: 'Light absorption', min: 0, max: 1.5, step: 0.01 },
      { configSuffix: 'LightShadowStrengthOverride', derivedKey: 'shadowStrength', label: 'Shadow strength', min: 0, max: 1.5, step: 0.01 },
      { configSuffix: 'LightMarchStepsOverride', derivedKey: 'lightMarchSteps', label: 'Light march', min: 2, max: 16, step: 1 },
      { configSuffix: 'LightObstacleStrengthOverride', derivedKey: 'obstacleStrength', label: 'Obstacle strength', min: 0, max: 1, step: 0.01 },
      { configSuffix: 'LightDepthLayersOverride', derivedKey: 'depthLayers', label: 'Depth layers', min: 2, max: 8, step: 1 },
      { configSuffix: 'LightVolumeDepthScaleOverride', derivedKey: 'volumeDepthScale', label: 'Depth scale', min: 0.1, max: 1.6, step: 0.01 },
    ],
  },
];

export type VolumetricAuthoringEntryKey = (typeof volumetricFamilyUiSpecs)[number]['authoringEntryKey'];
export type VolumetricCurrentTuningKey = (typeof volumetricFamilyUiSpecs)[number]['currentTuningKey'];
export type VolumetricOverrideEnabledKey = (typeof volumetricFamilyUiSpecs)[number]['overrideEnabledKey'];
export type VolumetricPresetPreviewKey = (typeof volumetricFamilyUiSpecs)[number]['presetPreviewKey'];

export function getVolumetricRouteHighlightSpec(familyId: VolumetricRouteHighlightFamilyId) {
  return volumetricRouteHighlightSpecs[familyId];
}

export function isVolumetricRouteHighlightFamilyId(familyId: string): familyId is VolumetricRouteHighlightFamilyId {
  return familyId in volumetricRouteHighlightSpecs;
}

export function getVolumetricFamilyUiSpecs(): readonly VolumetricFamilyUiSpec[] {
  return volumetricFamilyUiSpecs;
}

export function getVolumetricFamilyUiSpecByAuthoringKey(authoringEntryKey: string): VolumetricFamilyUiSpec | null {
  return volumetricFamilyUiSpecs.find((spec) => spec.authoringEntryKey === authoringEntryKey) ?? null;
}

export function getVolumetricFamilyUiSpecByFamilyId(familyId: VolumetricRouteHighlightFamilyId): VolumetricFamilyUiSpec {
  return volumetricFamilyUiSpecs.find((spec) => spec.familyId === familyId) as VolumetricFamilyUiSpec;
}

export function resolveVolumetricPresetPreviewFocusValues(
  presetId: string,
  presetPreviews: Record<string, readonly { presetId: string; focusValues: readonly string[] }[]>,
): string[] {
  for (const spec of volumetricFamilyUiSpecs) {
    const previews = presetPreviews[spec.presetPreviewKey];
    const match = previews?.find((preview) => preview.presetId === presetId);
    if (match) return [...match.focusValues];
  }
  return [];
}

export function formatVolumetricDiagnosticFocusValues(
  authoringEntryKey: string,
  runtimeConfigValues: readonly string[],
): string {
  const spec = getVolumetricFamilyUiSpecByAuthoringKey(authoringEntryKey);
  if (!spec) return '';
  return runtimeConfigValues
    .filter((value) => spec.diagnosticsFilters.some((filter) => value.startsWith(`${filter}:`)))
    .map((value) => spec.diagnosticsReplacements.reduce((next, [from, to]) => next.replace(from, to), value))
    .join(' · ');
}

export function buildVolumetricOverrideFieldsFromSpec(
  config: ParticleConfig,
  layerIndex: 2 | 3,
  tuning: Record<string, number>,
  spec: VolumetricFamilyUiSpec,
) {
  const prefix = layerIndex === 2 ? 'layer2' : 'layer3';
  const configValues = config as unknown as Record<string, number>;
  return spec.overrideFields.map((field) => {
    const configKey = `${prefix}${field.configSuffix}`;
    const derivedValue = tuning[field.derivedKey];
    return {
      configKey: configKey as keyof ParticleConfig,
      label: field.label,
      min: field.min,
      max: field.max,
      step: field.step,
      value: configValues[configKey] ?? derivedValue,
      derivedValue,
    };
  });
}
