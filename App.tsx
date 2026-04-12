import React, { useCallback, useMemo, useRef, useState } from 'react';
import type { Camera, Scene, WebGLRenderer } from 'three';
import { AppModeGate } from './components/AppModeGate';
import type { ParticleConfig, PresetSequenceItem } from './types';
import { normalizeConfig } from './lib/appStateConfig';
import { getInterLayerContactAmount } from './lib/appStateCollision';
import {
  LIBRARY_SCOPE,
  loadInitialPrivateConfig,
  loadPresetSequence,
  EMPTY_PUBLIC_PRESET_LIBRARY,
  loadPublicPresetLibraryData,
} from './lib/appStateLibrary';
import { useAudioController } from './lib/useAudioController';
import { useConfigHistory } from './lib/useConfigHistory';
import { useAppUiState } from './lib/useAppUiState';
import { usePresetLibrary } from './lib/usePresetLibrary';
import { usePresetTransition } from './lib/usePresetTransition';
import { useSequenceController } from './lib/useSequenceController';
import { useSequenceAudioTriggers } from './lib/useSequenceAudioTriggers';
import { AUDIO_BRIDGE_MODE_PARAM, AUDIO_BRIDGE_MODE_VALUE } from './lib/audioBridge';
import {
  loadCoreStarterPresetLibrary,
  loadStarterFutureNativeAugmentation,
  loadStarterProductPackAugmentation,
  mergeStarterLibraryAugmentation,
} from './lib/starterLibrary';
import { isHydrationPlaceholderConfig } from './lib/initialConfigHydration';
import { scheduleDeferredHydration } from './lib/scheduleDeferredHydration';
import { replayProjectSeedConfig } from './lib/projectSeedRuntime';
import { capturePresetThumbnailDataUrl } from './lib/presetThumbnailCapture';
import { useGlobalEditorShortcuts } from './lib/useGlobalEditorShortcuts';
import { useViewportTouchAssists } from './lib/useViewportTouchAssists';
import { buildInitialCameraPathSlots } from './components/AppSceneCameraPathController';
import type { CameraPathSlot, CameraRigApi } from './types/cameraPath';

const AppBodySceneConnected = React.lazy(() => import('./components/AppBodySceneConnected').then((module) => ({ default: module.AppBodySceneConnected })));

const AppBody: React.FC = () => {
  const isPublicLibraryMode = LIBRARY_SCOPE === 'public';
  const [config, setConfig] = useState<ParticleConfig>(() => (
    isPublicLibraryMode ? normalizeConfig(EMPTY_PUBLIC_PRESET_LIBRARY.currentConfig) : loadInitialPrivateConfig()
  ));
  const ui = useAppUiState();
  const { isTouchViewport } = useViewportTouchAssists({ setIsPanelOpen: ui.setIsPanelOpen });
  const rendererRef = useRef<WebGLRenderer | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const initialPresetSequenceRef = useRef<PresetSequenceItem[] | null>(null);
  const projectInputRef = useRef<HTMLInputElement | null>(null);
  const cameraRigApiRef = useRef<CameraRigApi | null>(null);
  const [cameraPathSlots, setCameraPathSlots] = useState<CameraPathSlot[]>(() => buildInitialCameraPathSlots() as CameraPathSlot[]);
  const [cameraPathDurationSeconds, setCameraPathDurationSeconds] = useState(8);
  const [cameraPathNotice, setCameraPathNotice] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);
  const [isCameraPathPlaying, setIsCameraPathPlaying] = useState(false);
  const [cameraPathExportEnabled, setCameraPathExportEnabled] = useState(false);

  const capturePresetThumbnail = useCallback(() => capturePresetThumbnailDataUrl(rendererRef.current), [rendererRef]);

  const {
    activePresetId,
    handleCreatePreset,
    handleDeletePreset,
    handleDismissLibraryNotice,
    handleDuplicatePreset,
    handleOverwritePreset,
    handleRandomize,
    handleRenamePreset,
    isPresetDirty,
    libraryNotice,
    presetBlendDuration,
    presets,
    setActivePresetId,
    setLibraryNotice,
    setPresets,
    setPresetBlendDuration,
    validPresetIds,
  } = usePresetLibrary({
    capturePresetThumbnail,
    config,
    isPublicLibraryMode,
    setConfig,
  });

  const {
    applyConfigInstant,
    applyConfigMorph,
    latestConfigRef,
    stopPresetTransition,
  } = usePresetTransition({
    config,
    setActivePresetId,
    setConfig,
    setIsPresetTransitioning: ui.setIsPresetTransitioning,
  });

  if (initialPresetSequenceRef.current === null) {
    initialPresetSequenceRef.current = isPublicLibraryMode
      ? EMPTY_PUBLIC_PRESET_LIBRARY.presetSequence
      : loadPresetSequence(validPresetIds);
  }

  const interLayerContactAmount = useMemo(() => getInterLayerContactAmount(config), [config]);

  const {
    audioRef,
    audioNotice,
    dismissAudioNotice,
    handleAudioSourceModeChange,
    isAudioActive,
    microphoneStreamRef,
    sharedAudioStreamRef,
    startAudio,
    stopAudio,
    synthEngineRef,
  } = useAudioController({
    config,
    latestConfigRef,
    setConfig,
  });

  const {
    activeSequenceItemId,
    handleAddPresetToSequence,
    handleCaptureSequenceKeyframe,
    handleDuplicateSequenceItem,
    handleLoadSequenceItem,
    handleMoveSequenceItem,
    handleRemoveSequenceItem,
    handleRenameSequenceItem,
    handleReorderSequenceItem,
    handleResetSequenceKeyframe,
    handleSequenceDriveModeChange,
    handleSequenceDriveMultiplierChange,
    handleSequenceDriveStrengthModeChange,
    handleSequenceDriveStrengthOverrideChange,
    handleSequenceHoldChange,
    handleSequenceTransitionChange,
    handleSequenceTransitionEasingChange,
    handleStartSequencePlayback,
    handleStopSequencePlayback,
    isSequencePlaying,
    presetSequence,
    sequenceLoopEnabled,
    sequenceSinglePassDuration,
    sequenceStepProgress,
    sequenceStepProgressRef,
    setActiveSequenceItemId,
    setPresetSequence,
    setSequenceLoopEnabled,
    setSequenceStepProgress,
    stopSequencePlayback,
  } = useSequenceController({
    applyConfigInstant,
    applyConfigMorph,
    config,
    initialPresetSequence: initialPresetSequenceRef.current,
    initialSequenceLoopEnabled: isPublicLibraryMode ? EMPTY_PUBLIC_PRESET_LIBRARY.sequenceLoopEnabled : true,
    isPresetTransitioning: ui.isPresetTransitioning,
    isPublicLibraryMode,
    latestConfigRef,
    presetBlendDuration,
    presets,
    setLibraryNotice,
    validPresetIds,
  });



  React.useEffect(() => {
    if (!isPublicLibraryMode) {
      return;
    }
    let cancelled = false;
    void loadPublicPresetLibraryData().then((publicLibrary) => {
      if (cancelled) return;
      setConfig((prev) => {
        return isHydrationPlaceholderConfig(prev) ? normalizeConfig(publicLibrary.currentConfig) : prev;
      });
      setPresetSequence((prev) => (prev.length > 0 ? prev : publicLibrary.presetSequence));
      setSequenceLoopEnabled(publicLibrary.sequenceLoopEnabled);
      if (initialPresetSequenceRef.current === null || initialPresetSequenceRef.current.length === 0) {
        initialPresetSequenceRef.current = publicLibrary.presetSequence;
      }
    }).catch((error) => {
      console.warn('Failed to hydrate public preset library:', error);
    });
    return () => {
      cancelled = true;
    };
  }, [isPublicLibraryMode, setConfig, setPresetSequence, setSequenceLoopEnabled]);

  React.useEffect(() => {
    if (isPublicLibraryMode || presets.length > 0 || presetSequence.length > 0) {
      return;
    }
    let cancelled = false;
    let augmentCleanup = () => {};
    const cleanup = scheduleDeferredHydration(() => {
      void loadCoreStarterPresetLibrary().then((starterLibrary) => {
        if (cancelled) return;
        if (latestConfigRef.current === config) {
          setConfig((prev) => {
            return isHydrationPlaceholderConfig(prev) ? normalizeConfig(starterLibrary.currentConfig) : prev;
          });
        }
        setPresetSequence((prev) => (prev.length > 0 ? prev : starterLibrary.presetSequence.filter((item) => validPresetIds.has(item.presetId) || starterLibrary.presets.some((preset) => preset.id === item.presetId))));
        setSequenceLoopEnabled(starterLibrary.sequenceLoopEnabled);
        if (initialPresetSequenceRef.current === null || initialPresetSequenceRef.current.length === 0) {
          initialPresetSequenceRef.current = starterLibrary.presetSequence;
        }
        augmentCleanup = scheduleDeferredHydration(() => {
          void Promise.all([
            loadStarterProductPackAugmentation(),
            loadStarterFutureNativeAugmentation(),
          ]).then(([productAugmentation, futureNativeAugmentation]) => {
            if (cancelled) return;
            const mergedLibrary = mergeStarterLibraryAugmentation(
              mergeStarterLibraryAugmentation(starterLibrary, productAugmentation),
              futureNativeAugmentation,
            );
            setPresetSequence((prev) => {
              if (prev.length === 0) {
                return mergedLibrary.presetSequence;
              }
              const knownPresetIds = new Set(mergedLibrary.presets.map((preset) => preset.id));
              const knownSequenceIds = new Set(prev.map((item) => item.id));
              const additionalItems = [...productAugmentation.presetSequence, ...futureNativeAugmentation.presetSequence]
                .filter((item) => knownPresetIds.has(item.presetId) && !knownSequenceIds.has(item.id));
              return additionalItems.length > 0 ? [...prev, ...additionalItems] : prev;
            });
            if (initialPresetSequenceRef.current === null || initialPresetSequenceRef.current.length === 0) {
              initialPresetSequenceRef.current = mergedLibrary.presetSequence;
            }
          }).catch((error) => {
            console.warn('Failed to hydrate starter future-native augmentation:', error);
          });
        }, 2400);
        if (cancelled) augmentCleanup();
      }).catch((error) => {
        console.warn('Failed to hydrate starter sequence:', error);
      });
    }, 1400);
    return () => {
      cancelled = true;
      augmentCleanup();
      cleanup();
    };
  }, [config, isPublicLibraryMode, latestConfigRef, presetSequence.length, presets.length, setConfig, setPresetSequence, setSequenceLoopEnabled, validPresetIds]);

  const handleReplayProjectSeed = React.useCallback(() => {
    setConfig((prev) => normalizeConfig(replayProjectSeedConfig(prev)));
  }, [setConfig]);

  const dismissCameraPathNotice = useCallback(() => {
    setCameraPathNotice(null);
  }, []);

  const handleCaptureCameraPathSlot = useCallback((slotIndex: number) => {
    const pose = cameraRigApiRef.current?.capturePose();
    if (!pose) {
      setCameraPathNotice({ tone: 'error', message: 'Camera path capture is unavailable until the scene is ready.' });
      return;
    }
    setCameraPathSlots((prev: CameraPathSlot[]) => prev.map((slot: CameraPathSlot, index: number) => index === slotIndex ? {
      id: `camera-path-slot-${slotIndex + 1}`,
      label: `Cam ${slotIndex + 1}`,
      pose,
      capturedAt: pose.capturedAt,
    } : slot));
    setCameraPathNotice({ tone: 'success', message: `Captured camera slot ${slotIndex + 1}.` });
  }, []);

  const handleLoadCameraPathSlot = useCallback((slotIndex: number) => {
    const slot = cameraPathSlots[slotIndex];
    if (!slot) {
      setCameraPathNotice({ tone: 'error', message: `Camera slot ${slotIndex + 1} is empty.` });
      return;
    }
    const ok = cameraRigApiRef.current?.applyPose(slot.pose, { durationSeconds: 0 }) ?? false;
    setCameraPathNotice({ tone: ok ? 'success' : 'error', message: ok ? `Loaded camera slot ${slotIndex + 1}.` : 'Camera path load is unavailable until the scene is ready.' });
  }, [cameraPathSlots]);

  const handleMorphCameraPathSlot = useCallback((slotIndex: number) => {
    const slot = cameraPathSlots[slotIndex];
    if (!slot) {
      setCameraPathNotice({ tone: 'error', message: `Camera slot ${slotIndex + 1} is empty.` });
      return;
    }
    const ok = cameraRigApiRef.current?.applyPose(slot.pose, { durationSeconds: 1.6 }) ?? false;
    setCameraPathNotice({ tone: ok ? 'success' : 'error', message: ok ? `Morphing to camera slot ${slotIndex + 1}.` : 'Camera path morph is unavailable until the scene is ready.' });
  }, [cameraPathSlots]);

  const handleClearCameraPathSlot = useCallback((slotIndex: number) => {
    setCameraPathSlots((prev: CameraPathSlot[]) => prev.map((slot: CameraPathSlot, index: number) => index === slotIndex ? null : slot));
    setCameraPathNotice({ tone: 'success', message: `Cleared camera slot ${slotIndex + 1}.` });
  }, []);

  const handlePlayCameraPathSequence = useCallback(() => {
    const poses = cameraPathSlots.filter((slot: CameraPathSlot): slot is NonNullable<CameraPathSlot> => slot !== null).map((slot) => slot.pose);
    if (poses.length < 2) {
      setCameraPathNotice({ tone: 'error', message: 'Capture at least two camera slots before playing a camera path.' });
      return;
    }
    const ok = cameraRigApiRef.current?.playSequence(poses, { durationSeconds: cameraPathDurationSeconds, loop: false }) ?? false;
    setCameraPathNotice({ tone: ok ? 'success' : 'error', message: ok ? `Playing camera path across ${poses.length} slots.` : 'Camera path playback is unavailable until the scene is ready.' });
  }, [cameraPathDurationSeconds, cameraPathSlots]);

  const handleCopyCameraPathDurationToExport = useCallback(() => {
    ui.setVideoDurationSeconds(cameraPathDurationSeconds);
    setCameraPathNotice({ tone: 'success', message: `Copied ${cameraPathDurationSeconds.toFixed(1)}s camera path duration to current export.` });
  }, [cameraPathDurationSeconds, ui]);

  const handleStopCameraPathSequence = useCallback(() => {
    cameraRigApiRef.current?.stopPlayback();
    setIsCameraPathPlaying(false);
    setCameraPathNotice({ tone: 'success', message: 'Stopped camera path playback.' });
  }, []);

  const {
    canRedo,
    canUndo,
    historyDepth,
    redo,
    redoDepth,
    undo,
  } = useConfigHistory({
    config,
    isTransitioning: ui.isPresetTransitioning,
    setConfig,
  });

  const handleSequenceStepByKeyboard = useCallback((direction: -1 | 1) => {
    if (presetSequence.length === 0) {
      return;
    }
    const currentIndex = activeSequenceItemId
      ? presetSequence.findIndex((item) => item.id === activeSequenceItemId)
      : -1;
    const fallbackIndex = direction > 0 ? 0 : presetSequence.length - 1;
    const nextIndex = currentIndex === -1
      ? fallbackIndex
      : (currentIndex + direction + presetSequence.length) % presetSequence.length;
    const nextItem = presetSequence[nextIndex];
    if (!nextItem) {
      return;
    }
    handleLoadSequenceItem(nextItem.id);
  }, [activeSequenceItemId, handleLoadSequenceItem, presetSequence]);

  useGlobalEditorShortcuts({
    canRedo,
    canUndo,
    isPublicLibraryMode,
    isTouchViewport,
    layerFocusMode: ui.layerFocusMode,
    onLoadSequenceStep: handleSequenceStepByKeyboard,
    onRedo: redo,
    onRequestScreenshot: () => ui.setSaveTrigger((prev) => prev + 1),
    onSetLayerFocusMode: ui.setLayerFocusMode,
    onTogglePanel: () => ui.setIsPanelOpen((prev) => !prev),
    onTogglePlay: () => ui.setIsPlaying((prev) => !prev),
    onUndo: undo,
    onRandomize: handleRandomize,
  });

  useSequenceAudioTriggers({
    activeSequenceItemId,
    applyConfigMorph,
    audioRef,
    config,
    isPresetTransitioning: ui.isPresetTransitioning,
    isPublicLibraryMode,
    latestConfigRef,
    presetSequence,
    presets,
    sequenceLoopEnabled,
    setActiveSequenceItemId,
    setSequenceStepProgress,
  });

  const presetLibrary = {
    activePresetId,
    handleCreatePreset,
    handleDeletePreset,
    handleDismissLibraryNotice,
    handleDuplicatePreset,
    handleOverwritePreset,
    handleRandomize,
    handleRenamePreset,
    isPresetDirty,
    libraryNotice,
    presets,
    setActivePresetId,
    setLibraryNotice,
    setPresets,
    validPresetIds,
  };

  const transitionController = {
    applyConfigInstant,
    applyConfigMorph,
    stopPresetTransition,
  };

  const sequenceController = {
    activeSequenceItemId,
    handleAddPresetToSequence,
    handleCaptureSequenceKeyframe,
    handleDuplicateSequenceItem,
    handleLoadSequenceItem,
    handleMoveSequenceItem,
    handleRemoveSequenceItem,
    handleRenameSequenceItem,
    handleReorderSequenceItem,
    handleResetSequenceKeyframe,
    handleSequenceDriveModeChange,
    handleSequenceDriveMultiplierChange,
    handleSequenceDriveStrengthModeChange,
    handleSequenceDriveStrengthOverrideChange,
    handleSequenceHoldChange,
    handleSequenceTransitionChange,
    handleSequenceTransitionEasingChange,
    handleStartSequencePlayback,
    handleStopSequencePlayback,
    isSequencePlaying,
    presetSequence,
    sequenceLoopEnabled,
    sequenceSinglePassDuration,
    sequenceStepProgress,
    sequenceStepProgressRef,
    setActiveSequenceItemId,
    setPresetSequence,
    setSequenceLoopEnabled,
    setSequenceStepProgress,
    stopSequencePlayback,
  };

  const audioController = {
    audioNotice,
    audioRef,
    dismissAudioNotice,
    handleAudioSourceModeChange,
    isAudioActive,
    microphoneStreamRef,
    sharedAudioStreamRef,
    startAudio,
    stopAudio,
    synthEngineRef,
  };

  const uiState = {
    comparePreviewEnabled: ui.comparePreviewEnabled,
    futureNativeSpecialistRouteControls: ui.futureNativeSpecialistRouteControls,
    comparePreviewOrientation: ui.comparePreviewOrientation,
    comparePreviewSlotIndex: ui.comparePreviewSlotIndex,
    canRedo,
    canUndo,
    historyDepth,
    isPanelOpen: ui.isPanelOpen,
    isPlaying: ui.isPlaying,
    isPresetTransitioning: ui.isPresetTransitioning,
    isTouchViewport,
    layerFocusMode: ui.layerFocusMode,
    layerLockState: ui.layerLockState,
    layerMuteState: ui.layerMuteState,
    saveTrigger: ui.saveTrigger,
    setComparePreviewEnabled: ui.setComparePreviewEnabled,
    setFutureNativeSpecialistRouteControls: ui.setFutureNativeSpecialistRouteControls,
    setComparePreviewOrientation: ui.setComparePreviewOrientation,
    setComparePreviewSlotIndex: ui.setComparePreviewSlotIndex,
    setIsPanelOpen: ui.setIsPanelOpen,
    setIsPlaying: ui.setIsPlaying,
    setLayerFocusMode: ui.setLayerFocusMode,
    setLayerLockState: ui.setLayerLockState,
    setLayerMuteState: ui.setLayerMuteState,
    setSaveTrigger: ui.setSaveTrigger,
    onRedo: redo,
    onUndo: undo,
    redoDepth,
    setVideoDurationSeconds: ui.setVideoDurationSeconds,
    setVideoExportMode: ui.setVideoExportMode,
    setVideoFps: ui.setVideoFps,
    videoDurationSeconds: ui.videoDurationSeconds,
    videoExportMode: ui.videoExportMode,
    videoFps: ui.videoFps,
    cameraPathSlots,
    cameraPathDurationSeconds,
    cameraPathNotice,
    isCameraPathPlaying,
    cameraPathExportEnabled,
    onDismissCameraPathNotice: dismissCameraPathNotice,
    onCaptureCameraPathSlot: handleCaptureCameraPathSlot,
    onLoadCameraPathSlot: handleLoadCameraPathSlot,
    onMorphCameraPathSlot: handleMorphCameraPathSlot,
    onClearCameraPathSlot: handleClearCameraPathSlot,
    onCameraPathDurationSecondsChange: setCameraPathDurationSeconds,
    onPlayCameraPathSequence: handlePlayCameraPathSequence,
    onStopCameraPathSequence: handleStopCameraPathSequence,
    onCameraPathExportEnabledChange: setCameraPathExportEnabled,
    onCopyCameraPathDurationToExport: handleCopyCameraPathDurationToExport,
  };

  return (
    <AppBodySceneConnected
      audioController={audioController}
      config={config}
      interLayerContactAmount={interLayerContactAmount}
      isPublicLibraryMode={isPublicLibraryMode}
      libraryScope={LIBRARY_SCOPE}
      presetBlendDuration={presetBlendDuration}
      presetLibrary={presetLibrary}
      projectInputRef={projectInputRef}
      rendererRef={rendererRef}
      sceneRef={sceneRef}
      cameraRef={cameraRef}
      sequenceController={sequenceController}
      setConfig={setConfig}
      setPresetBlendDuration={setPresetBlendDuration}
      transitionController={transitionController}
      uiState={uiState}
      onReplayProjectSeed={handleReplayProjectSeed}
      cameraRigApiRef={cameraRigApiRef}
      onCameraPathPlayingChange={setIsCameraPathPlaying}
    />
  );
};

export default function App() {
  return (
    <AppModeGate appModeParam={AUDIO_BRIDGE_MODE_PARAM} appModeValue={AUDIO_BRIDGE_MODE_VALUE}>
      <AppBody />
    </AppModeGate>
  );
}
