import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ParticleConfig, PresetRecord, PresetSequenceItem } from '../types';
import { PRESET_SEQUENCE_STORAGE_KEY } from './appStateLibrary';
import {
  advanceSequencePlayback,
  getSequenceSinglePassDuration,
  loadSequenceItem,
  SequenceApplyConfigInstant,
  SequenceApplyConfigMorph,
  startSequencePlayback,
} from './sequencePlaybackHelpers';

type UseSequencePlaybackArgs = {
  applyConfigInstant: SequenceApplyConfigInstant;
  applyConfigMorph: SequenceApplyConfigMorph;
  initialSequenceLoopEnabled: boolean;
  isPresetTransitioning: boolean;
  isPublicLibraryMode: boolean;
  presetSequence: PresetSequenceItem[];
  presets: PresetRecord[];
  setPresetSequence: Dispatch<SetStateAction<PresetSequenceItem[]>>;
  validPresetIds: Set<string>;
};

export function useSequencePlayback({
  applyConfigInstant,
  applyConfigMorph,
  initialSequenceLoopEnabled,
  isPresetTransitioning,
  isPublicLibraryMode,
  presetSequence,
  presets,
  setPresetSequence,
  validPresetIds,
}: UseSequencePlaybackArgs) {
  const [isSequencePlaying, setIsSequencePlaying] = useState(false);
  const [sequenceLoopEnabled, setSequenceLoopEnabled] = useState(initialSequenceLoopEnabled);
  const [activeSequenceItemId, setActiveSequenceItemId] = useState<string | null>(null);
  const [sequenceStepProgress, setSequenceStepProgress] = useState(0);
  const sequenceTimerRef = useRef<number | null>(null);
  const sequenceProgressFrameRef = useRef<number | null>(null);
  const sequenceStepStartedAtRef = useRef<number | null>(null);
  const sequenceStepProgressRef = useRef(0);
  const sequenceProgressLastPublishedAtRef = useRef(0);
  const sequenceProgressLastPublishedValueRef = useRef(0);

  const activeSequenceIndex = useMemo(
    () => presetSequence.findIndex((item) => item.id === activeSequenceItemId),
    [activeSequenceItemId, presetSequence],
  );

  const sequenceSinglePassDuration = useMemo(
    () => getSequenceSinglePassDuration(presetSequence),
    [presetSequence],
  );

  const clearSequenceTimer = useCallback(() => {
    if (sequenceTimerRef.current !== null) {
      window.clearTimeout(sequenceTimerRef.current);
      sequenceTimerRef.current = null;
    }
  }, []);

  const publishSequenceStepProgress = useCallback((nextValue: SetStateAction<number>, nowArg?: number) => {
    const resolvedValue = Math.min(
      1,
      Math.max(
        0,
        typeof nextValue === 'function'
          ? nextValue(sequenceStepProgressRef.current)
          : nextValue,
      ),
    );
    const now = nowArg ?? (typeof performance !== 'undefined' ? performance.now() : Date.now());
    const shouldPublish = resolvedValue === 0
      || resolvedValue === 1
      || Math.abs(resolvedValue - sequenceProgressLastPublishedValueRef.current) >= 0.025
      || now - sequenceProgressLastPublishedAtRef.current >= 80;

    sequenceStepProgressRef.current = resolvedValue;
    if (!shouldPublish) {
      return resolvedValue;
    }

    sequenceProgressLastPublishedAtRef.current = now;
    sequenceProgressLastPublishedValueRef.current = resolvedValue;
    setSequenceStepProgress(resolvedValue);
    return resolvedValue;
  }, []);

  const resetSequenceStepProgress = useCallback(() => {
    sequenceStepStartedAtRef.current = null;
    sequenceProgressLastPublishedAtRef.current = 0;
    sequenceProgressLastPublishedValueRef.current = 0;
    publishSequenceStepProgress(0, 0);
  }, [publishSequenceStepProgress]);

  const stopSequencePlayback = useCallback(() => {
    clearSequenceTimer();
    setIsSequencePlaying(false);
    resetSequenceStepProgress();
  }, [clearSequenceTimer, resetSequenceStepProgress]);

  const handleLoadSequenceItem = useCallback((itemId: string) => {
    loadSequenceItem(itemId, presetSequence, presets, applyConfigInstant, stopSequencePlayback, {
      setActiveSequenceItemId,
      setSequenceStepProgress: publishSequenceStepProgress,
    });
  }, [applyConfigInstant, presetSequence, presets, publishSequenceStepProgress, stopSequencePlayback]);

  const handleStartSequencePlayback = useCallback(() => {
    startSequencePlayback(presetSequence, presets, applyConfigInstant, clearSequenceTimer, {
      setActiveSequenceItemId,
      setIsSequencePlaying,
      setSequenceStepProgress: publishSequenceStepProgress,
    });
  }, [applyConfigInstant, clearSequenceTimer, presetSequence, presets, publishSequenceStepProgress]);

  const handleStopSequencePlayback = useCallback(() => {
    stopSequencePlayback();
  }, [stopSequencePlayback]);

  useEffect(() => {
    if (isPublicLibraryMode || typeof window === 'undefined') {
      return;
    }
    try {
      window.localStorage.setItem(PRESET_SEQUENCE_STORAGE_KEY, JSON.stringify(presetSequence));
    } catch (error) {
      console.warn('Failed to persist preset sequence:', error);
    }
  }, [isPublicLibraryMode, presetSequence]);

  useEffect(() => {
    setPresetSequence((prev) => prev.filter((item) => validPresetIds.has(item.presetId)));
  }, [setPresetSequence, validPresetIds]);

  useEffect(() => {
    if (!isSequencePlaying || isPresetTransitioning || presetSequence.length === 0 || activeSequenceIndex < 0) {
      clearSequenceTimer();
      return;
    }

    const currentItem = presetSequence[activeSequenceIndex];
    if (!currentItem) {
      return;
    }

    sequenceTimerRef.current = window.setTimeout(() => {
      advanceSequencePlayback({
        activeSequenceIndex,
        applyConfigMorph,
        presetSequence,
        presets,
        sequenceLoopEnabled,
        setters: {
          setActiveSequenceItemId,
          setIsSequencePlaying,
        },
      });
    }, currentItem.holdSeconds * 1000);

    return clearSequenceTimer;
  }, [
    activeSequenceIndex,
    applyConfigMorph,
    clearSequenceTimer,
    isPresetTransitioning,
    isSequencePlaying,
    presetSequence,
    presets,
    sequenceLoopEnabled,
  ]);

  useEffect(() => {
    if (sequenceProgressFrameRef.current !== null) {
      cancelAnimationFrame(sequenceProgressFrameRef.current);
      sequenceProgressFrameRef.current = null;
    }

    if (!isSequencePlaying || isPresetTransitioning || presetSequence.length === 0 || activeSequenceIndex < 0) {
      if (!isSequencePlaying) {
        resetSequenceStepProgress();
      }
      return;
    }

    const currentItem = presetSequence[activeSequenceIndex];
    if (!currentItem) {
      return;
    }

    const holdDurationMs = Math.max(200, currentItem.holdSeconds * 1000);
    sequenceStepStartedAtRef.current = performance.now();
    publishSequenceStepProgress(0, sequenceStepStartedAtRef.current);

    const tick = (now: number) => {
      const startedAt = sequenceStepStartedAtRef.current ?? now;
      const progress = Math.min(1, Math.max(0, (now - startedAt) / holdDurationMs));
      publishSequenceStepProgress(progress, now);

      if (progress < 1 && isSequencePlaying && !isPresetTransitioning) {
        sequenceProgressFrameRef.current = requestAnimationFrame(tick);
      }
    };

    sequenceProgressFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (sequenceProgressFrameRef.current !== null) {
        cancelAnimationFrame(sequenceProgressFrameRef.current);
        sequenceProgressFrameRef.current = null;
      }
    };
  }, [activeSequenceIndex, isPresetTransitioning, isSequencePlaying, presetSequence, publishSequenceStepProgress, resetSequenceStepProgress]);

  useEffect(() => () => {
    clearSequenceTimer();
    if (sequenceProgressFrameRef.current !== null) {
      cancelAnimationFrame(sequenceProgressFrameRef.current);
    }
  }, [clearSequenceTimer]);

  return {
    activeSequenceItemId,
    handleLoadSequenceItem,
    handleStartSequencePlayback,
    handleStopSequencePlayback,
    isSequencePlaying,
    sequenceLoopEnabled,
    sequenceSinglePassDuration,
    sequenceStepProgress,
    sequenceStepProgressRef,
    setActiveSequenceItemId,
    setSequenceLoopEnabled,
    setSequenceStepProgress: publishSequenceStepProgress,
    stopSequencePlayback,
  };
}
