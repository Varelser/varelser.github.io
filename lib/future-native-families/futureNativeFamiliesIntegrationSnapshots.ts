import { buildFutureNativeFamilyImplementationPacket } from './futureNativeFamiliesImplementationPackets';
import { getFutureNativeFamilyProgress } from './futureNativeFamiliesProgress';
import { getFutureNativeFamilySpecById } from './futureNativeFamiliesLookup';
import { mergeFutureNativeFamilySerializedBlock } from './futureNativeFamiliesSerialization';
import { createFractureLatticeRuntimeState, getFractureLatticeStats, simulateFractureLatticeRuntime } from './starter-runtime/fracture_latticeSolver';
import { buildFractureLatticeDebugRenderPayload } from './starter-runtime/fracture_latticeRenderer';
import { fractureLatticeUiSections } from './starter-runtime/fracture_latticeUi';
import { normalizeFractureLatticeConfig } from './starter-runtime/fracture_latticeAdapter';
import { getMpmGranularStats, simulateMpmGranularFrames } from './starter-runtime/mpm_granularSolver';
import { buildMpmGranularDebugRenderPayload } from './starter-runtime/mpm_granularRenderer';
import { mpmGranularUiSections } from './starter-runtime/mpm_granularUi';
import { normalizeMpmGranularConfig } from './starter-runtime/mpm_granularAdapter';
import { getPbdClothStats, stepPbdClothRuntime } from './starter-runtime/pbd_clothSolver';
import { buildPbdClothDebugRenderPayload } from './starter-runtime/pbd_clothRenderer';
import { pbdClothUiSections } from './starter-runtime/pbd_clothUi';
import { createPbdClothRuntimeFromInput, normalizePbdClothConfig } from './starter-runtime/pbd_clothAdapter';
import { getPbdMembraneStats, stepPbdMembraneRuntime } from './starter-runtime/pbd_membraneSolver';
import { buildPbdMembraneDebugRenderPayload } from './starter-runtime/pbd_membraneRenderer';
import { pbdMembraneUiSections } from './starter-runtime/pbd_membraneUi';
import { createPbdMembraneRuntimeFromInput, normalizePbdMembraneConfig } from './starter-runtime/pbd_membraneAdapter';
import { getPbdRopeStats, simulatePbdRopeFrames } from './starter-runtime/pbd_ropeSolver';
import { buildPbdRopeDebugRenderPayload } from './starter-runtime/pbd_ropeRenderer';
import { pbdRopeUiSections } from './starter-runtime/pbd_ropeUi';
import { normalizePbdRopeConfig } from './starter-runtime/pbd_ropeAdapter';
import { getPbdSoftbodyStats, stepPbdSoftbodyRuntime } from './starter-runtime/pbd_softbodySolver';
import { buildPbdSoftbodyDebugRenderPayload } from './starter-runtime/pbd_softbodyRenderer';
import { pbdSoftbodyUiSections } from './starter-runtime/pbd_softbodyUi';
import { createPbdSoftbodyRuntimeFromInput, normalizePbdSoftbodyConfig } from './starter-runtime/pbd_softbodyAdapter';
import { getVolumetricDensityTransportStats, simulateVolumetricDensityTransportRuntime } from './starter-runtime/volumetric_density_transportSolver';
import { buildVolumetricDensityTransportDebugRenderPayload } from './starter-runtime/volumetric_density_transportRenderer';
import { volumetricDensityTransportUiSections } from './starter-runtime/volumetric_density_transportUi';
import { volumetricSmokeUiSections } from './starter-runtime/volumetric_smokeUi';
import { createVolumetricDensityTransportRuntimeFromInput, normalizeVolumetricDensityTransportConfig } from './starter-runtime/volumetric_density_transportAdapter';
import { buildFutureNativeRuntimeConfigBlock, getIntegratedFixtureInput } from './futureNativeFamiliesIntegrationFixtures';
import {
  countControls,
  FUTURE_NATIVE_FIRST_WAVE_IDS,
  simulateFrames,
  type FutureNativeFirstWaveId,
  type FutureNativeIntegrationSnapshot,
  type FutureNativeProjectIntegratedId,
} from './futureNativeFamiliesIntegrationShared';

function buildVolumetricIntegrationSnapshot(
  familyId: FutureNativeProjectIntegratedId,
  frameCount: number,
  uiSections: readonly { id: string; controls: readonly unknown[] }[],
  options: { summaryPrefix?: string; familyRouteStatKey?: string } = {},
) {
  const spec = getFutureNativeFamilySpecById(familyId);
  const progress = getFutureNativeFamilyProgress(familyId);
  const implementationPacket = buildFutureNativeFamilyImplementationPacket(familyId);
  const serializerBlock = mergeFutureNativeFamilySerializedBlock(familyId);
  const config = normalizeVolumetricDensityTransportConfig(getIntegratedFixtureInput(familyId));
  const runtime = simulateVolumetricDensityTransportRuntime(createVolumetricDensityTransportRuntimeFromInput(config), frameCount);
  const render = buildVolumetricDensityTransportDebugRenderPayload(runtime);
  const stats = getVolumetricDensityTransportStats(runtime);
  return {
    familyId,
    title: spec.title,
    currentStage: progress.currentStage,
    progressPercent: progress.progressPercent,
    integrationReady: progress.integrationReady,
    serializerBlock,
    starterRuntimeStages: implementationPacket.starterRuntime.stages,
    uiSectionIds: uiSections.map((section) => section.id),
    uiControlCount: countControls(uiSections),
    runtimeConfigBlock: buildFutureNativeRuntimeConfigBlock(familyId),
    stats: {
      ...stats,
      ...(options.familyRouteStatKey ? { [options.familyRouteStatKey]: 1 } : {}),
    },
    scalarSamples: render.scalarSamples ?? [],
    summary: options.summaryPrefix ? `${options.summaryPrefix} ${render.summary}` : render.summary,
    nextTargets: progress.nextTargets,
  };
}

export function getFutureNativeUiSections(familyId: FutureNativeProjectIntegratedId) {
  switch (familyId) {
    case 'pbd-rope':
      return pbdRopeUiSections;
    case 'mpm-granular':
    case 'mpm-viscoplastic':
    case 'mpm-snow':
    case 'mpm-mud':
    case 'mpm-paste':
      return mpmGranularUiSections;
    case 'fracture-lattice':
    case 'fracture-voxel':
    case 'fracture-crack-propagation':
    case 'fracture-debris-generation':
      return fractureLatticeUiSections;
    case 'volumetric-density-transport':
      return volumetricDensityTransportUiSections;
    case 'volumetric-smoke':
      return volumetricSmokeUiSections;
    case 'volumetric-advection':
      return volumetricDensityTransportUiSections;
    case 'volumetric-pressure-coupling':
      return volumetricDensityTransportUiSections;
    case 'volumetric-light-shadow-coupling':
      return volumetricDensityTransportUiSections;
    case 'pbd-cloth':
      return pbdClothUiSections;
    case 'pbd-membrane':
      return pbdMembraneUiSections;
    case 'pbd-softbody':
      return pbdSoftbodyUiSections;
  }
}

export function buildIntegratedFamilySnapshot(familyId: FutureNativeProjectIntegratedId): FutureNativeIntegrationSnapshot {
  const spec = getFutureNativeFamilySpecById(familyId);
  const progress = getFutureNativeFamilyProgress(familyId);
  const implementationPacket = buildFutureNativeFamilyImplementationPacket(familyId);
  const serializerBlock = mergeFutureNativeFamilySerializedBlock(familyId);

  switch (familyId) {
    case 'pbd-rope': {
      const config = normalizePbdRopeConfig(getIntegratedFixtureInput(familyId));
      const runtime = simulatePbdRopeFrames(config, 72, { iterations: 10 });
      const render = buildPbdRopeDebugRenderPayload(runtime);
      const stats = getPbdRopeStats(runtime);
      return {
        familyId,
        title: spec.title,
        currentStage: progress.currentStage,
        progressPercent: progress.progressPercent,
        integrationReady: progress.integrationReady,
        serializerBlock,
        starterRuntimeStages: implementationPacket.starterRuntime.stages,
        uiSectionIds: pbdRopeUiSections.map((section) => section.id),
        uiControlCount: countControls(pbdRopeUiSections),
        runtimeConfigBlock: buildFutureNativeRuntimeConfigBlock(familyId),
        stats: { ...stats },
        scalarSamples: render.scalarSamples ?? [],
        summary: render.summary,
        nextTargets: progress.nextTargets,
      };
    }
    case 'mpm-granular': {
      const config = normalizeMpmGranularConfig(getIntegratedFixtureInput(familyId));
      const runtime = simulateMpmGranularFrames(config, 72, { substeps: 4 });
      const render = buildMpmGranularDebugRenderPayload(runtime);
      const stats = getMpmGranularStats(runtime);
      return {
        familyId,
        title: spec.title,
        currentStage: progress.currentStage,
        progressPercent: progress.progressPercent,
        integrationReady: progress.integrationReady,
        serializerBlock,
        starterRuntimeStages: implementationPacket.starterRuntime.stages,
        uiSectionIds: mpmGranularUiSections.map((section) => section.id),
        uiControlCount: countControls(mpmGranularUiSections),
        runtimeConfigBlock: buildFutureNativeRuntimeConfigBlock(familyId),
        stats: { ...stats },
        scalarSamples: render.scalarSamples ?? [],
        summary: render.summary,
        nextTargets: progress.nextTargets,
      };
    }
    case 'mpm-viscoplastic': {
      const config = normalizeMpmGranularConfig(getIntegratedFixtureInput(familyId));
      const runtime = simulateMpmGranularFrames(config, 84, { substeps: Math.max(4, config.substeps) });
      const render = buildMpmGranularDebugRenderPayload(runtime);
      const stats = getMpmGranularStats(runtime);
      return {
        familyId,
        title: spec.title,
        currentStage: progress.currentStage,
        progressPercent: progress.progressPercent,
        integrationReady: progress.integrationReady,
        serializerBlock,
        starterRuntimeStages: implementationPacket.starterRuntime.stages,
        uiSectionIds: mpmGranularUiSections.map((section) => section.id),
        uiControlCount: countControls(mpmGranularUiSections),
        runtimeConfigBlock: buildFutureNativeRuntimeConfigBlock(familyId),
        stats: { ...stats, familyRouteViscoplastic: 1 },
        scalarSamples: render.scalarSamples ?? [],
        summary: `viscoplastic ${render.summary}`,
        nextTargets: progress.nextTargets,
      };
    }
    case 'mpm-snow': {
      const config = normalizeMpmGranularConfig(getIntegratedFixtureInput(familyId));
      const runtime = simulateMpmGranularFrames(config, 88, { substeps: Math.max(4, config.substeps) });
      const render = buildMpmGranularDebugRenderPayload(runtime);
      const stats = getMpmGranularStats(runtime);
      return {
        familyId,
        title: spec.title,
        currentStage: progress.currentStage,
        progressPercent: progress.progressPercent,
        integrationReady: progress.integrationReady,
        serializerBlock,
        starterRuntimeStages: implementationPacket.starterRuntime.stages,
        uiSectionIds: mpmGranularUiSections.map((section) => section.id),
        uiControlCount: countControls(mpmGranularUiSections),
        runtimeConfigBlock: buildFutureNativeRuntimeConfigBlock(familyId),
        stats: { ...stats, familyRouteSnow: 1 },
        scalarSamples: render.scalarSamples ?? [],
        summary: `snow ${render.summary}`,
        nextTargets: progress.nextTargets,
      };
    }
    case 'mpm-mud': {
      const config = normalizeMpmGranularConfig(getIntegratedFixtureInput(familyId));
      const runtime = simulateMpmGranularFrames(config, 82, { substeps: Math.max(4, config.substeps) });
      const render = buildMpmGranularDebugRenderPayload(runtime);
      const stats = getMpmGranularStats(runtime);
      return {
        familyId,
        title: spec.title,
        currentStage: progress.currentStage,
        progressPercent: progress.progressPercent,
        integrationReady: progress.integrationReady,
        serializerBlock,
        starterRuntimeStages: implementationPacket.starterRuntime.stages,
        uiSectionIds: mpmGranularUiSections.map((section) => section.id),
        uiControlCount: countControls(mpmGranularUiSections),
        runtimeConfigBlock: buildFutureNativeRuntimeConfigBlock(familyId),
        stats: { ...stats, familyRouteMud: 1 },
        scalarSamples: render.scalarSamples ?? [],
        summary: `mud ${render.summary}`,
        nextTargets: progress.nextTargets,
      };
    }
    case 'mpm-paste': {
      const config = normalizeMpmGranularConfig(getIntegratedFixtureInput(familyId));
      const runtime = simulateMpmGranularFrames(config, 86, { substeps: Math.max(4, config.substeps) });
      const render = buildMpmGranularDebugRenderPayload(runtime);
      const stats = getMpmGranularStats(runtime);
      return {
        familyId,
        title: spec.title,
        currentStage: progress.currentStage,
        progressPercent: progress.progressPercent,
        integrationReady: progress.integrationReady,
        serializerBlock,
        starterRuntimeStages: implementationPacket.starterRuntime.stages,
        uiSectionIds: mpmGranularUiSections.map((section) => section.id),
        uiControlCount: countControls(mpmGranularUiSections),
        runtimeConfigBlock: buildFutureNativeRuntimeConfigBlock(familyId),
        stats: { ...stats, familyRoutePaste: 1 },
        scalarSamples: render.scalarSamples ?? [],
        summary: `paste ${render.summary}`,
        nextTargets: progress.nextTargets,
      };
    }
    case 'fracture-lattice': {
      const config = normalizeFractureLatticeConfig(getIntegratedFixtureInput(familyId));
      const runtime = simulateFractureLatticeRuntime(createFractureLatticeRuntimeState(config), 5);
      const render = buildFractureLatticeDebugRenderPayload(runtime);
      const stats = getFractureLatticeStats(runtime);
      return {
        familyId,
        title: spec.title,
        currentStage: progress.currentStage,
        progressPercent: progress.progressPercent,
        integrationReady: progress.integrationReady,
        serializerBlock,
        starterRuntimeStages: implementationPacket.starterRuntime.stages,
        uiSectionIds: fractureLatticeUiSections.map((section) => section.id),
        uiControlCount: countControls(fractureLatticeUiSections),
        runtimeConfigBlock: buildFutureNativeRuntimeConfigBlock(familyId),
        stats: { ...stats },
        scalarSamples: render.scalarSamples ?? [],
        summary: render.summary,
        nextTargets: progress.nextTargets,
      };
    }
    case 'fracture-voxel': {
      const config = normalizeFractureLatticeConfig(getIntegratedFixtureInput(familyId));
      const runtime = simulateFractureLatticeRuntime(createFractureLatticeRuntimeState(config), 6);
      const render = buildFractureLatticeDebugRenderPayload(runtime);
      const stats = getFractureLatticeStats(runtime);
      return {
        familyId,
        title: spec.title,
        currentStage: progress.currentStage,
        progressPercent: progress.progressPercent,
        integrationReady: progress.integrationReady,
        serializerBlock,
        starterRuntimeStages: implementationPacket.starterRuntime.stages,
        uiSectionIds: fractureLatticeUiSections.map((section) => section.id),
        uiControlCount: countControls(fractureLatticeUiSections),
        runtimeConfigBlock: buildFutureNativeRuntimeConfigBlock(familyId),
        stats: { ...stats, familyRouteVoxelized: 1 },
        scalarSamples: render.scalarSamples ?? [],
        summary: `voxel-chunks ${render.summary}`,
        nextTargets: progress.nextTargets,
      };
    }
    case 'fracture-crack-propagation': {
      const config = normalizeFractureLatticeConfig(getIntegratedFixtureInput(familyId));
      const runtime = simulateFractureLatticeRuntime(createFractureLatticeRuntimeState(config), 7);
      const render = buildFractureLatticeDebugRenderPayload(runtime);
      const stats = getFractureLatticeStats(runtime);
      return {
        familyId,
        title: spec.title,
        currentStage: progress.currentStage,
        progressPercent: progress.progressPercent,
        integrationReady: progress.integrationReady,
        serializerBlock,
        starterRuntimeStages: implementationPacket.starterRuntime.stages,
        uiSectionIds: fractureLatticeUiSections.map((section) => section.id),
        uiControlCount: countControls(fractureLatticeUiSections),
        runtimeConfigBlock: buildFutureNativeRuntimeConfigBlock(familyId),
        stats: { ...stats, familyRouteCrackPropagation: 1 },
        scalarSamples: render.scalarSamples ?? [],
        summary: `crack-front ${render.summary}`,
        nextTargets: progress.nextTargets,
      };
    }
    case 'fracture-debris-generation': {
      const config = normalizeFractureLatticeConfig(getIntegratedFixtureInput(familyId));
      const runtime = simulateFractureLatticeRuntime(createFractureLatticeRuntimeState(config), 7);
      const render = buildFractureLatticeDebugRenderPayload(runtime);
      const stats = getFractureLatticeStats(runtime);
      return {
        familyId,
        title: spec.title,
        currentStage: progress.currentStage,
        progressPercent: progress.progressPercent,
        integrationReady: progress.integrationReady,
        serializerBlock,
        starterRuntimeStages: implementationPacket.starterRuntime.stages,
        uiSectionIds: fractureLatticeUiSections.map((section) => section.id),
        uiControlCount: countControls(fractureLatticeUiSections),
        runtimeConfigBlock: buildFutureNativeRuntimeConfigBlock(familyId),
        stats: { ...stats, familyRouteDebrisGeneration: 1 },
        scalarSamples: render.scalarSamples ?? [],
        summary: `debris-field ${render.summary}`,
        nextTargets: progress.nextTargets,
      };
    }
    case 'volumetric-density-transport': {
      return buildVolumetricIntegrationSnapshot(familyId, 80, volumetricSmokeUiSections, {
        summaryPrefix: 'density-transport',
        familyRouteStatKey: 'familyRouteDensityTransport',
      });
    }
    case 'volumetric-smoke': {
      return buildVolumetricIntegrationSnapshot(familyId, 88, volumetricSmokeUiSections, {
        summaryPrefix: 'smoke',
        familyRouteStatKey: 'familyRouteSmoke',
      });
    }
    case 'volumetric-advection': {
      return buildVolumetricIntegrationSnapshot(familyId, 84, volumetricDensityTransportUiSections, {
        summaryPrefix: 'advection',
        familyRouteStatKey: 'familyRouteAdvection',
      });
    }
    case 'volumetric-pressure-coupling': {
      return buildVolumetricIntegrationSnapshot(familyId, 92, volumetricDensityTransportUiSections, {
        summaryPrefix: 'pressure-coupling',
        familyRouteStatKey: 'familyRoutePressureCoupling',
      });
    }
    case 'volumetric-light-shadow-coupling': {
      return buildVolumetricIntegrationSnapshot(familyId, 90, volumetricDensityTransportUiSections, {
        summaryPrefix: 'light-shadow',
        familyRouteStatKey: 'familyRouteLightShadowCoupling',
      });
    }
    case 'pbd-cloth': {
      const config = normalizePbdClothConfig(getIntegratedFixtureInput(familyId));
      const runtime = simulateFrames(createPbdClothRuntimeFromInput(config), stepPbdClothRuntime, 128, 12);
      const render = buildPbdClothDebugRenderPayload(runtime);
      const stats = getPbdClothStats(runtime);
      return {
        familyId,
        title: spec.title,
        currentStage: progress.currentStage,
        progressPercent: progress.progressPercent,
        integrationReady: progress.integrationReady,
        serializerBlock,
        starterRuntimeStages: implementationPacket.starterRuntime.stages,
        uiSectionIds: pbdClothUiSections.map((section) => section.id),
        uiControlCount: countControls(pbdClothUiSections),
        runtimeConfigBlock: buildFutureNativeRuntimeConfigBlock(familyId),
        stats: { ...stats, familyRouteCloth: 1 },
        scalarSamples: render.scalarSamples ?? [],
        summary: `cloth ${render.summary}`,
        nextTargets: progress.nextTargets,
      };
    }
    case 'pbd-membrane': {
      const config = normalizePbdMembraneConfig(getIntegratedFixtureInput(familyId));
      const runtime = simulateFrames(createPbdMembraneRuntimeFromInput(config), stepPbdMembraneRuntime, 120, 12);
      const render = buildPbdMembraneDebugRenderPayload(runtime);
      const stats = getPbdMembraneStats(runtime);
      return {
        familyId,
        title: spec.title,
        currentStage: progress.currentStage,
        progressPercent: progress.progressPercent,
        integrationReady: progress.integrationReady,
        serializerBlock,
        starterRuntimeStages: implementationPacket.starterRuntime.stages,
        uiSectionIds: pbdMembraneUiSections.map((section) => section.id),
        uiControlCount: countControls(pbdMembraneUiSections),
        runtimeConfigBlock: buildFutureNativeRuntimeConfigBlock(familyId),
        stats: { ...stats, familyRouteMembrane: 1 },
        scalarSamples: render.scalarSamples ?? [],
        summary: `membrane ${render.summary}`,
        nextTargets: progress.nextTargets,
      };
    }
    case 'pbd-softbody': {
      const config = normalizePbdSoftbodyConfig(getIntegratedFixtureInput(familyId));
      const runtime = simulateFrames(createPbdSoftbodyRuntimeFromInput(config), stepPbdSoftbodyRuntime, 120, 12);
      const render = buildPbdSoftbodyDebugRenderPayload(runtime);
      const stats = getPbdSoftbodyStats(runtime);
      return {
        familyId,
        title: spec.title,
        currentStage: progress.currentStage,
        progressPercent: progress.progressPercent,
        integrationReady: progress.integrationReady,
        serializerBlock,
        starterRuntimeStages: implementationPacket.starterRuntime.stages,
        uiSectionIds: pbdSoftbodyUiSections.map((section) => section.id),
        uiControlCount: countControls(pbdSoftbodyUiSections),
        runtimeConfigBlock: buildFutureNativeRuntimeConfigBlock(familyId),
        stats: { ...stats, familyRouteSoftbody: 1 },
        scalarSamples: render.scalarSamples ?? [],
        summary: `softbody ${render.summary}`,
        nextTargets: progress.nextTargets,
      };
    }
  }
}

export function buildFirstWaveIntegrationSnapshot(familyId: FutureNativeFirstWaveId): FutureNativeIntegrationSnapshot {
  return buildIntegratedFamilySnapshot(familyId);
}

export function buildAllFirstWaveIntegrationSnapshots(): FutureNativeIntegrationSnapshot[] {
  return FUTURE_NATIVE_FIRST_WAVE_IDS.map((id) => buildFirstWaveIntegrationSnapshot(id));
}
