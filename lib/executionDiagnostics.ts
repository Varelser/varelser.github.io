import type {
  ParticleConfig,
  ProjectCapabilityFlag,
} from '../types';
import { buildLayerSimulationAdapterBridgePlanFromRouting } from './simulationAdapterBridge';
import { resolveGpgpuExecutionFoundation } from './gpgpuExecutionFoundation';
import { buildProjectExecutionRouting } from './projectExecutionRouting';
import {
  buildFutureNativeVolumetricAuthoringEntrySet,
  buildFutureNativeVolumetricOverrideEnabledSet,
} from './future-native-families/futureNativeSmokeAuthoring';
import { buildVolumetricLightShadowDiagnosticValues } from './future-native-families/futureNativeSceneBridgeVolumetricLightShadow';
import {
  buildVolumetricDensityTransportDiagnosticValues,
  buildVolumetricPressureDiagnosticValues,
} from './future-native-families/futureNativeSceneBridgeVolumetricDensityPressure';
import {
  type VolumetricAuthoringEntryKey,
  getVolumetricFamilyUiSpecs,
} from './future-native-families/futureNativeVolumetricFamilyMetadata';
import { getGpgpuSceneBranches, getLayerSceneBranches } from './sceneRenderRoutingPlans';
import type { GpgpuExecutionRoute, LayerExecutionRoute } from './sceneRenderRoutingTypes';

type FutureNativeVolumetricFamilyId =
  | 'volumetric-smoke'
  | 'volumetric-advection'
  | 'volumetric-pressure-coupling'
  | 'volumetric-light-shadow-coupling';

export interface ExecutionDiagnosticEntry {
  hybridKind: string | null;
  id: 'layer2' | 'layer3' | 'gpgpu';
  label: string;
  mode: string;
  engine: string;
  requestedEngine: string;
  overrideId: string;
  path: string;
  proceduralSystemId: string | null;
  reason: string;
  capabilityFlags: ProjectCapabilityFlag[];
  notes: string[];
  adapterId?: string;
  sourceFieldKind?: string;
  sourceFieldMode?: string;
  injectionStrategy?: string;
  features?: string[];
  supportedFeatures?: string[];
  unsupportedFeatures?: string[];
  sceneBranches: string[];
  futureNativeFamilyId?: string | null;
  futureNativeBindingMode?: string | null;
  futureNativePrimaryPresetId?: string | null;
  futureNativeRecommendedPresetIds?: string[];
  futureNativeVolumetricDiagnostics?: Array<{
    key: VolumetricAuthoringEntryKey;
    label: string;
    runtimeConfigValues: string[];
    overrideActive: boolean;
  }>;
}

function buildFutureNativeVolumetricDiagnostics(
  familyId: string | null | undefined,
  config: ParticleConfig,
  layerIndex: 2 | 3,
) {
  if (!familyId) {
    return {
      futureNativeVolumetricDiagnostics: [],
    };
  }
  const authoringEntries = buildFutureNativeVolumetricAuthoringEntrySet(config, layerIndex);
  const overrideState = buildFutureNativeVolumetricOverrideEnabledSet(config, layerIndex);
  const authoringEntriesRecord = authoringEntries as unknown as Record<string, { runtimeConfigValues: string[] } | null>;
  const diagnostics = getVolumetricFamilyUiSpecs()
    .filter((spec) => spec.familyId === familyId)
    .map((spec) => {
      const authoringEntry = authoringEntriesRecord[spec.authoringEntryKey];
      if (!authoringEntry) return null;
      const runtimeConfigValues = [...authoringEntry.runtimeConfigValues];
      const runtimeMap = Object.fromEntries(
        runtimeConfigValues
          .map((value) => value.split(':'))
          .filter((parts): parts is [string, string] => parts.length >= 2)
          .map(([key, raw]) => [key, Number.parseFloat(raw)]),
      );
      if (spec.familyId === 'volumetric-pressure-coupling') {
        runtimeConfigValues.push(...buildVolumetricPressureDiagnosticValues({
          pressureRelaxation: runtimeMap.pressureRelax ?? runtimeMap.pressureRelaxation ?? 0,
          pressureIterations: runtimeMap.pressureIterations ?? 0,
          boundaryFade: runtimeMap.boundaryFade ?? 0,
          obstacleStrength: runtimeMap.obstacle ?? runtimeMap.obstacleStrength ?? 0,
          obstacleSoftness: runtimeMap.softness ?? runtimeMap.obstacleSoftness ?? 0,
          depthLayers: runtimeMap.depthLayers ?? 1,
        }));
      }
      if (spec.familyId === 'volumetric-advection') {
        runtimeConfigValues.push(...buildVolumetricDensityTransportDiagnosticValues({
          advectionStrength: runtimeMap.advection ?? runtimeMap.advectionStrength ?? 0,
          buoyancy: runtimeMap.buoyancy ?? 0,
          shadowStrength: runtimeMap.shadow ?? runtimeMap.shadowStrength ?? 0,
          obstacleStrength: runtimeMap.obstacle ?? runtimeMap.obstacleStrength ?? 0,
          depthLayers: runtimeMap.depthLayers ?? 1,
          volumeDepthScale: runtimeMap.depth ?? runtimeMap.volumeDepth ?? runtimeMap.volumeDepthScale ?? 0,
        }));
      }
      if (spec.familyId === 'volumetric-light-shadow-coupling') {
        runtimeConfigValues.push(...buildVolumetricLightShadowDiagnosticValues({
          lightAbsorption: runtimeMap.lightAbsorption ?? 0,
          shadowStrength: runtimeMap.shadow ?? runtimeMap.shadowStrength ?? 0,
          lightMarchSteps: runtimeMap.lightMarch ?? runtimeMap.lightMarchSteps ?? 0,
          obstacleStrength: runtimeMap.obstacle ?? runtimeMap.obstacleStrength ?? 0,
          depthLayers: runtimeMap.depthLayers ?? 1,
          volumeDepthScale: runtimeMap.volumeDepth ?? runtimeMap.volumeDepthScale ?? 0,
        }));
      }
      return {
        key: spec.authoringEntryKey as VolumetricAuthoringEntryKey,
        label: spec.diagnosticsLabel,
        runtimeConfigValues,
        overrideActive: overrideState[spec.overrideEnabledKey],
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);
  if (!getVolumetricFamilyUiSpecs().some((spec) => spec.familyId === familyId)) {
    return {
      futureNativeVolumetricDiagnostics: [],
    };
  }
  return {
    futureNativeVolumetricDiagnostics: diagnostics,
  };
}

export function getExecutionDiagnostics(config: ParticleConfig): ExecutionDiagnosticEntry[] {
  const routing = buildProjectExecutionRouting(config);
  const layerEntries: ExecutionDiagnosticEntry[] = ([2, 3] as const).map((layerIndex) => {
    const entry = routing.find((item) => item.key === (layerIndex === 2 ? 'layer2' : 'layer3'));
    const source = layerIndex === 2 ? config.layer2Source : config.layer3Source;
    if (!entry) {
      const missingEntry: ExecutionDiagnosticEntry = {
        id: layerIndex === 2 ? 'layer2' : 'layer3',
        label: layerIndex === 2 ? 'Layer 2' : 'Layer 3',
        hybridKind: null,
        mode: layerIndex === 2 ? config.layer2Type : config.layer3Type,
        engine: 'unknown',
        requestedEngine: 'unknown',
        overrideId: 'unknown',
        path: 'points',
        proceduralSystemId: null,
        reason: 'routing entry missing',
        capabilityFlags: [],
        notes: [],
        sceneBranches: [],
        futureNativeFamilyId: null,
        futureNativeBindingMode: null,
        futureNativePrimaryPresetId: null,
        futureNativeRecommendedPresetIds: [],
        futureNativeVolumetricDiagnostics: [],
      };
      return missingEntry;
    }
    const bridge = buildLayerSimulationAdapterBridgePlanFromRouting(entry, source);
    const volumetricDiagnostics = buildFutureNativeVolumetricDiagnostics(entry.futureNativeFamilyId, config, layerIndex);
    return {
      id: layerIndex === 2 ? 'layer2' : 'layer3',
      label: entry.label,
      hybridKind: entry.hybridKind,
      mode: entry.mode,
      engine: entry.resolvedEngine,
      requestedEngine: entry.requestedEngine,
      overrideId: entry.overrideId,
      path: entry.path,
      proceduralSystemId: entry.proceduralSystemId,
      reason: entry.reason,
      capabilityFlags: entry.capabilityFlags,
      notes: entry.notes,
      adapterId: bridge.adapterId,
      sourceFieldKind: bridge.sourceFieldKind,
      sourceFieldMode: bridge.sourceFieldMode,
      injectionStrategy: bridge.injectionStrategy,
      sceneBranches: getLayerSceneBranches(config, layerIndex, entry as LayerExecutionRoute),
      futureNativeFamilyId: entry.futureNativeFamilyId ?? null,
      futureNativeBindingMode: entry.futureNativeBindingMode ?? null,
      futureNativePrimaryPresetId: entry.futureNativePrimaryPresetId ?? null,
      futureNativeRecommendedPresetIds: [...(entry.futureNativeRecommendedPresetIds ?? [])],
      ...volumetricDiagnostics,
    };
  });

  const gpgpu = resolveGpgpuExecutionFoundation(config);
  const gpgpuEntry = routing.find((item) => item.key === 'gpgpu');
  if (!gpgpu.enabled || !gpgpuEntry) return layerEntries;

  return [
    ...layerEntries,
    {
      id: 'gpgpu',
      label: gpgpuEntry.label,
      hybridKind: gpgpuEntry.hybridKind,
      mode: gpgpuEntry.mode,
      engine: gpgpuEntry.resolvedEngine,
      requestedEngine: gpgpuEntry.requestedEngine,
      overrideId: gpgpuEntry.overrideId,
      path: gpgpuEntry.path,
      proceduralSystemId: gpgpuEntry.proceduralSystemId,
      reason: gpgpuEntry.reason,
      capabilityFlags: gpgpuEntry.capabilityFlags,
      notes: gpgpuEntry.notes,
      features: gpgpu.features,
      supportedFeatures: gpgpu.supportedFeatures,
      unsupportedFeatures: gpgpu.unsupportedFeatures,
      sceneBranches: getGpgpuSceneBranches(config, gpgpuEntry as GpgpuExecutionRoute),
    },
  ];
}
