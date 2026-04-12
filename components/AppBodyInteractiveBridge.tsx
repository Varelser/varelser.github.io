import React from 'react';
import type { Camera, Scene, WebGLRenderer } from 'three';
import { useAppPresetActions } from '../lib/useAppPresetActions';
import { useExportController } from '../lib/useExportController';
import { useLibraryTransfer } from '../lib/useLibraryTransfer';
import { useProjectTransfer } from '../lib/useProjectTransfer';
import type { ParticleConfig, ProjectManifest } from '../types';
import type { CameraRigApi } from '../types/cameraPath';
import type { Notice } from '../lib/audioControllerTypes';
import { AppBodyControlPanelBridge } from './AppBodyControlPanelBridge';
import { AppBodyExternalControlBridge } from './AppBodyExternalControlBridge';

type AppBodyInteractiveBridgeProps = {
  audioController: any;
  cameraRef?: React.MutableRefObject<Camera | null>;
  cameraRigApiRef?: React.MutableRefObject<CameraRigApi | null>;
  compareConfig: ParticleConfig | null;
  config: ParticleConfig;
  handleCaptureSnapshot: (slotIndex: number) => void;
  handleClearSnapshot: (slotIndex: number) => void;
  handleLoadSnapshot: (slotIndex: number) => void;
  handleMorphSnapshot: (slotIndex: number) => void;
  handleProjectFileChange: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleRenameSnapshot: (slotIndex: number, label: string) => void;
  handleSetSnapshotNote: (slotIndex: number, note: string) => void;
  interLayerContactAmount: number;
  isPublicLibraryMode: boolean;
  libraryScope: 'private' | 'public';
  onReplayProjectSeed: () => void;
  presetBlendDuration: number;
  presetLibrary: any;
  projectInputRef: React.MutableRefObject<HTMLInputElement | null>;
  projectManifest: ProjectManifest;
  projectNotice: Notice | null;
  setProjectManifest: React.Dispatch<React.SetStateAction<ProjectManifest>>;
  setProjectNotice: React.Dispatch<React.SetStateAction<Notice | null>>;
  rendererRef: React.MutableRefObject<WebGLRenderer | null>;
  sceneRef?: React.MutableRefObject<Scene | null>;
  sequenceController: any;
  setConfig: React.Dispatch<React.SetStateAction<ParticleConfig>>;
  setPresetBlendDuration: React.Dispatch<React.SetStateAction<number>>;
  showControlPanelBridge: boolean;
  showExternalControlBridge: boolean;
  snapshotSlots: any[];
  toggleLayerLock: (layer: 'layer1' | 'layer2' | 'layer3') => void;
  toggleLayerMute: (layer: 'layer1' | 'layer2' | 'layer3') => void;
  transitionController: any;
  uiState: any;
};

export const AppBodyInteractiveBridge: React.FC<AppBodyInteractiveBridgeProps> = ({
  audioController,
  cameraRef,
  cameraRigApiRef,
  compareConfig,
  config,
  handleCaptureSnapshot,
  handleClearSnapshot,
  handleLoadSnapshot,
  handleMorphSnapshot,
  handleProjectFileChange,
  handleRenameSnapshot,
  handleSetSnapshotNote,
  interLayerContactAmount,
  isPublicLibraryMode,
  libraryScope,
  onReplayProjectSeed,
  presetBlendDuration,
  presetLibrary,
  projectInputRef,
  projectManifest,
  projectNotice,
  setProjectManifest,
  setProjectNotice,
  rendererRef,
  sceneRef,
  sequenceController,
  setConfig,
  setPresetBlendDuration,
  showControlPanelBridge,
  showExternalControlBridge,
  snapshotSlots,
  toggleLayerLock,
  toggleLayerMute,
  transitionController,
  uiState,
}) => {
  const { dismissProjectNotice, handleExportProject } = useProjectTransfer({
    activePresetId: presetLibrary.activePresetId,
    config,
    isPanelOpen: uiState.isPanelOpen,
    isPlaying: uiState.isPlaying,
    isPublicLibraryMode,
    futureNativeSpecialistRouteControls: uiState.futureNativeSpecialistRouteControls,
    presetBlendDuration,
    presetSequence: sequenceController.presetSequence,
    presets: presetLibrary.presets,
    sequenceLoopEnabled: sequenceController.sequenceLoopEnabled,
    setProjectManifest,
    setProjectNotice,
    videoDurationSeconds: uiState.videoDurationSeconds,
    videoExportMode: uiState.videoExportMode,
    videoFps: uiState.videoFps,
  });
  const { handleExportLibrary, handleImportLibrary } = useLibraryTransfer({
    activePresetId: presetLibrary.activePresetId,
    config,
    isPublicLibraryMode,
    presetBlendDuration,
    presetSequence: sequenceController.presetSequence,
    presets: presetLibrary.presets,
    sequenceLoopEnabled: sequenceController.sequenceLoopEnabled,
    setActivePresetId: presetLibrary.setActivePresetId,
    setActiveSequenceItemId: sequenceController.setActiveSequenceItemId,
    setConfig,
    setLibraryNotice: presetLibrary.setLibraryNotice,
    setPresetBlendDuration,
    setPresetSequence: sequenceController.setPresetSequence,
    setPresets: presetLibrary.setPresets,
    setSequenceLoopEnabled: sequenceController.setSequenceLoopEnabled,
    stopPresetTransition: transitionController.stopPresetTransition,
    stopSequencePlayback: sequenceController.stopSequencePlayback,
    validPresetIds: presetLibrary.validPresetIds,
  });
  const { handleLoadPreset, handleTransitionToPreset } = useAppPresetActions({
    applyConfigInstant: transitionController.applyConfigInstant,
    applyConfigMorph: transitionController.applyConfigMorph,
    presetBlendDuration,
    presets: presetLibrary.presets,
    stopSequencePlayback: sequenceController.stopSequencePlayback,
  });
  const {
    activeExportQueueJobId,
    cancelExportQueue,
    clearExportQueue,
    dismissFrameNotice,
    dismissGifNotice,
    dismissVideoNotice,
    enqueueExportJobWithOverrides,
    enqueueFrameExportJob,
    enqueueGifExportJob,
    enqueueVideoExportJob,
    exportQueue,
    frameNotice,
    gifNotice,
    isFrameExporting,
    isExportQueueRunning,
    isGifExporting,
    isVideoRecording,
    removeExportJob,
    runFrameExport,
    runGifExport,
    runVideoRecording,
    startExportQueue,
    startFrameExport,
    startGifExport,
    startVideoRecording,
    stopFrameExport,
    stopGifExport,
    stopVideoRecording,
    videoNotice,
  } = useExportController({
    applyConfigInstant: transitionController.applyConfigInstant,
    activeSequenceItemId: sequenceController.activeSequenceItemId,
    config,
    stopSequencePlayback: sequenceController.stopSequencePlayback,
    handleStartSequencePlayback: sequenceController.handleStartSequencePlayback,
    presetSequence: sequenceController.presetSequence,
    presetSequenceLength: sequenceController.presetSequence.length,
    presets: presetLibrary.presets,
    rendererRef,
    sceneRef,
    cameraRef,
    cameraRigApiRef,
    cameraPathEnabled: uiState.cameraPathExportEnabled,
    cameraPathSlots: uiState.cameraPathSlots,
    sequenceLoopEnabled: sequenceController.sequenceLoopEnabled,
    sequenceSinglePassDuration: sequenceController.sequenceSinglePassDuration,
    setActiveSequenceItemId: sequenceController.setActiveSequenceItemId,
    setPresetSequence: sequenceController.setPresetSequence,
    setPresets: presetLibrary.setPresets,
    setSequenceLoopEnabled: sequenceController.setSequenceLoopEnabled,
    microphoneStreamRef: audioController.microphoneStreamRef,
    sharedAudioStreamRef: audioController.sharedAudioStreamRef,
    synthEngineRef: audioController.synthEngineRef,
    videoDurationSeconds: uiState.videoDurationSeconds,
    videoExportMode: uiState.videoExportMode,
    videoFps: uiState.videoFps,
  });

  return (
    <>
      {showControlPanelBridge ? (
        <AppBodyControlPanelBridge
          activePresetId={presetLibrary.activePresetId}
          activeSequenceItemId={sequenceController.activeSequenceItemId}
          audioNotice={audioController.audioNotice}
          audioSourceMode={config.audioSourceMode}
          canRedo={uiState.canRedo}
          canUndo={uiState.canUndo}
          historyDepth={uiState.historyDepth}
          comparePreviewEnabled={uiState.comparePreviewEnabled}
          comparePreviewOrientation={uiState.comparePreviewOrientation}
          comparePreviewSlotIndex={uiState.comparePreviewSlotIndex}
          compareReferenceConfig={compareConfig}
          config={config}
          contactAmount={interLayerContactAmount}
          frameNotice={frameNotice}
          exportQueue={exportQueue}
          handleProjectFileChange={handleProjectFileChange}
          activeExportQueueJobId={activeExportQueueJobId}
          isAudioActive={audioController.isAudioActive}
          isFrameExporting={isFrameExporting}
          isExportQueueRunning={isExportQueueRunning}
          isOpen={uiState.isPanelOpen}
          isPlaying={uiState.isPlaying}
          isPresetDirty={presetLibrary.isPresetDirty}
          isPresetTransitioning={uiState.isPresetTransitioning}
          isPublicLibraryMode={isPublicLibraryMode}
          isTouchViewport={uiState.isTouchViewport}
          isSequencePlaying={sequenceController.isSequencePlaying}
          isVideoRecording={isVideoRecording}
          layerFocusMode={uiState.layerFocusMode}
          layerLockState={uiState.layerLockState}
          layerMuteState={uiState.layerMuteState}
          libraryNotice={presetLibrary.libraryNotice}
          libraryScope={libraryScope}
          onAddPresetToSequence={sequenceController.handleAddPresetToSequence}
          onAudioSourceModeChange={audioController.handleAudioSourceModeChange}
          onCaptureSequenceKeyframe={sequenceController.handleCaptureSequenceKeyframe}
          onCaptureSnapshot={handleCaptureSnapshot}
          onClearSnapshot={handleClearSnapshot}
          onCreatePreset={presetLibrary.handleCreatePreset}
          onDeletePreset={presetLibrary.handleDeletePreset}
          onDismissAudioNotice={audioController.dismissAudioNotice}
          onDismissFrameNotice={dismissFrameNotice}
          onDismissGifNotice={dismissGifNotice}
          onDismissLibraryNotice={presetLibrary.handleDismissLibraryNotice}
          onDismissProjectNotice={dismissProjectNotice}
          onDismissVideoNotice={dismissVideoNotice}
          onEnqueueFrameExportJob={enqueueFrameExportJob}
          onEnqueueGifExportJob={enqueueGifExportJob}
          onEnqueueVideoExportJob={enqueueVideoExportJob}
          onStartExportQueue={startExportQueue}
          onCancelExportQueue={cancelExportQueue}
          onClearExportQueue={clearExportQueue}
          onRemoveExportQueueJob={removeExportJob}
          cameraPathSlots={uiState.cameraPathSlots}
          cameraPathExportEnabled={uiState.cameraPathExportEnabled}
          cameraPathDurationSeconds={uiState.cameraPathDurationSeconds}
          cameraPathNotice={uiState.cameraPathNotice}
          isCameraPathPlaying={uiState.isCameraPathPlaying}
          onDismissCameraPathNotice={uiState.onDismissCameraPathNotice}
          onCaptureCameraPathSlot={uiState.onCaptureCameraPathSlot}
          onLoadCameraPathSlot={uiState.onLoadCameraPathSlot}
          onMorphCameraPathSlot={uiState.onMorphCameraPathSlot}
          onClearCameraPathSlot={uiState.onClearCameraPathSlot}
          onCameraPathDurationSecondsChange={uiState.onCameraPathDurationSecondsChange}
          onPlayCameraPathSequence={uiState.onPlayCameraPathSequence}
          onStopCameraPathSequence={uiState.onStopCameraPathSequence}
          onCameraPathExportEnabledChange={uiState.onCameraPathExportEnabledChange}
          onCopyCameraPathDurationToExport={uiState.onCopyCameraPathDurationToExport}
          onDuplicatePreset={presetLibrary.handleDuplicatePreset}
          onRedo={uiState.onRedo}
          onDuplicateSequenceItem={sequenceController.handleDuplicateSequenceItem}
          onExportLibrary={handleExportLibrary}
          onExportProject={handleExportProject}
          onSetFutureNativeSpecialistRouteControls={uiState.setFutureNativeSpecialistRouteControls}
          onImportLibrary={handleImportLibrary}
          onLoadPreset={handleLoadPreset}
          onLoadSequenceItem={sequenceController.handleLoadSequenceItem}
          onLoadSnapshot={handleLoadSnapshot}
          onMorphSnapshot={handleMorphSnapshot}
          onMoveSequenceItem={sequenceController.handleMoveSequenceItem}
          onOverwritePreset={presetLibrary.handleOverwritePreset}
          onReplayProjectSeed={onReplayProjectSeed}
          onUndo={uiState.onUndo}
          onPresetBlendDurationChange={setPresetBlendDuration}
          onRandomize={presetLibrary.handleRandomize}
          onRemoveSequenceItem={sequenceController.handleRemoveSequenceItem}
          onRenamePreset={presetLibrary.handleRenamePreset}
          onRenameSequenceItem={sequenceController.handleRenameSequenceItem}
          onRenameSnapshot={handleRenameSnapshot}
          onReorderSequenceItem={sequenceController.handleReorderSequenceItem}
          onResetSequenceKeyframe={sequenceController.handleResetSequenceKeyframe}
          onSequenceDriveModeChange={sequenceController.handleSequenceDriveModeChange}
          onSequenceDriveMultiplierChange={sequenceController.handleSequenceDriveMultiplierChange}
          onSequenceDriveStrengthModeChange={sequenceController.handleSequenceDriveStrengthModeChange}
          onSequenceDriveStrengthOverrideChange={sequenceController.handleSequenceDriveStrengthOverrideChange}
          onSequenceHoldChange={sequenceController.handleSequenceHoldChange}
          onSequenceLoopEnabledChange={sequenceController.setSequenceLoopEnabled}
          onSequenceTransitionChange={sequenceController.handleSequenceTransitionChange}
          onSequenceTransitionEasingChange={sequenceController.handleSequenceTransitionEasingChange}
          onSetComparePreviewEnabled={uiState.setComparePreviewEnabled}
          onSetComparePreviewOrientation={uiState.setComparePreviewOrientation}
          onSetComparePreviewSlotIndex={uiState.setComparePreviewSlotIndex}
          onSetLayerFocusMode={uiState.setLayerFocusMode}
          onSetSnapshotNote={handleSetSnapshotNote}
          onStartFrameExport={startFrameExport}
          onStartGifExport={startGifExport}
          onStartSequencePlayback={sequenceController.handleStartSequencePlayback}
          onStartVideoRecording={startVideoRecording}
          onStopFrameExport={stopFrameExport}
          onStopGifExport={stopGifExport}
          onStopPresetTransition={transitionController.stopPresetTransition}
          onStopSequencePlayback={sequenceController.handleStopSequencePlayback}
          onStopVideoRecording={stopVideoRecording}
          onToggleLayerLock={toggleLayerLock}
          onToggleLayerMute={toggleLayerMute}
          onTransitionToPreset={handleTransitionToPreset}
          onVideoDurationSecondsChange={uiState.setVideoDurationSeconds}
          onVideoExportModeChange={uiState.setVideoExportMode}
          onVideoFpsChange={uiState.setVideoFps}
          presetBlendDuration={presetBlendDuration}
          redoDepth={uiState.redoDepth}
          presetSequence={sequenceController.presetSequence}
          presets={presetLibrary.presets}
          projectInputRef={projectInputRef}
          projectManifest={projectManifest}
          projectNotice={projectNotice}
          futureNativeSpecialistRouteControls={uiState.futureNativeSpecialistRouteControls}
          sequenceLoopEnabled={sequenceController.sequenceLoopEnabled}
          sequenceSinglePassDuration={sequenceController.sequenceSinglePassDuration}
          sequenceStepProgress={sequenceController.sequenceStepProgress}
          setConfig={setConfig}
          setIsOpen={uiState.setIsPanelOpen}
          setIsPlaying={uiState.setIsPlaying}
          setPresetSequence={sequenceController.setPresetSequence}
          setPresets={presetLibrary.setPresets}
          setSaveTrigger={uiState.setSaveTrigger}
          snapshotSlots={snapshotSlots}
          startAudio={audioController.startAudio}
          stopAudio={audioController.stopAudio}
          videoDurationSeconds={uiState.videoDurationSeconds}
          videoExportMode={uiState.videoExportMode}
          videoFps={uiState.videoFps}
          videoNotice={videoNotice}
          gifNotice={gifNotice}
          isGifExporting={isGifExporting}
        />
      ) : null}
      {showExternalControlBridge ? (
        <AppBodyExternalControlBridge
          audioController={audioController}
          cancelExportQueue={cancelExportQueue}
          clearExportQueue={clearExportQueue}
          config={config}
          enqueueExportJobWithOverrides={enqueueExportJobWithOverrides}
          enqueueFrameExportJob={enqueueFrameExportJob}
          enqueueGifExportJob={enqueueGifExportJob}
          enqueueVideoExportJob={enqueueVideoExportJob}
          exportQueue={exportQueue}
          handleLoadPreset={handleLoadPreset}
          handleTransitionToPreset={handleTransitionToPreset}
          isExportQueueRunning={isExportQueueRunning}
          isFrameExporting={isFrameExporting}
          isGifExporting={isGifExporting}
          isVideoRecording={isVideoRecording}
          onReplayProjectSeed={onReplayProjectSeed}
          presetLibrary={presetLibrary}
          runFrameExport={runFrameExport}
          runGifExport={runGifExport}
          runVideoRecording={runVideoRecording}
          sequenceController={sequenceController}
          setConfig={setConfig}
          startExportQueue={startExportQueue}
          uiState={uiState}
        />
      ) : null}
    </>
  );
};
