import type { ParticleConfig } from '../types';
import type { ProceduralSystemId } from './proceduralModeRegistry';
import type { GpgpuExecutionRoute, LayerExecutionRoute } from './sceneRenderRoutingTypes';

const PROCEDURAL_SURFACE_ENGINE = 'webgl-procedural-surface';
const HYBRID_RUNTIME_ENGINE = 'hybrid-runtime';

function doesLayerRouteRenderParticleCore(route: LayerExecutionRoute): boolean {
  return !(route.proceduralSystemId && route.resolvedEngine === PROCEDURAL_SURFACE_ENGINE);
}

function doesLayerRouteRenderProceduralSystem(route: LayerExecutionRoute, system: ProceduralSystemId): boolean {
  return route.proceduralSystemId === system && route.resolvedEngine === PROCEDURAL_SURFACE_ENGINE;
}

function doesLayerRouteRenderHybridSystem(route: LayerExecutionRoute, system: ProceduralSystemId): boolean {
  return route.proceduralSystemId === system && route.resolvedEngine === HYBRID_RUNTIME_ENGINE;
}

function getLayerRuntimeSource(config: ParticleConfig, layerIndex: 2 | 3) {
  return layerIndex === 2 ? config.layer2Source : config.layer3Source;
}

function getLayerRuntimeGlyphOutlineEnabled(config: ParticleConfig, layerIndex: 2 | 3) {
  return layerIndex === 2 ? config.layer2GlyphOutlineEnabled : config.layer3GlyphOutlineEnabled;
}

function getLayerRuntimeAuxEnabled(config: ParticleConfig, layerIndex: 2 | 3) {
  return layerIndex === 2 ? config.layer2AuxEnabled : config.layer3AuxEnabled;
}

function getLayerRuntimeSparkEnabled(config: ParticleConfig, layerIndex: 2 | 3) {
  return layerIndex === 2 ? config.layer2SparkEnabled : config.layer3SparkEnabled;
}

function getLayerRuntimeGeomMode3D(config: ParticleConfig, layerIndex: 2 | 3) {
  return layerIndex === 2 ? config.layer2GeomMode3D : config.layer3GeomMode3D;
}

function getLayerRuntimeConnectionEnabled(config: ParticleConfig, layerIndex: 2 | 3) {
  return layerIndex === 2 ? config.layer2ConnectionEnabled : config.layer3ConnectionEnabled;
}

function getLayerRuntimeConnectionStyle(config: ParticleConfig, layerIndex: 2 | 3) {
  return layerIndex === 2 ? config.layer2ConnectionStyle : config.layer3ConnectionStyle;
}

function getLayerRuntimeGhostTrailEnabled(config: ParticleConfig, layerIndex: 2 | 3) {
  return layerIndex === 2 ? config.layer2GhostTrailEnabled : config.layer3GhostTrailEnabled;
}

function doesLayerRenderGlyphOutline(config: ParticleConfig, layerIndex: 2 | 3, route: LayerExecutionRoute): boolean {
  if (!route.enabled) return false;
  return getLayerRuntimeGlyphOutlineEnabled(config, layerIndex) && getLayerRuntimeSource(config, layerIndex) === 'text';
}

function doesLayerRenderAuxParticles(config: ParticleConfig, layerIndex: 2 | 3, route: LayerExecutionRoute): boolean {
  return route.enabled && getLayerRuntimeAuxEnabled(config, layerIndex) && doesLayerRouteRenderParticleCore(route);
}

function doesLayerRenderSparkParticles(config: ParticleConfig, layerIndex: 2 | 3, route: LayerExecutionRoute): boolean {
  return route.enabled && getLayerRuntimeSparkEnabled(config, layerIndex) && doesLayerRouteRenderParticleCore(route);
}

export function getLayerSceneBranchesFromRoute(config: ParticleConfig, layerIndex: 2 | 3, route: LayerExecutionRoute): string[] {
  const futureNativeRenderer = Boolean(route.enabled && route.futureNativeFamilyId);
  const futureNativeFamilyId = route.futureNativeFamilyId ?? null;
  const futureNativeBindingMode = route.futureNativeBindingMode ?? null;
  const proceduralSystemId = futureNativeRenderer
    ? null
    : route.proceduralSystemId as ProceduralSystemId | null;
  const particleCore = futureNativeRenderer ? false : route.enabled && doesLayerRouteRenderParticleCore(route);
  const proceduralRenderSystemId = proceduralSystemId && doesLayerRouteRenderProceduralSystem(route, proceduralSystemId)
    ? proceduralSystemId
    : null;
  const hybridRenderSystemId = proceduralSystemId && doesLayerRouteRenderHybridSystem(route, proceduralSystemId)
    ? proceduralSystemId
    : null;
  const glyphOutline = futureNativeRenderer ? false : doesLayerRenderGlyphOutline(config, layerIndex, route);
  const auxParticles = futureNativeRenderer ? false : doesLayerRenderAuxParticles(config, layerIndex, route);
  const sparkParticles = futureNativeRenderer ? false : doesLayerRenderSparkParticles(config, layerIndex, route);
  const instancedSolids = futureNativeRenderer ? false : route.enabled && getLayerRuntimeGeomMode3D(config, layerIndex) !== 'billboard' && particleCore;
  const connectionStyle = futureNativeRenderer
    ? null
    : route.enabled && getLayerRuntimeConnectionEnabled(config, layerIndex) && particleCore
      ? getLayerRuntimeConnectionStyle(config, layerIndex)
      : null;
  const ghostTrail = futureNativeRenderer ? false : route.enabled && getLayerRuntimeGhostTrailEnabled(config, layerIndex) && particleCore;
  const sceneBranches: string[] = [];
  if (futureNativeRenderer && futureNativeFamilyId) {
    sceneBranches.push(`future-native-renderer:${futureNativeFamilyId}`);
    if (futureNativeBindingMode) sceneBranches.push(`future-native-binding:${futureNativeBindingMode}`);
  }
  if (particleCore) sceneBranches.push('particle-core');
  if (proceduralRenderSystemId) sceneBranches.push(`procedural:${proceduralRenderSystemId}`);
  if (hybridRenderSystemId) sceneBranches.push(`hybrid:${hybridRenderSystemId}`);
  if (glyphOutline) sceneBranches.push('glyph-outline');
  if (auxParticles) sceneBranches.push('aux-particles');
  if (sparkParticles) sceneBranches.push('spark-particles');
  if (instancedSolids) sceneBranches.push('instanced-solids');
  if (connectionStyle) sceneBranches.push(`connections:${connectionStyle}`);
  if (ghostTrail) sceneBranches.push('ghost-trail');
  return sceneBranches;
}

function doesGpgpuRouteRenderCore(route: GpgpuExecutionRoute): boolean {
  return Boolean(route.enabled);
}

function doesGpgpuRouteRenderInstancedSolids(route: GpgpuExecutionRoute, config: ParticleConfig): boolean {
  return Boolean(route.enabled && config.gpgpuGeomMode !== 'point');
}

function doesGpgpuRouteRenderTrailPoints(route: GpgpuExecutionRoute, config: ParticleConfig): boolean {
  return Boolean(route.enabled && config.gpgpuTrailEnabled);
}

function doesGpgpuRouteRenderRibbons(route: GpgpuExecutionRoute, config: ParticleConfig): boolean {
  return Boolean(route.enabled && config.gpgpuRibbonEnabled);
}

function doesGpgpuRouteRenderTubes(route: GpgpuExecutionRoute, config: ParticleConfig): boolean {
  return Boolean(route.enabled && config.gpgpuTubeEnabled);
}

function doesGpgpuRouteRenderStreakLines(route: GpgpuExecutionRoute, config: ParticleConfig): boolean {
  return Boolean(route.enabled && config.gpgpuStreakEnabled);
}

function doesGpgpuRouteRenderSmoothTube(route: GpgpuExecutionRoute, config: ParticleConfig): boolean {
  return Boolean(route.enabled && config.gpgpuSmoothTubeEnabled);
}

function doesGpgpuRouteRenderMetaball(route: GpgpuExecutionRoute, config: ParticleConfig): boolean {
  if (!route.enabled || !config.gpgpuMetaballEnabled) return false;
  return route.resolvedEngine === 'webgl-gpgpu' || route.resolvedEngine === 'webgpu-compute';
}

function doesGpgpuRouteRenderVolumetric(route: GpgpuExecutionRoute, config: ParticleConfig): boolean {
  return Boolean(route.enabled && config.gpgpuVolumetricEnabled);
}

export function getGpgpuSceneBranchesFromRoute(config: ParticleConfig, route: GpgpuExecutionRoute): string[] {
  const sceneBranches: string[] = [];
  if (doesGpgpuRouteRenderCore(route)) sceneBranches.push('gpgpu-core');
  if (doesGpgpuRouteRenderInstancedSolids(route, config)) sceneBranches.push('instanced-solids');
  if (doesGpgpuRouteRenderTrailPoints(route, config)) sceneBranches.push('trail-points');
  if (doesGpgpuRouteRenderStreakLines(route, config)) sceneBranches.push('streak-lines');
  if (doesGpgpuRouteRenderRibbons(route, config)) sceneBranches.push('ribbons');
  if (doesGpgpuRouteRenderTubes(route, config)) sceneBranches.push('tubes');
  if (doesGpgpuRouteRenderSmoothTube(route, config)) sceneBranches.push('smooth-tubes');
  if (doesGpgpuRouteRenderMetaball(route, config)) sceneBranches.push('metaballs');
  if (doesGpgpuRouteRenderVolumetric(route, config)) sceneBranches.push('volumetric');
  return sceneBranches;
}
