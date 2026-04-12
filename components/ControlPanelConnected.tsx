import React from 'react';
import { useControlPanelState } from './useControlPanelState';
import { ControlPanelBody } from './ControlPanelBody';
import { ControlPanelProps } from './controlPanelTypes';
import type { ControlPanelTab } from './controlPanelParts';

type ControlPanelConnectedProps = ControlPanelProps & {
  initialActiveTab: ControlPanelTab;
  isWide: boolean;
  onActiveTabChange: (tab: ControlPanelTab) => void;
  onClose: () => void;
  onToggleWidth: () => void;
};

export const ControlPanelConnected: React.FC<ControlPanelConnectedProps> = (props) => {
  const {
    config,
    libraryScope,
    setConfig,
    isWide,
    initialActiveTab,
    onActiveTabChange,
    onClose,
    onToggleWidth,
  } = props;
  const isPublicLibrary = libraryScope === 'public';

  const {
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
  } = useControlPanelState({
    audioSourceMode: props.audioSourceMode,
    config,
    isAudioActive: props.isAudioActive,
    isPublicLibrary,
    onCreatePreset: props.onCreatePreset,
    onImportLibrary: props.onImportLibrary,
    onRenamePreset: props.onRenamePreset,
    onReorderSequenceItem: props.onReorderSequenceItem,
    layerLockState: props.layerLockState,
    setConfig,
    initialActiveTab,
  });

  React.useEffect(() => {
    onActiveTabChange(activeTab);
  }, [activeTab, onActiveTabChange]);

  return (
    <ControlPanelBody
      activeTab={activeTab}
      applyCameraMotionPreset={applyCameraMotionPreset}
      applyPerformancePreset={applyPerformancePreset}
      applyScreenFxPreset={applyScreenFxPreset}
      audioActionLabel={audioActionLabel}
      draggingSequenceItemId={draggingSequenceItemId}
      dropTargetSequenceItemId={dropTargetSequenceItemId}
      editingPresetId={editingPresetId}
      editingPresetName={editingPresetName}
      formatPresetDate={formatPresetDate}
      handleCreatePreset={handleCreatePreset}
      handleLibraryFileChange={handleLibraryFileChange}
      handleSequenceDragEnd={handleSequenceDragEnd}
      handleSequenceDragOver={handleSequenceDragOver}
      handleSequenceDragStart={handleSequenceDragStart}
      handleSequenceDrop={handleSequenceDrop}
      handleStartRename={handleStartRename}
      handleSubmitRename={handleSubmitRename}
      libraryImportMode={libraryImportMode}
      libraryInputRef={libraryInputRef}
      lockedPanelClass={lockedPanelClass}
      presetName={presetName}
      props={props}
      setActiveTab={setActiveTab}
      setEditingPresetId={setEditingPresetId}
      setEditingPresetName={setEditingPresetName}
      setLibraryImportMode={setLibraryImportMode}
      setPresetName={setPresetName}
      updateConfig={updateConfig}
      updateLayer1Array={updateLayer1Array}
      updateLayerArray={updateLayerArray}
      updateMotionArray={updateMotionArray}
      updatePositionArray={updatePositionArray}
      isPublicLibrary={isPublicLibrary}
      isWide={isWide}
      onClose={onClose}
      onToggleWidth={onToggleWidth}
    />
  );
};
