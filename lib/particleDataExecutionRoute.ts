import type { ParticleConfig } from '../types';
import type { AuxMode } from '../components/particleData';
import { getLayerRuntimeParticleFieldSnapshot } from './sceneRenderRoutingRuntime';

export type ParticleDataExecutionRoute = 'worker' | 'direct';

export interface ParticleDataExecutionPlan {
  route: ParticleDataExecutionRoute;
  estimatedCount: number;
  threshold: number;
  reason:
    | 'worker-unavailable'
    | 'no-particles'
    | 'below-threshold'
    | 'worker-preferred';
}

const LAYER1_THRESHOLD = 4096;
const CORE_THRESHOLD = 8192;
const AUX_THRESHOLD = 3072;
const AMBIENT_THRESHOLD = 4096;

function isWorkerSupported() {
  return typeof Worker !== 'undefined';
}

export function estimateParticleDataCount(
  config: ParticleConfig,
  layerIndex: 1 | 2 | 3 | 4,
  isAux: boolean,
  auxMode: AuxMode,
) {
  if (layerIndex === 1) {
    return Math.max(0, config.layer1Count || 0);
  }

  if (layerIndex === 2 || layerIndex === 3) {
    const layerRuntime = getLayerRuntimeParticleFieldSnapshot(config, layerIndex);
    if (!layerRuntime) return 0;
    if (!isAux) {
      return Math.max(0, layerRuntime.count || 0);
    }
    return Math.max(0, auxMode === 'spark' ? (layerRuntime.sparkCount || 0) : (layerRuntime.auxCount || 0));
  }

  return Math.max(0, config.ambientCount || 0);
}

export function getParticleDataExecutionPlan(
  config: ParticleConfig,
  layerIndex: 1 | 2 | 3 | 4,
  isAux: boolean,
  auxMode: AuxMode,
): ParticleDataExecutionPlan {
  const estimatedCount = estimateParticleDataCount(config, layerIndex, isAux, auxMode);
  const threshold = layerIndex === 1
    ? LAYER1_THRESHOLD
    : layerIndex === 4
      ? AMBIENT_THRESHOLD
      : isAux
        ? AUX_THRESHOLD
        : CORE_THRESHOLD;

  if (estimatedCount <= 0) {
    return {
      route: 'direct',
      estimatedCount,
      threshold,
      reason: 'no-particles',
    };
  }

  if (!isWorkerSupported()) {
    return {
      route: 'direct',
      estimatedCount,
      threshold,
      reason: 'worker-unavailable',
    };
  }

  if (estimatedCount < threshold) {
    return {
      route: 'direct',
      estimatedCount,
      threshold,
      reason: 'below-threshold',
    };
  }

  return {
    route: 'worker',
    estimatedCount,
    threshold,
    reason: 'worker-preferred',
  };
}
