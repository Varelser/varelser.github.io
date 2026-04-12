import React from 'react';
import type { Camera, Scene, WebGLRenderer } from 'three';
import { AppBodyScene } from './AppBodyScene';
import type { ParticleConfig } from '../types';
import { useAppLayerPreview } from '../lib/useAppLayerPreview';
import { useAppSnapshots } from '../lib/useAppSnapshots';
import { createPendingProjectManifest, importProjectFile } from '../lib/useProjectTransfer';
import type { CameraRigApi } from '../types/cameraPath';
import type { Notice } from '../lib/audioControllerTypes';

const AppBodyInteractiveBridge = React.lazy(() => import('./AppBodyInteractiveBridge').then((module) => ({ default: module.AppBodyInteractiveBridge })));

type AppBodySceneConnectedProps = {
  config: ParticleConfig;
  setConfig: React.Dispatch<React.SetStateAction<ParticleConfig>>;
  isPublicLibraryMode: boolean;
  interLayerContactAmount: number;
  libraryScope: 'private' | 'public';
  presetBlendDuration: number;
  setPresetBlendDuration: React.Dispatch<React.SetStateAction<number>>;
  rendererRef: React.MutableRefObject<WebGLRenderer | null>;
  sceneRef?: React.MutableRefObject<Scene | null>;
  cameraRef?: React.MutableRefObject<Camera | null>;
  projectInputRef: React.MutableRefObject<HTMLInputElement | null>;
  presetLibrary: any;
  sequenceController: any;
  transitionController: any;
  audioController: any;
  uiState: any;
  onReplayProjectSeed: () => void;
  cameraRigApiRef?: React.MutableRefObject<CameraRigApi | null>;
  onCameraPathPlayingChange?: (isPlaying: boolean) => void;
};

export const AppBodySceneConnected: React.FC<AppBodySceneConnectedProps> = ({
  audioController,
  config,
  interLayerContactAmount,
  isPublicLibraryMode,
  libraryScope,
  presetBlendDuration,
  presetLibrary,
  projectInputRef,
  rendererRef,
  sceneRef,
  cameraRef,
  sequenceController,
  setConfig,
  setPresetBlendDuration,
  transitionController,
  uiState,
  onReplayProjectSeed,
  cameraRigApiRef,
  onCameraPathPlayingChange,
}) => {
  const [showExternalControlBridge, setShowExternalControlBridge] = React.useState(false);
  const [showControlPanelBridge, setShowControlPanelBridge] = React.useState(uiState.isPanelOpen);
  const [projectManifest, setProjectManifest] = React.useState(() => createPendingProjectManifest());
  const [projectNotice, setProjectNotice] = React.useState<Notice | null>(null);

  const dismissProjectNotice = React.useCallback(() => {
    setProjectNotice(null);
  }, []);

  const handleImportProject = React.useCallback((file: File) => importProjectFile({
    file,
    isPublicLibraryMode,
    setActivePresetId: presetLibrary.setActivePresetId,
    setConfig,
    setFutureNativeSpecialistRouteControls: uiState.setFutureNativeSpecialistRouteControls,
    setIsPanelOpen: uiState.setIsPanelOpen,
    setIsPlaying: uiState.setIsPlaying,
    setPresetBlendDuration,
    setPresetSequence: sequenceController.setPresetSequence,
    setPresets: presetLibrary.setPresets,
    setProjectManifest,
    setProjectNotice,
    setSequenceLoopEnabled: sequenceController.setSequenceLoopEnabled,
    setVideoDurationSeconds: uiState.setVideoDurationSeconds,
    setVideoExportMode: uiState.setVideoExportMode,
    setVideoFps: uiState.setVideoFps,
    stopPresetTransition: transitionController.stopPresetTransition,
    stopSequencePlayback: sequenceController.stopSequencePlayback,
  }), [
    isPublicLibraryMode,
    presetLibrary.setActivePresetId,
    presetLibrary.setPresets,
    sequenceController.setPresetSequence,
    sequenceController.setSequenceLoopEnabled,
    sequenceController.stopSequencePlayback,
    setConfig,
    setPresetBlendDuration,
    transitionController.stopPresetTransition,
    uiState.setFutureNativeSpecialistRouteControls,
    uiState.setIsPanelOpen,
    uiState.setIsPlaying,
    uiState.setVideoDurationSeconds,
    uiState.setVideoExportMode,
    uiState.setVideoFps,
  ]);

  const {
    compareConfig,
    handleCaptureSnapshot,
    handleClearSnapshot,
    handleLoadSnapshot,
    handleMorphSnapshot,
    handleProjectFileChange,
    handleRenameSnapshot,
    handleSetSnapshotNote,
    snapshotSlots,
  } = useAppSnapshots({
    applyConfigInstant: transitionController.applyConfigInstant,
    applyConfigMorph: transitionController.applyConfigMorph,
    comparePreviewEnabled: uiState.comparePreviewEnabled,
    comparePreviewSlotIndex: uiState.comparePreviewSlotIndex,
    config,
    handleImportProject,
    presetBlendDuration,
  });

  const {
    displayConfig,
    toggleLayerLock,
    toggleLayerMute,
  } = useAppLayerPreview({
    config,
    layerFocusMode: uiState.layerFocusMode,
    layerMuteState: uiState.layerMuteState,
    setLayerFocusMode: uiState.setLayerFocusMode,
    setLayerLockState: uiState.setLayerLockState,
    setLayerMuteState: uiState.setLayerMuteState,
  });

  React.useEffect(() => {
    if (uiState.isPanelOpen) {
      setShowControlPanelBridge(true);
    }
  }, [uiState.isPanelOpen]);

  React.useEffect(() => {
    if (typeof window === 'undefined') {
      setShowExternalControlBridge(true);
      return;
    }

    const idleWindow = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    if (typeof idleWindow.requestIdleCallback === 'function') {
      const idleId = idleWindow.requestIdleCallback(() => {
        React.startTransition(() => {
          setShowExternalControlBridge(true);
        });
      }, { timeout: 1800 });
      return () => {
        if (typeof idleWindow.cancelIdleCallback === 'function') {
          idleWindow.cancelIdleCallback(idleId);
        }
      };
    }

    const timeoutId = window.setTimeout(() => {
      React.startTransition(() => {
        setShowExternalControlBridge(true);
      });
    }, 1200);
    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <>
      {showControlPanelBridge || showExternalControlBridge ? (
        <React.Suspense fallback={null}>
          <AppBodyInteractiveBridge
            audioController={audioController}
            cameraRef={cameraRef}
            cameraRigApiRef={cameraRigApiRef}
            compareConfig={compareConfig}
            config={config}
            handleCaptureSnapshot={handleCaptureSnapshot}
            handleClearSnapshot={handleClearSnapshot}
            handleLoadSnapshot={handleLoadSnapshot}
            handleMorphSnapshot={handleMorphSnapshot}
            handleProjectFileChange={handleProjectFileChange}
            handleRenameSnapshot={handleRenameSnapshot}
            handleSetSnapshotNote={handleSetSnapshotNote}
            interLayerContactAmount={interLayerContactAmount}
            isPublicLibraryMode={isPublicLibraryMode}
            libraryScope={libraryScope}
            onReplayProjectSeed={onReplayProjectSeed}
            presetBlendDuration={presetBlendDuration}
            presetLibrary={presetLibrary}
            projectInputRef={projectInputRef}
            projectManifest={projectManifest}
            projectNotice={projectNotice}
            setProjectManifest={setProjectManifest}
            setProjectNotice={setProjectNotice}
            rendererRef={rendererRef}
            sceneRef={sceneRef}
            sequenceController={sequenceController}
            setConfig={setConfig}
            setPresetBlendDuration={setPresetBlendDuration}
            showControlPanelBridge={showControlPanelBridge}
            showExternalControlBridge={showExternalControlBridge}
            snapshotSlots={snapshotSlots}
            toggleLayerLock={toggleLayerLock}
            toggleLayerMute={toggleLayerMute}
            transitionController={transitionController}
            uiState={uiState}
          />
        </React.Suspense>
      ) : null}
      <AppBodyScene
        audioRef={audioController.audioRef}
        compareConfig={compareConfig}
        comparePreviewEnabled={uiState.comparePreviewEnabled}
        comparePreviewOrientation={uiState.comparePreviewOrientation}
        comparePreviewSlotIndex={uiState.comparePreviewSlotIndex}
        config={config}
        controlPanelState={{ isOpen: uiState.isPanelOpen, setIsOpen: uiState.setIsPanelOpen }}
        displayConfig={displayConfig}
        isPlaying={uiState.isPlaying}
        isSequencePlaying={sequenceController.isSequencePlaying}
        rendererRef={rendererRef}
        sceneRef={sceneRef}
        cameraRef={cameraRef}
        saveTrigger={uiState.saveTrigger}
        sequenceStepProgress={sequenceController.sequenceStepProgress}
        sequenceStepProgressRef={sequenceController.sequenceStepProgressRef}
        cameraRigApiRef={cameraRigApiRef}
        onCameraPathPlayingChange={onCameraPathPlayingChange}
      />
    </>
  );
};
