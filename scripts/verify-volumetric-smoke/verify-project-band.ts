import { buildProjectFutureNativeIntegrationSnapshot } from '../../lib/future-native-families/futureNativeFamiliesIntegration';
import { buildIntegratedFamilySnapshot } from '../../lib/future-native-families/futureNativeFamiliesIntegrationSnapshots';
import { findProjectFutureNativeVolumetricAuthoringEntry } from '../../lib/future-native-families/futureNativeSmokeAuthoring';
import { getVolumetricRouteHighlightSpec } from '../../lib/future-native-families/futureNativeVolumetricFamilyMetadata';
import { assertAuthoringRoundtrip, assertApproxEqual, assertProjectSnapshotArtifacts, buildVerificationProject } from '../verify-volumetric-family-shared';
import { createSmokeOverrideProject, type SmokeVerificationBundle } from './shared';

export function verifyVolumetricSmokeProjectBand(bundles: SmokeVerificationBundle[]) {
  const integrated = buildIntegratedFamilySnapshot('volumetric-smoke');
  const projectSnapshot = buildProjectFutureNativeIntegrationSnapshot('volumetric-smoke');
  const routeSpec = getVolumetricRouteHighlightSpec('volumetric-smoke');
  assertProjectSnapshotArtifacts(
    'volumetric-smoke',
    integrated,
    projectSnapshot,
    routeSpec.routeHighlightPrefixes,
    routeSpec.runtimeConfigPrefixes,
  );

  const authoringEntries = bundles.map((bundle) => {
    const project = buildVerificationProject(`${bundle.mode} smoke project`, bundle.config);
    const authoringEntry = assertAuthoringRoundtrip(
      'volumetric-smoke',
      'smoke',
      bundle.mode,
      project,
      ['lightScatter:', 'scatterAnisotropy:', 'rimBoost:'],
    );
    const { overrideRuntimeConfig, overrideProject } = createSmokeOverrideProject(bundle.mode, bundle.config);
    assertApproxEqual(overrideRuntimeConfig.smokeInjectorBias, 1.04, `${bundle.mode}: override injector bias missing`);
    assertApproxEqual(overrideRuntimeConfig.smokePrismSeparation, bundle.mode === 'prism_smoke' ? 1.22 : 0.42, `${bundle.mode}: override prism separation missing`);
    assertApproxEqual(overrideRuntimeConfig.smokePersistence, 1.12, `${bundle.mode}: override persistence missing`);
    assertApproxEqual(overrideRuntimeConfig.smokeDensityGain, 1.46, `${bundle.mode}: override density gain missing`);
    assertApproxEqual(overrideRuntimeConfig.smokeLightScatter, 1.18, `${bundle.mode}: override scatter missing`);
    assertApproxEqual(overrideRuntimeConfig.smokeScatterAnisotropy, 1.26, `${bundle.mode}: override anisotropy missing`);
    assertApproxEqual(overrideRuntimeConfig.smokeRimBoost, 1.02, `${bundle.mode}: override rim missing`);
    const overrideAuthoringEntry = findProjectFutureNativeVolumetricAuthoringEntry(overrideProject.ui, 'volumetric-smoke', bundle.mode);
    if (!overrideAuthoringEntry) throw new Error(`${bundle.mode}: override smoke authoring entry missing`);
    if (!(overrideAuthoringEntry.runtimeConfigValues ?? []).includes('lightScatter:1.180')) {
      throw new Error(`${bundle.mode}: override smoke authoring scatter missing`);
    }
    if (!(overrideAuthoringEntry.runtimeConfigValues ?? []).includes('rimBoost:1.020')) {
      throw new Error(`${bundle.mode}: override smoke authoring rim missing`);
    }
    return authoringEntry;
  });

  return { integrated, projectSnapshot, authoringEntries };
}
