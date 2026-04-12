import { buildFutureNativeDescriptorPacket } from '../lib/futureNativeDescriptorPacket';
import type { FutureNativeSceneBridgeDescriptor } from '../lib/future-native-families/futureNativeSceneRendererBridge';

interface WorkerRequest {
  id: number;
  descriptor: FutureNativeSceneBridgeDescriptor;
}

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const { id, descriptor } = event.data;
  const packet = buildFutureNativeDescriptorPacket(descriptor);
  const transferables: Transferable[] = [
    packet.surfacePositions.buffer,
    packet.surfaceColors.buffer,
    packet.surfaceIndices.buffer,
    packet.pointPositions.buffer,
    packet.linePositions.buffer,
    packet.hullPositions.buffer,
  ];
  (self as unknown as Worker).postMessage({ id, packet }, transferables);
};
