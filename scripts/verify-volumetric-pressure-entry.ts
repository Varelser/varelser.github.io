import { normalizeConfig } from '../lib/appStateConfig';
import { buildProjectFutureNativeIntegrationSnapshot } from '../lib/future-native-families/futureNativeFamiliesIntegration';
import { buildIntegratedFamilySnapshot } from '../lib/future-native-families/futureNativeFamiliesIntegrationSnapshots';
import { buildVolumetricPressureCouplingInput } from '../lib/future-native-families/futureNativeSceneBridgeVolumetricInputs';
import { buildEditableVolumetricPressureRuntimeConfig } from '../lib/future-native-families/futureNativeSceneBridgeVolumetricOverrides';
import { getFutureNativeSceneBinding } from '../lib/future-native-families/futureNativeSceneBindings';
import {
  buildFutureNativeSceneBridgeDescriptor,
  createFutureNativeSceneBridgeRuntime,
} from '../lib/future-native-families/futureNativeSceneRendererBridge';
import type { VolumetricDensityTransportNormalizedConfig } from '../lib/future-native-families/starter-runtime/volumetric_density_transportSchema';
import { buildProjectExecutionRoutingMap } from '../lib/projectExecutionRouting';
import type { Layer2Type, Layer3Source } from '../types';
import {
  assert,
  assertApproxEqual,
  assertAuthoringRoundtrip,
  assertProjectSnapshotArtifacts,
  buildVerificationProject,
} from './verify-volumetric-family-shared';
import { getVolumetricRouteHighlightSpec } from '../lib/future-native-families/futureNativeVolumetricFamilyMetadata';
import { buildFutureNativePressurePreviewSignature } from '../lib/future-native-families/futureNativeVolumetricDensityPressureAuthoring';

const cases: Array<{ mode: Layer2Type; source: Layer3Source }> = [
  { mode: 'vortex_transport', source: 'ring' },
  { mode: 'pressure_cells', source: 'grid' },
];

const report = cases.map(({ mode, source }) => {
  const config = normalizeConfig({
    layer2Enabled: true,
    layer2Type: mode,
    layer2Source: source,
    layer2Count: mode === 'vortex_transport' ? 7800 : 7200,
    layer2BaseSize: mode === 'vortex_transport' ? 1.16 : 1.12,
    layer2RadiusScale: mode === 'vortex_transport' ? 1.12 : 1.0,
    layer2FogDensity: mode === 'vortex_transport' ? 0.34 : 0.52,
    layer2FogGlow: mode === 'vortex_transport' ? 0.22 : 0.08,
    layer2FogAnisotropy: mode === 'vortex_transport' ? 0.72 : 0.18,
    layer2TemporalStrength: 0.24,
    layer2TemporalSpeed: 0.18,
  });

  const binding = getFutureNativeSceneBinding(mode);
  assert(binding, `${mode}: scene binding missing`);
  assert(binding.familyId === 'volumetric-pressure-coupling', `${mode}: family mismatch`);

  const routing = buildProjectExecutionRoutingMap(config).layer2;
  assert(routing.futureNativeFamilyId === 'volumetric-pressure-coupling', `${mode}: routing family mismatch`);
  assert(routing.futureNativeBindingMode === 'native-volume', `${mode}: routing binding mode mismatch`);

  const input = buildVolumetricPressureCouplingInput(config, 2);
  const runtime = createFutureNativeSceneBridgeRuntime(config, 2);
  assert(runtime, `${mode}: runtime missing`);
  assert(runtime.familyId === 'volumetric-pressure-coupling', `${mode}: runtime family mismatch`);
  const descriptor = buildFutureNativeSceneBridgeDescriptor(runtime, config, 2);
  assert(descriptor.familyId === 'volumetric-pressure-coupling', `${mode}: descriptor family mismatch`);
  assert(descriptor.bindingMode === 'native-volume', `${mode}: binding mode mismatch`);
  assert(descriptor.pointCount >= 24, `${mode}: point count too small`);
  assert(descriptor.lineCount >= 8, `${mode}: line count too small`);
  assert((descriptor.stats.cells ?? 0) >= 200, `${mode}: cell count too low`);
  assert((descriptor.stats.meshLineCount ?? 0) >= 20, `${mode}: mesh lines missing`);
  assert((descriptor.stats.obstacleWakeModeCount ?? 0) >= 2, `${mode}: pressure obstacle wake modes missing`);
  assert((descriptor.stats.volumeDepthLayerCount ?? 0) >= 3, `${mode}: pressure depth layers missing`);

  const editedRuntimeConfig = buildEditableVolumetricPressureRuntimeConfig(config, 2, {
    pressureRelaxation: mode === 'vortex_transport' ? 0.46 : 0.82,
    pressureIterations: mode === 'vortex_transport' ? 6 : 10,
    obstacleStrength: mode === 'vortex_transport' ? 0.24 : 0.78,
    volumeDepthScale: mode === 'vortex_transport' ? 0.96 : 0.62,
  });
  assertApproxEqual(editedRuntimeConfig.volumeDepthScale ?? 0, mode === 'vortex_transport' ? 0.96 : 0.62, `${mode}: editable pressure override missing`);

  return {
    mode,
    input,
    descriptor,
  };
});

const vortex = report.find((entry) => entry.mode === 'vortex_transport');
const cells = report.find((entry) => entry.mode === 'pressure_cells');
assert(vortex && cells, 'volumetric-pressure comparison cases missing');
const vortexCase = vortex!;
const cellsCase = cells!;
assert((vortexCase.input.swirlStrength ?? 0) > (cellsCase.input.swirlStrength ?? 0), 'volumetric-pressure swirl split missing');
assert((cellsCase.input.pressureRelaxation ?? 0) > (vortexCase.input.pressureRelaxation ?? 0), 'volumetric-pressure projection split missing');
assert((cellsCase.input.obstacleStrength ?? 0) > (vortexCase.input.obstacleStrength ?? 0), 'volumetric-pressure obstacle split missing');
assert((vortexCase.input.volumeDepthScale ?? 0) > (cellsCase.input.volumeDepthScale ?? 0), 'volumetric-pressure volume depth split missing');

const integrated = buildIntegratedFamilySnapshot('volumetric-pressure-coupling');
const projectSnapshot = buildProjectFutureNativeIntegrationSnapshot('volumetric-pressure-coupling');
const routeSpec = getVolumetricRouteHighlightSpec('volumetric-pressure-coupling');
assertProjectSnapshotArtifacts(
  'volumetric-pressure-coupling',
  integrated,
  projectSnapshot,
  routeSpec.routeHighlightPrefixes,
  routeSpec.runtimeConfigPrefixes,
);
assert(integrated.runtimeConfigBlock.values.some((value) => value.startsWith('pressureRelax:')), 'volumetric-pressure projection config missing');

for (const entry of report) {
  const overrideConfig = normalizeConfig({
    layer2Enabled: true,
    layer2Type: entry.mode,
    layer2Source: entry.mode === 'vortex_transport' ? 'ring' : 'grid',
    layer2FogDensity: entry.mode === 'vortex_transport' ? 0.34 : 0.52,
    layer2FogGlow: entry.mode === 'vortex_transport' ? 0.22 : 0.08,
    layer2FogAnisotropy: entry.mode === 'vortex_transport' ? 0.72 : 0.18,
    layer2TemporalStrength: 0.24,
    layer2TemporalSpeed: 0.18,
    layer2PressureOverrideEnabled: true,
    layer2PressureRelaxationOverride: entry.mode === 'vortex_transport' ? 0.46 : 0.82,
    layer2PressureIterationsOverride: entry.mode === 'vortex_transport' ? 6 : 10,
    layer2PressureBoundaryFadeOverride: entry.mode === 'vortex_transport' ? 0.12 : 0.24,
    layer2PressureSwirlStrengthOverride: entry.mode === 'vortex_transport' ? 1.06 : 0.24,
    layer2PressureObstacleStrengthOverride: entry.mode === 'vortex_transport' ? 0.24 : 0.78,
    layer2PressureObstacleSoftnessOverride: entry.mode === 'vortex_transport' ? 0.12 : 0.22,
    layer2PressureDepthLayersOverride: entry.mode === 'vortex_transport' ? 6 : 4,
    layer2PressureVolumeDepthScaleOverride: entry.mode === 'vortex_transport' ? 0.96 : 0.62,
  });
  const overrideRuntime = createFutureNativeSceneBridgeRuntime(overrideConfig, 2);
  assert(overrideRuntime, `${entry.mode}: override runtime missing`);
  const overrideRuntimeConfig = overrideRuntime.runtime.config as VolumetricDensityTransportNormalizedConfig;
  assertApproxEqual(overrideRuntimeConfig.pressureRelaxation ?? 0, entry.mode === 'vortex_transport' ? 0.46 : 0.82, `${entry.mode}: override projection missing`);
  assertApproxEqual(overrideRuntimeConfig.obstacleStrength ?? 0, entry.mode === 'vortex_transport' ? 0.24 : 0.78, `${entry.mode}: override obstacle missing`);
  const previewSignature = buildFutureNativePressurePreviewSignature(overrideConfig, 2, entry.mode === 'vortex_transport' ? 'future-native-volumetric-pressure-vortex-column' : 'future-native-volumetric-pressure-cells-basin');
  assert(previewSignature.some((value) => value.startsWith('preset:')), `${entry.mode}: pressure preview signature missing preset`);
  const project = buildVerificationProject(`${entry.mode} pressure project`, overrideConfig);
  assertAuthoringRoundtrip(
    'volumetric-pressure-coupling',
    'pressure',
    entry.mode,
    project,
    ['pressureRelax:', 'volumeDepth:'],
  );
}

console.log('PASS volumetric-pressure-native-starter');
console.log(JSON.stringify({
  report: report.map((entry) => ({
    mode: entry.mode,
    pointCount: entry.descriptor.pointCount,
    lineCount: entry.descriptor.lineCount,
    pressureRelaxation: entry.input.pressureRelaxation ?? 0,
    swirlStrength: entry.input.swirlStrength ?? 0,
    obstacleStrength: entry.input.obstacleStrength ?? 0,
    volumeDepthScale: entry.input.volumeDepthScale ?? 0,
  })),
  integrated: {
    progressPercent: integrated.progressPercent,
    uiControlCount: integrated.uiControlCount,
  },
  projectSnapshot: {
    uiControlCount: projectSnapshot.uiControlCount,
    runtimeConfigValues: projectSnapshot.runtimeConfig.values.length,
  },
}, null, 2));
