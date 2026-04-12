import type { ParticleConfig, PresetRecord, ProjectManifest } from '../types';
import {
  FUTURE_NATIVE_SCENE_BINDINGS,
  FUTURE_NATIVE_SCENE_PRESET_BINDINGS,
} from './future-native-families/futureNativeSceneBindingData';
import { futureNativeFamilySpecs } from './future-native-families/futureNativeFamiliesRegistry';
import { getFutureNativeProjectRouteSummary } from './futureNativePanelSummaries';
import {
  buildFutureNativeSpecialistAdapterPacket,
  buildFutureNativeSpecialistComparisonPacket,
  buildFutureNativeSpecialistOperatorPacket,
} from './future-native-families/futureNativeSpecialistOperatorPackets';
import type { FutureNativeSpecialistPacketFamilyId } from './future-native-families/futureNativeFamiliesSpecialistPacketTypes';

export interface ProjectFutureNativeCapabilityMatrixRow {
  familyId: string;
  title: string;
  group: string;
  stage: string;
  uiExposureStatus: string;
  uiExposureLabel: string;
  routeCount: number;
  presetCount: number;
  sceneBindingCount: number;
  currentRouteCount: number;
  manifestRouteCount: number;
  recommendedPresetCount: number;
  representativePresetId: string | null;
  supportsDirectSceneActivation: boolean;
  currentActive: boolean;
  serializedInManifest: boolean;
  warnings: string[];
}

export interface ProjectFutureNativeCapabilityMatrix {
  totalFamilies: number;
  activeFamilies: number;
  manifestFamilies: number;
  directActivationFamilies: number;
  sceneBoundFamilies: number;
  presetOnlyFamilies: number;
  specialistPreviewFamilies: number;
  warningCount: number;
  rows: ProjectFutureNativeCapabilityMatrixRow[];
}

export interface ProjectFutureNativeCapabilityFilterState {
  searchText?: string;
  exposureStatus?: string;
  statusFilter?: 'all' | 'active' | 'manifest' | 'inactive';
  warningsOnly?: boolean;
}

const PROJECT_FUTURE_NATIVE_SPECIALIST_FAMILY_IDS = new Set<FutureNativeSpecialistPacketFamilyId>([
  'specialist-houdini-native',
  'specialist-niagara-native',
  'specialist-touchdesigner-native',
  'specialist-unity-vfx-native',
]);

function asProjectFutureNativeSpecialistPacketFamilyId(familyId: string): FutureNativeSpecialistPacketFamilyId | null {
  return PROJECT_FUTURE_NATIVE_SPECIALIST_FAMILY_IDS.has(familyId as FutureNativeSpecialistPacketFamilyId)
    ? familyId as FutureNativeSpecialistPacketFamilyId
    : null;
}

function buildWarnings(row: Omit<ProjectFutureNativeCapabilityMatrixRow, 'warnings'>): string[] {
  const warnings: string[] = [];
  if (row.routeCount <= 0) warnings.push('no route metadata');
  if (row.presetCount <= 0 && row.uiExposureStatus !== 'specialist-preview') warnings.push('no packaged presets');
  if (row.uiExposureStatus === 'preset-only') warnings.push('preset-only exposure');
  if (row.uiExposureStatus === 'specialist-preview') warnings.push('specialist-preview only');
  if (!row.supportsDirectSceneActivation && row.uiExposureStatus !== 'specialist-preview') warnings.push('no direct activation');
  if (row.currentRouteCount > 0 && row.manifestRouteCount === 0) warnings.push('active not serialized');
  return warnings;
}

function rowMatchesSearch(row: ProjectFutureNativeCapabilityMatrixRow, query: string): boolean {
  if (!query) return true;
  const haystack = [
    row.familyId,
    row.title,
    row.group,
    row.stage,
    row.uiExposureStatus,
    row.uiExposureLabel,
    row.representativePresetId ?? '',
    ...row.warnings,
  ].join(' ').toLowerCase();
  return haystack.includes(query.toLowerCase());
}

export function filterProjectFutureNativeCapabilityRows(
  matrix: ProjectFutureNativeCapabilityMatrix,
  filters: ProjectFutureNativeCapabilityFilterState,
): ProjectFutureNativeCapabilityMatrixRow[] {
  const exposure = filters.exposureStatus && filters.exposureStatus !== 'all' ? filters.exposureStatus : null;
  const status = filters.statusFilter && filters.statusFilter !== 'all' ? filters.statusFilter : null;
  const warningsOnly = Boolean(filters.warningsOnly);
  const query = filters.searchText?.trim() ?? '';

  return matrix.rows.filter((row) => {
    if (warningsOnly && row.warnings.length === 0) return false;
    if (exposure && row.uiExposureStatus !== exposure) return false;
    if (status === 'active' && !row.currentActive) return false;
    if (status === 'manifest' && !row.serializedInManifest) return false;
    if (status === 'inactive' && (row.currentActive || row.serializedInManifest)) return false;
    if (!rowMatchesSearch(row, query)) return false;
    return true;
  });
}

export function buildProjectFutureNativeWarningFocusPacket(
  rows: ProjectFutureNativeCapabilityMatrixRow[],
  filters: ProjectFutureNativeCapabilityFilterState,
): string {
  const query = filters.searchText?.trim() || 'none';
  const exposure = filters.exposureStatus && filters.exposureStatus !== 'all' ? filters.exposureStatus : 'all';
  const status = filters.statusFilter ?? 'all';
  const warningsOnly = filters.warningsOnly ? 'yes' : 'no';
  return [
    'ProjectFutureNativeWarningFocusPacket',
    `rowCount=${rows.length}`,
    `warningsOnly=${warningsOnly}`,
    `exposureStatus=${exposure}`,
    `statusFilter=${status}`,
    `search=${query}`,
    ...rows.slice(0, 20).map((row) => [
      row.familyId,
      row.uiExposureStatus,
      `warnings=${row.warnings.length}`,
      `current=${row.currentRouteCount}`,
      `manifest=${row.manifestRouteCount}`,
      row.warnings.join(' | ') || 'ok',
    ].join(' :: ')),
  ].join('\n');
}

export function buildProjectFutureNativeCapabilityMatrix(
  currentConfig: ParticleConfig,
  projectManifest: ProjectManifest,
  presets: PresetRecord[],
): ProjectFutureNativeCapabilityMatrix {
  void presets;
  const summary = getFutureNativeProjectRouteSummary(currentConfig, projectManifest);
  const currentByFamily = summary.currentRoutes.reduce<Record<string, number>>((acc, route) => {
    acc[route.familyId] = (acc[route.familyId] ?? 0) + 1;
    return acc;
  }, {});
  const manifestByFamily = summary.manifestRoutes.reduce<Record<string, number>>((acc, route) => {
    acc[route.familyId] = (acc[route.familyId] ?? 0) + 1;
    return acc;
  }, {});

  const rows = futureNativeFamilySpecs.map((spec) => {
    const sceneBindings = FUTURE_NATIVE_SCENE_BINDINGS.filter((binding) => binding.familyId === spec.id);
    const presetBindings = FUTURE_NATIVE_SCENE_PRESET_BINDINGS.filter((binding) => binding.familyId === spec.id);
    const currentRouteCount = currentByFamily[spec.id] ?? 0;
    const manifestRouteCount = manifestByFamily[spec.id] ?? 0;
    const uiExposureStatus = sceneBindings.length > 0
      ? 'scene-bound'
      : spec.id.startsWith('specialist-')
        ? 'specialist-preview'
        : presetBindings.length > 0
          ? 'preset-only'
          : 'report-only';
    const uiExposureLabel = uiExposureStatus === 'scene-bound'
      ? 'Scene + preset'
      : uiExposureStatus === 'specialist-preview'
        ? 'Specialist preview'
        : uiExposureStatus === 'preset-only'
          ? 'Preset / preview only'
          : 'Report only';

    const baseRow: Omit<ProjectFutureNativeCapabilityMatrixRow, 'warnings'> = {
      familyId: spec.id,
      title: spec.title,
      group: spec.group,
      stage: spec.stage,
      uiExposureStatus,
      uiExposureLabel,
      routeCount: Math.max(sceneBindings.length, presetBindings.length, spec.id.startsWith('specialist-') ? 1 : 0),
      presetCount: presetBindings.length,
      sceneBindingCount: sceneBindings.length,
      currentRouteCount,
      manifestRouteCount,
      recommendedPresetCount: presetBindings.length,
      representativePresetId: presetBindings[0]?.id ?? null,
      supportsDirectSceneActivation: sceneBindings.length > 0,
      currentActive: currentRouteCount > 0,
      serializedInManifest: manifestRouteCount > 0,
    };

    return {
      ...baseRow,
      warnings: buildWarnings(baseRow),
    } satisfies ProjectFutureNativeCapabilityMatrixRow;
  });

  return {
    totalFamilies: rows.length,
    activeFamilies: rows.filter((row) => row.currentActive).length,
    manifestFamilies: rows.filter((row) => row.serializedInManifest).length,
    directActivationFamilies: rows.filter((row) => row.supportsDirectSceneActivation).length,
    sceneBoundFamilies: rows.filter((row) => row.uiExposureStatus === 'scene-bound').length,
    presetOnlyFamilies: rows.filter((row) => row.uiExposureStatus === 'preset-only').length,
    specialistPreviewFamilies: rows.filter((row) => row.uiExposureStatus === 'specialist-preview').length,
    warningCount: rows.reduce((sum, row) => sum + row.warnings.length, 0),
    rows,
  };
}



export function buildProjectFutureNativeFamilyFocusPacket(
  row: ProjectFutureNativeCapabilityMatrixRow,
  currentConfig: ParticleConfig,
  projectManifest: ProjectManifest,
): string {
  const summary = getFutureNativeProjectRouteSummary(currentConfig, projectManifest);
  const currentRoutes = summary.currentRoutes.filter((route) => route.familyId === row.familyId);
  const manifestRoutes = summary.manifestRoutes.filter((route) => route.familyId === row.familyId);
  const nextAction = row.uiExposureStatus === 'scene-bound'
    ? 'scene-bound: activate from global future-native overview or load representative preset'
    : row.uiExposureStatus === 'preset-only'
      ? 'preset-only: load representative preset from future-native overview'
      : row.uiExposureStatus === 'specialist-preview'
        ? 'specialist-preview: inspect specialist export manifest / packet rail'
        : 'report-only: inspect implementation packet and registry metadata';

  return [
    'ProjectFutureNativeFamilyFocusPacket',
    `familyId=${row.familyId}`,
    `title=${row.title}`,
    `group=${row.group}`,
    `stage=${row.stage}`,
    `uiExposureStatus=${row.uiExposureStatus}`,
    `routeCount=${row.routeCount}`,
    `presetCount=${row.presetCount}`,
    `sceneBindingCount=${row.sceneBindingCount}`,
    `currentRouteCount=${row.currentRouteCount}`,
    `manifestRouteCount=${row.manifestRouteCount}`,
    `representativePresetId=${row.representativePresetId ?? 'none'}`,
    `supportsDirectSceneActivation=${row.supportsDirectSceneActivation ? 'yes' : 'no'}`,
    `warnings=${row.warnings.join(' | ') || 'none'}`,
    `nextAction=${nextAction}`,
    ...currentRoutes.map((route) => `current::${route.key}::${route.label}::${route.mode}`),
    ...manifestRoutes.map((route) => `manifest::${route.key}::${route.label}::${route.mode}`),
  ].join('\n');
}

export function buildProjectFutureNativeRepresentativePresetPacket(
  row: ProjectFutureNativeCapabilityMatrixRow,
  currentConfig: ParticleConfig,
  projectManifest: ProjectManifest,
): string {
  const summary = getFutureNativeProjectRouteSummary(currentConfig, projectManifest);
  const routeKeys = Array.from(new Set([
    ...summary.currentRoutes.filter((route) => route.familyId === row.familyId).map((route) => route.key),
    ...summary.manifestRoutes.filter((route) => route.familyId === row.familyId).map((route) => route.key),
  ]));

  return [
    'ProjectFutureNativeRepresentativePresetPacket',
    `familyId=${row.familyId}`,
    `title=${row.title}`,
    `representativePresetId=${row.representativePresetId ?? 'none'}`,
    `uiExposureStatus=${row.uiExposureStatus}`,
    `routeKeys=${routeKeys.join(',') || 'none'}`,
    `warnings=${row.warnings.join(' | ') || 'none'}`,
    `nextAction=${row.representativePresetId ? `load-or-queue ${row.representativePresetId}` : 'no representative preset available'}` ,
  ].join('\n');
}

export function buildProjectFutureNativeRouteFocusPacket(
  row: ProjectFutureNativeCapabilityMatrixRow,
  currentConfig: ParticleConfig,
  projectManifest: ProjectManifest,
): string {
  const summary = getFutureNativeProjectRouteSummary(currentConfig, projectManifest);
  const currentRoutes = summary.currentRoutes.filter((route) => route.familyId === row.familyId);
  const manifestRoutes = summary.manifestRoutes.filter((route) => route.familyId === row.familyId);

  return [
    'ProjectFutureNativeRouteFocusPacket',
    `familyId=${row.familyId}`,
    `currentRouteCount=${currentRoutes.length}`,
    `manifestRouteCount=${manifestRoutes.length}`,
    ...currentRoutes.map((route) => `current::${route.key}::${route.label}::${route.mode}::${route.primaryPresetId ?? 'none'}`),
    ...manifestRoutes.map((route) => `manifest::${route.key}::${route.label}::${route.mode}::${route.primaryPresetId ?? 'none'}`),
  ].join('\n');
}

export function buildProjectFutureNativeSpecialistOperatorPacketForRow(
  row: ProjectFutureNativeCapabilityMatrixRow,
): string {
  const familyId = asProjectFutureNativeSpecialistPacketFamilyId(row.familyId);
  if (!familyId) return '';
  return buildFutureNativeSpecialistOperatorPacket(familyId);
}

export function buildProjectFutureNativeSpecialistAdapterPacketForRow(
  row: ProjectFutureNativeCapabilityMatrixRow,
): string {
  const familyId = asProjectFutureNativeSpecialistPacketFamilyId(row.familyId);
  if (!familyId) return '';
  return buildFutureNativeSpecialistAdapterPacket(familyId);
}

export function buildProjectFutureNativeSpecialistComparisonPacketForRow(
  row: ProjectFutureNativeCapabilityMatrixRow,
): string {
  const familyId = asProjectFutureNativeSpecialistPacketFamilyId(row.familyId);
  if (!familyId) return '';
  return buildFutureNativeSpecialistComparisonPacket(familyId);
}

export function buildProjectFutureNativeSpecialistPacket(
  row: ProjectFutureNativeCapabilityMatrixRow,
  currentConfig: ParticleConfig,
  projectManifest: ProjectManifest,
): string {
  const summary = getFutureNativeProjectRouteSummary(currentConfig, projectManifest);
  const specialistRoutes = [
    ...summary.currentRoutes.filter((route) => route.familyId === row.familyId),
    ...summary.manifestRoutes.filter((route) => route.familyId === row.familyId),
  ];

  return [
    'ProjectFutureNativeSpecialistPacket',
    `familyId=${row.familyId}`,
    `title=${row.title}`,
    `uiExposureStatus=${row.uiExposureStatus}`,
    `routeCount=${specialistRoutes.length}`,
    `warnings=${row.warnings.join(' | ') || 'none'}`,
    ...specialistRoutes.map((route) => [
      route.key,
      route.label,
      route.mode,
      route.primaryPresetId ?? 'none',
      route.recommendedPresetIds.join(',') || 'none',
      route.capabilityFlags.join(',') || 'none',
    ].join('::')),
  ].join('\n');
}
export function buildProjectFutureNativeImplementationPacket(
  matrix: ProjectFutureNativeCapabilityMatrix,
  currentConfig: ParticleConfig,
  projectManifest: ProjectManifest,
): string {
  const summary = getFutureNativeProjectRouteSummary(currentConfig, projectManifest);
  const activeFamilies = matrix.rows.filter((row) => row.currentActive).map((row) => row.familyId);
  const manifestFamilies = matrix.rows.filter((row) => row.serializedInManifest).map((row) => row.familyId);
  const warningRows = matrix.rows.filter((row) => row.warnings.length > 0);

  return [
    'ProjectFutureNativeImplementationPacket',
    `totalFamilies=${matrix.totalFamilies}`,
    `activeFamilies=${matrix.activeFamilies}`,
    `manifestFamilies=${matrix.manifestFamilies}`,
    `directActivationFamilies=${matrix.directActivationFamilies}`,
    `sceneBoundFamilies=${matrix.sceneBoundFamilies}`,
    `presetOnlyFamilies=${matrix.presetOnlyFamilies}`,
    `specialistPreviewFamilies=${matrix.specialistPreviewFamilies}`,
    `warningCount=${matrix.warningCount}`,
    `activeFamilyIds=${activeFamilies.join(',') || 'none'}`,
    `manifestFamilyIds=${manifestFamilies.join(',') || 'none'}`,
    `currentRouteKeys=${summary.currentRoutes.map((route) => route.key).join(',') || 'none'}`,
    `manifestRouteKeys=${summary.manifestRoutes.map((route) => route.key).join(',') || 'none'}`,
    ...warningRows.slice(0, 12).map((row) => `${row.familyId}: ${row.warnings.join(' | ')}`),
  ].join('\n');
}
