import assert from 'node:assert/strict';
import { DEFAULT_CONFIG } from '../../lib/appStateConfigDefaults';
import { getGpgpuSceneBranchesFromRoute, getLayerSceneBranchesFromRoute } from '../../lib/sceneRenderRoutingBranchBuilders';
import type { GpgpuExecutionRoute, LayerExecutionRoute } from '../../lib/sceneRenderRoutingTypes';

function createLayerRoute(overrides: Partial<LayerExecutionRoute> = {}): LayerExecutionRoute {
  return {
    key: 'layer2',
    label: 'Layer 2',
    enabled: true,
    mode: 'fluid',
    renderClass: 'particles',
    simulationClass: 'procedural',
    requestedEngine: 'webgl-particles',
    resolvedEngine: 'webgl-particles',
    path: 'layer2',
    overrideId: 'unit-test-layer2',
    proceduralSystemId: null,
    hybridKind: null,
    capabilityFlags: [],
    reason: 'unit test',
    notes: [],
    ...overrides,
  };
}

function createGpgpuRoute(overrides: Partial<GpgpuExecutionRoute> = {}): GpgpuExecutionRoute {
  return {
    key: 'gpgpu',
    label: 'GPGPU',
    enabled: true,
    mode: 'gpgpu',
    renderClass: 'gpgpu',
    simulationClass: 'gpgpu',
    requestedEngine: 'webgl-gpgpu',
    resolvedEngine: 'webgl-gpgpu',
    path: 'gpgpu',
    overrideId: 'unit-test-gpgpu',
    proceduralSystemId: null,
    hybridKind: null,
    capabilityFlags: [],
    reason: 'unit test',
    notes: [],
    ...overrides,
  };
}

export async function main() {
  const textConfig = {
    ...DEFAULT_CONFIG,
    layer2Source: 'text',
    layer2GlyphOutlineEnabled: true,
    layer2AuxEnabled: true,
    layer2SparkEnabled: true,
    layer2GeomMode3D: 'cube',
    layer2ConnectionEnabled: true,
    layer2ConnectionStyle: 'classic',
    layer2GhostTrailEnabled: true,
  } as const;

  const textBranches = getLayerSceneBranchesFromRoute(textConfig, 2, createLayerRoute());
  assert.deepEqual(textBranches, [
    'particle-core',
    'glyph-outline',
    'aux-particles',
    'spark-particles',
    'instanced-solids',
    'connections:classic',
    'ghost-trail',
  ]);

  const proceduralBranches = getLayerSceneBranchesFromRoute(
    textConfig,
    2,
    createLayerRoute({ resolvedEngine: 'webgl-procedural-surface', proceduralSystemId: 'reaction-diffusion' }),
  );
  assert.deepEqual(proceduralBranches, ['procedural:reaction-diffusion', 'glyph-outline']);

  const gpgpuBranches = getGpgpuSceneBranchesFromRoute(
    {
      ...DEFAULT_CONFIG,
      gpgpuGeomMode: 'cube',
      gpgpuTrailEnabled: true,
      gpgpuRibbonEnabled: true,
      gpgpuTubeEnabled: true,
      gpgpuStreakEnabled: true,
      gpgpuSmoothTubeEnabled: true,
      gpgpuMetaballEnabled: true,
      gpgpuVolumetricEnabled: true,
    },
    createGpgpuRoute(),
  );
  assert.deepEqual(gpgpuBranches, [
    'gpgpu-core',
    'instanced-solids',
    'trail-points',
    'streak-lines',
    'ribbons',
    'tubes',
    'smooth-tubes',
    'metaballs',
    'volumetric',
  ]);
}
