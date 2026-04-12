import { useSyncExternalStore } from 'react';
export interface FutureNativeSceneDiagnosticSnapshot {
  layerIndex: 2 | 3;
  familyId: string;
  bindingMode: string;
  summary: string;
  pointCount: number;
  lineCount: number;
  stats: Record<string, number>;
  playbackWorkerHeld?: boolean;
  playbackWorkerHeldAgeMs?: number;
  playbackWorkerPayloadTier?: 'very-heavy' | 'heavy' | 'medium' | 'light';
  playbackWorkerEstimatedBytes?: number;
  playbackWorkerCooldownMs?: number;
  playbackWorkerStaleMs?: number;
  playbackWorkerBackoffMs?: number;
  playbackWorkerBypassReason?: 'none' | 'fallback-pressure' | 'mixed-light' | 'pending-medium';
}

type Listener = () => void;

const diagnostics = new Map<2 | 3, FutureNativeSceneDiagnosticSnapshot>();
const listeners = new Set<Listener>();

function emit() {
  for (const listener of listeners) listener();
}

export function publishFutureNativeSceneDiagnostic(snapshot: FutureNativeSceneDiagnosticSnapshot) {
  diagnostics.set(snapshot.layerIndex, snapshot);
  emit();
}

export function clearFutureNativeSceneDiagnostic(layerIndex: 2 | 3) {
  if (diagnostics.delete(layerIndex)) emit();
}

export function getFutureNativeSceneDiagnosticsSnapshot() {
  return {
    layer2: diagnostics.get(2) ?? null,
    layer3: diagnostics.get(3) ?? null,
  } as const;
}

export function subscribeFutureNativeSceneDiagnostics(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useFutureNativeSceneDiagnostics(enabled: boolean) {
  return useSyncExternalStore(
    subscribeFutureNativeSceneDiagnostics,
    () => (enabled ? getFutureNativeSceneDiagnosticsSnapshot() : { layer2: null, layer3: null }),
    () => ({ layer2: null, layer3: null }),
  );
}
