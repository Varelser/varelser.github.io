import { useSyncExternalStore } from 'react';
import type { ControlPanelProps } from './controlPanelTypes';

type Listener = () => void;

let controlPanelPropsSnapshot: ControlPanelProps | null = null;
const listeners = new Set<Listener>();

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

export function publishControlPanelPropsSnapshot(nextProps: ControlPanelProps | null) {
  controlPanelPropsSnapshot = nextProps;
  emit();
}

export function subscribeControlPanelProps(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function usePublishedControlPanelProps(enabled: boolean) {
  return useSyncExternalStore(
    subscribeControlPanelProps,
    () => (enabled ? controlPanelPropsSnapshot : null),
    () => null,
  );
}
