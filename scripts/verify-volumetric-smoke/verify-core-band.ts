import { assert } from '../verify-volumetric-family-shared';
import { assertSmokeEditableConfig, type SmokeVerificationBundle } from './shared';

export function verifyVolumetricSmokeCoreBand(bundle: SmokeVerificationBundle): void {
  const { mode, config, runtimeConfig, descriptor } = bundle;
  assert((runtimeConfig.smokeInjectorBias ?? 0) > 0.1, `${mode}: smoke injector bias missing`);
  assert((runtimeConfig.smokePrismSeparation ?? 0) > 0.1, `${mode}: smoke prism separation missing`);
  assert((runtimeConfig.smokePersistence ?? 0) > 0.1, `${mode}: smoke persistence missing`);
  assert((runtimeConfig.smokeDensityGain ?? 0) > 0.2, `${mode}: smoke density gain missing`);
  assert((runtimeConfig.smokeLiftBias ?? 0) > 0.1, `${mode}: smoke lift bias missing`);
  assert((runtimeConfig.smokeLightScatter ?? 0) > 0.1, `${mode}: smoke light scatter missing`);
  assert((runtimeConfig.smokeScatterAnisotropy ?? 0) > 0.1, `${mode}: smoke scatter anisotropy missing`);
  assert((runtimeConfig.smokeRimBoost ?? 0) > 0.1, `${mode}: smoke rim boost missing`);
  assertSmokeEditableConfig(mode, config);
  assert(descriptor.bindingMode === 'native-volume', `${mode}: binding mode mismatch`);
  assert(descriptor.pointCount > 12, `${mode}: point count too small`);
  assert(descriptor.lineCount >= 6, `${mode}: line count too small`);
  assert((descriptor.stats.cells ?? 0) > 120, `${mode}: cell count too small`);
  assert((descriptor.stats.meanLighting ?? 0) > 0, `${mode}: mean lighting missing`);
  assert((descriptor.stats.sliceLineCount ?? 0) >= 2, `${mode}: slice lines missing`);
  assert((descriptor.stats.meshLineCount ?? 0) >= 20, `${mode}: mesh lines too low`);
  assert((descriptor.stats.obstacleMaskCellCount ?? 0) >= 8, `${mode}: obstacle mask missing`);
  assert((descriptor.stats.lightMarchLineCount ?? 0) >= 2, `${mode}: light marching missing`);
  assert((descriptor.stats.plumeAnisotropyMean ?? 0) > 0.004, `${mode}: plume anisotropy missing`);
  assert((descriptor.stats.obstacleWakeMean ?? 0) > 0.0004, `${mode}: obstacle wake missing`);
  assert((descriptor.stats.volumeLayerPointCount ?? 0) >= 12, `${mode}: volume layers missing`);
  assert((descriptor.stats.smokeLightScatter ?? 0) > 0.1, `${mode}: smoke scatter stat missing`);
  assert((descriptor.stats.smokeScatterAnisotropy ?? 0) > 0.1, `${mode}: smoke anisotropy stat missing`);
  assert((descriptor.stats.smokeRimBoost ?? 0) > 0.1, `${mode}: smoke rim stat missing`);
  assert((descriptor.stats.smokeInjectorRibbonLineCount ?? 0) >= 2, `${mode}: smoke injector ribbon missing`);
  assert((descriptor.stats.smokeInjectorBridgeLineCount ?? 0) >= 2, `${mode}: smoke injector bridges missing`);
  assert((descriptor.stats.smokeInjectorModeCount ?? 0) >= 2, `${mode}: smoke injector modes missing`);
  assert(Array.isArray(descriptor.payload.scalarSamples) && descriptor.payload.scalarSamples.length >= 8, `${mode}: scalar samples missing`);
}
