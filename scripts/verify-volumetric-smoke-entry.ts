import { buildFutureNativeVolumetricSmokeAuthoringSummary } from '../lib/future-native-families/futureNativeVolumetricSmokeAuthoring';
import { createSmokeVerificationBundle, smokeCases } from './verify-volumetric-smoke/shared';
import { verifyVolumetricSmokeCoreBand } from './verify-volumetric-smoke/verify-core-band';
import { verifyVolumetricSmokeProjectBand } from './verify-volumetric-smoke/verify-project-band';
import { verifyVolumetricSmokeRouteBand } from './verify-volumetric-smoke/verify-route-band';

const bundles = smokeCases.map(({ mode, source }) => createSmokeVerificationBundle(mode, source));
const authoring = buildFutureNativeVolumetricSmokeAuthoringSummary();
for (const bundle of bundles) verifyVolumetricSmokeCoreBand(bundle);
verifyVolumetricSmokeRouteBand(bundles);
const { integrated, projectSnapshot, authoringEntries } = verifyVolumetricSmokeProjectBand(bundles);

const report = bundles.map((bundle) => {
  const authoringEntry = authoringEntries.find((entry) => entry.mode === bundle.mode);
  return {
    mode: bundle.mode,
    summary: bundle.descriptor.summary,
    pointCount: bundle.descriptor.pointCount,
    lineCount: bundle.descriptor.lineCount,
    cells: bundle.descriptor.stats.cells,
    meanLighting: bundle.descriptor.stats.meanLighting,
    smokeInjectorBias: bundle.runtimeConfig.smokeInjectorBias,
    smokePrismSeparation: bundle.runtimeConfig.smokePrismSeparation,
    smokePersistence: bundle.runtimeConfig.smokePersistence,
    smokeDensityGain: bundle.runtimeConfig.smokeDensityGain,
    smokeLiftBias: bundle.runtimeConfig.smokeLiftBias,
    smokeLightScatter: bundle.runtimeConfig.smokeLightScatter,
    smokeScatterAnisotropy: bundle.runtimeConfig.smokeScatterAnisotropy,
    smokeRimBoost: bundle.runtimeConfig.smokeRimBoost,
    recommendedPresetIds: authoringEntry?.recommendedPresetIds ?? [],
  };
});

console.log('PASS volumetric-smoke-native-starter');
console.log(JSON.stringify({
  ok: true,
  cases: report,
  integrated: {
    progressPercent: integrated.progressPercent,
    uiControlCount: integrated.uiControlCount,
  },
  projectSnapshot: {
    uiControlCount: projectSnapshot.uiControlCount,
    runtimeConfigValues: projectSnapshot.runtimeConfig.values.length,
  },
}, null, 2));
