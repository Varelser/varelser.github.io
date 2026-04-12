import { assert } from '../verify-volumetric-family-shared';
import type { SmokeVerificationBundle } from './shared';

export function verifyVolumetricSmokeRouteBand(bundles: SmokeVerificationBundle[]): void {
  const prism = bundles.find((bundle) => bundle.mode === 'prism_smoke');
  const staticSmoke = bundles.find((bundle) => bundle.mode === 'static_smoke');
  assert(prism, 'prism_smoke: bundle missing');
  assert(staticSmoke, 'static_smoke: bundle missing');

  assert((prism.descriptor.stats.prismRefractionLineCount ?? 0) >= 3, 'prism_smoke: prism refraction lines missing');
  assert((prism.descriptor.stats.prismRefractionBridgeLineCount ?? 0) >= 2, 'prism_smoke: prism refraction bridges missing');
  assert((prism.descriptor.stats.prismRefractionCentroidCount ?? 0) >= 2, 'prism_smoke: prism refraction centroids missing');
  assert((prism.descriptor.stats.prismRefractionModeCount ?? 0) >= 2, 'prism_smoke: prism refraction modes missing');

  assert((staticSmoke.descriptor.stats.settledSlabBandCount ?? 0) >= 2, 'static_smoke: settled slab bands missing');
  assert((staticSmoke.descriptor.stats.settledSlabPersistenceLineCount ?? 0) >= 4, 'static_smoke: settled slab persistence lines missing');
  assert((staticSmoke.descriptor.stats.settledSlabBridgeLineCount ?? 0) >= 2, 'static_smoke: settled slab bridges missing');
  assert((staticSmoke.descriptor.stats.settledShadowShelfCount ?? 0) >= 1, 'static_smoke: settled shadow shelf missing');

  assert((prism.runtimeConfig.smokePrismSeparation ?? 0) > (staticSmoke.runtimeConfig.smokePrismSeparation ?? 0), 'volumetric-smoke prism/static split missing');
  assert((staticSmoke.runtimeConfig.smokePersistence ?? 0) > (prism.runtimeConfig.smokePersistence ?? 0), 'volumetric-smoke persistence split missing');
}
