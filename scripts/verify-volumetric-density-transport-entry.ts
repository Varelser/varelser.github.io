import { normalizeConfig } from '../lib/appStateConfig';
import { buildFutureNativeDensityPreviewSignature } from '../lib/future-native-families/futureNativeVolumetricDensityPressureAuthoring';
import {
  createVolumetricDensityTransportVerificationBundle,
  runVolumetricVerificationBand,
} from './verify-volumetric-density-transport/shared';
import { verifyVolumetricCoreBand } from './verify-volumetric-density-transport/verify-core-band';
import { verifyVolumetricObstacleAndLightBand } from './verify-volumetric-density-transport/verify-obstacle-light-band';
import { verifyVolumetricPlumeAndInjectorBand } from './verify-volumetric-density-transport/verify-plume-injector-band';
import { verifyVolumetricWakeAndVolumeBand } from './verify-volumetric-density-transport/verify-wake-volume-band';

const bundle = createVolumetricDensityTransportVerificationBundle();

runVolumetricVerificationBand('core', verifyVolumetricCoreBand, bundle);
runVolumetricVerificationBand('obstacle-light', verifyVolumetricObstacleAndLightBand, bundle);
runVolumetricVerificationBand('plume-injector', verifyVolumetricPlumeAndInjectorBand, bundle);
runVolumetricVerificationBand('wake-volume', verifyVolumetricWakeAndVolumeBand, bundle);

const densityPreviewSignature = buildFutureNativeDensityPreviewSignature(normalizeConfig({ layer2Enabled: true, layer2Type: 'condense_field', layer2Source: 'plane', layer2FogDensity: 0.48, layer2FogDrift: 0.22, layer2TemporalStrength: 0.28, layer2TemporalSpeed: 0.18 }), 2, 'future-native-volumetric-density-plume-weave');
if (!densityPreviewSignature.some((value) => value.startsWith('preset:future-native-volumetric-density-plume-weave'))) {
  throw new Error('Volumetric density preview signature missing preset');
}
console.log('PASS volumetric-density-transport-native-starter');
console.log(JSON.stringify({ initialStats: bundle.initialStats, stats: bundle.stats, summary: bundle.render.summary, densityPreviewSignature }, null, 2));
