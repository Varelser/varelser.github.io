import { normalizeConfig } from '../lib/appStateConfig';
import { buildProjectFutureNativeIntegrationSnapshot } from '../lib/future-native-families/futureNativeFamiliesIntegration';
import { buildIntegratedFamilySnapshot } from '../lib/future-native-families/futureNativeFamiliesIntegrationSnapshots';
import { buildVolumetricLightShadowCouplingInput } from '../lib/future-native-families/futureNativeSceneBridgeVolumetricInputs';
import { buildEditableVolumetricLightShadowRuntimeConfig } from '../lib/future-native-families/futureNativeSceneBridgeVolumetricOverrides';
import { getFutureNativeSceneBinding } from '../lib/future-native-families/futureNativeSceneBindings';
import {
  buildFutureNativeSceneBridgeDescriptor,
  createFutureNativeSceneBridgeRuntime,
} from '../lib/future-native-families/futureNativeSceneRendererBridge';
import type { VolumetricDensityTransportNormalizedConfig } from '../lib/future-native-families/starter-runtime/volumetric_density_transportSchema';
import { buildProjectExecutionRoutingMap } from '../lib/projectExecutionRouting';
import type { Layer2Type } from '../types';
import {
  assert,
  assertApproxEqual,
  assertAuthoringRoundtrip,
  assertProjectSnapshotArtifacts,
  buildVerificationProject,
} from './verify-volumetric-family-shared';
import { getVolumetricRouteHighlightSpec } from '../lib/future-native-families/futureNativeVolumetricFamilyMetadata';

const cases: Array<{ mode: Layer2Type; source: 'video' | 'text' | 'plane' | 'image' }> = [
  { mode: 'charge_veil', source: 'video' },
  { mode: 'velvet_ash', source: 'plane' },
];

const report = cases.map(({ mode, source }) => {
  const config = normalizeConfig({
    layer2Enabled: true,
    layer2Type: mode,
    layer2Source: source,
    layer2Count: mode === 'charge_veil' ? 7600 : 7200,
    layer2BaseSize: mode === 'charge_veil' ? 1.04 : 1.14,
    layer2RadiusScale: mode === 'charge_veil' ? 1.06 : 1.0,
    layer2FogDensity: mode === 'charge_veil' ? 0.28 : 0.64,
    layer2FogGlow: mode === 'charge_veil' ? 0.32 : 0.04,
    layer2FogAnisotropy: mode === 'charge_veil' ? 0.86 : 0.14,
    layer2TemporalStrength: 0.24,
    layer2TemporalSpeed: 0.18,
  });

  const binding = getFutureNativeSceneBinding(mode);
  assert(binding, `${mode}: scene binding missing`);
  assert(binding.familyId === 'volumetric-light-shadow-coupling', `${mode}: family mismatch`);

  const routing = buildProjectExecutionRoutingMap(config).layer2;
  assert(routing.futureNativeFamilyId === 'volumetric-light-shadow-coupling', `${mode}: routing family mismatch`);
  assert(routing.futureNativeBindingMode === 'native-volume', `${mode}: routing binding mode mismatch`);

  const input = buildVolumetricLightShadowCouplingInput(config, 2);
  const runtime = createFutureNativeSceneBridgeRuntime(config, 2);
  assert(runtime, `${mode}: runtime missing`);
  assert(runtime.familyId === 'volumetric-light-shadow-coupling', `${mode}: runtime family mismatch`);
  const descriptor = buildFutureNativeSceneBridgeDescriptor(runtime, config, 2);
  assert(descriptor.familyId === 'volumetric-light-shadow-coupling', `${mode}: descriptor family mismatch`);
  assert(descriptor.bindingMode === 'native-volume', `${mode}: binding mode mismatch`);
  assert(descriptor.pointCount >= 24, `${mode}: point count too small`);
  assert(descriptor.lineCount >= 8, `${mode}: line count too small`);
  assert((descriptor.stats.cells ?? 0) >= 200, `${mode}: cell count too low`);
  assert((descriptor.stats.lightMarchLineCount ?? 0) >= 3, `${mode}: light march lines missing`);
  assert((descriptor.stats.multiLightBridgeLineCount ?? 0) >= 2, `${mode}: light bridge lines missing`);
  assert((descriptor.stats.volumeDepthLayerCount ?? 0) >= 3, `${mode}: depth layers missing`);

  const editedRuntimeConfig = buildEditableVolumetricLightShadowRuntimeConfig(config, 2, {
    lightAbsorption: mode === 'charge_veil' ? 0.22 : 0.78,
    shadowStrength: mode === 'charge_veil' ? 0.34 : 0.92,
    lightMarchSteps: mode === 'charge_veil' ? 13 : 7,
    obstacleStrength: mode === 'charge_veil' ? 0.24 : 0.82,
    depthLayers: mode === 'charge_veil' ? 7 : 4,
    volumeDepthScale: mode === 'charge_veil' ? 1.08 : 0.62,
  });
  assertApproxEqual(editedRuntimeConfig.volumeDepthScale ?? 0, mode === 'charge_veil' ? 1.08 : 0.62, `${mode}: editable light-shadow override missing`);

  return {
    mode,
    input,
    descriptor,
  };
});

const charge = report.find((entry) => entry.mode === 'charge_veil');
const velvet = report.find((entry) => entry.mode === 'velvet_ash');
assert(charge && velvet, 'volumetric-light-shadow comparison cases missing');
const chargeCase = charge!;
const velvetCase = velvet!;
assert((chargeCase.input.lightAbsorption ?? 0) < (velvetCase.input.lightAbsorption ?? 0), 'volumetric-light-shadow absorption split missing');
assert((chargeCase.input.lightMarchSteps ?? 0) > (velvetCase.input.lightMarchSteps ?? 0), 'volumetric-light-shadow light march split missing');
assert((velvetCase.input.shadowStrength ?? 0) > (chargeCase.input.shadowStrength ?? 0), 'volumetric-light-shadow shadow split missing');
assert((velvetCase.input.obstacleStrength ?? 0) > (chargeCase.input.obstacleStrength ?? 0), 'volumetric-light-shadow obstacle split missing');
assert((chargeCase.input.volumeDepthScale ?? 0) > (velvetCase.input.volumeDepthScale ?? 0), 'volumetric-light-shadow volume depth split missing');

const integrated = buildIntegratedFamilySnapshot('volumetric-light-shadow-coupling');
const projectSnapshot = buildProjectFutureNativeIntegrationSnapshot('volumetric-light-shadow-coupling');
const routeSpec = getVolumetricRouteHighlightSpec('volumetric-light-shadow-coupling');
assertProjectSnapshotArtifacts(
  'volumetric-light-shadow-coupling',
  integrated,
  projectSnapshot,
  routeSpec.routeHighlightPrefixes,
  routeSpec.runtimeConfigPrefixes,
);
assert(integrated.runtimeConfigBlock.values.some((value) => value.startsWith('lightAbsorption:')), 'volumetric-light-shadow absorption config missing');

for (const entry of report) {
  const overrideConfig = normalizeConfig({
    layer2Enabled: true,
    layer2Type: entry.mode,
    layer2Source: entry.mode === 'charge_veil' ? 'text' : 'plane',
    layer2FogDensity: entry.mode === 'charge_veil' ? 0.24 : 0.72,
    layer2FogGlow: entry.mode === 'charge_veil' ? 0.36 : 0.04,
    layer2FogAnisotropy: entry.mode === 'charge_veil' ? 0.88 : 0.1,
    layer2TemporalStrength: 0.24,
    layer2TemporalSpeed: 0.18,
    layer2LightShadowOverrideEnabled: true,
    layer2LightAbsorptionOverride: entry.mode === 'charge_veil' ? 0.22 : 0.78,
    layer2LightShadowStrengthOverride: entry.mode === 'charge_veil' ? 0.34 : 0.92,
    layer2LightMarchStepsOverride: entry.mode === 'charge_veil' ? 13 : 7,
    layer2LightObstacleStrengthOverride: entry.mode === 'charge_veil' ? 0.24 : 0.82,
    layer2LightDepthLayersOverride: entry.mode === 'charge_veil' ? 7 : 4,
    layer2LightVolumeDepthScaleOverride: entry.mode === 'charge_veil' ? 1.08 : 0.62,
  });
  const overrideRuntime = createFutureNativeSceneBridgeRuntime(overrideConfig, 2);
  assert(overrideRuntime, `${entry.mode}: override runtime missing`);
  const overrideRuntimeConfig = overrideRuntime.runtime.config as VolumetricDensityTransportNormalizedConfig;
  assertApproxEqual(overrideRuntimeConfig.lightAbsorption ?? 0, entry.mode === 'charge_veil' ? 0.22 : 0.78, `${entry.mode}: override absorption missing`);
  assertApproxEqual(overrideRuntimeConfig.obstacleStrength ?? 0, entry.mode === 'charge_veil' ? 0.24 : 0.82, `${entry.mode}: override obstacle missing`);
  const project = buildVerificationProject(`${entry.mode} light-shadow project`, overrideConfig);
  assertAuthoringRoundtrip(
    'volumetric-light-shadow-coupling',
    'light-shadow',
    entry.mode,
    project,
    ['lightAbsorption:', 'lightMarch:'],
  );
}

console.log('PASS volumetric-light-shadow-native-starter');
console.log(JSON.stringify({
  report: report.map((entry) => ({
    mode: entry.mode,
    pointCount: entry.descriptor.pointCount,
    lineCount: entry.descriptor.lineCount,
    lightAbsorption: entry.input.lightAbsorption ?? 0,
    shadowStrength: entry.input.shadowStrength ?? 0,
    lightMarchSteps: entry.input.lightMarchSteps ?? 0,
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
