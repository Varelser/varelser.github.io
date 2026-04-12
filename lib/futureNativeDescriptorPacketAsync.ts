import type { FutureNativeSceneBridgeDescriptor } from './future-native-families/futureNativeSceneRendererBridge';
import type { FutureNativeDescriptorPacket } from './futureNativeDescriptorPacket';
import { buildFutureNativeDescriptorPacket } from './futureNativeDescriptorPacket';
import FutureNativeDescriptorPacketWorker from '../workers/futureNativeDescriptorPacketWorker?worker';
import { getFutureNativePacketExecutionPlan } from './futureNativePacketExecutionRoute';
import { beginWorkerExecutionRequest, completeWorkerExecutionRequest, failWorkerExecutionRequest } from './workerExecutionTelemetry';
import { getRuntimeProfilingNow, recordRuntimeProfilingDuration } from './runtimeProfiling';

let sharedWorkerInstance: Worker | null = null;
let sharedWorkerRequestId = 0;
let workerMarkedUnavailable = false;
const sharedWorkerCallbacks = new Map<number, (packet: FutureNativeDescriptorPacket) => void>();

function markWorkerUnavailable() {
  workerMarkedUnavailable = true;
  if (sharedWorkerInstance) {
    try {
      sharedWorkerInstance.terminate();
    } catch {}
  }
  sharedWorkerInstance = null;
  sharedWorkerCallbacks.clear();
}

function getSharedWorker() {
  if (workerMarkedUnavailable) {
    throw new Error('future-native packet worker unavailable');
  }
  if (!sharedWorkerInstance) {
    sharedWorkerInstance = new FutureNativeDescriptorPacketWorker();
    sharedWorkerInstance.onmessage = (event: MessageEvent<{ id: number; packet: FutureNativeDescriptorPacket }>) => {
      const callback = sharedWorkerCallbacks.get(event.data.id);
      if (!callback) return;
      sharedWorkerCallbacks.delete(event.data.id);
      callback(event.data.packet);
    };
    sharedWorkerInstance.onerror = () => {
      markWorkerUnavailable();
    };
    sharedWorkerInstance.onmessageerror = () => {
      markWorkerUnavailable();
    };
  }
  return sharedWorkerInstance;
}

export async function buildFutureNativeDescriptorPacketAsync(
  descriptor: FutureNativeSceneBridgeDescriptor,
  layerIndex: 2 | 3,
  options: { isPlaying?: boolean } = {},
): Promise<FutureNativeDescriptorPacket> {
  const telemetryId = `worker:future-native-packet-layer${layerIndex}:${descriptor.familyId}`;
  const modeTelemetryId = `${telemetryId}:${options.isPlaying ? 'playback' : 'static'}`;
  const startedAtMs = getRuntimeProfilingNow();
  const plan = getFutureNativePacketExecutionPlan(descriptor, typeof Worker !== 'undefined' && !workerMarkedUnavailable, { isPlaying: options.isPlaying });
  if (plan.route === 'direct') {
    const packet = buildFutureNativeDescriptorPacket(descriptor);
    const durationMs = getRuntimeProfilingNow() - startedAtMs;
    const directId = `direct:future-native-packet-layer${layerIndex}:${descriptor.familyId}`;
    const modeDirectId = `${directId}:${options.isPlaying ? 'playback' : 'static'}`;
    recordRuntimeProfilingDuration(directId, 'simulation', durationMs);
    recordRuntimeProfilingDuration(modeDirectId, 'simulation', durationMs);
    recordRuntimeProfilingDuration(telemetryId, 'simulation', durationMs);
    return packet;
  }

  beginWorkerExecutionRequest(telemetryId, {
    mode: options.isPlaying ? 'playback' : 'static',
    familyId: descriptor.familyId,
    bindingMode: descriptor.bindingMode,
    estimatedBytes: plan.estimatedBytes,
    pointCount: descriptor.pointCount,
    lineCount: descriptor.lineCount,
    layerIndex,
  }, startedAtMs);
  beginWorkerExecutionRequest(modeTelemetryId, {
    familyId: descriptor.familyId,
    bindingMode: descriptor.bindingMode,
    estimatedBytes: plan.estimatedBytes,
    pointCount: descriptor.pointCount,
    lineCount: descriptor.lineCount,
    layerIndex,
    mode: options.isPlaying ? 'playback' : 'static',
  }, startedAtMs);

  return await new Promise((resolve, reject) => {
    const id = ++sharedWorkerRequestId;
    sharedWorkerCallbacks.set(id, (packet) => {
      const durationMs = getRuntimeProfilingNow() - startedAtMs;
      completeWorkerExecutionRequest({ id: telemetryId, durationMs, route: 'worker' });
      completeWorkerExecutionRequest({ id: modeTelemetryId, durationMs, route: 'worker' });
      recordRuntimeProfilingDuration(telemetryId, 'simulation', durationMs);
      recordRuntimeProfilingDuration(modeTelemetryId, 'simulation', durationMs);
      resolve(packet);
    });
    try {
      getSharedWorker().postMessage({ id, descriptor });
    } catch {
      sharedWorkerCallbacks.delete(id);
      markWorkerUnavailable();
      try {
        const packet = buildFutureNativeDescriptorPacket(descriptor);
        const durationMs = getRuntimeProfilingNow() - startedAtMs;
        completeWorkerExecutionRequest({ id: telemetryId, durationMs, route: 'fallback' });
        completeWorkerExecutionRequest({ id: modeTelemetryId, durationMs, route: 'fallback' });
        recordRuntimeProfilingDuration(telemetryId, 'simulation', durationMs);
        recordRuntimeProfilingDuration(modeTelemetryId, 'simulation', durationMs);
        resolve(packet);
      } catch (error) {
        failWorkerExecutionRequest(telemetryId);
        failWorkerExecutionRequest(modeTelemetryId);
        reject(error);
      }
    }
  });
}
