import React from 'react';
import {
  ControlPanelActions,
  ControlPanelFooter,
  ControlPanelHeader,
  ControlPanelRail,
  ControlPanelTabBar,
} from './controlPanelChrome';
import { ControlPanelContent } from './controlPanelTabs';
import { ControlPanelProps } from './controlPanelTypes';
import type { ControlPanelTab } from './controlPanelParts';
import type { useControlPanelState } from './useControlPanelState';

type ControlPanelStateView = ReturnType<typeof useControlPanelState>;

type ControlPanelBodyProps = Pick<ControlPanelStateView,
  | 'activeTab'
  | 'applyCameraMotionPreset'
  | 'applyPerformancePreset'
  | 'applyScreenFxPreset'
  | 'audioActionLabel'
  | 'draggingSequenceItemId'
  | 'dropTargetSequenceItemId'
  | 'editingPresetId'
  | 'editingPresetName'
  | 'formatPresetDate'
  | 'handleCreatePreset'
  | 'handleLibraryFileChange'
  | 'handleSequenceDragEnd'
  | 'handleSequenceDragOver'
  | 'handleSequenceDragStart'
  | 'handleSequenceDrop'
  | 'handleStartRename'
  | 'handleSubmitRename'
  | 'libraryImportMode'
  | 'libraryInputRef'
  | 'lockedPanelClass'
  | 'presetName'
  | 'setActiveTab'
  | 'setEditingPresetId'
  | 'setEditingPresetName'
  | 'setLibraryImportMode'
  | 'setPresetName'
  | 'updateConfig'
  | 'updateLayer1Array'
  | 'updateLayerArray'
  | 'updateMotionArray'
  | 'updatePositionArray'
> & {
  props: ControlPanelProps;
  isPublicLibrary: boolean;
  isWide: boolean;
  onClose: () => void;
  onToggleWidth: () => void;
};

export const ControlPanelBody: React.FC<ControlPanelBodyProps> = ({
  activeTab,
  applyCameraMotionPreset,
  applyPerformancePreset,
  applyScreenFxPreset,
  audioActionLabel,
  draggingSequenceItemId,
  dropTargetSequenceItemId,
  editingPresetId,
  editingPresetName,
  formatPresetDate,
  handleCreatePreset,
  handleLibraryFileChange,
  handleSequenceDragEnd,
  handleSequenceDragOver,
  handleSequenceDragStart,
  handleSequenceDrop,
  handleStartRename,
  handleSubmitRename,
  libraryImportMode,
  libraryInputRef,
  lockedPanelClass,
  presetName,
  props,
  setActiveTab,
  setEditingPresetId,
  setEditingPresetName,
  setLibraryImportMode,
  setPresetName,
  updateConfig,
  updateLayer1Array,
  updateLayerArray,
  updateMotionArray,
  updatePositionArray,
  isPublicLibrary,
  isWide,
  onClose,
  onToggleWidth,
}) => (
  <div className="pointer-events-none absolute inset-y-0 right-0 z-50 flex w-full justify-end p-3 text-white sm:p-4">
    <div className={`flex h-full w-full items-stretch justify-end ${isWide ? 'max-w-[min(96vw,78rem)]' : 'max-w-[min(96vw,66rem)]'}`}>
      <ControlPanelRail
        activeTab={activeTab}
        isWide={isWide}
        onClose={onClose}
        onSelectTab={setActiveTab}
        onToggleWidth={onToggleWidth}
      />
      <div className="pointer-events-auto flex min-w-0 flex-1 flex-col overflow-hidden rounded-[30px] border border-white/10 bg-black/88 shadow-[0_30px_90px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
        <ControlPanelHeader
          activeTab={activeTab}
          isPublicLibrary={isPublicLibrary}
          isTouchViewport={props.isTouchViewport}
          isWide={isWide}
          onClose={onClose}
          onToggleWidth={onToggleWidth}
        />
        <ControlPanelActions
          canRedo={props.canRedo}
          canUndo={props.canUndo}
          historyDepth={props.historyDepth}
          isPlaying={props.isPlaying}
          isPublicLibrary={isPublicLibrary}
          onRandomize={props.onRandomize}
          onRedo={props.onRedo}
          onReset={props.onReset}
          onUndo={props.onUndo}
          redoDepth={props.redoDepth}
          togglePlay={props.togglePlay}
        />
        <ControlPanelTabBar activeTab={activeTab} onSelectTab={setActiveTab} />

        <ControlPanelContent
          activeTab={activeTab}
          config={props.config}
          contactAmount={props.contactAmount}
          isPublicLibrary={isPublicLibrary}
          lockedPanelClass={lockedPanelClass}
          updateConfig={updateConfig}
          applyCameraMotionPreset={applyCameraMotionPreset}
          applyPerformancePreset={applyPerformancePreset}
          applyScreenFxPreset={applyScreenFxPreset}
          presetName={presetName}
          setPresetName={setPresetName}
          handleCreatePreset={handleCreatePreset}
          activePresetId={props.activePresetId}
          onOverwritePreset={props.onOverwritePreset}
          isPresetTransitioning={props.isPresetTransitioning}
          onStopPresetTransition={props.onStopPresetTransition}
          presetBlendDuration={props.presetBlendDuration}
          onPresetBlendDurationChange={props.onPresetBlendDurationChange}
          libraryInputRef={libraryInputRef}
          handleLibraryFileChange={handleLibraryFileChange}
          handleProjectFileChange={props.handleProjectFileChange}
          onDismissProjectNotice={props.onDismissProjectNotice}
          onExportLibrary={props.onExportLibrary}
          onExportProject={props.onExportProject}
          libraryImportMode={libraryImportMode}
          setLibraryImportMode={setLibraryImportMode}
          libraryNotice={props.libraryNotice}
          onDismissLibraryNotice={props.onDismissLibraryNotice}
          sequenceLoopEnabled={props.sequenceLoopEnabled}
          onSequenceLoopEnabledChange={props.onSequenceLoopEnabledChange}
          isSequencePlaying={props.isSequencePlaying}
          onStartSequencePlayback={props.onStartSequencePlayback}
          onStopSequencePlayback={props.onStopSequencePlayback}
          presetSequence={props.presetSequence}
          setPresetSequence={props.setPresetSequence}
          activeSequenceItemId={props.activeSequenceItemId}
          sequenceSinglePassDuration={props.sequenceSinglePassDuration}
          onLoadSequenceItem={props.onLoadSequenceItem}
          sequenceStepProgress={props.sequenceStepProgress}
          draggingSequenceItemId={draggingSequenceItemId}
          dropTargetSequenceItemId={dropTargetSequenceItemId}
          handleSequenceDragStart={handleSequenceDragStart}
          handleSequenceDragOver={handleSequenceDragOver}
          handleSequenceDrop={handleSequenceDrop}
          handleSequenceDragEnd={handleSequenceDragEnd}
          presets={props.presets}
          setPresets={props.setPresets}
          projectInputRef={props.projectInputRef}
          projectManifest={props.projectManifest}
          projectNotice={props.projectNotice}
          onReplayProjectSeed={props.onReplayProjectSeed}
          futureNativeSpecialistRouteControls={props.futureNativeSpecialistRouteControls}
          onSetFutureNativeSpecialistRouteControls={props.onSetFutureNativeSpecialistRouteControls}
          isTouchViewport={props.isTouchViewport}
          layerFocusMode={props.layerFocusMode}
          comparePreviewEnabled={props.comparePreviewEnabled}
          onSetComparePreviewEnabled={props.onSetComparePreviewEnabled}
          comparePreviewOrientation={props.comparePreviewOrientation}
          onSetComparePreviewOrientation={props.onSetComparePreviewOrientation}
          comparePreviewSlotIndex={props.comparePreviewSlotIndex}
          onSetComparePreviewSlotIndex={props.onSetComparePreviewSlotIndex}
          onSetLayerFocusMode={props.onSetLayerFocusMode}
          layerMuteState={props.layerMuteState}
          onToggleLayerMute={props.onToggleLayerMute}
          layerLockState={props.layerLockState}
          onToggleLayerLock={props.onToggleLayerLock}
          snapshotSlots={props.snapshotSlots}
          onCaptureSnapshot={props.onCaptureSnapshot}
          onLoadSnapshot={props.onLoadSnapshot}
          onMorphSnapshot={props.onMorphSnapshot}
          onClearSnapshot={props.onClearSnapshot}
          onRenameSnapshot={props.onRenameSnapshot}
          onSetSnapshotNote={props.onSetSnapshotNote}
          compareReferenceConfig={props.compareReferenceConfig}
          onRenameSequenceItem={props.onRenameSequenceItem}
          onSequenceHoldChange={props.onSequenceHoldChange}
          onSequenceTransitionChange={props.onSequenceTransitionChange}
          onSequenceTransitionEasingChange={props.onSequenceTransitionEasingChange}
          onSequenceDriveModeChange={props.onSequenceDriveModeChange}
          onSequenceDriveStrengthModeChange={props.onSequenceDriveStrengthModeChange}
          onSequenceDriveStrengthOverrideChange={props.onSequenceDriveStrengthOverrideChange}
          onSequenceDriveMultiplierChange={props.onSequenceDriveMultiplierChange}
          onCaptureSequenceKeyframe={props.onCaptureSequenceKeyframe}
          onResetSequenceKeyframe={props.onResetSequenceKeyframe}
          onDuplicateSequenceItem={props.onDuplicateSequenceItem}
          onMoveSequenceItem={props.onMoveSequenceItem}
          onRemoveSequenceItem={props.onRemoveSequenceItem}
          videoExportMode={props.videoExportMode}
          onVideoExportModeChange={props.onVideoExportModeChange}
          videoFps={props.videoFps}
          onVideoFpsChange={props.onVideoFpsChange}
          videoDurationSeconds={props.videoDurationSeconds}
          onVideoDurationSecondsChange={props.onVideoDurationSecondsChange}
          isVideoRecording={props.isVideoRecording}
          onStartVideoRecording={props.onStartVideoRecording}
          onStopVideoRecording={props.onStopVideoRecording}
          isFrameExporting={props.isFrameExporting}
          onStartFrameExport={props.onStartFrameExport}
          onStopFrameExport={props.onStopFrameExport}
          isGifExporting={props.isGifExporting}
          onStartGifExport={props.onStartGifExport}
          onStopGifExport={props.onStopGifExport}
          videoNotice={props.videoNotice}
          onDismissVideoNotice={props.onDismissVideoNotice}
          frameNotice={props.frameNotice}
          onDismissFrameNotice={props.onDismissFrameNotice}
          gifNotice={props.gifNotice}
          onDismissGifNotice={props.onDismissGifNotice}
          exportQueue={props.exportQueue}
          activeExportQueueJobId={props.activeExportQueueJobId}
          isExportQueueRunning={props.isExportQueueRunning}
          onEnqueueVideoExportJob={props.onEnqueueVideoExportJob}
          onEnqueueFrameExportJob={props.onEnqueueFrameExportJob}
          onEnqueueGifExportJob={props.onEnqueueGifExportJob}
          onStartExportQueue={props.onStartExportQueue}
          onCancelExportQueue={props.onCancelExportQueue}
          onClearExportQueue={props.onClearExportQueue}
          onRemoveExportQueueJob={props.onRemoveExportQueueJob}
          cameraPathSlots={props.cameraPathSlots}
          cameraPathExportEnabled={props.cameraPathExportEnabled}
          cameraPathDurationSeconds={props.cameraPathDurationSeconds}
          isCameraPathPlaying={props.isCameraPathPlaying}
          cameraPathNotice={props.cameraPathNotice}
          onDismissCameraPathNotice={props.onDismissCameraPathNotice}
          onCaptureCameraPathSlot={props.onCaptureCameraPathSlot}
          onLoadCameraPathSlot={props.onLoadCameraPathSlot}
          onMorphCameraPathSlot={props.onMorphCameraPathSlot}
          onClearCameraPathSlot={props.onClearCameraPathSlot}
          onCameraPathDurationSecondsChange={props.onCameraPathDurationSecondsChange}
          onPlayCameraPathSequence={props.onPlayCameraPathSequence}
          onStopCameraPathSequence={props.onStopCameraPathSequence}
          onCameraPathExportEnabledChange={props.onCameraPathExportEnabledChange}
          onCopyCameraPathDurationToExport={props.onCopyCameraPathDurationToExport}
          editingPresetId={editingPresetId}
          editingPresetName={editingPresetName}
          setEditingPresetId={setEditingPresetId}
          setEditingPresetName={setEditingPresetName}
          handleSubmitRename={handleSubmitRename}
          handleStartRename={handleStartRename}
          onLoadPreset={props.onLoadPreset}
          formatPresetDate={formatPresetDate}
          isPresetDirty={props.isPresetDirty}
          onTransitionToPreset={props.onTransitionToPreset}
          onAddPresetToSequence={props.onAddPresetToSequence}
          onDuplicatePreset={props.onDuplicatePreset}
          onDeletePreset={props.onDeletePreset}
          updatePositionArray={updatePositionArray}
          updateLayerArray={updateLayerArray}
          updateLayer1Array={updateLayer1Array}
          updateMotionArray={updateMotionArray}
          audioSourceMode={props.audioSourceMode}
          onAudioSourceModeChange={props.onAudioSourceModeChange}
          isAudioActive={props.isAudioActive}
          stopAudio={props.stopAudio}
          startAudio={props.startAudio}
          audioActionLabel={audioActionLabel}
          audioNotice={props.audioNotice}
          onDismissAudioNotice={props.onDismissAudioNotice}
        />

        <ControlPanelFooter
          config={props.config}
          isPublicLibrary={isPublicLibrary}
          onSave={props.onSave}
          updateConfig={updateConfig}
        />
      </div>
    </div>
  </div>
);
