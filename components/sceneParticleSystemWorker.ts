import { generateParticleData } from './particleData';
import type { AuxMode, ParticleData } from './particleData';
import type { ParticleConfig } from '../types';
import ParticleDataWorker from '../workers/particleDataWorker?worker';
import { getRuntimeProfilingNow, recordRuntimeProfilingDuration } from '../lib/runtimeProfiling';
import { beginWorkerExecutionRequest, completeWorkerExecutionRequest, failWorkerExecutionRequest } from '../lib/workerExecutionTelemetry';
import { getParticleDataExecutionPlan } from '../lib/particleDataExecutionRoute';

let sharedWorkerInstance: Worker | null = null;
let sharedWorkerRequestId = 0;
const sharedWorkerCallbacks = new Map<number, (data: ParticleData | null) => void>();

function getSharedWorker(): Worker {
  if (!sharedWorkerInstance) {
    sharedWorkerInstance = new ParticleDataWorker();
    sharedWorkerInstance.onmessage = (e: MessageEvent<{ id: number; data: ParticleData | null }>) => {
      const callback = sharedWorkerCallbacks.get(e.data.id);
      if (callback) {
        sharedWorkerCallbacks.delete(e.data.id);
        callback(e.data.data);
      }
    };
  }
  return sharedWorkerInstance;
}

export function generateParticleDataAsync(
  config: ParticleConfig,
  layerIndex: 1 | 2 | 3 | 4,
  isAux: boolean,
  auxMode: AuxMode,
): Promise<ParticleData | null> {
  const telemetryId = `worker:particle-data-layer${layerIndex}${isAux ? `-${auxMode}` : '-core'}`;
  const executionPlan = getParticleDataExecutionPlan(config, layerIndex, isAux, auxMode);
  const payload = {
    layerIndex,
    isAux,
    auxMode,
    estimatedCount: executionPlan.estimatedCount,
    threshold: executionPlan.threshold,
    route: executionPlan.route,
    reason: executionPlan.reason,
    executionDiagnosticsEnabled: config.executionDiagnosticsEnabled,
    configDigest: JSON.stringify([config.layer2Type, config.layer3Type, config.executionDiagnosticsEnabled]).slice(0, 128),
  };
  const startedAtMs = getRuntimeProfilingNow();

  if (executionPlan.route === 'direct') {
    const data = generateParticleData(config, layerIndex, isAux, auxMode);
    const durationMs = getRuntimeProfilingNow() - startedAtMs;
    recordRuntimeProfilingDuration(telemetryId, 'simulation', durationMs);
    recordRuntimeProfilingDuration(`direct:particle-data-layer${layerIndex}${isAux ? `-${auxMode}` : '-core'}`, 'simulation', durationMs);
    return Promise.resolve(data);
  }

  beginWorkerExecutionRequest(telemetryId, payload, startedAtMs);

  return new Promise((resolve) => {
    const id = ++sharedWorkerRequestId;
    sharedWorkerCallbacks.set(id, (data) => {
      const durationMs = getRuntimeProfilingNow() - startedAtMs;
      completeWorkerExecutionRequest({ id: telemetryId, durationMs, route: 'worker' });
      recordRuntimeProfilingDuration(telemetryId, 'simulation', durationMs);
      resolve(data);
    });
    try {
      getSharedWorker().postMessage({ id, config, layerIndex, isAux, auxMode });
    } catch {
      sharedWorkerCallbacks.delete(id);
      try {
        const data = generateParticleData(config, layerIndex, isAux, auxMode);
        const durationMs = getRuntimeProfilingNow() - startedAtMs;
        completeWorkerExecutionRequest({ id: telemetryId, durationMs, route: 'fallback' });
        recordRuntimeProfilingDuration(telemetryId, 'simulation', durationMs);
        resolve(data);
      } catch (error) {
        failWorkerExecutionRequest(telemetryId);
        throw error;
      }
    }
  });
}
