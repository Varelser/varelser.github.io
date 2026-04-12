import type {
  ParticleConfig,
  ProjectFutureNativeVolumetricAuthoringEntry,
  ProjectFutureNativeVolumetricAuthoringStateSet as ProjectFutureNativeVolumetricAuthoringStateShape,
} from '../../types';
import {
  buildVolumetricAuthoringEntry,
  buildVolumetricAuthoringState,
  formatVolumetricNumericFields,
} from './futureNativeVolumetricAuthoringShared';
import {
  buildEditableVolumetricAdvectionRuntimeConfig,
  buildEditableVolumetricLightShadowRuntimeConfig,
  buildEditableVolumetricPressureRuntimeConfig,
  buildEditableVolumetricSmokeRuntimeConfig,
} from './futureNativeSceneBridgeVolumetricOverrides';
import {
  advectionFocusFields,
  advectionModes,
  advectionValueFields,
  type VolumetricAuthoringEntryKey,
  type VolumetricCurrentTuningKey,
  type VolumetricRouteHighlightFamilyId,
  type VolumetricPresetPreviewKey,
  getVolumetricFamilyUiSpecs,
  lightShadowFocusFields,
  lightShadowModes,
  lightShadowValueFields,
  pressureFocusFields,
  pressureModes,
  pressureValueFields,
  smokeFocusFields,
  smokeModes,
  smokeValueFields,
} from './futureNativeVolumetricFamilyMetadata';
import {
  buildEmptyFutureNativeVolumetricCurrentTuningSet,
  buildEmptyFutureNativeVolumetricPresetPreviewSet,
  buildVolumetricPresetPreviewFromSpec,
  buildVolumetricRuntimeTuningSnapshotFromSpec,
  type FutureNativeVolumetricCurrentTuningSet,
  type FutureNativeVolumetricPresetPreviewSet,
} from './futureNativeVolumetricStateSets';

export interface VolumetricSmokeRuntimeTuningSnapshot {
  smokeInjectorBias: number;
  smokePrismSeparation: number;
  smokePersistence: number;
  smokeDensityGain: number;
  smokeLiftBias: number;
  smokeLightScatter: number;
  smokeScatterAnisotropy: number;
  smokeRimBoost: number;
}

export interface VolumetricSmokePresetPreview {
  presetId: string;
  values: string[];
  focusValues: string[];
}

export interface VolumetricAdvectionRuntimeTuningSnapshot {
  advectionStrength: number;
  buoyancy: number;
  swirlStrength: number;
  lightAbsorption: number;
  shadowStrength: number;
  obstacleStrength: number;
  depthLayers: number;
  volumeDepthScale: number;
}

export interface VolumetricAdvectionPresetPreview {
  presetId: string;
  values: string[];
  focusValues: string[];
}

export interface VolumetricPressureRuntimeTuningSnapshot {
  pressureRelaxation: number;
  pressureIterations: number;
  boundaryFade: number;
  swirlStrength: number;
  obstacleStrength: number;
  obstacleSoftness: number;
  depthLayers: number;
  volumeDepthScale: number;
}

export interface VolumetricPressurePresetPreview {
  presetId: string;
  values: string[];
  focusValues: string[];
}

export interface VolumetricLightShadowRuntimeTuningSnapshot {
  lightAbsorption: number;
  shadowStrength: number;
  lightMarchSteps: number;
  obstacleStrength: number;
  depthLayers: number;
  volumeDepthScale: number;
}

export interface VolumetricLightShadowPresetPreview {
  presetId: string;
  values: string[];
  focusValues: string[];
}

type AuthoringEntryItem<T> = T extends Array<infer U> ? U : never;

export type FutureNativeVolumetricAuthoringEntrySet = {
  [K in keyof ProjectFutureNativeVolumetricAuthoringStateShape]: AuthoringEntryItem<ProjectFutureNativeVolumetricAuthoringStateShape[K]> | null;
};

export type FutureNativeVolumetricAuthoringStateSet = ProjectFutureNativeVolumetricAuthoringStateShape;
export type {
  FutureNativeVolumetricCurrentTuningSet,
  FutureNativeVolumetricOverrideEnabledSet,
  FutureNativeVolumetricPresetPreviewEntry,
  FutureNativeVolumetricPresetPreviewSet,
} from './futureNativeVolumetricStateSets';
export {
  buildEmptyFutureNativeVolumetricCurrentTuningSet,
  buildEmptyFutureNativeVolumetricOverrideEnabledSet,
  buildEmptyFutureNativeVolumetricPresetPreviewSet,
  buildFutureNativeVolumetricOverrideEnabledSet,
} from './futureNativeVolumetricStateSets';

function buildFutureNativeVolumetricAuthoringEntryByFamilyId(
  config: ParticleConfig,
  layerIndex: 2 | 3,
  familyId: 'volumetric-smoke' | 'volumetric-advection' | 'volumetric-pressure-coupling' | 'volumetric-light-shadow-coupling',
): ProjectFutureNativeVolumetricAuthoringEntry | null {
  switch (familyId) {
    case 'volumetric-smoke':
      return buildFutureNativeSmokeAuthoringEntry(config, layerIndex);
    case 'volumetric-advection':
      return buildFutureNativeAdvectionAuthoringEntry(config, layerIndex);
    case 'volumetric-pressure-coupling':
      return buildFutureNativePressureAuthoringEntry(config, layerIndex);
    case 'volumetric-light-shadow-coupling':
      return buildFutureNativeLightShadowAuthoringEntry(config, layerIndex);
  }
}

function buildProjectFutureNativeVolumetricAuthoringStateByFamilyId(
  config: ParticleConfig,
  familyId: 'volumetric-smoke' | 'volumetric-advection' | 'volumetric-pressure-coupling' | 'volumetric-light-shadow-coupling',
): ProjectFutureNativeVolumetricAuthoringEntry[] {
  switch (familyId) {
    case 'volumetric-smoke':
      return buildProjectFutureNativeSmokeAuthoringState(config);
    case 'volumetric-advection':
      return buildProjectFutureNativeAdvectionAuthoringState(config);
    case 'volumetric-pressure-coupling':
      return buildProjectFutureNativePressureAuthoringState(config);
    case 'volumetric-light-shadow-coupling':
      return buildProjectFutureNativeLightShadowAuthoringState(config);
  }
}

export function buildEmptyFutureNativeVolumetricAuthoringEntrySet(): FutureNativeVolumetricAuthoringEntrySet {
  const empty = {} as FutureNativeVolumetricAuthoringEntrySet;
  for (const spec of getVolumetricFamilyUiSpecs()) {
    const key = spec.authoringEntryKey as keyof FutureNativeVolumetricAuthoringEntrySet;
    empty[key] = null;
  }
  return empty;
}

export function buildEmptyProjectFutureNativeVolumetricAuthoringStateSet(): FutureNativeVolumetricAuthoringStateSet {
  const empty = {} as FutureNativeVolumetricAuthoringStateSet;
  for (const spec of getVolumetricFamilyUiSpecs()) {
    const key = spec.authoringEntryKey as keyof FutureNativeVolumetricAuthoringStateSet;
    empty[key] = [] as ProjectFutureNativeVolumetricAuthoringEntry[];
  }
  return empty;
}

export function buildVolumetricSmokeRuntimeTuningSnapshot(
  config: ParticleConfig,
  layerIndex: 2 | 3,
): VolumetricSmokeRuntimeTuningSnapshot | null {
  const mode = layerIndex === 2 ? config.layer2Type : config.layer3Type;
  if (!smokeModes.includes(mode as (typeof smokeModes)[number])) return null;
  const runtimeConfig = buildEditableVolumetricSmokeRuntimeConfig(config, layerIndex);
  return {
    smokeInjectorBias: runtimeConfig.smokeInjectorBias,
    smokePrismSeparation: runtimeConfig.smokePrismSeparation,
    smokePersistence: runtimeConfig.smokePersistence,
    smokeDensityGain: runtimeConfig.smokeDensityGain,
    smokeLiftBias: runtimeConfig.smokeLiftBias,
    smokeLightScatter: runtimeConfig.smokeLightScatter,
    smokeScatterAnisotropy: runtimeConfig.smokeScatterAnisotropy,
    smokeRimBoost: runtimeConfig.smokeRimBoost,
  };
}

export function formatVolumetricSmokeRuntimeTuningValues(snapshot: VolumetricSmokeRuntimeTuningSnapshot): string[] {
  return formatVolumetricNumericFields(snapshot, smokeValueFields);
}

export function formatVolumetricSmokeRuntimeFocusValues(snapshot: VolumetricSmokeRuntimeTuningSnapshot): string[] {
  return formatVolumetricNumericFields(snapshot, smokeFocusFields);
}

export function buildVolumetricSmokePresetPreview(
  presetId: string,
  layerIndex: 2 | 3,
): VolumetricSmokePresetPreview | null {
  return buildVolumetricPresetPreviewFromSpec(presetId, layerIndex, 'volumetric-smoke') as VolumetricSmokePresetPreview | null;
}

export function buildFutureNativeSmokeAuthoringEntry(
  config: ParticleConfig,
  layerIndex: 2 | 3,
): ProjectFutureNativeVolumetricAuthoringEntry | null {
  return buildVolumetricAuthoringEntry(config, layerIndex, smokeModes, 'volumetric-smoke', buildVolumetricSmokeRuntimeTuningSnapshot, smokeValueFields);
}

export function buildProjectFutureNativeSmokeAuthoringState(config: ParticleConfig): ProjectFutureNativeVolumetricAuthoringEntry[] {
  return buildVolumetricAuthoringState(config, buildFutureNativeSmokeAuthoringEntry);
}

export function buildVolumetricAdvectionRuntimeTuningSnapshot(
  config: ParticleConfig,
  layerIndex: 2 | 3,
): VolumetricAdvectionRuntimeTuningSnapshot | null {
  const mode = layerIndex === 2 ? config.layer2Type : config.layer3Type;
  if (!advectionModes.includes(mode as (typeof advectionModes)[number])) return null;
  const runtimeConfig = buildEditableVolumetricAdvectionRuntimeConfig(config, layerIndex);
  return {
    advectionStrength: runtimeConfig.advectionStrength,
    buoyancy: runtimeConfig.buoyancy,
    swirlStrength: runtimeConfig.swirlStrength,
    lightAbsorption: runtimeConfig.lightAbsorption,
    shadowStrength: runtimeConfig.shadowStrength,
    obstacleStrength: runtimeConfig.obstacleStrength,
    depthLayers: runtimeConfig.depthLayers,
    volumeDepthScale: runtimeConfig.volumeDepthScale,
  };
}

export function formatVolumetricAdvectionRuntimeTuningValues(snapshot: VolumetricAdvectionRuntimeTuningSnapshot): string[] {
  return formatVolumetricNumericFields(snapshot, advectionValueFields);
}

export function formatVolumetricAdvectionRuntimeFocusValues(snapshot: VolumetricAdvectionRuntimeTuningSnapshot): string[] {
  return formatVolumetricNumericFields(snapshot, advectionFocusFields);
}

export function buildVolumetricAdvectionPresetPreview(
  presetId: string,
  layerIndex: 2 | 3,
): VolumetricAdvectionPresetPreview | null {
  return buildVolumetricPresetPreviewFromSpec(presetId, layerIndex, 'volumetric-advection') as VolumetricAdvectionPresetPreview | null;
}

export function buildFutureNativeAdvectionAuthoringEntry(
  config: ParticleConfig,
  layerIndex: 2 | 3,
): ProjectFutureNativeVolumetricAuthoringEntry | null {
  return buildVolumetricAuthoringEntry(config, layerIndex, advectionModes, 'volumetric-advection', buildVolumetricAdvectionRuntimeTuningSnapshot, advectionValueFields);
}

export function buildProjectFutureNativeAdvectionAuthoringState(config: ParticleConfig): ProjectFutureNativeVolumetricAuthoringEntry[] {
  return buildVolumetricAuthoringState(config, buildFutureNativeAdvectionAuthoringEntry);
}

export function buildVolumetricPressureRuntimeTuningSnapshot(
  config: ParticleConfig,
  layerIndex: 2 | 3,
): VolumetricPressureRuntimeTuningSnapshot | null {
  const mode = layerIndex === 2 ? config.layer2Type : config.layer3Type;
  if (!pressureModes.includes(mode as (typeof pressureModes)[number])) return null;
  const runtimeConfig = buildEditableVolumetricPressureRuntimeConfig(config, layerIndex);
  return {
    pressureRelaxation: runtimeConfig.pressureRelaxation,
    pressureIterations: runtimeConfig.pressureIterations,
    boundaryFade: runtimeConfig.boundaryFade,
    swirlStrength: runtimeConfig.swirlStrength,
    obstacleStrength: runtimeConfig.obstacleStrength,
    obstacleSoftness: runtimeConfig.obstacleSoftness,
    depthLayers: runtimeConfig.depthLayers,
    volumeDepthScale: runtimeConfig.volumeDepthScale,
  };
}

export function formatVolumetricPressureRuntimeTuningValues(snapshot: VolumetricPressureRuntimeTuningSnapshot): string[] {
  return formatVolumetricNumericFields(snapshot, pressureValueFields);
}

export function formatVolumetricPressureRuntimeFocusValues(snapshot: VolumetricPressureRuntimeTuningSnapshot): string[] {
  return formatVolumetricNumericFields(snapshot, pressureFocusFields);
}

export function buildVolumetricPressurePresetPreview(
  presetId: string,
  layerIndex: 2 | 3,
): VolumetricPressurePresetPreview | null {
  return buildVolumetricPresetPreviewFromSpec(presetId, layerIndex, 'volumetric-pressure-coupling') as VolumetricPressurePresetPreview | null;
}

export function buildFutureNativePressureAuthoringEntry(
  config: ParticleConfig,
  layerIndex: 2 | 3,
): ProjectFutureNativeVolumetricAuthoringEntry | null {
  return buildVolumetricAuthoringEntry(config, layerIndex, pressureModes, 'volumetric-pressure-coupling', buildVolumetricPressureRuntimeTuningSnapshot, pressureValueFields);
}

export function buildProjectFutureNativePressureAuthoringState(config: ParticleConfig): ProjectFutureNativeVolumetricAuthoringEntry[] {
  return buildVolumetricAuthoringState(config, buildFutureNativePressureAuthoringEntry);
}

export function buildVolumetricLightShadowRuntimeTuningSnapshot(
  config: ParticleConfig,
  layerIndex: 2 | 3,
): VolumetricLightShadowRuntimeTuningSnapshot | null {
  const mode = layerIndex === 2 ? config.layer2Type : config.layer3Type;
  if (!lightShadowModes.includes(mode as (typeof lightShadowModes)[number])) return null;
  const runtimeConfig = buildEditableVolumetricLightShadowRuntimeConfig(config, layerIndex);
  return {
    lightAbsorption: runtimeConfig.lightAbsorption,
    shadowStrength: runtimeConfig.shadowStrength,
    lightMarchSteps: runtimeConfig.lightMarchSteps,
    obstacleStrength: runtimeConfig.obstacleStrength,
    depthLayers: runtimeConfig.depthLayers,
    volumeDepthScale: runtimeConfig.volumeDepthScale,
  };
}

export function formatVolumetricLightShadowRuntimeTuningValues(snapshot: VolumetricLightShadowRuntimeTuningSnapshot): string[] {
  return formatVolumetricNumericFields(snapshot, lightShadowValueFields);
}

export function formatVolumetricLightShadowRuntimeFocusValues(snapshot: VolumetricLightShadowRuntimeTuningSnapshot): string[] {
  return formatVolumetricNumericFields(snapshot, lightShadowFocusFields);
}

export function buildVolumetricLightShadowPresetPreview(
  presetId: string,
  layerIndex: 2 | 3,
): VolumetricLightShadowPresetPreview | null {
  return buildVolumetricPresetPreviewFromSpec(presetId, layerIndex, 'volumetric-light-shadow-coupling') as VolumetricLightShadowPresetPreview | null;
}

export function buildFutureNativeLightShadowAuthoringEntry(
  config: ParticleConfig,
  layerIndex: 2 | 3,
): ProjectFutureNativeVolumetricAuthoringEntry | null {
  return buildVolumetricAuthoringEntry(config, layerIndex, lightShadowModes, 'volumetric-light-shadow-coupling', buildVolumetricLightShadowRuntimeTuningSnapshot, lightShadowValueFields);
}

export function buildProjectFutureNativeLightShadowAuthoringState(config: ParticleConfig): ProjectFutureNativeVolumetricAuthoringEntry[] {
  return buildVolumetricAuthoringState(config, buildFutureNativeLightShadowAuthoringEntry);
}

export function buildFutureNativeVolumetricAuthoringEntrySet(
  config: ParticleConfig,
  layerIndex: 2 | 3,
): FutureNativeVolumetricAuthoringEntrySet {
  const entrySet = buildEmptyFutureNativeVolumetricAuthoringEntrySet();
  for (const spec of getVolumetricFamilyUiSpecs()) {
    const key = spec.authoringEntryKey as keyof FutureNativeVolumetricAuthoringEntrySet;
    entrySet[key] = buildFutureNativeVolumetricAuthoringEntryByFamilyId(config, layerIndex, spec.familyId);
  }
  return entrySet;
}

export function buildProjectFutureNativeVolumetricAuthoringStateSet(
  config: ParticleConfig,
): FutureNativeVolumetricAuthoringStateSet {
  const stateSet = buildEmptyProjectFutureNativeVolumetricAuthoringStateSet();
  for (const spec of getVolumetricFamilyUiSpecs()) {
    const key = spec.authoringEntryKey as keyof FutureNativeVolumetricAuthoringStateSet;
    stateSet[key] = buildProjectFutureNativeVolumetricAuthoringStateByFamilyId(config, spec.familyId);
  }
  return stateSet;
}

export function buildFutureNativeVolumetricCurrentTuningSet(
  config: ParticleConfig,
  layerIndex: 2 | 3,
): FutureNativeVolumetricCurrentTuningSet {
  const tuningSet = buildEmptyFutureNativeVolumetricCurrentTuningSet();
  for (const spec of getVolumetricFamilyUiSpecs()) {
    tuningSet[spec.currentTuningKey as VolumetricCurrentTuningKey] = buildVolumetricRuntimeTuningSnapshotFromSpec(config, layerIndex, spec.familyId);
  }
  return tuningSet;
}

export function buildFutureNativeVolumetricPresetPreviewSet(
  recommendedPresetIds: string[],
  layerIndex: 2 | 3,
): FutureNativeVolumetricPresetPreviewSet {
  const previewSet = buildEmptyFutureNativeVolumetricPresetPreviewSet();
  for (const spec of getVolumetricFamilyUiSpecs()) {
    previewSet[spec.presetPreviewKey as VolumetricPresetPreviewKey] = recommendedPresetIds
      .map((presetId) => buildVolumetricPresetPreviewFromSpec(presetId, layerIndex, spec.familyId))
      .filter((preview): preview is NonNullable<typeof preview> => preview !== null);
  }
  return previewSet;
}

export function getProjectFutureNativeVolumetricAuthoringEntries(
  stateSet: ProjectFutureNativeVolumetricAuthoringStateShape,
  familyId?: VolumetricRouteHighlightFamilyId,
): ProjectFutureNativeVolumetricAuthoringEntry[] {
  const stateRecord = stateSet as unknown as Record<string, ProjectFutureNativeVolumetricAuthoringEntry[] | undefined>;
  const specs = familyId
    ? getVolumetricFamilyUiSpecs().filter((spec) => spec.familyId === familyId)
    : getVolumetricFamilyUiSpecs();
  return specs.flatMap((spec) => stateRecord[spec.authoringEntryKey] ?? []);
}

export function findProjectFutureNativeVolumetricAuthoringEntry(
  stateSet: ProjectFutureNativeVolumetricAuthoringStateShape,
  familyId: VolumetricRouteHighlightFamilyId,
  mode: string,
): ProjectFutureNativeVolumetricAuthoringEntry | null {
  return getProjectFutureNativeVolumetricAuthoringEntries(stateSet, familyId).find((entry) => entry.mode === mode) ?? null;
}
