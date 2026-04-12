import type { FutureNativeSceneBridgeDescriptor } from './future-native-families/futureNativeSceneRendererBridge';

export type FutureNativePacketExecutionRoute = 'worker' | 'direct';

export interface FutureNativePacketExecutionPlan {
  route: FutureNativePacketExecutionRoute;
  estimatedBytes: number;
  reason:
    | 'worker-unavailable'
    | 'family-not-supported'
    | 'playback-family-not-enabled'
    | 'proxy-preview'
    | 'below-threshold'
    | 'worker-preferred';
}

export interface FutureNativePacketExecutionRouteOptions {
  isPlaying?: boolean;
}

const ELIGIBLE_FAMILIES = new Set([
  'pbd-cloth',
  'pbd-membrane',
  'pbd-softbody',
]);

export function estimateFutureNativeDescriptorBytes(descriptor: FutureNativeSceneBridgeDescriptor): number {
  const surface = descriptor.surfaceMesh;
  const surfaceBytes = (surface?.positions.byteLength ?? 0)
    + (surface?.indices.byteLength ?? 0)
    + (surface?.hullLines?.byteLength ?? 0);
  const pointBytes = (descriptor.payload.points?.length ?? 0) * 3 * 4;
  const lineBytes = (descriptor.payload.lines?.length ?? 0) * 6 * 4;
  const statBytes = Object.keys(descriptor.stats).length * 8;
  return surfaceBytes + pointBytes + lineBytes + statBytes;
}

export function getFutureNativePacketExecutionPlan(
  descriptor: FutureNativeSceneBridgeDescriptor,
  workerAvailable = typeof Worker !== 'undefined',
  options: FutureNativePacketExecutionRouteOptions = {},
): FutureNativePacketExecutionPlan {
  const estimatedBytes = estimateFutureNativeDescriptorBytes(descriptor);
  if (!workerAvailable) {
    return { route: 'direct', estimatedBytes, reason: 'worker-unavailable' };
  }
  if (descriptor.bindingMode === 'proxy-preview') {
    return { route: 'direct', estimatedBytes, reason: 'proxy-preview' };
  }
  if (!ELIGIBLE_FAMILIES.has(descriptor.familyId)) {
    return { route: 'direct', estimatedBytes, reason: 'family-not-supported' };
  }
  if (options.isPlaying && descriptor.familyId !== 'pbd-softbody') {
    return { route: 'direct', estimatedBytes, reason: 'playback-family-not-enabled' };
  }
  const threshold = options.isPlaying
    ? descriptor.familyId === 'pbd-softbody'
      ? 96 * 1024
      : 160 * 1024
    : descriptor.familyId === 'pbd-softbody'
      ? 96 * 1024
      : 72 * 1024;
  if (estimatedBytes < threshold) {
    return { route: 'direct', estimatedBytes, reason: 'below-threshold' };
  }
  return { route: 'worker', estimatedBytes, reason: 'worker-preferred' };
}
