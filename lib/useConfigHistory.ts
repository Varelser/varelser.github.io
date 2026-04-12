import React from 'react';
import type { ParticleConfig } from '../types';

type UseConfigHistoryArgs = {
  config: ParticleConfig;
  isTransitioning: boolean;
  maxHistory?: number;
  mergeWindowMs?: number;
  setConfig: React.Dispatch<React.SetStateAction<ParticleConfig>>;
};

type ConfigHistoryState = {
  canRedo: boolean;
  canUndo: boolean;
  historyDepth: number;
  redoDepth: number;
  redo: () => boolean;
  undo: () => boolean;
};

function areConfigsEqual(a: ParticleConfig, b: ParticleConfig) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function useConfigHistory({
  config,
  isTransitioning,
  maxHistory = 80,
  mergeWindowMs = 420,
  setConfig,
}: UseConfigHistoryArgs): ConfigHistoryState {
  const [past, setPast] = React.useState<ParticleConfig[]>([]);
  const [future, setFuture] = React.useState<ParticleConfig[]>([]);
  const configRef = React.useRef(config);
  const previousConfigRef = React.useRef(config);
  const skipNextRecordRef = React.useRef(false);
  const lastRecordedAtRef = React.useRef(0);
  const hasUserInteractedRef = React.useRef(false);

  React.useEffect(() => {
    configRef.current = config;
  }, [config]);

  React.useEffect(() => {
    if (typeof window === 'undefined') {
      hasUserInteractedRef.current = true;
      return;
    }

    const markInteraction = () => {
      hasUserInteractedRef.current = true;
    };

    window.addEventListener('pointerdown', markInteraction, { passive: true });
    window.addEventListener('keydown', markInteraction);
    window.addEventListener('touchstart', markInteraction, { passive: true });

    return () => {
      window.removeEventListener('pointerdown', markInteraction);
      window.removeEventListener('keydown', markInteraction);
      window.removeEventListener('touchstart', markInteraction);
    };
  }, []);

  React.useEffect(() => {
    const previous = previousConfigRef.current;
    if (areConfigsEqual(previous, config)) {
      return;
    }

    previousConfigRef.current = config;

    if (skipNextRecordRef.current) {
      skipNextRecordRef.current = false;
      return;
    }

    if (isTransitioning || !hasUserInteractedRef.current) {
      return;
    }

    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    setPast((currentPast) => {
      if (now - lastRecordedAtRef.current <= mergeWindowMs && currentPast.length > 0) {
        lastRecordedAtRef.current = now;
        return currentPast;
      }
      lastRecordedAtRef.current = now;
      const nextPast = [...currentPast, previous];
      return nextPast.slice(-maxHistory);
    });
    setFuture([]);
  }, [config, isTransitioning, maxHistory, mergeWindowMs]);

  const undo = React.useCallback(() => {
    const previous = past[past.length - 1];
    if (!previous) {
      return false;
    }

    skipNextRecordRef.current = true;
    previousConfigRef.current = previous;
    setPast((currentPast) => currentPast.slice(0, -1));
    setFuture((currentFuture) => [configRef.current, ...currentFuture].slice(0, maxHistory));
    setConfig(previous);
    return true;
  }, [maxHistory, past, setConfig]);

  const redo = React.useCallback(() => {
    const next = future[0];
    if (!next) {
      return false;
    }

    skipNextRecordRef.current = true;
    previousConfigRef.current = next;
    setFuture((currentFuture) => currentFuture.slice(1));
    setPast((currentPast) => [...currentPast, configRef.current].slice(-maxHistory));
    setConfig(next);
    return true;
  }, [future, maxHistory, setConfig]);

  return {
    canRedo: future.length > 0,
    canUndo: past.length > 0,
    historyDepth: past.length,
    redo,
    redoDepth: future.length,
    undo,
  };
}
