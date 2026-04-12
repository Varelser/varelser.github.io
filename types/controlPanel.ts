import type React from 'react';
import type { ExportBatchJob } from '../lib/exportBatchQueue';
import type { CameraPathSlot } from './cameraPath';
import type {
  AudioSourceMode,
  ParticleConfig,
  PresetRecord,
  PresetSequenceItem,
  ProjectManifest,
  ProjectFutureNativeSpecialistRouteControlEntry,
  SequenceDriveMode,
  SequenceDriveStrengthMode,
  SequenceTransitionEasing,
} from '../types';

export type SnapshotSlot = {
  id: string;
  label: string;
  note: string;
  capturedAt: string;
} | null;

export type LayerFocusMode = 'all' | 'layer1' | 'layer2' | 'layer3';
export type LayerToggleState = { layer1: boolean; layer2: boolean; layer3: boolean };
export type ComparePreviewOrientation = 'vertical' | 'horizontal';

export interface ControlPanelCoreProps {
  config: ParticleConfig;
  contactAmount: number;
  libraryScope: 'private' | 'public';
  setConfig: React.Dispatch<React.SetStateAction<ParticleConfig>>;
  canRedo: boolean;
  canUndo: boolean;
  historyDepth: number;
  isPlaying: boolean;
  isTouchViewport: boolean;
  redoDepth: number;
  togglePlay: () => void;
  onRedo: () => void;
  onSave: () => void;
  onReset: () => void;
  onRandomize: () => void;
  onUndo: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export interface ControlPanelPresetProps {
  presets: PresetRecord[];
  setPresets: React.Dispatch<React.SetStateAction<PresetRecord[]>>;
  activePresetId: string | null;
  isPresetDirty: boolean;
  onCreatePreset: (name: string) => void;
  onLoadPreset: (presetId: string) => void;
  onOverwritePreset: (presetId: string) => void;
  onRenamePreset: (presetId: string, nextName: string) => void;
  onDuplicatePreset: (presetId: string) => void;
  onDeletePreset: (presetId: string) => void;
  presetBlendDuration: number;
  onPresetBlendDurationChange: (seconds: number) => void;
  onTransitionToPreset: (presetId: string) => void;
  isPresetTransitioning: boolean;
  onStopPresetTransition: () => void;
}

export interface ControlPanelSequenceProps {
  presetSequence: PresetSequenceItem[];
  setPresetSequence: React.Dispatch<React.SetStateAction<PresetSequenceItem[]>>;
  activeSequenceItemId: string | null;
  isSequencePlaying: boolean;
  sequenceLoopEnabled: boolean;
  onSequenceLoopEnabledChange: (enabled: boolean) => void;
  onAddPresetToSequence: (presetId: string) => void;
  onRemoveSequenceItem: (itemId: string) => void;
  onSequenceHoldChange: (itemId: string, holdSeconds: number) => void;
  onSequenceTransitionChange: (itemId: string, transitionSeconds: number) => void;
  onSequenceTransitionEasingChange: (itemId: string, transitionEasing: SequenceTransitionEasing) => void;
  onSequenceDriveModeChange: (itemId: string, mode: SequenceDriveMode) => void;
  onSequenceDriveStrengthModeChange: (itemId: string, mode: SequenceDriveStrengthMode) => void;
  onSequenceDriveStrengthOverrideChange: (itemId: string, value: number) => void;
  onSequenceDriveMultiplierChange: (itemId: string, multiplier: number) => void;
  onRenameSequenceItem: (itemId: string, label: string) => void;
  onCaptureSequenceKeyframe: (itemId: string) => void;
  onResetSequenceKeyframe: (itemId: string) => void;
  onLoadSequenceItem: (itemId: string) => void;
  onDuplicateSequenceItem: (itemId: string) => void;
  onMoveSequenceItem: (itemId: string, direction: -1 | 1) => void;
  onReorderSequenceItem: (sourceItemId: string, targetItemId: string) => void;
  onStartSequencePlayback: () => void;
  onStopSequencePlayback: () => void;
  sequenceStepProgress: number;
  sequenceSinglePassDuration: number;
}

export interface ControlPanelExportProps {
  audioSourceMode: AudioSourceMode;
  videoExportMode: 'current' | 'sequence';
  onVideoExportModeChange: (mode: 'current' | 'sequence') => void;
  videoDurationSeconds: number;
  onVideoDurationSecondsChange: (seconds: number) => void;
  videoFps: number;
  onVideoFpsChange: (fps: number) => void;
  isVideoRecording: boolean;
  onStartVideoRecording: () => void;
  onStopVideoRecording: () => void;
  videoNotice: { tone: 'success' | 'error'; message: string } | null;
  onDismissVideoNotice: () => void;
  isFrameExporting: boolean;
  onStartFrameExport: () => void;
  onStopFrameExport: () => void;
  frameNotice: { tone: 'success' | 'error'; message: string } | null;
  onDismissFrameNotice: () => void;
  isGifExporting: boolean;
  onStartGifExport: () => void;
  onStopGifExport: () => void;
  gifNotice: { tone: 'success' | 'error'; message: string } | null;
  onDismissGifNotice: () => void;
  exportQueue: ExportBatchJob[];
  activeExportQueueJobId: string | null;
  isExportQueueRunning: boolean;
  onEnqueueVideoExportJob: () => void;
  onEnqueueFrameExportJob: () => void;
  onEnqueueGifExportJob: () => void;
  onStartExportQueue: () => void;
  onCancelExportQueue: () => void;
  onClearExportQueue: () => void;
  onRemoveExportQueueJob: (jobId: string) => void;
}

export interface ControlPanelCameraPathProps {
  cameraPathSlots: CameraPathSlot[];
  cameraPathExportEnabled: boolean;
  cameraPathDurationSeconds: number;
  isCameraPathPlaying: boolean;
  cameraPathNotice: { tone: 'success' | 'error'; message: string } | null;
  onDismissCameraPathNotice: () => void;
  onCaptureCameraPathSlot: (slotIndex: number) => void;
  onLoadCameraPathSlot: (slotIndex: number) => void;
  onMorphCameraPathSlot: (slotIndex: number) => void;
  onClearCameraPathSlot: (slotIndex: number) => void;
  onCameraPathDurationSecondsChange: (seconds: number) => void;
  onPlayCameraPathSequence: () => void;
  onStopCameraPathSequence: () => void;
  onCameraPathExportEnabledChange: (enabled: boolean) => void;
  onCopyCameraPathDurationToExport: () => void;
}

export interface ControlPanelLibraryProps {
  onExportLibrary: () => void;
  onImportLibrary: (file: File, mode: 'append' | 'replace') => void;
  libraryNotice: { tone: 'success' | 'error'; message: string } | null;
  onDismissLibraryNotice: () => void;
}

export interface ControlPanelProjectProps {
  handleProjectFileChange: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onDismissProjectNotice: () => void;
  onExportProject: () => void;
  projectInputRef: React.RefObject<HTMLInputElement | null>;
  projectManifest: ProjectManifest;
  projectNotice: { tone: 'success' | 'error'; message: string } | null;
  onReplayProjectSeed: () => void;
  futureNativeSpecialistRouteControls: ProjectFutureNativeSpecialistRouteControlEntry[];
  onSetFutureNativeSpecialistRouteControls: React.Dispatch<React.SetStateAction<ProjectFutureNativeSpecialistRouteControlEntry[]>>;
}

export interface ControlPanelWorkspaceProps {
  layerFocusMode: LayerFocusMode;
  comparePreviewEnabled: boolean;
  onSetComparePreviewEnabled: (enabled: boolean) => void;
  comparePreviewOrientation: ComparePreviewOrientation;
  onSetComparePreviewOrientation: (orientation: ComparePreviewOrientation) => void;
  comparePreviewSlotIndex: number;
  onSetComparePreviewSlotIndex: (slotIndex: number) => void;
  onSetLayerFocusMode: (mode: LayerFocusMode) => void;
  layerMuteState: LayerToggleState;
  onToggleLayerMute: (layer: keyof LayerToggleState) => void;
  layerLockState: LayerToggleState;
  onToggleLayerLock: (layer: keyof LayerToggleState) => void;
  snapshotSlots: SnapshotSlot[];
  onCaptureSnapshot: (slotIndex: number) => void;
  onLoadSnapshot: (slotIndex: number) => void;
  onMorphSnapshot: (slotIndex: number) => void;
  onClearSnapshot: (slotIndex: number) => void;
  onRenameSnapshot: (slotIndex: number, label: string) => void;
  onSetSnapshotNote: (slotIndex: number, note: string) => void;
  compareReferenceConfig: ParticleConfig | null;
}

export interface ControlPanelAudioProps {
  audioSourceMode: AudioSourceMode;
  onAudioSourceModeChange: (mode: AudioSourceMode) => void;
  audioNotice: { tone: 'success' | 'error'; message: string } | null;
  onDismissAudioNotice: () => void;
  startAudio: () => void;
  stopAudio: () => void;
  isAudioActive: boolean;
}

export interface ControlPanelProps extends
  ControlPanelCoreProps,
  ControlPanelPresetProps,
  ControlPanelSequenceProps,
  ControlPanelExportProps,
  ControlPanelCameraPathProps,
  ControlPanelLibraryProps,
  ControlPanelProjectProps,
  ControlPanelWorkspaceProps,
  ControlPanelAudioProps {}
