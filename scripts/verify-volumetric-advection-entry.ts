import { normalizeConfig } from '../lib/appStateConfig';
import {
  buildProjectFutureNativeIntegrationSnapshot,
} from '../lib/future-native-families/futureNativeFamiliesIntegration';
import {
  buildIntegratedFamilySnapshot,
} from '../lib/future-native-families/futureNativeFamiliesIntegrationSnapshots';
import {
  buildVolumetricDensityTransportInput,
} from '../lib/future-native-families/futureNativeSceneBridgeVolumetricInputs';
import { buildEditableVolumetricAdvectionRuntimeConfig } from '../lib/future-native-families/futureNativeSceneBridgeVolumetricOverrides';
import {
  getFutureNativeSceneBinding,
} from '../lib/future-native-families/futureNativeSceneBindings';
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

const cases: Array<{ mode: Layer2Type; source: Layer3Source }> = [
  { mode: 'condense_field', source: 'plane' },
  { mode: 'sublimate_cloud', source: 'ring' },
];

const report = cases.map(({ mode, source }) => {
  const config = normalizeConfig({
    layer2Enabled: true,
    layer2Type: mode,
    layer2Source: source,
    layer2Count: mode === 'sublimate_cloud' ? 8200 : 8600,
    layer2BaseSize: mode === 'sublimate_cloud' ? 1.12 : 1.06,
    layer2RadiusScale: mode === 'sublimate_cloud' ? 1.04 : 1,
    layer2FogDensity: mode === 'sublimate_cloud' ? 0.34 : 0.48,
    layer2FogGlow: mode === 'sublimate_cloud' ? 0.16 : 0.12,
    layer2FogAnisotropy: mode === 'sublimate_cloud' ? 0.48 : 0.22,
    layer2TemporalStrength: 0.24,
    layer2TemporalSpeed: 0.18,
  });

  const binding = getFutureNativeSceneBinding(mode);
  assert(binding, `${mode}: scene binding missing`);
  assert(binding.familyId === 'volumetric-advection', `${mode}: family mismatch`);

  const routing = buildProjectExecutionRoutingMap(config).layer2;
  assert(routing.futureNativeFamilyId === 'volumetric-advection', `${mode}: routing family mismatch`);
  assert(routing.futureNativeBindingMode === 'native-volume', `${mode}: routing binding mode mismatch`);

  const input = buildVolumetricDensityTransportInput(config, 2);
  const runtime = createFutureNativeSceneBridgeRuntime(config, 2);
  assert(runtime, `${mode}: runtime missing`);
  assert(runtime.familyId === 'volumetric-advection', `${mode}: runtime family mismatch`);
  const descriptor = buildFutureNativeSceneBridgeDescriptor(runtime, config, 2);
  assert(descriptor.familyId === 'volumetric-advection', `${mode}: descriptor family mismatch`);
  assert(descriptor.bindingMode === 'native-volume', `${mode}: binding mode mismatch`);
  assert(descriptor.pointCount >= 24, `${mode}: point count too small`);
  assert(descriptor.lineCount >= 8, `${mode}: line count too small`);
  assert((descriptor.stats.cells ?? 0) >= 200, `${mode}: cell count too low`);
  assert((descriptor.stats.meshLineCount ?? 0) >= 20, `${mode}: mesh lines missing`);
  assert((descriptor.stats.tripleLightModeCount ?? 0) >= (mode === 'condense_field' ? 1 : 2), `${mode}: triple-light modes missing`);
  assert((descriptor.stats.vortexPacketModeCount ?? 0) >= 1, `${mode}: vortex packet modes missing`);
  assert((descriptor.stats.layeredWakeModeCount ?? 0) >= (mode === 'condense_field' ? 1 : 2), `${mode}: layered wake modes missing`);

  const editedRuntimeConfig = buildEditableVolumetricAdvectionRuntimeConfig(config, 2, {
    advectionStrength: 1.04,
    buoyancy: mode === 'sublimate_cloud' ? 0.42 : 0.16,
    obstacleStrength: mode === 'sublimate_cloud' ? 0.24 : 0.68,
    volumeDepthScale: mode === 'sublimate_cloud' ? 1.02 : 0.7,
  });
  assertApproxEqual(editedRuntimeConfig.advectionStrength, 1.04, `${mode}: editable advection override missing`);

  return {
    mode,
    input,
    descriptor,
  };
});

const condense = report.find((entry) => entry.mode === 'condense_field');
const sublimate = report.find((entry) => entry.mode === 'sublimate_cloud');
assert(condense && sublimate, 'volumetric-advection comparison cases missing');
const condenseCase = condense!;
const sublimateCase = sublimate!;
assert((sublimateCase.input.buoyancy ?? 0) > (condenseCase.input.buoyancy ?? 0), 'volumetric-advection buoyancy split missing');
assert((condenseCase.input.obstacleStrength ?? 0) > (sublimateCase.input.obstacleStrength ?? 0), 'volumetric-advection obstacle split missing');
assert((sublimateCase.input.depthLayers ?? 0) >= (condenseCase.input.depthLayers ?? 0), 'volumetric-advection depth layering split missing');
assert((sublimateCase.input.volumeDepthScale ?? 0) > (condenseCase.input.volumeDepthScale ?? 0), 'volumetric-advection volume depth split missing');

const integrated = buildIntegratedFamilySnapshot('volumetric-advection');
const projectSnapshot = buildProjectFutureNativeIntegrationSnapshot('volumetric-advection');
const routeSpec = getVolumetricRouteHighlightSpec('volumetric-advection');
assertProjectSnapshotArtifacts(
  'volumetric-advection',
  integrated,
  projectSnapshot,
  routeSpec.routeHighlightPrefixes,
  routeSpec.runtimeConfigPrefixes,
);
assert(integrated.runtimeConfigBlock.values.some((value) => value.startsWith('advection:')), 'volumetric-advection advection config missing');

for (const entry of report) {
  const overrideConfig = normalizeConfig({
    layer2Enabled: true,
    layer2Type: entry.mode,
    layer2Source: entry.mode === 'sublimate_cloud' ? 'ring' : 'plane',
    layer2FogDensity: entry.mode === 'sublimate_cloud' ? 0.34 : 0.48,
    layer2FogGlow: entry.mode === 'sublimate_cloud' ? 0.16 : 0.12,
    layer2FogAnisotropy: entry.mode === 'sublimate_cloud' ? 0.48 : 0.22,
    layer2TemporalStrength: 0.24,
    layer2TemporalSpeed: 0.18,
    layer2AdvectionOverrideEnabled: true,
    layer2AdvectionStrengthOverride: 1.04,
    layer2AdvectionBuoyancyOverride: entry.mode === 'sublimate_cloud' ? 0.42 : 0.16,
    layer2AdvectionSwirlStrengthOverride: entry.mode === 'sublimate_cloud' ? 0.88 : 0.56,
    layer2AdvectionLightAbsorptionOverride: entry.mode === 'sublimate_cloud' ? 0.28 : 0.62,
    layer2AdvectionShadowStrengthOverride: entry.mode === 'sublimate_cloud' ? 0.38 : 0.74,
    layer2AdvectionObstacleStrengthOverride: entry.mode === 'sublimate_cloud' ? 0.24 : 0.68,
    layer2AdvectionDepthLayersOverride: entry.mode === 'sublimate_cloud' ? 6 : 4,
    layer2AdvectionVolumeDepthScaleOverride: entry.mode === 'sublimate_cloud' ? 1.02 : 0.7,
  });
  const overrideRuntime = createFutureNativeSceneBridgeRuntime(overrideConfig, 2);
  assert(overrideRuntime, `${entry.mode}: override runtime missing`);
  const overrideRuntimeConfig = overrideRuntime.runtime.config as VolumetricDensityTransportNormalizedConfig;
  assertApproxEqual(overrideRuntimeConfig.advectionStrength, 1.04, `${entry.mode}: override advection missing`);
  assertApproxEqual(overrideRuntimeConfig.obstacleStrength ?? 0, entry.mode === 'sublimate_cloud' ? 0.24 : 0.68, `${entry.mode}: override obstacle missing`);
  const project = buildVerificationProject(`${entry.mode} advection project`, overrideConfig);
  const authoringEntry = assertAuthoringRoundtrip(
    'volumetric-advection',
    'advection',
    entry.mode,
    project,
    ['advection:', 'volumeDepth:'],
  );
  assert((authoringEntry.runtimeConfigValues ?? []).includes(`advection:1.040`), `${entry.mode}: advection authoring override advection missing`);
}

console.log('PASS volumetric-advection-native-starter');
console.log(JSON.stringify({
  report: report.map((entry) => ({
    mode: entry.mode,
    pointCount: entry.descriptor.pointCount,
    lineCount: entry.descriptor.lineCount,
    buoyancy: entry.input.buoyancy ?? 0,
    obstacleStrength: entry.input.obstacleStrength ?? 0,
    depthLayers: entry.input.depthLayers ?? 0,
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
