import type { ParticleConfig } from '../types';
import type { FutureNativeSceneBridgeRuntime } from './future-native-families/futureNativeSceneRendererBridge';

export function getFutureNativeVisualFrameStride(
  renderQuality: ParticleConfig['renderQuality'],
  familyId: FutureNativeSceneBridgeRuntime['familyId'],
) {
  if (renderQuality === 'cinematic') return 1;
  const isVolumetricFamily = familyId.startsWith('volumetric-');
  if (renderQuality === 'draft') {
    return isVolumetricFamily ? 4 : 3;
  }
  return isVolumetricFamily ? 3 : 2;
}
